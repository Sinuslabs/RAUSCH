/**
 * @file SpotlightXY.js
 * @description XY pad with a dot-video spotlight effect.
 *   Video always plays at a fixed opacity. The handle is a spotlight —
 *   dots near it are revealed brightly, rest of the video shows dimly.
 *   Final dot alpha = max(videoAlpha * videoBaseAlpha, glow * maxAlpha, minAlpha)
 *
 * @outline
 *   Filter                  DSP effect controlled by X and Y axes
 *   XY_pad                  Panel — static background (all dots at minAlpha)
 *   XY_pad_overlay          Panel on top — dynamic layer (glow zone dots + handle)
 *   CONFIG                  Layout + visual config
 *   xValue / yValue         Normalized 0-1 handle position
 *   frames / frameIndex     Video clip data from EyesData
 *   startAnimation()        No-op stub (kept for Interface.js compatibility)
 *   stopAnimation()         No-op stub (kept for Interface.js compatibility)
 *   setX/setY/setXY         Programmatic position setters
 *   getX/getY               Read current position
 *
 * @note  The negative-radius hole may show faint minAlpha dots bleeding through
 *        from the background layer (default minAlpha=0.03 — barely perceptible).
 *
 * @dependencies EyesData (global), Synth.getEffect("Filter")
 * @ui XY_pad, XY_pad_overlay, X_knb, Y_knb
 */
namespace SpotlightXY {

    const var Filter = Synth.getEffect("Filter");
    const var XY_pad = Content.getComponent("XY_pad");
    const var X_knb = Content.getComponent("X_knb");
    const var Y_knb = Content.getComponent("Y_knb");

    // Create overlay panel on top of XY_pad for dynamic elements (glow zone + handle).
    // Content.addPanel returns existing panel if name already exists, so this is safe to re-run.
    const var XY_overlay = Content.addPanel("XY_pad_overlay", XY_pad.get("x"), XY_pad.get("y"));
    XY_overlay.set("width",          XY_pad.get("width"));
    XY_overlay.set("height",         XY_pad.get("height"));
    XY_overlay.set("bgColour",       0x00000000);  // fully transparent — see through to background
    XY_overlay.set("allowCallbacks", "No Callbacks"); // pass mouse events to XY_pad beneath

    const var CONFIG = {
        dotSize: 6,
        gap: 4,
        padding: 6,
        dotColour: 0xFFFFFFFF,
        handleSize: 18,
        handleColour: 0xFFFFFFFF,
        handleStroke: 2.0,
        glowRadius: 8.0,
        glowFalloff: 1.0,
        glowGrowStep: 0.093,  // ~10s to reach full radius at 15fps
        glowShrinkStep: 0.7,  // ~0.5s to collapse on release
        minAlpha: 0.03,
        maxAlpha: 1.0,
        videoBaseAlpha: 0.0,  // video only visible through spotlight
        negativeRadius: 1.5,  // grid-unit radius around handle forced to opacity 0
        negativeFade: 1.5,    // grid-unit fade zone from 0 back to normal alpha
        springStiffness: 0.5, // pull-toward-target force per frame (higher = snappier)
        springDamping: 0.1,  // velocity retention per frame (lower = more overshoot/bounce)
        handleScaleActive: 1.38,      // handle scale multiplier while clicked/dragged
        negativeRadiusActive: 2.6,    // negative hole radius while clicked/dragged
        activeTransitionSpeed: 0.4,  // lerp speed for both (0–1, higher = snappier)
        frameSpeed: 1.0               // frames advanced per timer tick (lower = slower playback)
    };

    var xValue = 0.5;
    var yValue = 0.5;
    var springX = 0.5;   // visual position — trails target with spring physics
    var springY = 0.5;
    var velX = 0.0;
    var velY = 0.0;
    var isDragging = false;
    var playing = false;
    var currentGlowRadius = 1;
    var currentHandleScale = 1.0;
    var currentNegRadius = 1.5;  // matches CONFIG.negativeRadius

    // --- Video state ---
    var frames = [];
    var videoCols = 0;
    var videoRows = 0;
    var frameCount = 0;
    var framePos = 0.0;  // fractional frame position for sub-frame blending
    var frameDir = 1;    // 1 = forward, -1 = reverse (ping-pong)

    // --- Cached grid geometry (opt 1) ---
    // Recomputed only when dotSize/gap/padding change, not every frame.
    var gridCols = 0;
    var gridRows = 0;
    var gridOffsetX = 0.0;
    var gridOffsetY = 0.0;
    var gridTotalW = 0.0;
    var gridTotalH = 0.0;
    var gridStep = 0.0;

    // --- Opt 7: col→videoCol lookup table ---
    // Precomputed once per recalcGrid/loadData — replaces Math.floor(col*videoScaleX) per dot.
    var colToVC = [];

    inline function rebuildColToVC()
    {
        colToVC = [];
        if (videoCols > 0 && gridCols > 0)
        {
            var scale = videoCols / gridCols;
            for (var c = 0; c < gridCols; c++)
                colToVC[c] = Math.floor(c * scale);
        }
    }

    inline function recalcGrid()
    {
        var w = XY_pad.get("width");
        var h = XY_pad.get("height");
        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        gridStep    = dotSize + gapSize;
        gridCols    = Math.floor((w - CONFIG.padding * 2 + gapSize) / gridStep);
        gridRows    = Math.floor((h - CONFIG.padding * 2 + gapSize) / gridStep);
        gridTotalW  = gridCols * dotSize + (gridCols - 1) * gapSize;
        gridTotalH  = gridRows * dotSize + (gridRows - 1) * gapSize;
        gridOffsetX = (w - gridTotalW) / 2;
        gridOffsetY = (h - gridTotalH) / 2;
        rebuildColToVC();
    }

    inline function loadData(data)
    {
        if (isDefined(data.frames))
        {
            frames = data.frames;
            videoCols = data.cols;
            videoRows = data.rows;
            frameCount = data.frameCount;
            framePos = 0.0;
            rebuildColToVC(); // videoCols changed — rebuild lookup table
        }
    }

    // --- Timer: always running, advances frames ---
    const var Timer = Engine.createTimerObject();

    Timer.setTimerCallback(function ()
    {
        if (frameCount > 0)
        {
            framePos += frameDir * CONFIG.frameSpeed;
            if (framePos >= frameCount - 1) { frameDir = -1; framePos = frameCount - 1; }
            else if (framePos <= 0) { frameDir = 1; framePos = 0.0; }
        }

        // Grow glow slowly on note-on, collapse quickly on note-off
        var glowTarget = playing ? CONFIG.glowRadius : 0.0;
        if (currentGlowRadius < glowTarget)
            currentGlowRadius = Math.min(currentGlowRadius + CONFIG.glowGrowStep, glowTarget);
        else if (currentGlowRadius > glowTarget)
            currentGlowRadius = Math.max(currentGlowRadius - CONFIG.glowShrinkStep, glowTarget);

        // Handle scale + negative radius: lerp toward active/idle targets
        var scaleTarget = isDragging ? CONFIG.handleScaleActive : 1.0;
        currentHandleScale += (scaleTarget - currentHandleScale) * CONFIG.activeTransitionSpeed;

        var negTarget = isDragging ? CONFIG.negativeRadiusActive : CONFIG.negativeRadius;
        currentNegRadius += (negTarget - currentNegRadius) * CONFIG.activeTransitionSpeed;

        // Spring physics: visual handle lags behind target with overshoot
        velX = velX * CONFIG.springDamping + (xValue - springX) * CONFIG.springStiffness;
        velY = velY * CONFIG.springDamping + (yValue - springY) * CONFIG.springStiffness;
        springX = springX + velX;
        springY = springY + velY;

        // Opt 8: skip repaint when nothing is visually changing.
        // Glow collapsed, spring settled, handle/negRadius not animating → overlay is empty.
        if (!isDragging
            && currentGlowRadius < 0.001
            && Math.abs(velX) + Math.abs(velY) < 0.0001
            && Math.abs(currentHandleScale - 1.0) < 0.001
            && Math.abs(currentNegRadius - CONFIG.negativeRadius) < 0.001)
        {
            return;
        }

        XY_overlay.repaint();
    });

    // --- Helpers ---
    inline function clamp(val, lo, hi)
    {
        if (val < lo) return lo;
        if (val > hi) return hi;
        return val;
    }

    inline function maxf(a, b)
    {
        return a > b ? a : b;
    }

    // ---------------------------------------------------------------------------
    // Background layer — static dot grid at minAlpha.
    // Only repaint when CONFIG layout/colour properties change, not on every tick.
    // ---------------------------------------------------------------------------
    XY_pad.setPaintRoutine(function (g)
    {
        if (gridCols < 1 || gridRows < 1) return;

        var dotSize = CONFIG.dotSize;

        g.setColour(Colours.withAlpha(CONFIG.dotColour, CONFIG.minAlpha));

        for (var row = 0; row < gridRows; row++)
        {
            for (var col = 0; col < gridCols; col++)
            {
                g.fillEllipse([gridOffsetX + col * gridStep, gridOffsetY + row * gridStep, dotSize, dotSize]);
            }
        }
    });

    // ---------------------------------------------------------------------------
    // Overlay layer — glow zone dots (video blending + spotlight) + handle.
    // Repaints every timer tick but only iterates the glow bounding box.
    // Optimisations applied:
    //   1. Grid geometry read from cached module vars (recalcGrid)
    //   2. Squared-distance used to cull dots before Math.sqrt
    //   3. glowFalloff==1.0 fast path avoids Math.pow
    //   4. Per-frame constants hoisted above the loop
    //   5. Squared negRad early-exit skips sqrt/video/draw for hole dots
    //   6. finalAlpha < 0.005 threshold skips imperceptible draw calls
    //   7. colToVC[] lookup replaces Math.floor(col*videoScaleX) per dot
    //   8. Idle skip in timer — paint not called when nothing is changing
    // ---------------------------------------------------------------------------
    XY_overlay.setPaintRoutine(function (g)
    {
        if (gridCols < 1 || gridRows < 1) return;

        var dotSize = CONFIG.dotSize;

        var handleX   = gridOffsetX + xValue * (gridTotalW - dotSize) + dotSize * 0.5;
        var handleY   = gridOffsetY + yValue * (gridTotalH - dotSize) + dotSize * 0.5;
        var handleCol = springX * (gridCols - 1);
        var handleRow = springY * (gridRows - 1);

        // --- Opt 4: hoist per-frame constants above the loop ---
        var fi0       = Math.floor(framePos);
        var fi1       = Math.min(fi0 + 1, frameCount - 1);
        var blend     = framePos - fi0;
        var frame0    = (fi0 < frames.length) ? frames[fi0] : [];
        var frame1    = (fi1 < frames.length) ? frames[fi1] : frame0;
        var hasVideo  = videoCols > 0 && videoRows > 0 && frame0.length > 0;
        var hasFrame1 = frame1 !== frame0;
        var videoScaleY   = hasVideo ? (videoRows / gridRows) : 0.0;
        var linearFalloff = CONFIG.glowFalloff == 1.0;
        var maxAlpha  = CONFIG.maxAlpha;
        var minAlpha  = CONFIG.minAlpha;
        var vBaseAlpha = CONFIG.videoBaseAlpha;
        var negFade   = CONFIG.negativeFade;
        var dotColour = CONFIG.dotColour;

        // --- Opt 2+5: precompute squared radii ---
        var rad      = currentGlowRadius;
        var radSq    = rad * rad;
        var negRad   = currentNegRadius;
        var negRadSq = negRad * negRad;

        // Bounding box in grid space
        var colMin = Math.max(0,            Math.floor(handleCol - rad));
        var colMax = Math.min(gridCols - 1, Math.ceil(handleCol  + rad));
        var rowMin = Math.max(0,            Math.floor(handleRow - rad));
        var rowMax = Math.min(gridRows - 1, Math.ceil(handleRow  + rad));

        for (var row = rowMin; row <= rowMax; row++)
        {
            var dy       = row - handleRow;
            var dySq     = dy * dy;
            var vrOffset = hasVideo ? Math.floor(row * videoScaleY) * videoCols : 0;

            for (var col = colMin; col <= colMax; col++)
            {
                var dx     = col - handleCol;
                var distSq = dx * dx + dySq;

                // Opt 2: outer glow cull — no sqrt yet
                if (distSq >= radSq) continue;

                // Opt 5: negative hole — skip sqrt, video, glow, draw entirely
                if (distSq < negRadSq) continue;

                // Need real dist now for falloff + fade zone
                var dist = Math.sqrt(distSq);

                // Blended video sample — opt 7: colToVC[] replaces Math.floor(col*videoScaleX)
                var videoAlpha = 0.0;
                if (hasVideo)
                {
                    var vi = vrOffset + colToVC[col];
                    var v0 = frame0[vi];
                    videoAlpha = hasFrame1 ? (v0 + (frame1[vi] - v0) * blend) : v0;
                }

                // Opt 3: skip Math.pow when falloff is linear
                var normDist = dist / rad;
                var glow = linearFalloff ? (1.0 - normDist) : Math.pow(1.0 - normDist, CONFIG.glowFalloff);

                var finalAlpha = videoAlpha * maxf(vBaseAlpha, glow * maxAlpha);
                finalAlpha = maxf(finalAlpha, minAlpha);

                // Negative fade zone (only reached for negRad <= dist < negRad+negFade)
                if (dist < negRad + negFade)
                    finalAlpha = finalAlpha * ((dist - negRad) / negFade);

                // Opt 6: skip imperceptible dots — saves setColour + fillEllipse
                if (finalAlpha < 0.005) continue;

                g.setColour(Colours.withAlpha(dotColour, finalAlpha));
                g.fillEllipse([gridOffsetX + col * gridStep, gridOffsetY + row * gridStep, dotSize, dotSize]);
            }
        }

        // Draw handle
        var hs = CONFIG.handleSize * currentHandleScale;
        var hx = handleX - hs * 0.5;
        var hy = handleY - hs * 0.5;

        g.setColour(Colours.withAlpha(CONFIG.handleColour, 0.15));
        g.fillEllipse([hx, hy, hs, hs]);
        g.setColour(CONFIG.handleColour);
        g.drawEllipse([hx, hy, hs, hs], CONFIG.handleStroke);
    });

    // --- Knob callbacks ---
    inline function onXKnobControl(component, value)
    {
        xValue = component.getValueNormalized();
        Filter.setAttribute(Filter.Filter, xValue);
        XY_overlay.repaint();
    }

    inline function onYKnobControl(component, value)
    {
        yValue = 1.0 - component.getValueNormalized();
        Filter.setAttribute(Filter.Mix, (1.0 - yValue) * 100.0);
        XY_overlay.repaint();
    }

    X_knb.setControlCallback(onXKnobControl);
    Y_knb.setControlCallback(onYKnobControl);

    // --- Mouse ---
    XY_pad.setMouseCallback(function (event)
    {
        var area = this.getLocalBounds(0);
        var w = area[2];
        var h = area[3];

        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        var step = dotSize + gapSize;

        var cols = Math.floor((w - CONFIG.padding * 2 + gapSize) / step);
        var rows = Math.floor((h - CONFIG.padding * 2 + gapSize) / step);

        if (cols < 1 || rows < 1) return;

        var totalGridW = cols * dotSize + (cols - 1) * gapSize;
        var totalGridH = rows * dotSize + (rows - 1) * gapSize;
        var offsetX = (w - totalGridW) / 2;
        var offsetY = (h - totalGridH) / 2;

        if (event.doubleClick)
        {
            xValue = 0.5;
            yValue = 0.5;
            velX = 0.0;
            velY = 0.0;
            X_knb.setValueNormalized(0.5);
            X_knb.changed();
            Y_knb.setValueNormalized(0.5);
            Y_knb.changed();
            return;
        }

        if (event.clicked) isDragging = true;
        if (event.mouseUp) isDragging = false;

        if (isDragging || event.clicked)
        {
            xValue = clamp((event.x - offsetX - dotSize * 0.5) / (totalGridW - dotSize), 0.0, 1.0);
            yValue = clamp((event.y - offsetY - dotSize * 0.5) / (totalGridH - dotSize), 0.0, 1.0);

            X_knb.setValueNormalized(xValue);
            X_knb.changed();
            Y_knb.setValueNormalized(1.0 - yValue);
            Y_knb.changed();
        }
    });

    // --- Animation control ---
    inline function startAnimation()
    {
        playing = true;
        if (currentGlowRadius < 1.5)
            currentGlowRadius = 1.5;
    }

    inline function stopAnimation()
    {
        playing = false;
    }

    // --- Public API ---
    inline function setX(val)
    {
        xValue = clamp(val, 0.0, 1.0);
        XY_overlay.repaint();
    }

    inline function setY(val)
    {
        yValue = clamp(val, 0.0, 1.0);
        XY_overlay.repaint();
    }

    inline function setXY(x, y)
    {
        xValue = clamp(x, 0.0, 1.0);
        yValue = clamp(y, 0.0, 1.0);
        XY_overlay.repaint();
    }

    inline function getX()
    {
        return xValue;
    }

    inline function getY()
    {
        return yValue;
    }

    // Config setters that affect the background grid → recalc + repaint both layers
    inline function setDotSize(s)
    {
        CONFIG.dotSize = s;
        recalcGrid();
        XY_pad.repaint();
        XY_overlay.repaint();
    }

    inline function setGap(gap)
    {
        CONFIG.gap = gap;
        recalcGrid();
        XY_pad.repaint();
        XY_overlay.repaint();
    }

    inline function setAlphaRange(minA, maxA)
    {
        CONFIG.minAlpha = minA;
        CONFIG.maxAlpha = maxA;
        XY_pad.repaint();   // minAlpha is used by background
        XY_overlay.repaint();
    }

    // Config setters that only affect the overlay
    inline function setGlowRadius(r)
    {
        CONFIG.glowRadius = r;
        XY_overlay.repaint();
    }

    inline function setGlowFalloff(f)
    {
        CONFIG.glowFalloff = f;
        XY_overlay.repaint();
    }

    inline function setVideoBaseAlpha(v)
    {
        CONFIG.videoBaseAlpha = v;
        XY_overlay.repaint();
    }

    inline function repaint()
    {
        XY_overlay.repaint();
    }

    inline function repaintBackground()
    {
        XY_pad.repaint();
    }

    // --- Init ---
    loadData(EyesData);
    recalcGrid();
    Timer.startTimer(Math.max(10, Math.round(1000.0 / 60)));
}

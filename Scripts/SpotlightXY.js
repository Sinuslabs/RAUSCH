/**
 * @file SpotlightXY.js
 * @description XY pad with a dot-video spotlight effect.
 *   Video always plays at a fixed opacity. The handle is a spotlight —
 *   dots near it are revealed brightly, rest of the video shows dimly.
 *   Final dot alpha = max(videoAlpha * videoBaseAlpha, glow * maxAlpha, minAlpha)
 *
 * @outline
 *   Filter                  DSP effect controlled by X and Y axes
 *   XY_pad                  Panel component hosting the pad
 *   CONFIG                  Layout + visual config
 *   xValue / yValue         Normalized 0-1 handle position
 *   frames / frameIndex     Video clip data from EyesData
 *   startAnimation()        No-op stub (kept for Interface.js compatibility)
 *   stopAnimation()         No-op stub (kept for Interface.js compatibility)
 *   setX/setY/setXY         Programmatic position setters
 *   getX/getY               Read current position
 *
 * @dependencies EyesData (global), Synth.getEffect("Filter")
 * @ui XY_pad, X_knb, Y_knb
 */
namespace SpotlightXY {

    const var Filter = Synth.getEffect("Filter");
    const var XY_pad = Content.getComponent("XY_pad");
    const var X_knb = Content.getComponent("X_knb");
    const var Y_knb = Content.getComponent("Y_knb");

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

    inline function loadData(data) {
        if (isDefined(data.frames)) {
            frames = data.frames;
            videoCols = data.cols;
            videoRows = data.rows;
            frameCount = data.frameCount;
            framePos = 0.0;
        }
    }

    // --- Timer: always running, advances frames ---
    const var Timer = Engine.createTimerObject();

    Timer.setTimerCallback(function () {
        if (frameCount > 0) {
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

        XY_pad.repaint();
    });

    // --- Helpers ---
    inline function clamp(val, lo, hi) {
        if (val < lo) return lo;
        if (val > hi) return hi;
        return val;
    }

    inline function maxf(a, b) { return a > b ? a : b; }

    // --- Paint ---
    XY_pad.setPaintRoutine(function (g) {
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

        var handleX = offsetX + xValue * (totalGridW - dotSize) + dotSize * 0.5;
        var handleY = offsetY + yValue * (totalGridH - dotSize) + dotSize * 0.5;
        var handleCol = springX * (cols - 1);
        var handleRow = springY * (rows - 1);

        var fi0 = Math.floor(framePos);
        var fi1 = Math.min(fi0 + 1, frameCount - 1);
        var blend = framePos - fi0;
        var frame0 = (fi0 < frames.length) ? frames[fi0] : [];
        var frame1 = (fi1 < frames.length) ? frames[fi1] : frame0;

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var x = offsetX + col * (dotSize + gapSize);
                var y = offsetY + row * (dotSize + gapSize);

                // Blended sample between two frames
                var videoAlpha = 0.0;
                if (videoCols > 0 && videoRows > 0 && frame0.length > 0) {
                    var vc = Math.floor(col * videoCols / cols);
                    var vr = Math.floor(row * videoRows / rows);
                    var vi = vr * videoCols + vc;
                    if (vi < frame0.length) {
                        var v0 = frame0[vi];
                        var v1 = (frame1.length > vi) ? frame1[vi] : v0;
                        videoAlpha = v0 + (v1 - v0) * blend;
                    }
                }

                // Spotlight glow from handle proximity
                var dx = col - handleCol;
                var dy = row - handleRow;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var glow = 0.0;
                if (dist < currentGlowRadius) {
                    var normDist = dist / currentGlowRadius;
                    glow = Math.pow(1.0 - normDist, CONFIG.glowFalloff);
                }

                var finalAlpha = videoAlpha * maxf(CONFIG.videoBaseAlpha, glow * CONFIG.maxAlpha);
                finalAlpha = maxf(finalAlpha, CONFIG.minAlpha);

                // Negative glow: punch a transparent hole around the handle
                if (dist < currentNegRadius) {
                    finalAlpha = 0.0;
                } else if (dist < currentNegRadius + CONFIG.negativeFade) {
                    var t = (dist - currentNegRadius) / CONFIG.negativeFade;
                    finalAlpha = finalAlpha * t;
                }

                g.setColour(Colours.withAlpha(CONFIG.dotColour, finalAlpha));
                g.fillEllipse([x, y, dotSize, dotSize]);
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
    inline function onXKnobControl(component, value) {
        xValue = component.getValueNormalized();
        Filter.setAttribute(Filter.Filter, xValue);
        XY_pad.repaint();
    }

    inline function onYKnobControl(component, value) {
        yValue = 1.0 - component.getValueNormalized();
        Filter.setAttribute(Filter.Mix, (1.0 - yValue) * 100.0);
        XY_pad.repaint();
    }

    X_knb.setControlCallback(onXKnobControl);
    Y_knb.setControlCallback(onYKnobControl);

    // --- Mouse ---
    XY_pad.setMouseCallback(function (event) {
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

        if (event.doubleClick) {
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

        if (isDragging || event.clicked) {
            xValue = clamp((event.x - offsetX - dotSize * 0.5) / (totalGridW - dotSize), 0.0, 1.0);
            yValue = clamp((event.y - offsetY - dotSize * 0.5) / (totalGridH - dotSize), 0.0, 1.0);

            X_knb.setValueNormalized(xValue);
            X_knb.changed();
            Y_knb.setValueNormalized(1.0 - yValue);
            Y_knb.changed();
        }
    });

    // --- Animation control ---
    inline function startAnimation() {
        playing = true;
        if (currentGlowRadius < 1.5)
            currentGlowRadius = 1.5;
    }
    inline function stopAnimation() { playing = false; }

    // --- Public API ---
    inline function setX(val) { xValue = clamp(val, 0.0, 1.0); XY_pad.repaint(); }
    inline function setY(val) { yValue = clamp(val, 0.0, 1.0); XY_pad.repaint(); }
    inline function setXY(x, y) {
        xValue = clamp(x, 0.0, 1.0);
        yValue = clamp(y, 0.0, 1.0);
        XY_pad.repaint();
    }

    inline function getX() { return xValue; }
    inline function getY() { return yValue; }

    inline function setGlowRadius(r) { CONFIG.glowRadius = r; XY_pad.repaint(); }
    inline function setGlowFalloff(f) { CONFIG.glowFalloff = f; XY_pad.repaint(); }
    inline function setVideoBaseAlpha(v) { CONFIG.videoBaseAlpha = v; XY_pad.repaint(); }
    inline function setAlphaRange(minA, maxA) { CONFIG.minAlpha = minA; CONFIG.maxAlpha = maxA; XY_pad.repaint(); }
    inline function setDotSize(s) { CONFIG.dotSize = s; XY_pad.repaint(); }
    inline function setGap(g) { CONFIG.gap = g; XY_pad.repaint(); }
    inline function repaint() { XY_pad.repaint(); }

    // --- Init ---
    loadData(EyesData);
    Timer.startTimer(Math.max(10, Math.round(1000.0 / 60)));
}

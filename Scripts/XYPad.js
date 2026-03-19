/**
 * @file XYPad.js
 * @description 2D XY pad with dot-grid background and draggable handle.
 *   Renders a grid of dots with a glow effect around the handle position.
 *   X-axis controls Filter frequency, Y-axis controls Filter mix (inverted).
 *
 * @outline
 *   Filter / Filter         DSP effects controlled by X and Y axes
 *   XY_pad                 Panel component — static background (dot grid at minAlpha)
 *   XY_pad_overlay         Panel on top — dynamic layer (glow dots + handle)
 *   CONFIG                 Layout: dotSize, gap, padding, handleSize, glowRadius, glowFalloff, etc.
 *   xValue / yValue        Normalized 0-1 position of the handle
 *   XY_pad paint           Draws all dots at minAlpha (static, repaint only on CONFIG changes)
 *   XY_overlay paint       Draws glow-affected dots + handle (repaint on every drag)
 *   setMouseCallback       Drag to update xValue/yValue, sets Filter.Filter and Filter.Mix
 *   setX(val) / setY(val)  Programmatic position setters
 *   setXY(x, y)            Set both axes at once
 *   getX() / getY()        Read current position
 *   setDotSize/Gap/etc.    Visual config setters (repaint background + overlay as needed)
 *   setGlowRadius/Falloff  Control handle proximity glow (overlay repaint only)
 *   setAlphaRange()        Set min/max dot opacity
 *   repaint()              Force repaint of overlay (dynamic layer)
 *   repaintBackground()    Force repaint of static dot grid
 *
 * @dependencies Synth.getEffect("Filter"/"Filter")
 * @ui XY_pad, XY_pad_overlay
 */
namespace XYPad {

	const var Filter = Synth.getEffect("Filter");
    const var XY_pad = Content.getComponent("XY_pad");
    const var X_knb = Content.getComponent("X_knb");
    const var Y_knb = Content.getComponent("Y_knb");

    // Create overlay panel on top of XY_pad for dynamic elements (glow + handle).
    // Content.addPanel returns existing panel if name already exists, so this is safe to re-run.
    const var XY_overlay = Content.addPanel("XY_pad_overlay", XY_pad.get("x"), XY_pad.get("y"));
    XY_overlay.set("width",          XY_pad.get("width"));
    XY_overlay.set("height",         XY_pad.get("height"));
    XY_overlay.set("bgColour",       0x00000000);  // fully transparent — see through to background
    XY_overlay.set("allowCallbacks", "No Callbacks"); // pass mouse events to XY_pad beneath

    const var CONFIG = {
        dotSize: 6,
        gap: 4,
        padding: 4,
        dotColour: 0x88FFFFFF,
        handleSize: 18,
        handleColour: 0xFFFFFFFF,
        glowRadius: 5.0,
        glowFalloff: 2.0,
        minAlpha: 0.1,
        maxAlpha: 1.0,
        handleStroke: 2.0
    };

    var xValue = 0.5;
    var yValue = 0.5;
    var isDragging = false;
    var cols = 0;
    var rows = 0;

    inline function clamp(val, lo, hi)
    {
        if (val < lo) return lo;
        if (val > hi) return hi;
        return val;
    }

    // ---------------------------------------------------------------------------
    // Background layer — static dot grid at minAlpha.
    // Only repaint when CONFIG layout/colour properties change, not on drag.
    // ---------------------------------------------------------------------------
    XY_pad.setPaintRoutine(function(g)
    {
        var area = this.getLocalBounds(0);
        var w = area[2];
        var h = area[3];

        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        var padding = CONFIG.padding;

        cols = Math.floor((w - padding * 2 + gapSize) / (dotSize + gapSize));
        rows = Math.floor((h - padding * 2 + gapSize) / (dotSize + gapSize));

        var totalGridW = cols * dotSize + (cols - 1) * gapSize;
        var totalGridH = rows * dotSize + (rows - 1) * gapSize;
        var offsetX = (w - totalGridW) / 2;
        var offsetY = (h - totalGridH) / 2;

        // Single colour set — all dots share the same base alpha
        g.setColour(Colours.withAlpha(CONFIG.dotColour, CONFIG.minAlpha));

        for (var row = 0; row < rows; row++)
        {
            for (var col = 0; col < cols; col++)
            {
                g.fillEllipse([
                    offsetX + col * (dotSize + gapSize),
                    offsetY + row * (dotSize + gapSize),
                    dotSize, dotSize
                ]);
            }
        }
    });

    // ---------------------------------------------------------------------------
    // Overlay layer — glow dots (within glowRadius only) + handle.
    // Repaints on every drag event. Iterates only a small subset of the grid.
    // ---------------------------------------------------------------------------
    XY_overlay.setPaintRoutine(function(g)
    {
        var area = this.getLocalBounds(0);
        var w = area[2];
        var h = area[3];

        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        var padding = CONFIG.padding;

        var c = Math.floor((w - padding * 2 + gapSize) / (dotSize + gapSize));
        var r = Math.floor((h - padding * 2 + gapSize) / (dotSize + gapSize));

        var totalGridW = c * dotSize + (c - 1) * gapSize;
        var totalGridH = r * dotSize + (r - 1) * gapSize;
        var offsetX    = (w - totalGridW) / 2;
        var offsetY    = (h - totalGridH) / 2;

        var handleCol = xValue * (c - 1);
        var handleRow = yValue * (r - 1);
        var handleX   = offsetX + xValue * (totalGridW - dotSize) + dotSize * 0.5;
        var handleY   = offsetY + yValue * (totalGridH - dotSize) + dotSize * 0.5;

        // Only iterate dots within the glow bounding box
        var rad = CONFIG.glowRadius;
        var colMin = Math.max(0, Math.floor(handleCol - rad));
        var colMax = Math.min(c - 1, Math.ceil(handleCol + rad));
        var rowMin = Math.max(0, Math.floor(handleRow - rad));
        var rowMax = Math.min(r - 1, Math.ceil(handleRow + rad));

        for (var row = rowMin; row <= rowMax; row++)
        {
            for (var col = colMin; col <= colMax; col++)
            {
                var dx   = col - handleCol;
                var dy   = row - handleRow;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < rad)
                {
                    var normDist = dist / rad;
                    var falloff  = Math.pow(1.0 - normDist, CONFIG.glowFalloff);
                    var alpha    = CONFIG.minAlpha + falloff * (CONFIG.maxAlpha - CONFIG.minAlpha);
                    g.setColour(Colours.withAlpha(CONFIG.dotColour, alpha));
                    g.fillEllipse([
                        offsetX + col * (dotSize + gapSize),
                        offsetY + row * (dotSize + gapSize),
                        dotSize, dotSize
                    ]);
                }
            }
        }

        // Draw handle
        var hs = CONFIG.handleSize;
        var hx = handleX - hs * 0.5;
        var hy = handleY - hs * 0.5;

        g.setColour(Colours.withAlpha(CONFIG.handleColour, 0.15));
        g.fillEllipse([hx, hy, hs, hs]);

        g.setColour(CONFIG.handleColour);
        g.drawEllipse([hx, hy, hs, hs], CONFIG.handleStroke);
    });

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

    XY_pad.setMouseCallback(function(event)
    {
        var area = this.getLocalBounds(0);
        var w = area[2];
        var h = area[3];

        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        var padding = CONFIG.padding;

        var c = Math.floor((w - padding * 2 + gapSize) / (dotSize + gapSize));
        var r = Math.floor((h - padding * 2 + gapSize) / (dotSize + gapSize));

        var totalGridW = c * dotSize + (c - 1) * gapSize;
        var totalGridH = r * dotSize + (r - 1) * gapSize;
        var offsetX = (w - totalGridW) / 2;
        var offsetY = (h - totalGridH) / 2;

        if (event.doubleClick)
        {
            xValue = 0.5;
            yValue = 0.5;
            X_knb.setValueNormalized(0.5);
            X_knb.changed();
            Y_knb.setValueNormalized(0.5);
            Y_knb.changed();
            return;
        }

        if (event.clicked)
        {
            isDragging = true;
        }

        if (event.mouseUp)
        {
            isDragging = false;
        }

        if (isDragging || event.clicked)
        {
            xValue = clamp((event.x - offsetX - dotSize * 0.5) / (totalGridW - dotSize), 0.0, 1.0);
            yValue = clamp((event.y - offsetY - dotSize * 0.5) / (totalGridH - dotSize), 0.0, 1.0);

            X_knb.setValueNormalized(xValue);
            X_knb.changed();
            Y_knb.setValueNormalized(1.0 - yValue);
            Y_knb.changed();

            XY_overlay.repaint(); // only the dynamic layer needs updating
        }
    });

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

    // Config setters that affect the background grid → repaint both layers
    inline function setDotSize(size)
    {
        CONFIG.dotSize = size;
        XY_pad.repaint();
        XY_overlay.repaint();
    }

    inline function setGap(g)
    {
        CONFIG.gap = g;
        XY_pad.repaint();
        XY_overlay.repaint();
    }

    inline function setPadding(p)
    {
        CONFIG.padding = p;
        XY_pad.repaint();
        XY_overlay.repaint();
    }

    inline function setDotColour(c)
    {
        CONFIG.dotColour = c;
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
    inline function setHandleSize(s)
    {
        CONFIG.handleSize = s;
        XY_overlay.repaint();
    }

    inline function setHandleColour(c)
    {
        CONFIG.handleColour = c;
        XY_overlay.repaint();
    }

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

    inline function repaint()
    {
        XY_overlay.repaint();
    }

    inline function repaintBackground()
    {
        XY_pad.repaint();
    }
}

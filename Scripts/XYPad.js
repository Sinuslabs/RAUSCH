/**
 * @file XYPad.js
 * @description 2D XY pad with dot-grid background and draggable handle.
 *   Renders a grid of dots with a glow effect around the handle position.
 *   X-axis controls Filter frequency, Y-axis controls Gater mix (inverted).
 *
 * @outline
 *   Filter / Gater         DSP effects controlled by X and Y axes
 *   XY_pad                 Panel component hosting the pad
 *   CONFIG                 Layout: dotSize, gap, padding, handleSize, glowRadius, glowFalloff, etc.
 *   xValue / yValue        Normalized 0-1 position of the handle
 *   setPaintRoutine        Renders dot grid with glow proximity effect + handle circle
 *   setMouseCallback       Drag to update xValue/yValue, sets Filter.Filter and Gater.Mix
 *   setX(val) / setY(val)  Programmatic position setters
 *   setXY(x, y)            Set both axes at once
 *   getX() / getY()        Read current position
 *   setDotSize/Gap/etc.    Visual config setters
 *   setGlowRadius/Falloff  Control handle proximity glow
 *   setAlphaRange()        Set min/max dot opacity
 *   repaint()              Force repaint
 *
 * @dependencies Synth.getEffect("Filter"/"Gater")
 * @ui XY_pad
 */
namespace XYPad {

	const var Filter = Synth.getEffect("Filter");
	const var Gater = Synth.getEffect("Gater");
    const var XY_pad = Content.getComponent("XY_pad");

    const var CONFIG = {
        dotSize: 8,
        gap: 4,
        padding: 10,
        dotColour: 0x88FFFFFF,
        handleSize: 18,
        handleColour: 0xFFFFFFFF,
        glowRadius: 5.0,
        glowFalloff: 2.0,
        minAlpha: 0.1,
        maxAlpha: 1.0,
        handleStroke: 2.0,
        wiggleAmount: 2.5,
        wiggleSpeed: 0.4
    };

    var xValue = 0.5;
    var yValue = 0.5;
    var isDragging = false;
    var cols = 0;
    var rows = 0;
    var wiggleTime = 0.0;

    var wigglePhasesX = [];
    var wigglePhasesY = [];
    var wiggleInited = false;
    var wi = 0;

    inline function initWigglePhases(numDots)
    {
        wigglePhasesX = [];
        wigglePhasesY = [];

        for (wi = 0; wi < numDots; wi++)
        {
            wigglePhasesX.push(Math.random() * Math.PI * 2.0);
            wigglePhasesY.push(Math.random() * Math.PI * 2.0);
        }

        wiggleInited = true;
    }

    inline function clamp(val, lo, hi)
    {
        if (val < lo) return lo;
        if (val > hi) return hi;
        return val;
    }

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

        var totalDots = cols * rows;

        if (!wiggleInited || wigglePhasesX.length != totalDots)
            initWigglePhases(totalDots);

        var totalGridW = cols * dotSize + (cols - 1) * gapSize;
        var totalGridH = rows * dotSize + (rows - 1) * gapSize;
        var offsetX = (w - totalGridW) / 2;
        var offsetY = (h - totalGridH) / 2;

        // Handle position in pixel space
        var handleX = offsetX + xValue * (totalGridW - dotSize) + dotSize * 0.5;
        var handleY = offsetY + yValue * (totalGridH - dotSize) + dotSize * 0.5;

        // Handle position in grid-column/row space
        var handleCol = xValue * (cols - 1);
        var handleRow = yValue * (rows - 1);

        var t = wiggleTime;
        var wigAmt = CONFIG.wiggleAmount;

        for (var row = 0; row < rows; row++)
        {
            for (var col = 0; col < cols; col++)
            {
                var x = offsetX + col * (dotSize + gapSize);
                var y = offsetY + row * (dotSize + gapSize);

                // Distance from this dot to the handle in grid units
                var dx = col - handleCol;
                var dy = row - handleRow;
                var dist = Math.sqrt(dx * dx + dy * dy);

                var alpha = CONFIG.minAlpha;
                var proximity = 0.0;

                if (dist < CONFIG.glowRadius)
                {
                    var normDist = dist / CONFIG.glowRadius;
                    var falloff = Math.pow(1.0 - normDist, CONFIG.glowFalloff);
                    alpha = CONFIG.minAlpha + falloff * (CONFIG.maxAlpha - CONFIG.minAlpha);
                    proximity = falloff;
                }

                g.setColour(Colours.withAlpha(CONFIG.dotColour, alpha));

                if (proximity > 0.0)
                {
                    var dotIndex = row * cols + col;
                    var wx = Math.sin(t + wigglePhasesX[dotIndex]) * wigAmt * proximity;
                    var wy = Math.cos(t * 0.7 + wigglePhasesY[dotIndex]) * wigAmt * proximity;
                    g.fillEllipse([x + wx, y + wy, dotSize, dotSize]);
                }
                else
                {
                    g.fillEllipse([x, y, dotSize, dotSize]);
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

    XY_pad.setTimerCallback(function()
    {
        wiggleTime += CONFIG.wiggleSpeed;
        this.repaint();
    });

    XY_pad.startTimer(40);

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

            Filter.setAttribute(Filter.Filter, xValue);
            Gater.setAttribute(Gater.Mix, (1.0 - yValue) * 100.0);

            this.repaint();
            this.changed();
        }
    });

    inline function setX(val)
    {
        xValue = clamp(val, 0.0, 1.0);
        XY_pad.repaint();
    }

    inline function setY(val)
    {
        yValue = clamp(val, 0.0, 1.0);
        XY_pad.repaint();
    }

    inline function setXY(x, y)
    {
        xValue = clamp(x, 0.0, 1.0);
        yValue = clamp(y, 0.0, 1.0);
        XY_pad.repaint();
    }

    inline function getX()
    {
        return xValue;
    }

    inline function getY()
    {
        return yValue;
    }

    inline function setDotSize(size)
    {
        CONFIG.dotSize = size;
        XY_pad.repaint();
    }

    inline function setGap(g)
    {
        CONFIG.gap = g;
        XY_pad.repaint();
    }

    inline function setPadding(p)
    {
        CONFIG.padding = p;
        XY_pad.repaint();
    }

    inline function setDotColour(c)
    {
        CONFIG.dotColour = c;
        XY_pad.repaint();
    }

    inline function setHandleSize(s)
    {
        CONFIG.handleSize = s;
        XY_pad.repaint();
    }

    inline function setHandleColour(c)
    {
        CONFIG.handleColour = c;
        XY_pad.repaint();
    }

    inline function setGlowRadius(r)
    {
        CONFIG.glowRadius = r;
        XY_pad.repaint();
    }

    inline function setGlowFalloff(f)
    {
        CONFIG.glowFalloff = f;
        XY_pad.repaint();
    }

    inline function setAlphaRange(minA, maxA)
    {
        CONFIG.minAlpha = minA;
        CONFIG.maxAlpha = maxA;
        XY_pad.repaint();
    }

    inline function repaint()
    {
        XY_pad.repaint();
    }
}

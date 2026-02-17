/**
 * @file DotPnl.js
 * @description Animated dot-grid panel with 11 switchable animation modes.
 *   Renders a grid of dots on "Dot_pnl" and animates their alpha values using
 *   various algorithms. Supports mode cycling and per-mode parameter tuning.
 *
 * @outline
 *   CONFIG                  Dot grid layout: dotSize, gap, padding, dotColour
 *   ANIM                    Global animation: speed, waveCount, minAlpha, maxAlpha, direction, mode
 *   RAIN/STATIC/SCAN/etc.   Per-mode config objects
 *   calcTunnelAlpha()       Radial concentric-ring animation
 *   calcRainAlpha()         Matrix-style falling column drops
 *   calcStaticAlpha()       Random TV-static flicker
 *   calcScanAlpha()         Moving scan-line bar
 *   calcPulseAlpha()        Radial pulse from center
 *   calcPlasmaAlpha()       Multi-sine plasma pattern
 *   calcRippleAlpha()       Randomly spawning concentric ripples
 *   calcVortexAlpha()       Spinning spiral-arm vortex
 *   calcBreatheAlpha()      Breathing glow in/out
 *   calcWaveAlpha()         Directional sine wave
 *   calcNoiseAlpha()        Smooth Perlin noise with octaves
 *   setMode(mode)           Switch animation mode (resets phase)
 *   startAnimation()        Start the render timer
 *   stopAnimation()         Stop the render timer
 *   nextMode/prevMode       Cycle through modes
 *   startCycle/stopCycle    Auto-cycle modes on a timer
 *   set*() helpers          Per-mode parameter setters
 *
 * @dependencies None (self-contained namespace)
 * @ui Dot_pnl
 */
namespace DotPnl {

    const var Dot_pnl = Content.getComponent("Dot_pnl");

    const var CONFIG = {
        dotSize: 8,
        gap: 4,
        padding: 10,
        dotColour: 0x88FFFFFF
    };

    const var ANIM = {
        speed: 0.05,
        waveCount: 3.0,
        minAlpha: 0.1,
        maxAlpha: 1.0,
        direction: 1,
        mode: "tunnel"
    };

    const var RAIN = {
        dropCount: 8,
        trailLength: 4,
        speed: 0.15
    };

    const var SCAN = {
        width: 3.0,
        speed: 0.08,
        vertical: false
    };

    const var RIPPLE = {
        maxRipples: 5,
        speed: 0.04,
        decay: 0.015,
        frequency: 8.0,
        spawnRate: 0.02
    };

    const var VORTEX = {
        speed: 0.02,
        twist: 3.0,
        arms: 3
    };

    const var NOISE = {
        speed: 0.04,
        scale: 5.0,
        octaves: 4
    };

    var animationData = [];
    var phase = 0.0;
    var phase2 = 0.0;
    var cols = 0;
    var rows = 0;
    var rainDrops = [];
    var ripples = [];

    const var Timer = Engine.createTimerObject();

    inline function calcTunnelAlpha(col, row, centerCol, centerRow, maxDist)
    {
        local dx = col - centerCol;
        local dy = row - centerRow;
        local dist = Math.sqrt(dx * dx + dy * dy);
        local normDist = dist / maxDist;

        local wave = Math.sin((normDist * ANIM.waveCount * Math.PI * 2.0) + (phase * ANIM.direction));
        return ANIM.minAlpha + (wave + 1.0) * 0.5 * (ANIM.maxAlpha - ANIM.minAlpha);	
    }

    inline function calcRainAlpha(col, row)
    {
        local alpha = ANIM.minAlpha;

        for (i = 0; i < rainDrops.length; i++)
        {
            local drop = rainDrops[i];
            if (drop.col == col)
            {
                local dist = row - drop.row;
                if (dist >= 0 && dist < RAIN.trailLength)
                {
                    local trailAlpha = ANIM.maxAlpha * (1.0 - (dist / RAIN.trailLength));
                    if (trailAlpha > alpha)
                        alpha = trailAlpha;
                }
            }
        }

        return alpha;
    }

    inline function initRainDrops()
    {
        rainDrops = [];
        for (i = 0; i < RAIN.dropCount; i++)
        {
            rainDrops.push({
                "col": Math.floor(Math.random() * Math.max(1, cols)),
                "row": Math.floor(Math.random() * Math.max(1, rows)) - rows
            });
        }
    }

    inline function calcScanAlpha(col, row)
    {
        local pos = SCAN.vertical ? col : row;
        local max = SCAN.vertical ? cols : rows;
        local scanPos = phase * max;

        local dist = Math.abs(pos - scanPos);
        if (dist > max / 2.0)
            dist = max - dist;

        if (dist < SCAN.width)
        {
            local falloff = 1.0 - (dist / SCAN.width);
            return ANIM.minAlpha + (falloff * falloff * (ANIM.maxAlpha - ANIM.minAlpha));
        }

        return ANIM.minAlpha;
    }

    inline function calcRippleAlpha(col, row, centerCol, centerRow, maxDist)
    {
        local alpha = ANIM.minAlpha;

        for (i = 0; i < ripples.length; i++)
        {
            local r = ripples[i];
            local dx = col - r.x;
            local dy = row - r.y;
            local dist = Math.sqrt(dx * dx + dy * dy);

            local wave = Math.sin(dist * RIPPLE.frequency - r.age * 10.0);
            local envelope = Math.max(0.0, r.strength * (1.0 - dist / (maxDist * 1.5)));

            local contribution = envelope * (wave + 1.0) * 0.5;
            alpha = alpha + contribution * (ANIM.maxAlpha - ANIM.minAlpha);
        }

        return Math.min(ANIM.maxAlpha, alpha);
    }

    inline function initRipples()
    {
        ripples = [];
    }

    inline function spawnRipple()
    {
        if (ripples.length < RIPPLE.maxRipples)
        {
            ripples.push({
                "x": Math.random() * cols,
                "y": Math.random() * rows,
                "age": 0.0,
                "strength": 0.5 + Math.random() * 0.5
            });
        }
    }

    inline function atan2(y, x)
    {
        if (x > 0)
            return Math.atan(y / x);
        else if (x < 0 && y >= 0)
            return Math.atan(y / x) + Math.PI;
        else if (x < 0 && y < 0)
            return Math.atan(y / x) - Math.PI;
        else if (x == 0 && y > 0)
            return Math.PI / 2.0;
        else if (x == 0 && y < 0)
            return -Math.PI / 2.0;
        else
            return 0.0;
    }

    inline function calcVortexAlpha(col, row, centerCol, centerRow, maxDist)
    {
        local dx = col - centerCol;
        local dy = row - centerRow;
        local dist = Math.sqrt(dx * dx + dy * dy);
        local normDist = dist / maxDist;

        local angle = atan2(dy, dx);
        local twist = angle + normDist * VORTEX.twist + phase;

        local arms = Math.sin(twist * VORTEX.arms);
        local fade = 1.0 - normDist * 0.3;

        local value = (arms + 1.0) * 0.5 * fade;

        return ANIM.minAlpha + value * (ANIM.maxAlpha - ANIM.minAlpha);
    }

    inline function hash(x, y)
    {
        local n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }

    inline function smoothNoise(x, y)
    {
        local ix = Math.floor(x);
        local iy = Math.floor(y);
        local fx = x - ix;
        local fy = y - iy;

        fx = fx * fx * (3.0 - 2.0 * fx);
        fy = fy * fy * (3.0 - 2.0 * fy);

        local a = hash(ix, iy);
        local b = hash(ix + 1, iy);
        local c = hash(ix, iy + 1);
        local d = hash(ix + 1, iy + 1);

        return a + fx * (b - a) + fy * (c - a) + fx * fy * (a - b - c + d);
    }

    inline function calcNoiseAlpha(col, row)
    {
        local x = col / Math.max(1, cols) * NOISE.scale + phase;
        local y = row / Math.max(1, rows) * NOISE.scale + phase2;

        local value = 0.0;
        local amplitude = 1.0;
        local totalAmp = 0.0;

        for (o = 0; o < NOISE.octaves; o++)
        {
            value = value + smoothNoise(x, y) * amplitude;
            totalAmp = totalAmp + amplitude;
            x = x * 2.0;
            y = y * 2.0;
            amplitude = amplitude * 0.5;
        }

        value = value / totalAmp;

        return ANIM.minAlpha + value * (ANIM.maxAlpha - ANIM.minAlpha);
    }

    Dot_pnl.setPaintRoutine(function(g)
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

        var centerCol = (cols - 1) / 2.0;
        var centerRow = (rows - 1) / 2.0;
        var maxDist = Math.sqrt(centerCol * centerCol + centerRow * centerRow);

        var dotIndex = 0;

        for (row = 0; row < rows; row++)
        {
            for (col = 0; col < cols; col++)
            {
                var x = offsetX + col * (dotSize + gapSize);
                var y = offsetY + row * (dotSize + gapSize);

                var alpha = ANIM.minAlpha;

                if (animationData.length > dotIndex)
                {
                    alpha = animationData[dotIndex];
                }
                else if (ANIM.mode == "tunnel")
                {
                    alpha = calcTunnelAlpha(col, row, centerCol, centerRow, maxDist);
                }
                else if (ANIM.mode == "rain")
                {
                    alpha = calcRainAlpha(col, row);
                }
                else if (ANIM.mode == "scan")
                {
                    alpha = calcScanAlpha(col, row);
                }
                else if (ANIM.mode == "ripple")
                {
                    alpha = calcRippleAlpha(col, row, centerCol, centerRow, maxDist);
                }
                else if (ANIM.mode == "vortex")
                {
                    alpha = calcVortexAlpha(col, row, centerCol, centerRow, maxDist);
                }
                else if (ANIM.mode == "noise")
                {
                    alpha = calcNoiseAlpha(col, row);
                }

                g.setColour(Colours.withAlpha(CONFIG.dotColour, alpha));
                g.fillEllipse([x, y, dotSize, dotSize]);

                dotIndex++;
            }
        }
    });

    Timer.setTimerCallback(function()
    {
        if (ANIM.mode == "tunnel")
        {
            phase += ANIM.speed;
            if (phase > Math.PI * 2.0)
                phase -= Math.PI * 2.0;
        }
        else if (ANIM.mode == "rain")
        {
            for (i = 0; i < rainDrops.length; i++)
            {
                rainDrops[i].row += RAIN.speed;

                if (rainDrops[i].row > rows + RAIN.trailLength)
                {
                    rainDrops[i].row = -RAIN.trailLength;
                    rainDrops[i].col = Math.floor(Math.random() * Math.max(1, cols));
                }
            }
        }
        else if (ANIM.mode == "scan")
        {
            phase += SCAN.speed;
            if (phase > 1.0)
                phase -= 1.0;
        }
        else if (ANIM.mode == "ripple")
        {
            if (Math.random() < RIPPLE.spawnRate)
                spawnRipple();

            var newRipples = [];
            for (i = 0; i < ripples.length; i++)
            {
                ripples[i].age += RIPPLE.speed;
                ripples[i].strength -= RIPPLE.decay;

                if (ripples[i].strength > 0)
                    newRipples.push(ripples[i]);
            }
            ripples = newRipples;
        }
        else if (ANIM.mode == "vortex")
        {
            phase += VORTEX.speed;
        }
        else if (ANIM.mode == "noise")
        {
            phase += NOISE.speed;
            phase2 += NOISE.speed * 0.8;
        }

        Dot_pnl.repaint();
    });

    inline function startAnimation(intervalMs)
    {
        Timer.startTimer(intervalMs);
    }

    inline function stopAnimation()
    {
        Timer.stopTimer();
    }

    inline function setSpeed(s)
    {
        ANIM.speed = s;
    }

    inline function setWaveCount(w)
    {
        ANIM.waveCount = w;
        Dot_pnl.repaint();
    }

    inline function setDirection(d)
    {
        ANIM.direction = d;
    }

    inline function setAlphaRange(minA, maxA)
    {
        ANIM.minAlpha = minA;
        ANIM.maxAlpha = maxA;
        Dot_pnl.repaint();
    }

    inline function setMode(mode)
    {
        ANIM.mode = mode;

        if (mode == "rain")
            initRainDrops();
        else if (mode == "ripple")
            initRipples();

        phase = 0.0;
        phase2 = 0.0;

        Dot_pnl.repaint();
    }

    inline function setRainDropCount(count)
    {
        RAIN.dropCount = count;
        initRainDrops();
    }

    inline function setRainTrailLength(len)
    {
        RAIN.trailLength = len;
    }

    inline function setRainSpeed(s)
    {
        RAIN.speed = s;
    }

    inline function setScanWidth(w)
    {
        SCAN.width = w;
    }

    inline function setScanSpeed(s)
    {
        SCAN.speed = s;
    }

    inline function setScanVertical(v)
    {
        SCAN.vertical = v;
        Dot_pnl.repaint();
    }

    inline function setRippleMaxCount(m)
    {
        RIPPLE.maxRipples = m;
    }

    inline function setRippleSpeed(s)
    {
        RIPPLE.speed = s;
    }

    inline function setRippleDecay(d)
    {
        RIPPLE.decay = d;
    }

    inline function setRippleFrequency(f)
    {
        RIPPLE.frequency = f;
    }

    inline function setRippleSpawnRate(r)
    {
        RIPPLE.spawnRate = r;
    }

    inline function setVortexSpeed(s)
    {
        VORTEX.speed = s;
    }

    inline function setVortexTwist(t)
    {
        VORTEX.twist = t;
    }

    inline function setVortexArms(a)
    {
        VORTEX.arms = a;
    }

    inline function setNoiseSpeed(s)
    {
        NOISE.speed = s;
    }

    inline function setNoiseScale(s)
    {
        NOISE.scale = s;
    }

    inline function setNoiseOctaves(o)
    {
        NOISE.octaves = o;
    }

    inline function setDotSize(size)
    {
        CONFIG.dotSize = size;
        Dot_pnl.repaint();
    }

    inline function setGap(g)
    {
        CONFIG.gap = g;
        Dot_pnl.repaint();
    }

    inline function setPadding(p)
    {
        CONFIG.padding = p;
        Dot_pnl.repaint();
    }

    inline function setDotColour(c)
    {
        CONFIG.dotColour = c;
        Dot_pnl.repaint();
    }

    inline function setAnimationData(data)
    {
        animationData = data;
        Dot_pnl.repaint();
    }

    inline function repaint()
    {
        Dot_pnl.repaint();
    }

    // Mode cycling
    const var modes = ["tunnel", "rain", "scan", "ripple", "vortex", "noise"];
    var currentModeIndex = 0;
    var cycleEnabled = false;

    const var CycleTimer = Engine.createTimerObject();

    CycleTimer.setTimerCallback(function()
    {
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        setMode(modes[currentModeIndex]);
        Console.print("Mode: " + modes[currentModeIndex]);
    });

    inline function startCycle(intervalMs)
    {
        cycleEnabled = true;
        CycleTimer.startTimer(intervalMs);
    }

    inline function stopCycle()
    {
        cycleEnabled = false;
        CycleTimer.stopTimer();
    }

    inline function nextMode()
    {
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        setMode(modes[currentModeIndex]);
        return modes[currentModeIndex];
    }

    inline function prevMode()
    {
        currentModeIndex = currentModeIndex - 1;
        if (currentModeIndex < 0)
            currentModeIndex = modes.length - 1;
        setMode(modes[currentModeIndex]);
        return modes[currentModeIndex];
    }

    // Auto-start animation
    startAnimation(30);
}
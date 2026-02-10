/**
 * @file Styles/RingKnobLAF.js
 * @description Full-featured ring knob with configurable arc, dual ellipses, indicator,
 *   track markers, modulation arcs, and flexible label positioning. Supports per-knob
 *   color config via text property (e.g. "Label;color=synth1;dots=hide;label=left").
 *
 * @outline
 *   CONFIG                    Arc range, track, marker, outer/inner ellipse, indicator,
 *                             center fill, modulation arc, and label settings
 *   parseKnobConfig(text)     Parses "label;dots=X;label=X;color=X" from obj.text
 *   getKnobColor(config)      Resolves color from synth colors, theme paths, or hex values
 *   isSynthColor(config)      Checks if color is synth1-4
 *   draw(g, obj)              Renders: optional track, rotated outer ellipse + indicator,
 *                             inner ellipse, center fill, track markers (dots), modulation
 *                             range/active arcs with glow, and positioned label text
 *   laf                       Local LAF registered as "drawRotarySlider"
 *   Auto-applied to           All components matching "_RingKnb"
 *
 * @dependencies Theme (TC colors), Globals.colours (synth colors), Icons
 * @ui *_RingKnb
 */
namespace RingKnobLAF {

    const var CONFIG = {
        // Arc range (how far the knob travels, in radians)
        arcRange: 2.3,

        // Outer track
        trackThickness: 6,
        trackInset: 0.1,
        trackEnabled: false,

        // Track markers
        markerSize: 3,
        markerOpacity: 0.7,

        // Outer ellipse (knob body)
        outerEllipseInset: 0.2,
        outerEllipseStroke: 1.0,

        // Inner ellipse (center)
        innerEllipseInset: 0.41,
        innerEllipseStroke: 1.0,

        // Center fill ellipse (for synth colors)
        centerFillEnabled: true,
        centerFillInset: 0.45,

        // Indicator (rounded rectangle)
        indicatorWidth: 0.02,
        indicatorHeight: 0.21,
        indicatorPosition: -0.,
        indicatorCornerRadius: 0.,

        // Modulation arc
        modArcInset: 0.15,
        modRangeOpacity: 0.13,
        modGlowThickness: 0.5,
        modLineThickness: 2,

        // Label
        labelEnabled: true,
        labelFontSize: 16,
        labelBottomOffset: 0
    };

    // Path style for arcs
    var p = {};
    p.EndCapStyle = "rounded";
    p.JointStyle = "rounded";
    p.Thickness = CONFIG.trackThickness;

    inline function parseKnobConfig(text) {
        local config = {
            "label": "",
            "dots": "default",
            "labelPos": "default",
            "color": "default"
        };

        if (text == "" || text.indexOf(";") == -1) {
            config.label = text;
            return config;
        }

        local parts = text.split(";");
        config.label = parts[0];

        for (i = 1; i < parts.length; i++) {
            local kv = parts[i].split("=");
            if (kv.length == 2) {
                local key = kv[0].trim();
                local value = kv[1].trim();

                if (key == "dots") config.dots = value;
                if (key == "label") config.labelPos = value;
                if (key == "color") config.color = value;
            }
        }

        return config;
    }

    inline function getKnobColor(colorConfig, baseAlpha) {
        if (colorConfig == "default" || colorConfig == "") {
            return Colours.withAlpha(TC.UI.on_background, baseAlpha);
        }

        // Check for synth colors (synth1, synth2, synth3, synth4)
        if (isDefined(Globals.colours)) {
            if (colorConfig == "synth1" && isDefined(Globals.colours.synth1)) {
                return Colours.withAlpha(Globals.colours.synth1, baseAlpha);
            }
            if (colorConfig == "synth2" && isDefined(Globals.colours.synth2)) {
                return Colours.withAlpha(Globals.colours.synth2, baseAlpha);
            }
            if (colorConfig == "synth3" && isDefined(Globals.colours.synth3)) {
                return Colours.withAlpha(Globals.colours.synth3, baseAlpha);
            }
            if (colorConfig == "synth4" && isDefined(Globals.colours.synth4)) {
                return Colours.withAlpha(Globals.colours.synth4, baseAlpha);
            }
        }

        local parts = colorConfig.split(".");
        if (parts.length == 2) {
            local category = parts[0];
            local colorName = parts[1];

            if (category == "UI" && isDefined(TC.UI[colorName])) {
                return Colours.withAlpha(TC.UI[colorName], baseAlpha);
            }
            if (category == "Effect" && isDefined(TC.Effect[colorName])) {
                return Colours.withAlpha(TC.Effect[colorName], baseAlpha);
            }
            if (category == "Knob" && isDefined(TC.Knob[colorName])) {
                return Colours.withAlpha(TC.Knob[colorName], baseAlpha);
            }
            if (category == "Display" && isDefined(TC.Display[colorName])) {
                return Colours.withAlpha(TC.Display[colorName], baseAlpha);
            }
        }

        if (colorConfig.indexOf("0x") == 0 || colorConfig.indexOf("#") == 0) {
            local hexValue = colorConfig.replace("#", "0x");
            return Colours.withAlpha(parseInt(hexValue), baseAlpha);
        }

        return Colours.withAlpha(TC.UI.on_background, baseAlpha);
    }
    
    inline function isSynthColor(colorConfig) {
        return (colorConfig == "synth1" || colorConfig == "synth2" ||
            colorConfig == "synth3" || colorConfig == "synth4");
    }

    inline function draw(g, obj) {
        local cfg = parseKnobConfig(obj.text);

        local baseAlpha = 1.0;
        if (!obj.enabled)
            baseAlpha = 0.5;

        local colour = getKnobColor(cfg.color, baseAlpha);

        local paths = [];

        local w = obj.area[2];
        local h = obj.area[3];

        local size;
        local offsetX;
        local offsetY;
        local knobArea;
        local labelArea;

        if (cfg.labelPos == "left" || cfg.labelPos == "right") {
            size = h;
            offsetY = 0;

            if (cfg.labelPos == "left") {
                offsetX = w - size;
                labelArea = [0, 0, w - size, h];
            }
            else {
                offsetX = 0;
                labelArea = [size, 0, w - size, h];
            }
        }
        else {
            size = w;
            offsetX = 0;
            offsetY = 0;
            labelArea = obj.area;
        }

        local b = [offsetX, offsetY, size, size];
        local ARC = CONFIG.arcRange;

        for (i = 0; i < 4; i++) {
            paths.push(Content.createPath());
            paths[i].startNewSubPath(offsetX, offsetY);
            paths[i].startNewSubPath(offsetX + size, offsetY + size);
        }

        // Draw background track (optional)
        if (CONFIG.trackEnabled) {
            paths[0].addArc([0, 0, size, size], -ARC, ARC);
            g.setColour(Colours.withAlpha(colour, 0.13));
            p.Thickness = CONFIG.trackThickness;
            g.drawPath(paths[0], [offsetX, offsetY, size, size], p);
        }

        local r = -ARC + obj.valueNormalized * 2 * ARC;

        local centerX = offsetX + size / 2;
        local centerY = offsetY + size / 2;

        g.rotate(r, [centerX, centerY]);

        // Outer ellipse
        g.setColour(colour);
        g.drawEllipse([offsetX + CONFIG.outerEllipseInset * size, offsetY + CONFIG.outerEllipseInset * size, size - 2 * CONFIG.outerEllipseInset * size, size - 2 * CONFIG.outerEllipseInset * size], CONFIG.outerEllipseStroke);

        // Indicator
        local outerRadius = (size / 2) - (CONFIG.outerEllipseInset * size);
        local innerRadius = (size / 2) - (CONFIG.innerEllipseInset * size);
        local gapCenter = outerRadius - (outerRadius - innerRadius) * CONFIG.indicatorPosition;
        local indicatorY = -((size / 2) - gapCenter);

        g.setColour(colour);
        local indicatorRect = [
            offsetX + (size - CONFIG.indicatorWidth * size) / 2,
            offsetY + (size - CONFIG.indicatorHeight * size) / 2 + indicatorY,
            CONFIG.indicatorWidth * size,
            CONFIG.indicatorHeight * size
        ];
        g.fillRoundedRectangle(indicatorRect, CONFIG.indicatorCornerRadius);

        g.rotate(-r, [centerX, centerY]);

        // Inner ellipse
        g.setColour(colour);
        g.drawEllipse([offsetX + CONFIG.innerEllipseInset * size, offsetY + CONFIG.innerEllipseInset * size, size - 2 * CONFIG.innerEllipseInset * size, size - 2 * CONFIG.innerEllipseInset * size], CONFIG.innerEllipseStroke);

        // Center fill ellipse (for synth colors)
        if (CONFIG.centerFillEnabled && isSynthColor(cfg.color)) {
            local centerFillSize = size - 2 * CONFIG.centerFillInset * size;
            local centerFillX = offsetX + CONFIG.centerFillInset * size;
            local centerFillY = offsetY + CONFIG.centerFillInset * size;
            g.setColour(colour);
            g.fillEllipse([centerFillX, centerFillY, centerFillSize, centerFillSize]);
        }

        // Track markers (dots)
        if (cfg.dots != "hide") {
            local trackRadius = (size / 2) - (CONFIG.trackInset * size);
            local markerSize = CONFIG.markerSize;

            g.setColour(Colours.withAlpha(colour, CONFIG.markerOpacity));

            if (cfg.dots == "default" || cfg.dots == "two") {
                local leftX = centerX + Math.cos(-ARC - Math.PI / 2) * trackRadius;
                local leftY = centerY + Math.sin(-ARC - Math.PI / 2) * trackRadius;
                g.fillEllipse([leftX - markerSize / 2, leftY - markerSize / 2, markerSize, markerSize]);
            }

            if (cfg.dots == "default" || cfg.dots == "one") {
                local topX = centerX + Math.cos(-Math.PI / 2) * trackRadius;
                local topY = centerY + Math.sin(-Math.PI / 2) * trackRadius;
                g.fillEllipse([topX - markerSize / 2, topY - markerSize / 2, markerSize, markerSize]);
            }

            if (cfg.dots == "default" || cfg.dots == "two") {
                local rightX = centerX + Math.cos(ARC - Math.PI / 2) * trackRadius;
                local rightY = centerY + Math.sin(ARC - Math.PI / 2) * trackRadius;
                g.fillEllipse([rightX - markerSize / 2, rightY - markerSize / 2, markerSize, markerSize]);
            }
        }

        // Modulation arc inset calculations
        local modInset = CONFIG.modArcInset * size;
        local modArcSize = size - 2 * modInset;
        local modArcArea = [modInset, modInset, modArcSize, modArcSize];
        local modDrawArea = [offsetX + modInset, offsetY + modInset, modArcSize, modArcSize];

        // Modulation range arc
        paths[1].addArc(modArcArea, -ARC + obj.modMinValue * 2.0 * ARC, -ARC + obj.modMaxValue * 2.0 * ARC);
        g.setColour(Colours.withAlpha(colour, CONFIG.modRangeOpacity));
        p.Thickness = CONFIG.trackThickness;
        g.drawPath(paths[1], modDrawArea, p);

        // Active modulation
        if (obj.modulationActive) {
            local mv = (obj.scaledValue + obj.addValue);
            local lm = obj.lastModValue;

            paths[2].addArc(modArcArea, -ARC + lm * 2.0 * ARC, -ARC + mv * 2.0 * ARC);

            local brightness = mv - lm;
            local modRange = obj.modMaxValue - obj.modMinValue;
            local alpha = Math.range(1.0 - brightness / modRange, 0.0, 1.0);

            // Glow
            g.setColour(Colours.withAlpha(colour, alpha * 0.1));
            p.Thickness = CONFIG.modGlowThickness;
            g.drawPath(paths[2], modDrawArea, p);

            // Solid line
            p.Thickness = CONFIG.modLineThickness;
            g.setColour(colour);
            g.drawPath(paths[2], modDrawArea, p);
        }

        // Text label
        if (CONFIG.labelEnabled && cfg.labelPos != "hidden") {
            g.setColour(colour);
            g.setFont(Theme.Regular, CONFIG.labelFontSize);
            local displayText = obj.hover ? obj.valueAsText : cfg.label;

            if (cfg.labelPos == "left")
                g.drawAlignedText(displayText, labelArea, "right");
            else if (cfg.labelPos == "right")
                g.drawAlignedText(displayText, labelArea, "left");
            else {
                local bottomLabelArea = [obj.area[0], obj.area[1] + CONFIG.labelBottomOffset, obj.area[2], obj.area[3]];
                g.drawAlignedText(displayText, bottomLabelArea, "centredBottom");
            }
        }
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawRotarySlider", draw);

    const var components = Content.getAllComponents('_RingKnb');
    for (c in components) c.setLocalLookAndFeel(laf);
}

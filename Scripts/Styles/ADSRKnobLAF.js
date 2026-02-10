/**
 * @file Styles/ADSRKnobLAF.js
 * @description Look-and-feel for ADSR knobs. Draws a bordered rectangle with centered
 *   text (shows value on hover, label otherwise) and an optional modulation line at bottom.
 *
 * @outline
 *   CONFIG              borderRadius, strokeThickness, fontSize, padding, modLine settings
 *   draw(g, obj)        Renders border, text, and modulation indicator bar
 *   laf                 Local LAF registered as "drawRotarySlider"
 *   Auto-applied to     All components matching "_ADSR_knb"
 *
 * @dependencies Theme (TC.Display colors), StyleHelpers
 * @ui *_ADSR_knb
 */
namespace ADSRKnobLAF {

    const var CONFIG = {
        borderRadius: 2,
        strokeThickness: 1.0,
        fontSize: 12,
        padding: 2,
        modLineHeight: 2,
        modLineOffset: 3
    };

    inline function draw(g, obj) {
        local w = obj.area[2];
        local h = obj.area[3];

        local baseAlpha = obj.enabled ? 1.0 : 0.5;
        local colour = Colours.withAlpha(TC.Display.on_display_var, baseAlpha);

        // Border
        g.setColour(colour);
        g.drawRoundedRectangle([0, 0, w, h], CONFIG.borderRadius, CONFIG.strokeThickness);

        // Text - show value on hover, otherwise show text
        g.setFont(Theme.Regular, CONFIG.fontSize);
        local displayText = (obj.hover || obj.clicked) ? obj.valueAsText : obj.text;
        g.drawAlignedText(displayText, [0, 0, w, h], "centred");

        // Modulation line at bottom
        if (obj.modulationActive) {
            local lineY = h - CONFIG.modLineOffset;

            // Background track (full range)
            g.setColour(Colours.withAlpha(colour, 0.25));
            g.fillRect([0, lineY, w, CONFIG.modLineHeight]);

            // Active modulation value
            local modValue = obj.scaledValue + obj.addValue;
            local lineWidth = w * modValue;
            g.setColour(colour);
            g.fillRect([0, lineY, lineWidth, CONFIG.modLineHeight]);
        }
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawRotarySlider", draw);

    const var components = Content.getAllComponents("_ADSR_knb");
    for (c in components) c.setLocalLookAndFeel(laf);
}

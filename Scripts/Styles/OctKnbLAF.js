/**
 * @file Styles/OctKnbLAF.js
 * @description Octave knob styling with centered value text and bottom indicator line.
 *   Specific knob IDs (Synth1_Pitch_OctKnb, Synth1_Fine_OctKnb) show a disabled-color
 *   line unless hovered.
 *
 * @outline
 *   CONFIG              fontSize, lineHeight, lineOffset, hoverAlpha
 *   disabledLineIds     Array of component IDs that use disabled line color
 *   draw(g, obj)        Renders centered valueAsText + bottom line with conditional coloring
 *   laf                 Local LAF registered as "drawRotarySlider"
 *   Auto-applied to     All components matching "_OctKnb"
 *
 * @dependencies Theme (TC.UI / TC.Display colors)
 * @ui *_OctKnb
 */
namespace OctKnbLAF {

    const var CONFIG = {
        fontSize: 14,
        lineHeight: 2,
        lineOffset: 2,
        hoverAlpha: 0.7
    };

    const var disabledLineIds = ["Synth1_Pitch_OctKnb", "Synth1_Fine_OctKnb"];

    inline function draw(g, obj) {
        local w = obj.area[2];
        local h = obj.area[3];

        local colour = TC.UI.panel;

        if (obj.hover)
            colour = Colours.withAlpha(colour, CONFIG.hoverAlpha);

        // Centered text
        g.setColour(colour);
        g.setFont(Theme.Regular, CONFIG.fontSize);
        g.drawAlignedText(obj.valueAsText, [0, 0, w, h], "centred");

        // Line at bottom
        local lineY = h - CONFIG.lineOffset - CONFIG.lineHeight;
        local useDisabledLine = disabledLineIds.contains(obj.id) && !obj.hover;
        local lineColour = useDisabledLine ? TC.Display.on_display_disabled : TC.UI.panel;
        g.setColour(lineColour);
        g.fillRect([0, lineY, w, CONFIG.lineHeight]);
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawRotarySlider", draw);

    const var components = Content.getAllComponents("_OctKnb");
    for (c in components) c.setLocalLookAndFeel(laf);
}

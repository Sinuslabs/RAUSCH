/**
 * @file Styles/OctButtonLAF.js
 * @description Octave toggle button with centered text and a bottom indicator line.
 *   Line color switches between panel (active) and on_display_disabled (inactive).
 *
 * @outline
 *   CONFIG              fontSize, hoverAlpha, lineHeight, lineOffset
 *   draw(g, obj)        Renders centered text + horizontal line at bottom edge
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_oct_button"
 *
 * @dependencies Theme (TC.UI / TC.Display colors)
 * @ui *_oct_button
 */
namespace OctButtonLAF {

    const var CONFIG = {
        fontSize: 14,
        hoverAlpha: 0.7,
        lineHeight: 2,
        lineOffset: 2
    };

    inline function draw(g, obj) {
        local w = obj.area[2];
        local h = obj.area[3];

        local colour = TC.UI.panel;

        if (obj.over)
            colour = Colours.withAlpha(colour, CONFIG.hoverAlpha);

        // Centered text
        g.setColour(colour);
        g.setFont(Theme.Regular, CONFIG.fontSize);
        g.drawAlignedText(obj.text, [0, 0, w, h], "centred");

        // Line at bottom
        local lineY = h - CONFIG.lineOffset - CONFIG.lineHeight;
        local lineColour = obj.value ? TC.UI.panel : TC.Display.on_display_disabled;
        g.setColour(lineColour);
        g.fillRect([0, lineY, w, CONFIG.lineHeight]);
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawToggleButton", draw);

    const var components = Content.getAllComponents("_oct_button");
    for (c in components) c.setLocalLookAndFeel(laf);
}

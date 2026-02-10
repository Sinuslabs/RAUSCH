/**
 * @file Styles/DisplayButtonLAF.js
 * @description Toggle button styling for display-context buttons. When active, fills
 *   a rounded rect background and inverts the text color to on_display_contrast.
 *
 * @outline
 *   CONFIG              padding, textPadding, borderRadius, fontSize
 *   draw(g, obj)        Renders text with active/hover/disabled states, filled bg when toggled on
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_displayBtn"
 *
 * @dependencies Theme (TC.Display colors), StyleHelpers
 * @ui *_displayBtn
 */
namespace DisplayButtonLAF {

    const var CONFIG = {
        padding: 1,
        textPadding: 9,
        borderRadius: 2,
        fontSize: 16
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local paddedA = StyleHelpers.addPadding(a, CONFIG.padding);
        local textA = StyleHelpers.addPadding(paddedA, CONFIG.textPadding);

        if (obj.enabled) {
            g.setColour(TC.Display.on_display);
        } else {
            g.setColour(TC.Display.on_display_var);
        }

        if (!obj.over) {
            g.setColour(TC.Display.on_display_var);
        }

        if (obj.value) {
            g.setColour(TC.Display.on_display);
            g.fillRoundedRectangle(paddedA, CONFIG.borderRadius);
            g.setColour(TC.Display.on_display_contrast);
        }

        g.setFont(Theme.SemiBold, CONFIG.fontSize);
        g.drawAlignedText(obj.text, textA, 'left');
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_displayBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

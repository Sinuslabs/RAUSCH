/**
 * @file Styles/MenuLAF.js
 * @description Centered menu tab button with filled background when selected.
 *   Uses panel/on_panel colors. Selected state fills a rounded rect; unselected
 *   uses reduced alpha with hover brightening.
 *
 * @outline
 *   CONFIG              padding, textPadding, fontSize, inactiveAlpha
 *   draw(g, obj)        Renders centered text with filled rounded-rect bg when selected
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_menu"
 *
 * @dependencies Theme (TC.UI colors), StyleHelpers
 * @ui *_menu
 */
namespace MenuLAF {

    const var CONFIG = {
        padding: 1,
        textPadding: 5,
        fontSize: 16,
        inactiveAlpha: 0.4
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local paddedA = StyleHelpers.addPadding(a, CONFIG.padding);
        local textA = StyleHelpers.addPadding(paddedA, CONFIG.textPadding);

        // When selected, fill background with UI.panel color and border radius 3px
        if (obj.value) {
            g.setColour(TC.UI.panel);
            g.fillRoundedRectangle(paddedA, 3);

            // Set text color to UI.on_panel when selected
            g.setColour(TC.UI.on_panel);
        } else {
            // Not selected - use inactive alpha
            if (!obj.over) {
                g.setColour(Colours.withAlpha(TC.UI.panel, CONFIG.inactiveAlpha));
            } else {
                g.setColour(TC.UI.panel);
            }
        }

        g.setFont(Theme.SemiBold, CONFIG.fontSize);
        g.drawAlignedText(obj.text, paddedA, 'centred');
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_menu');
    for (c in components) c.setLocalLookAndFeel(laf);
}

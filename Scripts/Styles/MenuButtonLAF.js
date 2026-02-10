/**
 * @file Styles/MenuButtonLAF.js
 * @description Simple text-only toggle button for menu items. Shows text at reduced
 *   alpha when not hovered, full alpha on hover/active. No background fill.
 *
 * @outline
 *   CONFIG              padding, textPadding, fontSize, inactiveAlpha
 *   draw(g, obj)        Renders left-aligned text with hover/active alpha states
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_MenuBtn"
 *
 * @dependencies Theme (TC.UI colors), StyleHelpers
 * @ui *_MenuBtn
 */
namespace MenuButtonLAF {

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

        if (obj.value) {
            g.setColour(TC.UI.on_background);
        }

        if (!obj.over) {
            g.setColour(Colours.withAlpha(TC.UI.on_background, CONFIG.inactiveAlpha));
        }

        g.setFont(Theme.SemiBold, CONFIG.fontSize);
        g.drawAlignedText(obj.text, textA, 'left');
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_MenuBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

/**
 * @file Styles/SoloButtonLAF.js
 * @description Solo button with "S" label. Shows yellow (Effect.yellow) background when
 *   active, gray when inactive. Text inverts to black when soloed.
 *
 * @outline
 *   CONFIG              padding, cornerRadius, fontSize
 *   draw(g, obj)        Renders rounded rect with "S" text; yellow fill when active
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_solo_btn"
 *
 * @dependencies Theme (TC.Effect / TC.UI colors), StyleHelpers
 * @ui *_solo_btn
 */
namespace SoloButtonLAF {

    const var CONFIG = {
        padding: 4,
        cornerRadius: 4,
        fontSize: 14
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local pa = StyleHelpers.addPadding(a, CONFIG.padding);

        // Background - slightly rounded
        if (obj.value) {
            g.setColour(TC.Effect.yellow);
        } else {
            g.setColour(TC.UI.on_background_var);
        }
        g.fillRoundedRectangle(pa, CONFIG.cornerRadius);

        // Centered "S" text
        if (obj.value) {
            g.setColour(Colours.black);
        } else {
            g.setColour(TC.UI.on_background_text_disabled);
        }
        g.setFont(Theme.SemiBold, CONFIG.fontSize);
        g.drawAlignedText("S", pa, "centred");
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_solo_btn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

/**
 * @file Styles/TextButtonLAF.js
 * @description Simple text toggle button. Shows centered text with hover brightening.
 *   When active, fills a rounded rect with on_panel color and renders text in panel color.
 *
 * @outline
 *   CONFIG              padding, fontSize, fontSpacing
 *   draw(g, obj)        Renders centered text with rounded-rect fill when toggled on
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_textBtn"
 *
 * @dependencies Theme (TC.UI colors), StyleHelpers
 * @ui *_textBtn
 */
namespace TextButtonLAF {

    const var CONFIG = {
        padding: 4,
        fontSize: 18,
        fontSpacing: 0.02
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local textArea = StyleHelpers.addPadding(a, CONFIG.padding);

        g.setColour(TC.UI.on_background_var);

        if (obj.over) {
            g.setColour(TC.UI.on_background);
        }

        if (obj.value) {
            g.setColour(TC.UI.on_panel);
            g.fillRoundedRectangle(textArea, 3);
            g.setColour(TC.UI.panel);
        }

        g.setFontWithSpacing(Theme.Regular, CONFIG.fontSize, CONFIG.fontSpacing);
        g.drawAlignedText(obj.text, textArea, "centred");
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawToggleButton", draw);

    const var components = Content.getAllComponents('_textBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

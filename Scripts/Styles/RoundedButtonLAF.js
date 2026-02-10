/**
 * @file Styles/RoundedButtonLAF.js
 * @description Pill-shaped toggle button with rounded border. Draws an outlined rounded
 *   rectangle that fills solid when toggled on, inverting the text color.
 *
 * @outline
 *   CONFIG              padding, textPadding, borderRadius (12), borderWidth, fontSize,
 *                        disabledAlpha, hoverAlpha
 *   draw(g, obj)        Renders rounded border outline; fills + inverts text when value=true
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_roundBtn"
 *
 * @dependencies Theme (TC.UI colors), StyleHelpers
 * @ui *_roundBtn
 */
namespace RoundedButtonLAF {

    const var CONFIG = {
        padding: 3,
        textPadding: 9,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        disabledAlpha: 0.6,
        hoverAlpha: 0.9
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local paddedA = StyleHelpers.addPadding(a, CONFIG.padding);
        local textA = StyleHelpers.addPadding(paddedA, CONFIG.textPadding);

        local STROKE_COLOR = TC.UI.surface_darkest;
        local TEXT_INVERT_COLOR = TC.UI.on_background_text;

        if (!obj.enabled) {
            STROKE_COLOR = Colours.withAlpha(STROKE_COLOR, CONFIG.disabledAlpha);
        }

        if (obj.over) {
            STROKE_COLOR = Colours.withAlpha(STROKE_COLOR, CONFIG.hoverAlpha);
        }

        g.setColour(STROKE_COLOR);
        g.drawRoundedRectangle(paddedA, CONFIG.borderRadius, CONFIG.borderWidth);

        if (obj.value) {
            g.setColour(STROKE_COLOR);
            g.fillRoundedRectangle(paddedA, CONFIG.borderRadius);
            g.setColour(TEXT_INVERT_COLOR);
        }

        g.setFont(Theme.Regular, CONFIG.fontSize);
        g.drawAlignedText(obj.text, textA, 'centred');
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_roundBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

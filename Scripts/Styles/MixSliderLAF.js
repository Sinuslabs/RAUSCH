/**
 * @file Styles/MixSliderLAF.js
 * @description Horizontal fill-line slider with label below. Draws a thin horizontal
 *   track line with a filled portion representing the current value. Shows value text
 *   on hover, label text otherwise.
 *
 * @outline
 *   CONFIG              lineHeight, lineY position ratio, labelFontSize, labelOffset
 *   draw(g, obj)        Renders background line, filled portion, and centered label text
 *   laf                 Local LAF registered as "drawRotarySlider"
 *   Auto-applied to     All components matching "_RingSlider"
 *
 * @dependencies Theme (TC.UI colors)
 * @ui *_RingSlider
 */
namespace MixSliderLAF {

    const var CONFIG = {
        lineHeight: 2,
        lineY: 0.4,
        labelFontSize: 14,
        labelOffset: 8
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local w = a[2];
        local h = a[3];

        local baseAlpha = obj.enabled ? 1.0 : 0.5;
        local colour = Colours.withAlpha(TC.UI.on_background, baseAlpha);

        local lineY = h * CONFIG.lineY;
        local lineHeight = CONFIG.lineHeight;

        // Background line
        g.setColour(Colours.withAlpha(colour, 0.2));
        g.fillRect([0, lineY, w, lineHeight]);

        // Filled portion
        local fillWidth = w * obj.valueNormalized;
        g.setColour(colour);
        g.fillRect([0, lineY, fillWidth, lineHeight]);

        // Label below
        local labelY = lineY + CONFIG.labelOffset;
        local labelArea = [0, labelY, w, h - labelY];

        local displayText = obj.hover ? obj.valueAsText : obj.text;

        g.setColour(colour);
        g.setFont(Theme.Regular, CONFIG.labelFontSize);
        g.drawAlignedText(displayText, labelArea, "centred");
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawRotarySlider", draw);

    const var components = Content.getAllComponents('_RingSlider');
    for (c in components) c.setLocalLookAndFeel(laf);
}

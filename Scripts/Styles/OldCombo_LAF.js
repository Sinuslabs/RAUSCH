/**
 * @file Styles/OldCombo_LAF.js
 * @description Canvas-drawn combobox styling (active alternative to CSS-based ComboboxLAF).
 *   Renders a bordered combobox with text, dropdown arrow, and a custom popup menu
 *   with background, item rendering, separators, and sizing.
 *
 * @outline
 *   CONFIG               Layout: padding, borderRadius, borderWidth, fontSize, arrow dimensions
 *                         Popup: popupBorderRadius, popupItemHeight, popupItemPadding, popupItemFontSize,
 *                                popupHighlightAlpha, popupTickedAlpha, popupSeparatorHeight
 *   draw(g, obj)          Renders combobox border, text, and dropdown triangle arrow
 *   drawPopupBg(g, obj)   Fills popup background with rounded rect + border
 *   drawPopupItem(g, obj) Renders popup menu items with highlight/ticked/separator states
 *   getPopupItemSize(obj) Sets desired height for popup items and separators
 *   laf                   Local LAF with drawComboBox, drawPopupMenuBackground,
 *                          drawPopupMenuItem, getIdealPopupMenuItemSize registered
 *   Auto-applied to       All components matching "_cmb"
 *
 * @dependencies Theme (TC.Display colors)
 * @ui *_cmb
 */
namespace OldCombo_LAF {

    const var CONFIG = {
        // Layout
        padding: 4,
        borderRadius: 4,
        borderWidth: 1.0,

        // Font
        fontSize: 16,

        // Arrow
        arrowWidth: 6,
        arrowHeight: 4,
        arrowRight: 10,

        // Alpha
        hoverAlpha: 1.0,
        defaultAlpha: 0.7,
        disabledAlpha: 0.35,

        // Popup
        popupBorderRadius: 4,
        popupItemHeight: 28,
        popupItemPadding: 10,
        popupItemFontSize: 13,
        popupHighlightAlpha: 0.15,
        popupTickedAlpha: 1.0,
        popupSeparatorHeight: 1
    };

    // --- ComboBox ---
    inline function draw(g, obj) {
        local a = obj.area;
        local w = a[2];
        local h = a[3];

        local alpha = CONFIG.defaultAlpha;

        if (!obj.enabled)
            alpha = CONFIG.disabledAlpha;
        else if (obj.over)
            alpha = CONFIG.hoverAlpha;

        // Border
        local borderColour = Colours.withAlpha(TC.Display.on_display, alpha * 0.5);
        g.setColour(borderColour);
        g.drawRoundedRectangle([0, 0, w, h], CONFIG.borderRadius, CONFIG.borderWidth);

        // Text
        local textColour = Colours.withAlpha(TC.Display.on_display, alpha);
        g.setColour(textColour);
        g.setFont(Theme.Regular, CONFIG.fontSize);

        local textArea = [CONFIG.padding, 0, w - CONFIG.padding * 2 - CONFIG.arrowRight - CONFIG.arrowWidth, h];
        g.drawAlignedText(obj.text, textArea, "left");

        // Arrow
        local arrowX = w - CONFIG.arrowRight - CONFIG.arrowWidth;
        local arrowY = (h - CONFIG.arrowHeight) / 2;

        g.setColour(Colours.withAlpha(TC.Display.on_display, alpha));

        local p = Content.createPath();
        p.startNewSubPath(0.0, 0.0);
        p.lineTo(1.0, 0.0);
        p.lineTo(0.5, 1.0);
        p.closeSubPath();
        g.fillPath(p, [arrowX, arrowY, CONFIG.arrowWidth, CONFIG.arrowHeight]);
    }

    // --- Popup Background ---
    inline function drawPopupBg(g, obj) {
        local w = obj.width;
        local h = obj.height;

        g.setColour(TC.Display.display);
        g.fillRoundedRectangle([0, 0, w, h], CONFIG.popupBorderRadius);

        g.setColour(Colours.withAlpha(TC.Display.on_display, 0.15));
        g.drawRoundedRectangle([0, 0, w, h], CONFIG.popupBorderRadius, 1.0);
    }

    // --- Popup Menu Item ---
    inline function drawPopupItem(g, obj) {
        local a = obj.area;
        local w = a[2];
        local h = a[3];
        local textAlpha = CONFIG.defaultAlpha;

        if (obj.isSeparator)
        {
            g.setColour(Colours.withAlpha(TC.Display.on_display, 0.15));
            g.fillRect([CONFIG.popupItemPadding, h * 0.5, w - CONFIG.popupItemPadding * 2, CONFIG.popupSeparatorHeight]);
        }

        if (!obj.isSeparator && obj.isHighlighted)
        {
            g.setColour(Colours.withAlpha(TC.Display.on_display, CONFIG.popupHighlightAlpha));
            g.fillRoundedRectangle([2, 1, w - 4, h - 2], CONFIG.popupBorderRadius);
            textAlpha = CONFIG.hoverAlpha;
        }

        if (!obj.isSeparator && !obj.isActive)
            textAlpha = CONFIG.disabledAlpha;

        if (!obj.isSeparator && obj.isTicked)
            textAlpha = CONFIG.popupTickedAlpha;

        if (!obj.isSeparator)
        {
            g.setColour(Colours.withAlpha(TC.Display.on_display, textAlpha));
            g.setFont(Theme.Regular, CONFIG.popupItemFontSize);
            g.drawAlignedText(obj.text, [CONFIG.popupItemPadding, 0, w - CONFIG.popupItemPadding * 2, h], "left");
        }
    }

    // --- Popup Item Size ---
    inline function getPopupItemSize(obj) {
        if (obj.isSeparator)
            obj.desiredHeight = CONFIG.popupSeparatorHeight + 8;

        if (!obj.isSeparator)
            obj.desiredHeight = CONFIG.popupItemHeight;
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction("drawComboBox", draw);
    laf.registerFunction("drawPopupMenuBackground", drawPopupBg);
    laf.registerFunction("drawPopupMenuItem", drawPopupItem);
    laf.registerFunction("getIdealPopupMenuItemSize", getPopupItemSize);

    const var components = Content.getAllComponents("_cmb");
    for (c in components) c.setLocalLookAndFeel(laf);
}

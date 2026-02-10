/**
 * @file Styles/ToggleButtonLAF.js
 * @description Toggle button with icon + text. Draws an icon (from ICON_MAP or default
 *   caretDown) on the left and right-aligned text. Fills a pill-shaped background when
 *   active. Special handling for "Customize_toggleBtn" (icon only, no text).
 *
 * @outline
 *   CONFIG              padding, textPadding, borderRadius, iconSize, iconOffset, fontSize,
 *                        disabledAlpha, hoverAlpha
 *   ICON_MAP            Maps component IDs to icon names (Voices->Head, Prompt->Script, etc.)
 *   draw(g, obj)        Renders icon + right-aligned text; filled pill bg when active
 *   laf                 Local LAF registered as "drawToggleButton"
 *   Auto-applied to     All components matching "_toggleBtn"
 *
 * @dependencies Icons.get[], Theme (TC.UI / TC.Button colors), StyleHelpers
 * @ui *_toggleBtn
 */
namespace ToggleButtonLAF {

    const var CONFIG = {
        padding: 3,
        textPadding: 9,
        borderRadius: 12,
        iconSize: 14,
        iconOffsetX: 12,
        iconOffsetY: 8,
        fontSize: 16,
        disabledAlpha: 0.6,
        hoverAlpha: 0.9
    };

    // Icon mapping for specific button IDs
    const var ICON_MAP = {
        "Voices_toggleBtn": "Head",
        "Prompt_toggleBtn": "Script",
        "Customize_toggleBtn": "Gear"
    };

    inline function draw(g, obj) {
        local a = obj.area;
        local paddedA = StyleHelpers.addPadding(a, CONFIG.padding);
        local textA = StyleHelpers.addPadding(paddedA, CONFIG.textPadding);

        local icon = 'caretDown';

        // Check for custom icon based on component ID
        if (isDefined(ICON_MAP[obj.id])) {
            icon = ICON_MAP[obj.id];
        }

        local STROKE_COLOR = TC.UI.on_background;
        local TEXT_INVERT_COLOR = TC.Button.on_primary;

        if (!obj.enabled) {
            STROKE_COLOR = Colours.withAlpha(STROKE_COLOR, CONFIG.disabledAlpha);
        }

        if (obj.over) {
            STROKE_COLOR = Colours.withAlpha(STROKE_COLOR, CONFIG.hoverAlpha);
        }

        g.setColour(STROKE_COLOR);

        if (obj.value) {
            g.setColour(STROKE_COLOR);
            g.fillRoundedRectangle(paddedA, CONFIG.borderRadius);
            g.setColour(TEXT_INVERT_COLOR);
        }

        g.fillPath(Icons.get[icon], [a[0] + CONFIG.iconOffsetX, a[1] + CONFIG.iconOffsetY, CONFIG.iconSize, CONFIG.iconSize]);

        // Skip text for Customize button
        if (obj.id === 'Customize_toggleBtn') {
            return;
        }

        g.setFont(Theme.Regular, CONFIG.fontSize);
        g.drawAlignedText(obj.text, textA, 'right');
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_toggleBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

/**
 * @file Styles/DisplayIconButtonLAF.js
 * @description Icon toggle button for display panels. Parses icon name and size from
 *   the component's text property (format: "iconName;w=16;h=16") and renders the
 *   icon path from Icons.get[] with active/inactive/hover alpha states.
 *
 * @outline
 *   CONFIG                   defaultIconWidth/Height, activeAlpha, inactiveAlpha, disabledAlpha, hoverAlpha
 *   parseIconBtnConfig()     Parses "icon;w=N;h=N;style=X" from obj.text
 *   draw(g, obj)             Renders icon path with alpha based on value/enabled/hover state
 *   laf                      Local LAF registered as "drawToggleButton"
 *   Auto-applied to          All components matching "_displayIconBtn"
 *
 * @dependencies Icons.get[], Theme (TC.Display colors), StyleHelpers
 * @ui *_displayIconBtn
 */
namespace DisplayIconButtonLAF {

    const var CONFIG = {
        defaultIconWidth: 12,
        defaultIconHeight: 12,
        activeAlpha: 1.0,
        inactiveAlpha: 0.5,
        disabledAlpha: 0.6,
        hoverAlpha: 0.7
    };

    inline function parseIconBtnConfig(text) {
        local config = {
            "icon": "",
            "w": CONFIG.defaultIconWidth,
            "h": CONFIG.defaultIconHeight,
            "style": "default"
        };

        local parts = text.split(";");
        config.icon = parts[0];

        if (parts.length > 1 && parts[1].indexOf("=") != -1) {
            for (i = 1; i < parts.length; i++) {
                local kv = parts[i].split("=");
                if (kv.length == 2) {
                    local key = kv[0].trim();
                    local value = kv[1].trim();

                    if (key == "style") config.style = value;
                    if (key == "w") config.w = value.getIntValue();
                    if (key == "h") config.h = value.getIntValue();
                }
            }
        } else {
            if (parts[1]) config.w = parts[1].getIntValue();
            if (parts[2]) config.h = parts[2].getIntValue();
        }

        return config;
    }

    inline function draw(g, obj) {
        local a = obj.area;
        local cfg = parseIconBtnConfig(obj.text);

        a = StyleHelpers.withSizeKeepingCentre(a, cfg.w, cfg.h);

        local ICON_COLOUR = TC.Display.on_display;

        if (obj.value) {
            ICON_COLOUR = Colours.withAlpha(ICON_COLOUR, CONFIG.activeAlpha);
        } else {
            ICON_COLOUR = Colours.withAlpha(ICON_COLOUR, CONFIG.inactiveAlpha);
        }

        if (!obj.enabled) {
            ICON_COLOUR = Colours.withAlpha(ICON_COLOUR, CONFIG.disabledAlpha);
        }

        if (obj.over) {
            ICON_COLOUR = Colours.withAlpha(ICON_COLOUR, CONFIG.hoverAlpha);
        }

        g.setColour(ICON_COLOUR);
        g.fillPath(Icons.get[cfg.icon], a);
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_displayIconBtn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

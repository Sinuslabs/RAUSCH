/**
 * @file Styles/IconButtonLAF.js
 * @description Icon toggle button for UI panels. Parses icon name, size, and style
 *   from the component's text property. Supports a "display" style variant that uses
 *   Display colors instead of UI colors. Exposes claf for external use (e.g. PresetBrowser).
 *
 * @outline
 *   CONFIG                  defaultIconWidth/Height, activeAlpha, inactiveAlpha, disabledAlpha, hoverAlpha
 *   parseIconBtnConfig()    Parses "icon;w=N;h=N;style=display" from obj.text
 *   draw(g, obj)            Renders icon path with style-aware coloring and alpha states
 *   claf                    Local LAF registered as "drawToggleButton" (public, used by PresetBrowser)
 *   Auto-applied to         All components matching "_iconBtn"
 *
 * @dependencies Icons.get[], Theme (TC.UI / TC.Display colors), StyleHelpers
 * @ui *_iconBtn
 */
namespace IconButtonLAF {

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

        local ICON_COLOUR = TC.UI.on_background;
        local DISPLAY_ICON_COLOUR = TC.Display.on_display;

        if (cfg.style == "display") {
            ICON_COLOUR = Colours.withAlpha(DISPLAY_ICON_COLOUR, CONFIG.activeAlpha);
        }

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

    const var claf = Content.createLocalLookAndFeel();
    claf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_iconBtn');
    for (c in components) {
        c.setLocalLookAndFeel(claf);
    }
}

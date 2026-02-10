/**
 * @file Core/ThemeData.js
 * @description Theme color scheme definitions built from Primitives tokens.
 *   Defines LIGHT_THEME, SUPER_LIGHT_THEME, and DARK_THEME objects, each containing
 *   categorized color maps for UI, Effect, Knob, Display, Notification, and Button.
 *
 * @outline
 *   LIGHT_THEME        Light color scheme (dark text on light backgrounds)
 *     .Colors.UI         panel, background, on_background, surface_darkest, etc.
 *     .Colors.Effect     yellow, red, pink, purple, orange, green, blue + on_ variants
 *     .Colors.Knob       knob_body, knob_base, knob_outline, knob_accent + disabled variants
 *     .Colors.Display    display, on_display, on_display_contrast/var/disabled
 *     .Colors.Notification  primary, error, warning + on_ variants
 *     .Colors.Button     primary, on_primary, primary_var + disabled variants
 *   SUPER_LIGHT_THEME  Extra-light variant (inverted display colors)
 *   DARK_THEME         Dark color scheme (light text on dark backgrounds)
 *
 * @dependencies Primitives (color palettes)
 */
namespace ThemeData {
    const LIGHT_THEME = {
        Colors: {
            UI: {
                panel: Primitives.Colors.Base['200'],
                on_panel: Primitives.Colors.Base['700'],
                background: Primitives.Colors.Base['300'],
                on_background: Primitives.Colors.Base['700'],
                on_background_text: Primitives.Colors.Base['100'],
                on_background_text_disabled: Primitives.Colors.Base['400'],
                on_background_disabled: Primitives.Colors.Base['800'],
                on_background_var: Primitives.Colors.Base['600'],
                surface_darkest: Primitives.Colors.Base['1000']
            },
            Effect: {
                yellow: Primitives.Colors.AcidYellow['600'],
                on_yellow: Primitives.Colors.AcidYellow['1000'],
                red: Primitives.Colors.Red['500'],
                on_red: Primitives.Colors.Red['1000'],
                pink: Primitives.Colors.Purple['400'],
                on_pink: Primitives.Colors.Purple['1000'],
                purple: Primitives.Colors.Purple['600'],
                on_purple: Primitives.Colors.Purple['100'],
                orange: Primitives.Colors.Orange['1000'],
                on_orange: Primitives.Colors.Orange['100'],
                green: Primitives.Colors.Green['500'],
                on_green: Primitives.Colors.Green['1000'],
                blue: Primitives.Colors.Blue['500'],
                on_blue: Primitives.Colors.Blue['100'],
                lightBlue: Primitives.Colors.Blue['100'],
                onLightBlue: Primitives.Colors.Blue['1000']
            },
            Knob: {
                knob_body: Primitives.Colors.Base['100'],
                knob_base: Primitives.Colors.Base['400'],
                knob_outline: Primitives.Colors.Base['600'],
                knob_accent: Primitives.Colors.Base['800'],
                knob_base_disabled: Primitives.Colors.Base['400'],
                knob_body_disabled: Primitives.Colors.Base['200'],
                knob_accent_disabled: Primitives.Colors.Base['500']
            },
            Display: {
                display: Primitives.Colors.Base['900'],
                on_display: Primitives.Colors.Base['100'],
                on_display_contrast: Primitives.Colors.Base['800'],
                on_display_var: Primitives.Colors.Base['400'],
                on_display_disabled: Primitives.Colors.Base['500']
            },
            Notification: {
                primary: Primitives.Colors.Blue['100'],
                on_primary: Primitives.Colors.Blue['1000'],
                error: Primitives.Colors.Red['400'],
                on_error: Primitives.Colors.Red['1000'],
                warning: Primitives.Colors.AcidYellow['400'],
                on_warning: Primitives.Colors.AcidYellow['1000']
            },
            Button: {
                primary: Primitives.Colors.Base['900'],
                on_primary: Primitives.Colors.Base['50'],
                primary_var: Primitives.Colors.Base['600'],
                on_primary_var: Primitives.Colors.Base['100'],
                primary_disabled: Primitives.Colors.Base['500'],
                on_primary_disabled: Primitives.Colors.Base['300']
            },
        }
    };
    
    const SUPER_LIGHT_THEME = {
        Colors: {
            UI: {
                panel: Primitives.Colors.Base['200'],
                on_panel: Primitives.Colors.Base['700'],
                background: Primitives.Colors.Base['300'],
                on_background: Primitives.Colors.Base['700'],
                on_background_text: Primitives.Colors.Base['100'],
                on_background_text_disabled: Primitives.Colors.Base['400'],
                on_background_disabled: Primitives.Colors.Base['800'],
                on_background_var: Primitives.Colors.Base['600'],
                surface_darkest: Primitives.Colors.Base['1000']
            },
            Effect: {
                yellow: Primitives.Colors.AcidYellow['600'],
                on_yellow: Primitives.Colors.AcidYellow['1000'],
                red: Primitives.Colors.Red['500'],
                on_red: Primitives.Colors.Red['1000'],
                pink: Primitives.Colors.Purple['400'],
                on_pink: Primitives.Colors.Purple['1000'],
                purple: Primitives.Colors.Purple['600'],
                on_purple: Primitives.Colors.Purple['100'],
                orange: Primitives.Colors.Orange['1000'],
                on_orange: Primitives.Colors.Orange['100'],
                green: Primitives.Colors.Green['500'],
                on_green: Primitives.Colors.Green['1000'],
                blue: Primitives.Colors.Blue['500'],
                on_blue: Primitives.Colors.Blue['100'],
                lightBlue: Primitives.Colors.Blue['100'],
                onLightBlue: Primitives.Colors.Blue['1000']
            },
            Knob: {
                knob_body: Primitives.Colors.Base['100'],
                knob_base: Primitives.Colors.Base['400'],
                knob_outline: Primitives.Colors.Base['600'],
                knob_accent: Primitives.Colors.Base['800'],
                knob_base_disabled: Primitives.Colors.Base['400'],
                knob_body_disabled: Primitives.Colors.Base['200'],
                knob_accent_disabled: Primitives.Colors.Base['500']
            },
            Display: {
                display: Primitives.Colors.Base['50'],
                on_display: Primitives.Colors.Base['900'],
                on_display_contrast: Primitives.Colors.Base['50'],
                on_display_var: Primitives.Colors.Base['700'],
                on_display_disabled: Primitives.Colors.Base['600']
            },
            Notification: {
                primary: Primitives.Colors.Blue['100'],
                on_primary: Primitives.Colors.Blue['1000'],
                error: Primitives.Colors.Red['400'],
                on_error: Primitives.Colors.Red['1000'],
                warning: Primitives.Colors.AcidYellow['400'],
                on_warning: Primitives.Colors.AcidYellow['1000']
            },
            Button: {
                primary: Primitives.Colors.Base['900'],
                on_primary: Primitives.Colors.Base['50'],
                primary_var: Primitives.Colors.Base['600'],
                on_primary_var: Primitives.Colors.Base['100'],
                primary_disabled: Primitives.Colors.Base['500'],
                on_primary_disabled: Primitives.Colors.Base['300']
            },
        }
    };


    const DARK_THEME = {
        Colors: {
            UI: {
                panel: Primitives.Colors.Base['700'],
                on_panel: Primitives.Colors.Base['200'],
                background: Primitives.Colors.Base['800'],
                on_background: Primitives.Colors.Base['200'],
                on_background_text: Primitives.Colors.Base['800'],
                on_background_text_disabled: Primitives.Colors.Base['600'],
                on_background_disabled: Primitives.Colors.Base['500'],
                on_background_var: Primitives.Colors.Base['400'],
                surface_darkest: Primitives.Colors.Base['100']
            },
            Effect: {
                yellow: Primitives.Colors.AcidYellow['600'],
                on_yellow: Primitives.Colors.AcidYellow['1000'],
                red: Primitives.Colors.Red['500'],
                on_red: Primitives.Colors.Red['1000'],
                pink: Primitives.Colors.Purple['400'],
                on_pink: Primitives.Colors.Purple['1000'],
                purple: Primitives.Colors.Purple['600'],
                on_purple: Primitives.Colors.Purple['100'],
                orange: Primitives.Colors.Orange['500'],
                on_orange: Primitives.Colors.Orange['1000'],
                green: Primitives.Colors.Green['500'],
                on_green: Primitives.Colors.Green['1000'],
                blue: Primitives.Colors.Blue['500'],
                on_blue: Primitives.Colors.Blue['100'],
                lightBlue: Primitives.Colors.Blue['100'],
                onLightBlue: Primitives.Colors.Blue['1000']
            },
            Knob: {
                knob_body: Primitives.Colors.Base['800'],
                knob_base: Primitives.Colors.Base['900'],
                knob_outline: Primitives.Colors.Base['400'],
                knob_accent: Primitives.Colors.Base['100'],
                knob_base_disabled: Primitives.Colors.Base['600'],
                knob_body_disabled: Primitives.Colors.Base['700'],
                knob_accent_disabled: Primitives.Colors.Base['500']
            },
            on_background: Primitives.Colors.Base['300'],
            Display: {
                display: Primitives.Colors.Base['900'],
                on_display: Primitives.Colors.Base['50'],
                on_display_contrast: Primitives.Colors.Base['900'],
                on_display_var: Primitives.Colors.Base['200'],
                on_display_disabled: Primitives.Colors.Base['400']
            },
            Notification: {
                primary: Primitives.Colors.Blue['100'],
                on_primary: Primitives.Colors.Blue['1000'],
                error: Primitives.Colors.Red['400'],
                on_error: Primitives.Colors.Red['1000'],
                warning: Primitives.Colors.AcidYellow['400'],
                on_warning: Primitives.Colors.AcidYellow['1000']
            },
            Button: {
                primary: Primitives.Colors.Base['100'],
                on_primary: Primitives.Colors.Base['1000'],
                primary_var: Primitives.Colors.Base['300'],
                on_primary_var: Primitives.Colors.Base['800'],
                primary_disabled: Primitives.Colors.Base['600'],
                on_primary_disabled: Primitives.Colors.Base['400']
            }
        },
    };
}

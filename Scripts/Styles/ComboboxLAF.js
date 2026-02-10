/**
 * @file Styles/ComboboxLAF.js
 * @description CSS/stylesheet-based combobox styling using HISE's inline stylesheet system.
 *   Defines select, popup, and popup-item styles via CSS strings with theme-variable bindings.
 *   Currently commented out in include.js (OldCombo_LAF.js is used instead).
 *
 * @outline
 *   CONFIG               borderWidth, borderRadius, padding, fontSize, arrow settings
 *   createStylesheet()   Returns CSS string for select, popup, popup-item, hr elements
 *   setupVariables(laf)  Binds Theme colors to CSS custom properties via setStyleSheetProperty
 *   createLAF()          Creates global script LAF with inline stylesheet
 *   updateTheme()        Re-applies theme variables and repaints all _cmb components
 *   laf                  Global script LAF with CSS stylesheet
 *   Auto-applied to      All components matching "_cmb"
 *
 * @dependencies Theme (TC colors), Engine.createGlobalScriptLookAndFeel
 * @ui *_cmb
 */
namespace ComboboxLAF {

    const var CONFIG= {
        // Border
        borderWidth: 1,
            borderRadius: 4,

            // Padding
            padding: "8px 32px 8px 10px",

            // Font
            fontSize: 14,
            fontWeight: "normal",
            letterSpacing: "0.02em",

            // Arrow
            arrowWidth: 12,
            arrowHeight: 12,
            arrowRight: 8,
            arrowOpacity: 0.7,
            arrowOpacityHover: 1.0
    }

    ;

    inline function createStylesheet() {
        return "


        @font-face {
            font-family: Regular;
        }


        select {
            font-family: Regular;
            color: var(--textColour);
            border: var(--borderWidth) solid var(--borderColour);
            border-radius: var(--borderRadius);
            padding: var(--padding);
            font-family: var(--fontFamily);
            font-size: var(--fontSize);
            font-weight: var(--fontWeight);
            letter-spacing: var(--letterSpacing);
            text-align: left;
            position: relative;
        }

        select:hover {
            color: var(--textColourHover);
            border-color: var(--borderColourHover);
            opacity: 0.9;
        }

        select:active {
            background-color: var(--bgColour);
            color: var(--textColour);
        }

        select:disabled {
            background-color: var(--bgColourDisabled);
            color: var(--textColourDisabled);
            opacity: 0.6;
        }

        select::after {
            content: '';
            position: absolute;
            right: var(--arrowRight);
            top: 50%;
            transform: translateY(-50%);
            width: var(--arrowWidth);
            height: var(--arrowHeight);
            background-image: \"84.t0lavsBQ76.tCwF..VDQX+9fCw1WJBDQnj.cCwFp5YBQ3NhqCwly0w.QzMCcCwF..d.QTV.gCwFD6YBQpsevCwVtvsBQn.AtCwlavsBQ76.tCMVY\";
            background-color: var(--arrowColour);
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            opacity: var(--arrowOpacity);
        }

        select:hover::after {
            opacity: var(--arrowOpacityHover);
        }

        .popup {
            background-color: #BECBCF;
            min-width: 100px;
            font-family: Regular;

        }

        .popup-item {
            background-color: transparent;
            color: #1F2329;
            padding: 10px;
            margin: 2px;
            border-radius: 1px;
            font-family: Regular;
            font-size: 12px;
        }

        .popup-item:hover {
            background-color: #A8B3B8;
        }

        .popup-item:active {
            color: #BECBCF;
            background-color: #1F2329;
            font-weight: bold;
        }

        .popup-item:disabled {
            color: #BECBCF;
        }

        hr {
            margin: 4px 0;
            border: none;
            border-top: 1px solid #BECBCF;
        }

        ";

    }

    inline function setupVariables(laf) {
        // Background colors
        laf.setStyleSheetProperty("bgColour", TC.UI.background, "color");
        laf.setStyleSheetProperty("bgColourHover", TC.UI.background, "color");
        laf.setStyleSheetProperty("bgColourActive", TC.UI.panel, "color");
        laf.setStyleSheetProperty("bgColourDisabled", TC.UI.background, "color");

        // Text colors
        laf.setStyleSheetProperty("textColour", TC.UI.on_background, "color");
        laf.setStyleSheetProperty("textColourHover", TC.UI.on_background, "color");
        laf.setStyleSheetProperty("textColourDisabled", TC.UI.on_background_text_disabled, "color");

        // Border
        laf.setStyleSheetProperty("borderWidth", CONFIG.borderWidth, "px");
        laf.setStyleSheetProperty("borderColour", TC.UI.surface_darkest, "color");
        laf.setStyleSheetProperty("borderColourHover", TC.UI.surface_darkest, "color");
        laf.setStyleSheetProperty("borderRadius", CONFIG.borderRadius, "px");

        // Padding
        laf.setStyleSheetProperty("padding", CONFIG.padding, "");

        // Font
        laf.setStyleSheetProperty("fontFamily", Theme.Regular, "");
        laf.setStyleSheetProperty("fontSize", CONFIG.fontSize, "px");
        laf.setStyleSheetProperty("fontWeight", CONFIG.fontWeight, "");
        laf.setStyleSheetProperty("letterSpacing", CONFIG.letterSpacing, "");

        // Arrow
        laf.setStyleSheetProperty("arrowColour", TC.UI.on_background_var, "color");
        laf.setStyleSheetProperty("arrowWidth", CONFIG.arrowWidth, "px");
        laf.setStyleSheetProperty("arrowHeight", CONFIG.arrowHeight, "px");
        laf.setStyleSheetProperty("arrowRight", CONFIG.arrowRight, "px");
        laf.setStyleSheetProperty("arrowOpacity", CONFIG.arrowOpacity, "");
        laf.setStyleSheetProperty("arrowOpacityHover", CONFIG.arrowOpacityHover, "");

        // Popup
        laf.setStyleSheetProperty("popupBgColour", TC.Display.display, "color");
        laf.setStyleSheetProperty("popupItemTextColour", TC.UI.on_background_text, "color");
        laf.setStyleSheetProperty("popupItemTextHover", TC.UI.on_background_text, "color");
        laf.setStyleSheetProperty("popupItemTextActive", TC.UI.surface_darkest, "color");
        laf.setStyleSheetProperty("popupItemTextDisabled", TC.UI.on_background_text_disabled, "color");
        laf.setStyleSheetProperty("popupItemBgHover", TC.UI.background, "color");
        laf.setStyleSheetProperty("popupSeparatorColour", TC.UI.surface_darkest, "color");
    }

    inline function createLAF() {
        local laf=Engine.createGlobalScriptLookAndFeel();
        laf.setInlineStyleSheet(createStylesheet());
        setupVariables(laf);
        return laf;
    }

    const var laf=createLAF();

    // Public function to update theme
    inline function updateTheme() {
        setupVariables(laf);
        local comboboxes=Content.getAllComponents("_cmb");

        for (c in comboboxes) {
            c.sendRepaintMessage();
        }
    }

    const var components=Content.getAllComponents('_cmb');
    for (c in components) c.setLocalLookAndFeel(laf);
}
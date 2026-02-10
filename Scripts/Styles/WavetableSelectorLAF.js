/**
 * @file Styles/WavetableSelectorLAF.js
 * @description CSS/stylesheet-based combobox styling for wavetable selector dropdowns.
 *   Similar to ComboboxLAF but uses a local LAF and dark-themed popup colors.
 *   Applied specifically to "Wavetable_Combobox" components.
 *
 * @outline
 *   CONFIG               borderWidth, borderRadius, padding, fontSize, arrow settings
 *   createStylesheet()   Returns CSS string for select, popup, popup-item elements (dark theme)
 *   setupVariables(laf)  Binds Theme colors to CSS custom properties
 *   createLAF()          Creates local LAF with inline stylesheet
 *   laf                  Local LAF with CSS stylesheet
 *   Auto-applied to      All components matching "Wavetable_Combobox"
 *
 * @dependencies Theme (TC colors), Content.createLocalLookAndFeel
 * @ui Wavetable_Combobox
 */
namespace WavetableSelectorLAF {

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
            color: #BECBCF;
            opacity: 0.9;
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
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            opacity: var(--arrowOpacity);
        }



        .popup {
            background-color: #000000;
            min-width: 100px;
            font-family: Regular;

        }

        .popup-item {
            background-color: #000000;
            color: white;
            padding: 10px;
            margin: 2px;
            border-radius: 1px;
            font-family: Regular;
            font-size: 12px;
        }

        .popup-item:hover {
            background-color: #303740;
        }

        .popup-item:active {
            color: black;
            background-color: #000000;
            font-weight: bold;
        }

        .popup-item:disabled {
            color: #6B7280;
        }

        hr {
            margin: 4px 0;
            border: none;
            border-top: 1px solid #4B5563;
        }

        ";

    }

    inline function setupVariables(laf) {
        // Background colors - using darker theme colors
        laf.setStyleSheetProperty("bgColour", TC.UI.background, "color");
        laf.setStyleSheetProperty("bgColourHover", TC.UI.background, "color");
        laf.setStyleSheetProperty("bgColourActive", TC.UI.panel, "color");
        laf.setStyleSheetProperty("bgColourDisabled", TC.UI.background, "color");

        // Text colors - using lighter colors for dark background
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

        // Popup - using dark colors
        laf.setStyleSheetProperty("popupBgColour", TC.Display.display, "color");
        laf.setStyleSheetProperty("popupItemTextColour", TC.UI.on_background_text, "color");
        laf.setStyleSheetProperty("popupItemTextHover", TC.UI.on_background_text, "color");
        laf.setStyleSheetProperty("popupItemTextActive", TC.UI.on_background, "color");
        laf.setStyleSheetProperty("popupItemTextDisabled", TC.UI.on_background_text_disabled, "color");
        laf.setStyleSheetProperty("popupItemBgHover", TC.UI.background, "color");
        laf.setStyleSheetProperty("popupSeparatorColour", TC.UI.surface_darkest, "color");
    }

    inline function createLAF() {
        local laf=Content.createLocalLookAndFeel();
        laf.setInlineStyleSheet(createStylesheet());
        setupVariables(laf);
        return laf;
    }

    const var laf=createLAF();

    const var components=Content.getAllComponents('Wavetable_Combobox');
    for (c in components) c.setLocalLookAndFeel(laf);
}
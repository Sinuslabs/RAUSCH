/**
 * @file Core/Theme.js
 * @description Global theme manager (Core version, loaded via Core/ include path).
 *   Loads custom fonts, holds the active THEME object (light/dark/super_light),
 *   and provides repaintAll() to refresh all registered panels and knobs on theme change.
 *   Calls UI.setTheme() and PresetBrowser.updatePresetBrowserColours() on switch.
 *
 * @outline
 *   THEME               Active theme data object (from ThemeData)
 *   CURRENT             Current theme name string ('light' | 'dark')
 *   SemiBold / Regular  Font name constants
 *   displayBold / Reg   Display font aliases
 *   setTheme(theme)     Switches THEME, calls UI.setTheme() + PresetBrowser update, repaints all
 *   toggleTheme(value)  Boolean toggle between light and dark
 *   panels[]            Registered panels to repaint on theme change
 *   knobs[]             All components (for sendRepaintMessage)
 *   repaintAll()        Repaints all panels and knobs
 *   registerThemePanel() Add a panel to the repaint list
 *
 * @dependencies ThemeData, UI, PresetBrowser
 */
namespace Theme {

	//FONTS
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/OverusedGrotesk-Roman.ttf", "ov-grotesk");
	Engine.loadFontAs("{PROJECT_FOLDER}Fonts/OverusedGrotesk-Medium.ttf", "ov-grotesk-med");


	Engine.setGlobalFont("ov-grotesk");
    
    reg THEME = ThemeData.LIGHT_THEME;
    reg CURRENT = 'light';

	const SemiBold = 'ov-grotesk-med';
	const Regular = 'ov-grotesk';
	const displayBold = 'ov-grotesk-med';
	const displayReg = 'ov-grotesk';
	
	
    inline function setTheme(theme) {
		if (theme === 'light') {
			CURRENT = 'light';
			THEME = ThemeData.LIGHT_THEME;
			UI.setTheme('light');
			PresetBrowser.updatePresetBrowserColours('light');
		}

		if (theme === 'dark') {
			CURRENT = 'dark';
			THEME = ThemeData.DARK_THEME;
			UI.setTheme('dark');
			PresetBrowser.updatePresetBrowserColours('dark');
		}

		if (theme === 'super_light') {
			THEME = ThemeData.SUPER_LIGHT_THEME;
		}

		//UserSettings.save('theme', theme);
		repaintAll();
	}
    
    inline function toggleTheme(value) {
		if (value) {
			setTheme('light');
		} else {
			setTheme('dark');
		}
	}
    
    reg panels = [];
    reg knobs = [];
    
    inline function repaintAll() {
		for (pnl in panels) {
			pnl.repaint();
		}

		for (knb in knobs) {
			knb.sendRepaintMessage();
		}
	}
    
    inline function registerThemePanel(panel) {
		panels.push(panel);
	}

}
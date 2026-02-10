namespace UI_Misc {

const var MadeBy_btn = Content.getComponent("MadeBy_btn");

const var CONFIG = {
	logoSize: 14,
	fontSize: 13,
	fontSpacing: 0.02,
	logoTextGap: 5,
	padding: 4,
	defaultAlpha: 0.5,
	hoverAlpha: 0.8,
	activeAlpha: 1.0
};

inline function drawMadeByBtn(g, obj) {
	local a = obj.area;
	local alpha = CONFIG.defaultAlpha;

	if (obj.over) alpha = CONFIG.hoverAlpha;
	if (obj.value) alpha = CONFIG.activeAlpha;

	local colour = Colours.withAlpha(TC.UI.on_panel, alpha);

	// Draw logo icon on the left
	local logoArea = [a[0] + CONFIG.padding, a[1] + (a[3] - CONFIG.logoSize) / 2, CONFIG.logoSize, CONFIG.logoSize];
	g.setColour(colour);
	g.fillPath(Icons.get.sinus, logoArea);

	// Draw "Sinuslabs" text and version next to the logo
	local textX = logoArea[0] + CONFIG.logoSize + CONFIG.logoTextGap;
	local textArea = [textX, a[1], a[2] - textX + a[0], a[3]];
	g.setFontWithSpacing(Theme.Regular, CONFIG.fontSize, CONFIG.fontSpacing);
	g.drawAlignedText("Sinuslabs v1.0", textArea, "left");
}

const var laf = Content.createLocalLookAndFeel();
laf.registerFunction("drawToggleButton", drawMadeByBtn);
MadeBy_btn.setLocalLookAndFeel(laf);

inline function onMadeByBtn(component, value) {
	if (value) {
		Router.goTo("About");
	}
}

MadeBy_btn.setControlCallback(onMadeByBtn);

}
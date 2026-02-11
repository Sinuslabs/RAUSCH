namespace DefaultKnobLAF {

    const var laf = Content.createLocalLookAndFeel();

    laf.loadImage("{PROJECT_FOLDER}Default_light.png", "filmstrip");

    const var SIZE = 164;
    const var FRAMES = 100;

    inline function draw(g, obj) {
        local a = obj.area;
        local value = obj.valueNormalized;
        local knobSize = a[2];
        local knobArea = [a[0], a[1], knobSize, knobSize];

        if (!obj.enabled) g.setOpacity(0.5);

        local frameIndex = Math.min(Math.floor(value * FRAMES), FRAMES - 1);
        g.drawImage("filmstrip", knobArea, 0, frameIndex * SIZE);

        g.setColour(TC.UI.on_panel);
        local text = (obj.hover || obj.clicked) ? obj.valueAsText : obj.text;
        g.setFont(Theme.Regular, 16);
        g.drawAlignedText(text, a, "centredBottom");
    }

    laf.registerFunction("drawRotarySlider", draw);

    const var components = Content.getAllComponents("_defaultKnb");
    for (c in components) c.setLocalLookAndFeel(laf);
}

namespace Mapping {

    const var Mix_defaultKnb = Content.getComponent("Mix_defaultKnb");
    const var Rez_defaultKnb = Content.getComponent("Rez_defaultKnb");
    const var Rate_defaultKnb = Content.getComponent("Rate_defaultKnb");

    const var DeRez = Synth.getEffect("DeRez");
    const var Volume = Synth.getEffect("Volume");

    const var Volyme_RingKnb = Content.getComponent("Volyme_RingKnb");

    // Mix_defaultKnb -> DeRez Mix
    inline function onMixControl(component, value) {
        Logger.log("Mapping: Mix -> " + value);
        DeRez.setAttribute(DeRez.Mix, value);
    }
    Mix_defaultKnb.setControlCallback(onMixControl);

    // Rez_defaultKnb -> DeRez Rez
    inline function onRezControl(component, value) {
        Logger.log("Mapping: Rez -> " + value);
        DeRez.setAttribute(DeRez.Rez, value);
    }
    Rez_defaultKnb.setControlCallback(onRezControl);

    // Rate_defaultKnb -> DeRez Rate
    inline function onRateControl(component, value) {
        Logger.log("Mapping: Rate -> " + value);
        DeRez.setAttribute(DeRez.Rate, value);
    }
    Rate_defaultKnb.setControlCallback(onRateControl);

    // Volyme_RingKnb -> Volume Gain
    inline function onVolumeControl(component, value) {
        Logger.log("Mapping: Volume -> " + value);
        Volume.setAttribute(Volume.Gain, value);
    }
    Volyme_RingKnb.setControlCallback(onVolumeControl);

    Logger.log("Mapping: callbacks registered");
}

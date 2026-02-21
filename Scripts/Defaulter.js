namespace Defaulter {

    Content.getComponent('Volyme_RingKnb').setValue(0);

    var knobs = Content.getAllComponents('_knb');
    var defaultKnobs = Content.getAllComponents('_defaultKnb');
    
    const var vol = Content.getComponent("Volyme_RingKnb");
    vol.setValue(vol.get('defaultValue'));
    vol.changed();
    
    // on startup restore defaultValue to each knob
    for (k in knobs) {
        k.setValue(k.get('defaultValue'));
        k.changed();
    }

    // on startup restore defaultValue to each defaultKnob
    for (k in defaultKnobs) {
        k.setValue(k.get('defaultValue'));
        k.changed();
    }

}

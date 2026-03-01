namespace Defaulter {

    var knobs = Content.getAllComponents('_knb');
    var defaultKnobs = Content.getAllComponents('_defaultKnb');
    

    
    Content.callAfterDelay(100, defaulter, {});
    
    inline function defaulter() {
	    local vol = Content.getComponent("Volyme_RingKnb");
	    vol.setValue(vol.get('defaultValue'));
	    vol.changed();
	    
	    // on startup push current UI value → DSP for each _knb
	    for (k in knobs) {
	        k.setValue(k.get('defaultValue'));
	        k.changed();
	    }

	    // on startup push current UI value → DSP for each _defaultKnb
	    // (catches Mix_defaultKnb, Rez_defaultKnb, Rate_defaultKnb, etc.)
	    for (k in defaultKnobs) {
	        k.setValue(k.get('defaultValue'));
	        k.changed();
	    }
	    
	    local MadeBy_btn = Content.getComponent("MadeBy_btn");
	    MadeBy_btn.setValue(0);
	    MadeBy_btn.changed();
    }

	    


}

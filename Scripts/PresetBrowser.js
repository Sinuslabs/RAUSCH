/**
 * @file PresetBrowser.js
 * @description User preset management with pre/post load callbacks and prev/next navigation.
 *   Wraps HISE's UserPresetHandler, displays the current preset name on a router
 *   button, and wires up previous/next navigation buttons.
 *
 * @outline
 *   uph                      UserPresetHandler instance
 *   btn_presetName            Button showing current preset name (routes to PresetBrowser page)
 *   btn_prevPreset/nextPreset Navigation buttons with IconButtonLAF styling
 *   setPreCallback()          Called before preset load (return true to allow)
 *   setPostCallback()         Called after preset load, updates display
 *   setPostSaveCallback()     Called after preset save, refreshes list
 *   updatePresetNameDisplay() Reads Engine.getCurrentUserPresetName(), updates button text
 *   updatePresetList()        Refreshes presetList array and finds current index
 *   loadPreviousPreset()      Loads previous user preset
 *   loadNextPreset()          Loads next user preset
 *   onPresetNameButton()      Toggles Router to PresetBrowser page
 *
 * @dependencies Router, IconButtonLAF, Engine
 * @ui PresetBrowser_router, PresetBrowser_prev_iconBtn, PresetBrowser_next_iconBtn
 */
namespace PresetBrowser {

    // Create the UserPresetHandler
    const var uph = Engine.createUserPresetHandler();

    // Preset name display button
    const var btn_presetName = Content.getComponent("PresetBrowser_router");

    // Current preset tracking
    reg currentPresetIndex = 0;
    reg presetList = [];

    // ============================================
    // PRE & POST CALLBACKS
    // ============================================

    uph.setPreCallback(function(presetObject) {
        // Called before preset loads
        // Return false to cancel the load, true to proceed
        Console.print("PresetBrowser: Loading preset...");
        return true;
    });

    uph.setPostCallback(function(presetObject) {
        // Called after preset has loaded
        Console.print("PresetBrowser: Preset loaded successfully");
        updatePresetNameDisplay();
        updatePresetList();
    });

    uph.setPostSaveCallback(function() {
        // Called after preset has been saved
        Console.print("PresetBrowser: Preset saved");
        updatePresetList();
        updatePresetNameDisplay();
    });

    // ============================================
    // PRESET NAME DISPLAY
    // ============================================

    inline function updatePresetNameDisplay() {
        local presetName = Engine.getCurrentUserPresetName();

        if (presetName == "" || !isDefined(presetName)) {
            presetName = "Init";
        }

        if (isDefined(btn_presetName)) {
            btn_presetName.set("text", presetName);
        }
    }

    inline function getCurrentPresetName() {
        return Engine.getCurrentUserPresetName();
    }

    // ============================================
    // PRESET LIST MANAGEMENT
    // ============================================

    inline function updatePresetList() {
        presetList = Engine.getUserPresetList();

        // Find current preset index
        local currentName = Engine.getCurrentUserPresetName();
        currentPresetIndex = presetList.indexOf(currentName);

        if (currentPresetIndex == -1) {
            currentPresetIndex = 0;
        }
    }

    // ============================================
    // PREV/NEXT PRESET FUNCTIONS
    // ============================================

    inline function loadPreviousPreset() {
		Engine.loadPreviousUserPreset(false);
    }

    inline function loadNextPreset() {
  		Engine.loadNextUserPreset(false);
    }

    // ============================================
    // BUTTON CALLBACKS
    // ============================================

    inline function onPresetNameButton(component, value) {
        if (value) {
            Router.goTo("PresetBrowser");
        } else {
	        Router.goToPrev();
        }
    }

    inline function onPrevPresetButton(component, value) {
        if (value) {
            loadPreviousPreset();
        }
    }

    inline function onNextPresetButton(component, value) {
        if (value) {
            loadNextPreset();
        }
    }

    // Get prev/next buttons if they exist
    const var btn_prevPreset = Content.getComponent("PresetBrowser_prev_iconBtn");
    const var btn_nextPreset = Content.getComponent("PresetBrowser_next_iconBtn");

    // Attach callbacks
    if (isDefined(btn_presetName)) {
        btn_presetName.setControlCallback(onPresetNameButton);
    }

    if (isDefined(btn_prevPreset)) {
	    
    btn_prevPreset.setLocalLookAndFeel(IconButtonLAF.claf);
        btn_prevPreset.setControlCallback(onPrevPresetButton);
    }

    if (isDefined(btn_nextPreset)) {
	    btn_nextPreset.setLocalLookAndFeel(IconButtonLAF.claf);
        btn_nextPreset.setControlCallback(onNextPresetButton);
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    updatePresetList();
    updatePresetNameDisplay();
}

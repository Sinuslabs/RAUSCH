/**
 * @file Styles/BypassButtonLAF.js
 * @description Horizontal toggle-switch styling for synth bypass buttons.
 *   Draws a track with a sliding square thumb. Value is inverted (bypass=1 means OFF).
 *   Track color matches the synth color from SynthSelector when active.
 *
 * @outline
 *   CONFIG                  padding, trackHeight, thumbSize, cornerRadius
 *   getSynthIndexFromId()   Extracts synth number from component ID (e.g. "Synth1_onOff_btn" -> 0)
 *   draw(g, obj)            Renders track + sliding thumb with synth-colored active state
 *   laf                     Local LAF registered as "drawToggleButton"
 *   Auto-applied to         All components matching "_onOff_btn"
 *
 * @dependencies Theme (TC.UI colors), StyleHelpers, SynthSelector.getSynthColor()
 * @ui *_onOff_btn
 */
namespace BypassButtonLAF {

    const var CONFIG = {
        padding: 2,
        trackHeight: 16,
        thumbSize: 12,
        cornerRadius: 2  // More square with minimal rounding
    };

    // Extract synth index from component ID (e.g., "Synth1_onOff_btn" -> 0)
    inline function getSynthIndexFromId(id) {
        local match = Engine.getRegexMatches(id, "Synth(\\d+)");
        if (isDefined(match) && match.length > 1) {
            return parseInt(match[1]) - 1;  // Convert to 0-based index
        }
        return -1;
    }

    inline function draw(g, obj) {
        local a = obj.area;
        local paddedArea = StyleHelpers.addPadding(a, CONFIG.padding);

        local width = paddedArea[2];
        local height = paddedArea[3];

        // Calculate track dimensions (horizontal switch, more square)
        local trackHeight = Math.min(CONFIG.trackHeight, height);
        local trackY = paddedArea[1] + (height - trackHeight) / 2;
        local trackWidth = width;
        local trackArea = [paddedArea[0], trackY, trackWidth, trackHeight];

        // Calculate thumb position (square thumb)
        local thumbSize = CONFIG.thumbSize;
        local thumbY = trackY + (trackHeight - thumbSize) / 2;
        local thumbMargin = 2; // Space between thumb and track edges

        // Reverse the value: bypass true (1) means synth is OFF, bypass false (0) means synth is ON
        local isOn = !obj.value;

        // Get synth color from ID
        local synthIndex = getSynthIndexFromId(obj.id);
        local activeColor = TC.UI.on_background_text_disabled;  // Default fallback
        if (synthIndex >= 0) {
            activeColor = SynthSelector.getSynthColor(synthIndex);
        }

        // Calculate thumb X position (slides left/right)
        local thumbX;
        if (isOn) {
            // Thumb on the right (synth is ON)
            thumbX = paddedArea[0] + trackWidth - thumbSize - thumbMargin;
        } else {
            // Thumb on the left (synth is OFF/bypassed)
            thumbX = paddedArea[0] + thumbMargin;
        }

        // Draw track background
        if (isOn) {
            // Active: synth-colored track
            g.setColour(activeColor);
            g.fillRoundedRectangle(trackArea, CONFIG.cornerRadius);
        } else {
            // Inactive: gray track
            g.setColour(TC.UI.on_background_text_disabled);
            g.fillRoundedRectangle(trackArea, CONFIG.cornerRadius);
        }

        // Draw track border
        g.setColour(Colours.withAlpha(Colours.black, 0.1));
        g.drawRoundedRectangle(trackArea, CONFIG.cornerRadius, 1);

        // Draw thumb (square)
        local thumbArea = [thumbX, thumbY, thumbSize, thumbSize];
        g.setColour(Colours.white);
        g.fillRoundedRectangle(thumbArea, CONFIG.cornerRadius);

        // Draw thumb shadow/border
        g.setColour(Colours.withAlpha(Colours.black, 0.15));
        g.drawRoundedRectangle(thumbArea, CONFIG.cornerRadius, 1);
    }

    const var laf = Content.createLocalLookAndFeel();
    laf.registerFunction('drawToggleButton', draw);

    const var components = Content.getAllComponents('_onOff_btn');
    for (c in components) c.setLocalLookAndFeel(laf);
}

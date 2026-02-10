/**
 * @file Knobs.js
 * @description Placeholder for display knob styling setup.
 *   Creates a local LAF for components matching '_displayKnb' suffix.
 *   Currently the LAF assignment is commented out.
 *
 * @outline
 *   displayKnbLAF       Local look-and-feel (unused)
 *   displayKnobs        All components matching '_displayKnb'
 *
 * @dependencies Content
 * @ui *_displayKnb components
 */
namespace Knobs {

    // ------------------------ CSS KNOB --------
    const var displayKnbLAF = Content.createLocalLookAndFeel();
    const var displayKnobs = Content.getAllComponents('_displayKnb');

    for (k in displayKnobs) {
        //k.setLocalLookAndFeel(displayKnbLAF);
    }

}

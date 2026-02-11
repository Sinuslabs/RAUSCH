/**
 * @file Styles/include.js
 * @description Style include manifest. Loads StyleHelpers and all Look-and-Feel (LAF)
 *   scripts in dependency order. ComboboxLAF is commented out in favor of OldCombo_LAF.
 *
 * @outline
 *   Includes (in order):
 *     StyleHelpers.js          Area/rect utility functions
 *     TextButtonLAF.js         _textBtn styling
 *     RoundedButtonLAF.js      _roundBtn styling
 *     DisplayIconButtonLAF.js  _displayIconBtn styling
 *     IconButtonLAF.js         _iconBtn styling
 *     DisplayButtonLAF.js      _displayBtn styling
 *     MenuButtonLAF.js         _MenuBtn styling
 *     BypassButtonLAF.js       _onOff_btn styling
 *     RingKnobLAF.js           _RingKnb styling
 *     OldCombo_LAF.js          _cmb styling (active)
 *     MenuLAF.js               _menu styling
 *     ADSRKnobLAF.js           _ADSR_knb styling
 *     OctKnbLAF.js             _OctKnb styling
 *     OctButtonLAF.js          _oct_button styling
 *     PresetBrowserLAF.js      PresetBrowser styling
 *   Commented out:
 *     ComboboxLAF.js           CSS-based _cmb (replaced by OldCombo_LAF)
 */
include("StyleHelpers.js");
include("Styles/TextButtonLAF.js");
include("Styles/RoundedButtonLAF.js");
include("Styles/DisplayIconButtonLAF.js");
include("Styles/IconButtonLAF.js");
include("Styles/DisplayButtonLAF.js");
include("Styles/MenuButtonLAF.js");
include("Styles/BypassButtonLAF.js");
include("Styles/RingKnobLAF.js");
//include("Styles/ComboboxLAF.js");
include("Styles/OldCombo_LAF.js");
include("Styles/MenuLAF.js");
include("Styles/ADSRKnobLAF.js");
include("Styles/OctKnbLAF.js");
include("Styles/OctButtonLAF.js");
include("Styles/PresetBrowserLAF.js");
include("Styles/DefaultKnobLAF.js");
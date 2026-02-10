
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::voiceofthestarship_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/VoiceOfTheStarship/VoiceOfTheStarship.h"

#include "../../External/airwindows/plugins/LinuxVST/src/VoiceOfTheStarship/VoiceOfTheStarship.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/VoiceOfTheStarship/VoiceOfTheStarshipProc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::voiceofthestarship_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(VoiceOfTheStarship, voiceofthestarship_ns);

}  // namespace project

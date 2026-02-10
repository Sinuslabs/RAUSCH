
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::bitglitter_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/BitGlitter/BitGlitter.h"

#include "../../External/airwindows/plugins/LinuxVST/src/BitGlitter/BitGlitter.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/BitGlitter/BitGlitterProc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::bitglitter_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(BitGlitter, bitglitter_ns);

}  // namespace project

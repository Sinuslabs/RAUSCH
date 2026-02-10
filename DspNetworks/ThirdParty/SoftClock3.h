
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::softclock3_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/SoftClock3/SoftClock3.h"

#include "../../External/airwindows/plugins/LinuxVST/src/SoftClock3/SoftClock3.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/SoftClock3/SoftClock3Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::softclock3_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(SoftClock3, softclock3_ns);

}  // namespace project

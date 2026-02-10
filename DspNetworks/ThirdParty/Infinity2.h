
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::infinity2_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/Infinity2/Infinity2.h"

#include "../../External/airwindows/plugins/LinuxVST/src/Infinity2/Infinity2.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/Infinity2/Infinity2Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::infinity2_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(Infinity2, infinity2_ns);

}  // namespace project

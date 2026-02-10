
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::starchild2_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/StarChild2/StarChild2.h"

#include "../../External/airwindows/plugins/LinuxVST/src/StarChild2/StarChild2.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/StarChild2/StarChild2Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::starchild2_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(StarChild2, starchild2_ns);

}  // namespace project

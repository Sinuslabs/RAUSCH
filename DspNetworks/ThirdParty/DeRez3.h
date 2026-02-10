
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::derez3_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/DeRez3/DeRez3.h"

#include "../../External/airwindows/plugins/LinuxVST/src/DeRez3/DeRez3.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/DeRez3/DeRez3Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::derez3_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(DeRez3, derez3_ns);

}  // namespace project

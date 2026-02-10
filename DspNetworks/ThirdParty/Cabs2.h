
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::cabs2_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/Cabs2/Cabs2.h"

#include "../../External/airwindows/plugins/LinuxVST/src/Cabs2/Cabs2.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/Cabs2/Cabs2Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::cabs2_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(Cabs2, cabs2_ns);

}  // namespace project

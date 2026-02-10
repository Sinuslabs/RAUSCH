
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::interstage_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/Interstage/Interstage.h"

#include "../../External/airwindows/plugins/LinuxVST/src/Interstage/Interstage.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/Interstage/InterstageProc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::interstage_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(Interstage, interstage_ns);

}  // namespace project

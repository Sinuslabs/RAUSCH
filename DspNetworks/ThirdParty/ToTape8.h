
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::totape8_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/ToTape8/ToTape8.h"

#include "../../External/airwindows/plugins/LinuxVST/src/ToTape8/ToTape8.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/ToTape8/ToTape8Proc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::totape8_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(ToTape8, totape8_ns);

}  // namespace project

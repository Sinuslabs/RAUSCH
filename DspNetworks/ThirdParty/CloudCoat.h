
#pragma once

#include <JuceHeader.h>

#include "../../AdditionalSourceCode/AirWindows.h"

namespace airwindows::cloudcoat_ns {
JUCE_BEGIN_IGNORE_WARNINGS_GCC_LIKE("-Wmultichar")
#include "../../External/airwindows/plugins/LinuxVST/src/CloudCoat/CloudCoat.h"

#include "../../External/airwindows/plugins/LinuxVST/src/CloudCoat/CloudCoat.cpp"
#include "../../External/airwindows/plugins/LinuxVST/src/CloudCoat/CloudCoatProc.cpp"
JUCE_END_IGNORE_WARNINGS_GCC_LIKE
}  // namespace airwindows::cloudcoat_ns

namespace project {

using namespace juce;
using namespace hise;
using namespace scriptnode;

DECLARE_AIRWINDOWS_NODE(CloudCoat, cloudcoat_ns);

}  // namespace project

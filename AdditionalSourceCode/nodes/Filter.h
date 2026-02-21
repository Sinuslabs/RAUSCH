#pragma once

#include "Gater.h"
#include "djfilter.h"
// These will improve the readability of the connection definition

#define getT(Idx) template get<Idx>()
#define connectT(Idx, target) template connect<Idx>(target)
#define getParameterT(Idx) template getParameter<Idx>()
#define setParameterT(Idx, value) template setParameter<Idx>(value)
#define setParameterWT(Idx, value) template setWrapParameter<Idx>(value)
using namespace scriptnode;
using namespace snex;
using namespace snex::Types;

namespace Filter_impl
{
// ==============================| Node & Parameter type declarations |==============================

template <int NV>
using Gater_t = wrap::mod<parameter::plain<control::minmax<NV, parameter::empty>, 0>, 
                          project::Gater<NV>>;
template <int NV>
using minmax4_t = control::minmax<NV, 
                                  parameter::plain<Gater_t<NV>, 1>>;

template <int NV>
using smoothed_parameter_t = wrap::mod<parameter::plain<project::djfilter<NV>, 0>, 
                                       control::smoothed_parameter<NV, smoothers::linear_ramp<NV>>>;
template <int NV>
using pma_t = control::pma<NV, 
                           parameter::plain<smoothed_parameter_t<NV>, 0>>;

DECLARE_PARAMETER_RANGE_SKEW(dry_wet_mixer_c0Range, 
                             -100., 
                             0., 
                             5.42227);

template <int NV>
using dry_wet_mixer_c0 = parameter::from0To1<core::gain<NV>, 
                                             0, 
                                             dry_wet_mixer_c0Range>;

template <int NV> using dry_wet_mixer_c1 = dry_wet_mixer_c0<NV>;

template <int NV>
using dry_wet_mixer_multimod = parameter::list<dry_wet_mixer_c0<NV>, dry_wet_mixer_c1<NV>>;

template <int NV>
using dry_wet_mixer_t = control::xfader<dry_wet_mixer_multimod<NV>, 
                                        faders::rms>;

template <int NV>
using dry_path_t = container::chain<parameter::empty, 
                                    wrap::fix<2, dry_wet_mixer_t<NV>>, 
                                    core::gain<NV>>;

template <int NV>
using wet_path_t = container::chain<parameter::empty, 
                                    wrap::fix<2, fx::reverb>, 
                                    core::gain<NV>>;

namespace dry_wet1_t_parameters
{
}

template <int NV>
using dry_wet1_t = container::split<parameter::plain<Filter_impl::dry_wet_mixer_t<NV>, 0>, 
                                    wrap::fix<2, dry_path_t<NV>>, 
                                    wet_path_t<NV>>;
template <int NV>
using minmax3_t = control::minmax<NV, 
                                  parameter::plain<dry_wet1_t<NV>, 0>>;

namespace Filter_t_parameters
{
// Parameter list for Filter_impl::Filter_t --------------------------------------------------------

DECLARE_PARAMETER_RANGE_STEP(Mix_InputRange, 
                             0., 
                             100., 
                             1.);

template <int NV>
using Mix = parameter::chain<Mix_InputRange, 
                             parameter::plain<Filter_impl::minmax3_t<NV>, 0>, 
                             parameter::plain<Filter_impl::minmax4_t<NV>, 0>>;

template <int NV>
using Filter = parameter::plain<Filter_impl::pma_t<NV>, 0>;
template <int NV>
using Tempo = parameter::plain<Filter_impl::Gater_t<NV>, 
                               0>;
template <int NV>
using Smooth = parameter::plain<Filter_impl::Gater_t<NV>, 
                                2>;
template <int NV>
using Filter_t_plist = parameter::list<Filter<NV>, 
                                       Tempo<NV>, 
                                       Mix<NV>, 
                                       Smooth<NV>>;
}

template <int NV>
using Filter_t_ = container::chain<Filter_t_parameters::Filter_t_plist<NV>, 
                                   wrap::fix<2, minmax4_t<NV>>, 
                                   Gater_t<NV>, 
                                   control::minmax<NV, parameter::empty>, 
                                   pma_t<NV>, 
                                   smoothed_parameter_t<NV>, 
                                   project::djfilter<NV>, 
                                   minmax3_t<NV>, 
                                   dry_wet1_t<NV>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public Filter_impl::Filter_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(Filter);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(68)
		{
			0x005C, 0x0000, 0x0000, 0x6946, 0x746C, 0x7265, 0x0000, 0x0000, 
            0x0000, 0x0000, 0x3F80, 0x6A7F, 0x3F26, 0x0000, 0x3F80, 0x0000, 
            0x0000, 0x005C, 0x0001, 0x0000, 0x6554, 0x706D, 0x006F, 0x0000, 
            0x0000, 0x0000, 0x9000, 0x0041, 0xC000, 0x0040, 0x8000, 0x003F, 
            0x8000, 0x5C3F, 0x0200, 0x0000, 0x4D00, 0x7869, 0x0000, 0x0000, 
            0x0000, 0x0000, 0x42C8, 0x0000, 0x0000, 0x0000, 0x3F80, 0x0000, 
            0x3F80, 0x005C, 0x0003, 0x0000, 0x6D53, 0x6F6F, 0x6874, 0x0000, 
            0x0000, 0x3F00, 0x0000, 0x4248, 0x6667, 0x420A, 0x0000, 0x3F80, 
            0xCCCD, 0x3DCC, 0x0000, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& minmax4 = this->getT(0);                       // Filter_impl::minmax4_t<NV>
		auto& Gater = this->getT(1);                         // Filter_impl::Gater_t<NV>
		auto& minmax2 = this->getT(2);                       // control::minmax<NV, parameter::empty>
		auto& pma = this->getT(3);                           // Filter_impl::pma_t<NV>
		auto& smoothed_parameter = this->getT(4);            // Filter_impl::smoothed_parameter_t<NV>
		auto& djfilter1 = this->getT(5);                     // project::djfilter<NV>
		auto& minmax3 = this->getT(6);                       // Filter_impl::minmax3_t<NV>
		auto& dry_wet1 = this->getT(7);                      // Filter_impl::dry_wet1_t<NV>
		auto& dry_path = this->getT(7).getT(0);              // Filter_impl::dry_path_t<NV>
		auto& dry_wet_mixer = this->getT(7).getT(0).getT(0); // Filter_impl::dry_wet_mixer_t<NV>
		auto& dry_gain = this->getT(7).getT(0).getT(1);      // core::gain<NV>
		auto& wet_path = this->getT(7).getT(1);              // Filter_impl::wet_path_t<NV>
		auto& reverb = this->getT(7).getT(1).getT(0);        // fx::reverb
		auto& wet_gain = this->getT(7).getT(1).getT(1);      // core::gain<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		dry_wet1.getParameterT(0).connectT(0, dry_wet_mixer); // DryWet -> dry_wet_mixer::Value
		dry_wet1.getParameterT(0).connectT(0, dry_wet_mixer); // DryWet -> dry_wet_mixer::Value
		this->getParameterT(0).connectT(0, pma);              // Filter -> pma::Value
		
		this->getParameterT(1).connectT(0, Gater); // Tempo -> Gater::Tempo
		
		auto& Mix_p = this->getParameterT(2);
		Mix_p.connectT(0, minmax3); // Mix -> minmax3::Value
		Mix_p.connectT(1, minmax4); // Mix -> minmax4::Value
		
		this->getParameterT(3).connectT(0, Gater); // Smooth -> Gater::Smoothness
		
		// Modulation Connections ------------------------------------------------------------------
		
		Gater.getParameter().connectT(0, minmax2);                             // Gater -> minmax2::Value
		minmax4.getWrappedObject().getParameter().connectT(0, Gater);          // minmax4 -> Gater::Mix
		smoothed_parameter.getParameter().connectT(0, djfilter1);              // smoothed_parameter -> djfilter1::DJFilter
		pma.getWrappedObject().getParameter().connectT(0, smoothed_parameter); // pma -> smoothed_parameter::Value
		auto& dry_wet_mixer_p = dry_wet_mixer.getWrappedObject().getParameter();
		dry_wet_mixer_p.getParameterT(0).connectT(0, dry_gain);          // dry_wet_mixer -> dry_gain::Gain
		dry_wet_mixer_p.getParameterT(1).connectT(0, wet_gain);          // dry_wet_mixer -> wet_gain::Gain
		minmax3.getWrappedObject().getParameter().connectT(0, dry_wet1); // minmax3 -> dry_wet1::DryWet
		
		// Default Values --------------------------------------------------------------------------
		
		;                                   // minmax4::Value is automated
		minmax4.setParameterT(1, 0.);       // control::minmax::Minimum
		minmax4.setParameterT(2, 96.2617);  // control::minmax::Maximum
		minmax4.setParameterT(3, 0.482145); // control::minmax::Skew
		minmax4.setParameterT(4, 0.);       // control::minmax::Step
		minmax4.setParameterT(5, 0.);       // control::minmax::Polarity
		
		; // Gater::Tempo is automated
		; // Gater::Mix is automated
		; // Gater::Smoothness is automated
		
		;                                     // minmax2::Value is automated
		minmax2.setParameterT(1, -0.0170249); // control::minmax::Minimum
		minmax2.setParameterT(2, 0.0346829);  // control::minmax::Maximum
		minmax2.setParameterT(3, 1.02405);    // control::minmax::Skew
		minmax2.setParameterT(4, 0.);         // control::minmax::Step
		minmax2.setParameterT(5, 0.);         // control::minmax::Polarity
		
		;                         // pma::Value is automated
		pma.setParameterT(1, 1.); // control::pma::Multiply
		pma.setParameterT(2, 0.); // control::pma::Add
		
		;                                          // smoothed_parameter::Value is automated
		smoothed_parameter.setParameterT(1, 26.6); // control::smoothed_parameter::SmoothingTime
		smoothed_parameter.setParameterT(2, 1.);   // control::smoothed_parameter::Enabled
		
		;                                     // djfilter1::DJFilter is automated
		djfilter1.setParameterT(1, 276.132);  // project::djfilter::Min
		djfilter1.setParameterT(2, 2568.72);  // project::djfilter::Max
		djfilter1.setParameterT(3, 0.209916); // project::djfilter::Steepnes
		
		;                                  // minmax3::Value is automated
		minmax3.setParameterT(1, 0.);      // control::minmax::Minimum
		minmax3.setParameterT(2, 0.35398); // control::minmax::Maximum
		minmax3.setParameterT(3, 1.);      // control::minmax::Skew
		minmax3.setParameterT(4, 0.);      // control::minmax::Step
		minmax3.setParameterT(5, 0.);      // control::minmax::Polarity
		
		; // dry_wet1::DryWet is automated
		
		; // dry_wet_mixer::Value is automated
		
		;                               // dry_gain::Gain is automated
		dry_gain.setParameterT(1, 20.); // core::gain::Smoothing
		dry_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		reverb.setParameterT(0, 0.077644); // fx::reverb::Damping
		reverb.setParameterT(1, 1.);       // fx::reverb::Width
		reverb.setParameterT(2, 0.737219); // fx::reverb::Size
		
		;                               // wet_gain::Gain is automated
		wet_gain.setParameterT(1, 20.); // core::gain::Smoothing
		wet_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		this->setParameterT(0, 0.650062);
		this->setParameterT(1, 6.);
		this->setParameterT(2, 0.);
		this->setParameterT(3, 34.6);
	}
	
	static constexpr bool isPolyphonic() { return NV > 1; };
	
	static constexpr bool hasTail() { return true; };
	
	static constexpr bool isSuspendedOnSilence() { return false; };
};
}

#undef getT
#undef connectT
#undef setParameterT
#undef setParameterWT
#undef getParameterT
// ======================================| Public Definition |======================================

namespace project
{
// polyphonic template declaration

template <int NV>
using Filter = wrap::node<Filter_impl::instance<NV>>;
}



#pragma once

#include "DeRez3.h"
// These will improve the readability of the connection definition

#define getT(Idx) template get<Idx>()
#define connectT(Idx, target) template connect<Idx>(target)
#define getParameterT(Idx) template getParameter<Idx>()
#define setParameterT(Idx, value) template setParameter<Idx>(value)
#define setParameterWT(Idx, value) template setWrapParameter<Idx>(value)
using namespace scriptnode;
using namespace snex;
using namespace snex::Types;

namespace Crush_impl
{
// =============================| Node & Parameter type declarations |=============================

template <int NV>
using minmax1_t = control::minmax<NV, 
                                  parameter::plain<project::DeRez3<NV>, 0>>;

template <int NV>
using minmax_t = control::minmax<NV, 
                                 parameter::plain<project::DeRez3<NV>, 1>>;

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
                                    wrap::fix<2, project::DeRez3<NV>>, 
                                    core::gain<NV>>;

namespace dry_wet1_t_parameters
{
}

template <int NV>
using dry_wet1_t = container::split<parameter::plain<Crush_impl::dry_wet_mixer_t<NV>, 0>, 
                                    wrap::fix<2, dry_path_t<NV>>, 
                                    wet_path_t<NV>>;

namespace Crush_t_parameters
{
// Parameter list for Crush_impl::Crush_t --------------------------------------------------------

template <int NV>
using Mix = parameter::plain<Crush_impl::dry_wet1_t<NV>, 
                             0>;
template <int NV>
using Rate = parameter::plain<Crush_impl::minmax1_t<NV>, 
                              0>;
template <int NV>
using Rez = parameter::plain<Crush_impl::minmax_t<NV>, 
                             0>;
template <int NV>
using Crush_t_plist = parameter::list<Mix<NV>, 
                                      Rate<NV>, 
                                      Rez<NV>>;
}

template <int NV>
using Crush_t_ = container::chain<Crush_t_parameters::Crush_t_plist<NV>, 
                                  wrap::fix<2, minmax1_t<NV>>, 
                                  minmax_t<NV>, 
                                  dry_wet1_t<NV>>;

// ================================| Root node initialiser class |================================

template <int NV> struct instance: public Crush_impl::Crush_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(Crush);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(48)
		{
			0x005C, 0x0000, 0x0000, 0x694D, 0x0078, 0x0000, 0x0000, 0x0000, 
            0x8000, 0x003F, 0x8000, 0x003F, 0x8000, 0x003F, 0x0000, 0x5C00, 
            0x0100, 0x0000, 0x5200, 0x7461, 0x0065, 0x0000, 0x0000, 0x0000, 
            0x8000, 0x313F, 0x009A, 0x003F, 0x8000, 0x003F, 0x0000, 0x5C00, 
            0x0200, 0x0000, 0x5200, 0x7A65, 0x0000, 0x0000, 0x0000, 0x0000, 
            0x3F80, 0x78D5, 0x3EE0, 0x0000, 0x3F80, 0x0000, 0x0000, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References -----------------------------------------------------------------------
		
		auto& minmax1 = this->getT(0);                       // Crush_impl::minmax1_t<NV>
		auto& minmax = this->getT(1);                        // Crush_impl::minmax_t<NV>
		auto& dry_wet1 = this->getT(2);                      // Crush_impl::dry_wet1_t<NV>
		auto& dry_path = this->getT(2).getT(0);              // Crush_impl::dry_path_t<NV>
		auto& dry_wet_mixer = this->getT(2).getT(0).getT(0); // Crush_impl::dry_wet_mixer_t<NV>
		auto& dry_gain = this->getT(2).getT(0).getT(1);      // core::gain<NV>
		auto& wet_path = this->getT(2).getT(1);              // Crush_impl::wet_path_t<NV>
		auto& DeRez3 = this->getT(2).getT(1).getT(0);        // project::DeRez3<NV>
		auto& wet_gain = this->getT(2).getT(1).getT(1);      // core::gain<NV>
		
		// Parameter Connections -----------------------------------------------------------------
		
		dry_wet1.getParameterT(0).connectT(0, dry_wet_mixer); // DryWet -> dry_wet_mixer::Value
		this->getParameterT(0).connectT(0, dry_wet1);         // Mix -> dry_wet1::DryWet
		
		this->getParameterT(1).connectT(0, minmax1); // Rate -> minmax1::Value
		
		this->getParameterT(2).connectT(0, minmax); // Rez -> minmax::Value
		
		// Modulation Connections ----------------------------------------------------------------
		
		minmax1.getWrappedObject().getParameter().connectT(0, DeRez3); // minmax1 -> DeRez3::Rate
		minmax.getWrappedObject().getParameter().connectT(0, DeRez3);  // minmax -> DeRez3::Rez
		auto& dry_wet_mixer_p = dry_wet_mixer.getWrappedObject().getParameter();
		dry_wet_mixer_p.getParameterT(0).connectT(0, dry_gain); // dry_wet_mixer -> dry_gain::Gain
		dry_wet_mixer_p.getParameterT(1).connectT(0, wet_gain); // dry_wet_mixer -> wet_gain::Gain
		
		// Default Values ------------------------------------------------------------------------
		
		;                                   // minmax1::Value is automated
		minmax1.setParameterT(1, 0.321119); // control::minmax::Minimum
		minmax1.setParameterT(2, 0.883676); // control::minmax::Maximum
		minmax1.setParameterT(3, 1.6925);   // control::minmax::Skew
		minmax1.setParameterT(4, 0.);       // control::minmax::Step
		minmax1.setParameterT(5, 1.);       // control::minmax::Polarity
		
		;                                   // minmax::Value is automated
		minmax.setParameterT(1, 0.0704687); // control::minmax::Minimum
		minmax.setParameterT(2, 0.552453);  // control::minmax::Maximum
		minmax.setParameterT(3, 0.638977);  // control::minmax::Skew
		minmax.setParameterT(4, 0.);        // control::minmax::Step
		minmax.setParameterT(5, 1.);        // control::minmax::Polarity
		
		; // dry_wet1::DryWet is automated
		
		; // dry_wet_mixer::Value is automated
		
		;                               // dry_gain::Gain is automated
		dry_gain.setParameterT(1, 20.); // core::gain::Smoothing
		dry_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		;                            // DeRez3::Rate is automated
		;                            // DeRez3::Rez is automated
		DeRez3.setParameterT(2, 1.); // project::DeRez3::DryWet
		
		;                               // wet_gain::Gain is automated
		wet_gain.setParameterT(1, 20.); // core::gain::Smoothing
		wet_gain.setParameterT(2, 0.);  // core::gain::ResetValue
		
		this->setParameterT(0, 1.);
		this->setParameterT(1, 0.502353);
		this->setParameterT(2, 0.438422);
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
// =====================================| Public Definition |=====================================

namespace project
{
// polyphonic template declaration

template <int NV>
using Crush = wrap::node<Crush_impl::instance<NV>>;
}



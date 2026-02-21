#pragma once

// These will improve the readability of the connection definition

#define getT(Idx) template get<Idx>()
#define connectT(Idx, target) template connect<Idx>(target)
#define getParameterT(Idx) template getParameter<Idx>()
#define setParameterT(Idx, value) template setParameter<Idx>(value)
#define setParameterWT(Idx, value) template setWrapParameter<Idx>(value)
using namespace scriptnode;
using namespace snex;
using namespace snex::Types;

namespace djfilter_impl
{
// ============================| Node & Parameter type declarations |============================

template <int NV>
using minmax_t = control::minmax<NV, 
                                 parameter::plain<filters::svf<NV>, 0>>;

template <int NV>
using minmax3_t = control::minmax<NV, 
                                  parameter::plain<filters::svf<NV>, 1>>;

template <int NV>
using xfader_c0 = parameter::chain<ranges::Identity, 
                                   parameter::plain<minmax_t<NV>, 0>, 
                                   parameter::plain<minmax3_t<NV>, 0>>;

template <int NV> using minmax1_t = minmax_t<NV>;

template <int NV> using minmax2_t = minmax3_t<NV>;

template <int NV>
using xfader_c1 = parameter::chain<ranges::Identity, 
                                   parameter::plain<minmax1_t<NV>, 0>, 
                                   parameter::plain<minmax2_t<NV>, 0>>;

template <int NV>
using xfader_multimod = parameter::list<xfader_c0<NV>, xfader_c1<NV>>;

template <int NV>
using xfader_t = control::xfader<xfader_multimod<NV>, faders::overlap>;

namespace djfilter_t_parameters
{
// Parameter list for djfilter_impl::djfilter_t -------------------------------------------------

template <int NV>
using DJFilter = parameter::plain<djfilter_impl::xfader_t<NV>, 
                                  0>;
template <int NV>
using Min = parameter::plain<djfilter_impl::minmax1_t<NV>, 
                             1>;
template <int NV>
using Max = parameter::plain<djfilter_impl::minmax_t<NV>, 
                             2>;
using Steepnes = parameter::empty;
template <int NV>
using djfilter_t_plist = parameter::list<DJFilter<NV>, 
                                         Min<NV>, 
                                         Max<NV>, 
                                         Steepnes>;
}

template <int NV>
using djfilter_t_ = container::chain<djfilter_t_parameters::djfilter_t_plist<NV>, 
                                     wrap::fix<2, xfader_t<NV>>, 
                                     minmax2_t<NV>, 
                                     minmax3_t<NV>, 
                                     minmax_t<NV>, 
                                     minmax1_t<NV>, 
                                     filters::svf<NV>, 
                                     filters::svf<NV>>;

// ================================| Root node initialiser class |================================

template <int NV> struct instance: public djfilter_impl::djfilter_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(djfilter);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(68)
		{
			0x005C, 0x0000, 0x0000, 0x4A44, 0x6946, 0x746C, 0x7265, 0x0000, 
            0x0000, 0x0000, 0x0000, 0x3F80, 0xD6F8, 0x3EFE, 0x0000, 0x3F80, 
            0x0000, 0x0000, 0x015C, 0x0001, 0x0000, 0x694D, 0x006E, 0x0000, 
            0x0000, 0x0000, 0x9C40, 0xD846, 0x8A10, 0x0043, 0x8000, 0x003F, 
            0x0000, 0x5C00, 0x0200, 0x0000, 0x4D00, 0x7861, 0x0000, 0x0000, 
            0x41A0, 0x4000, 0x469C, 0x8B75, 0x4520, 0x6C1A, 0x3E6B, 0x0000, 
            0x0000, 0x005C, 0x0003, 0x0000, 0x7453, 0x6565, 0x6E70, 0x7365, 
            0x0000, 0xCCCD, 0x3DCC, 0x0000, 0x4120, 0xF447, 0x3E56, 0x004E, 
            0x3E94, 0x0000, 0x0000, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References ----------------------------------------------------------------------
		
		auto& xfader = this->getT(0);  // djfilter_impl::xfader_t<NV>
		auto& minmax2 = this->getT(1); // djfilter_impl::minmax2_t<NV>
		auto& minmax3 = this->getT(2); // djfilter_impl::minmax3_t<NV>
		auto& minmax = this->getT(3);  // djfilter_impl::minmax_t<NV>
		auto& minmax1 = this->getT(4); // djfilter_impl::minmax1_t<NV>
		auto& svf1 = this->getT(5);    // filters::svf<NV>
		auto& svf = this->getT(6);     // filters::svf<NV>
		
		// Parameter Connections ----------------------------------------------------------------
		
		this->getParameterT(0).connectT(0, xfader); // DJFilter -> xfader::Value
		
		this->getParameterT(1).connectT(0, minmax1); // Min -> minmax1::Minimum
		
		this->getParameterT(2).connectT(0, minmax); // Max -> minmax::Maximum
		
		// Modulation Connections ---------------------------------------------------------------
		
		minmax.getWrappedObject().getParameter().connectT(0, svf1);  // minmax -> svf1::Frequency
		minmax3.getWrappedObject().getParameter().connectT(0, svf1); // minmax3 -> svf1::Q
		minmax1.getWrappedObject().getParameter().connectT(0, svf);  // minmax1 -> svf::Frequency
		minmax2.getWrappedObject().getParameter().connectT(0, svf);  // minmax2 -> svf::Q
		auto& xfader_p = xfader.getWrappedObject().getParameter();
		xfader_p.getParameterT(0).connectT(0, minmax);  // xfader -> minmax::Value
		xfader_p.getParameterT(0).connectT(1, minmax3); // xfader -> minmax3::Value
		xfader_p.getParameterT(1).connectT(0, minmax1); // xfader -> minmax1::Value
		xfader_p.getParameterT(1).connectT(1, minmax2); // xfader -> minmax2::Value
		
		// Default Values -----------------------------------------------------------------------
		
		; // xfader::Value is automated
		
		;                                   // minmax2::Value is automated
		minmax2.setParameterT(1, 0.826753); // control::minmax::Minimum
		minmax2.setParameterT(2, 3.95576);  // control::minmax::Maximum
		minmax2.setParameterT(3, 1.14437);  // control::minmax::Skew
		minmax2.setParameterT(4, 0.);       // control::minmax::Step
		minmax2.setParameterT(5, 1.);       // control::minmax::Polarity
		
		;                                  // minmax3::Value is automated
		minmax3.setParameterT(1, 1.);      // control::minmax::Minimum
		minmax3.setParameterT(2, 5.32943); // control::minmax::Maximum
		minmax3.setParameterT(3, 1.);      // control::minmax::Skew
		minmax3.setParameterT(4, 0.);      // control::minmax::Step
		minmax3.setParameterT(5, 1.);      // control::minmax::Polarity
		
		;                                  // minmax::Value is automated
		minmax.setParameterT(1, 20.5218);  // control::minmax::Minimum
		;                                  // minmax::Maximum is automated
		minmax.setParameterT(3, 0.429684); // control::minmax::Skew
		minmax.setParameterT(4, 0.);       // control::minmax::Step
		minmax.setParameterT(5, 1.);       // control::minmax::Polarity
		
		;                                   // minmax1::Value is automated
		;                                   // minmax1::Minimum is automated
		minmax1.setParameterT(2, 17766.9);  // control::minmax::Maximum
		minmax1.setParameterT(3, 0.139005); // control::minmax::Skew
		minmax1.setParameterT(4, 0.);       // control::minmax::Step
		minmax1.setParameterT(5, 0.);       // control::minmax::Polarity
		
		;                            // svf1::Frequency is automated
		;                            // svf1::Q is automated
		svf1.setParameterT(2, 0.);   // filters::svf::Gain
		svf1.setParameterT(3, 0.01); // filters::svf::Smoothing
		svf1.setParameterT(4, 1.);   // filters::svf::Mode
		svf1.setParameterT(5, 1.);   // filters::svf::Enabled
		
		;                           // svf::Frequency is automated
		;                           // svf::Q is automated
		svf.setParameterT(2, 0.);   // filters::svf::Gain
		svf.setParameterT(3, 0.01); // filters::svf::Smoothing
		svf.setParameterT(4, 0.);   // filters::svf::Mode
		svf.setParameterT(5, 1.);   // filters::svf::Enabled
		
		this->setParameterT(0, 0.497734);
		this->setParameterT(1, 276.132);
		this->setParameterT(2, 2568.72);
		this->setParameterT(3, 0.209916);
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
using djfilter = wrap::node<djfilter_impl::instance<NV>>;
}



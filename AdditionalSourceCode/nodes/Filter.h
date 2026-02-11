#pragma once

#include "Cabs2.h"
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
using minmax_t = control::minmax<NV, 
                                 parameter::plain<project::Cabs2<NV>, 0>>;
template <int NV>
using pma_t = control::pma<NV, 
                           parameter::plain<minmax_t<NV>, 0>>;

template <int NV>
using minmax1_t = control::minmax<NV, 
                                  parameter::plain<project::Cabs2<NV>, 1>>;
template <int NV>
using pma1_t = control::pma<NV, 
                            parameter::plain<minmax1_t<NV>, 0>>;

template <int NV>
using smoothed_parameter_mod = parameter::chain<ranges::Identity, 
                                                parameter::plain<pma_t<NV>, 0>, 
                                                parameter::plain<pma1_t<NV>, 0>>;

template <int NV>
using smoothed_parameter_t = wrap::mod<smoothed_parameter_mod<NV>, 
                                       control::smoothed_parameter<NV, smoothers::linear_ramp<NV>>>;

namespace Filter_t_parameters
{
}

template <int NV>
using Filter_t_ = container::chain<parameter::plain<Filter_impl::smoothed_parameter_t<NV>, 0>, 
                                   wrap::fix<2, smoothed_parameter_t<NV>>, 
                                   pma_t<NV>, 
                                   pma1_t<NV>, 
                                   minmax_t<NV>, 
                                   minmax1_t<NV>, 
                                   project::Cabs2<NV>>;

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
		SNEX_METADATA_ENCODED_PARAMETERS(18)
		{
			0x005C, 0x0000, 0x0000, 0x6946, 0x746C, 0x7265, 0x0000, 0x0000, 
            0x0000, 0x0000, 0x3F80, 0x62AB, 0x3F16, 0x0000, 0x3F80, 0x0000, 
            0x0000, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& smoothed_parameter = this->getT(0); // Filter_impl::smoothed_parameter_t<NV>
		auto& pma = this->getT(1);                // Filter_impl::pma_t<NV>
		auto& pma1 = this->getT(2);               // Filter_impl::pma1_t<NV>
		auto& minmax = this->getT(3);             // Filter_impl::minmax_t<NV>
		auto& minmax1 = this->getT(4);            // Filter_impl::minmax1_t<NV>
		auto& Cabs2 = this->getT(5);              // project::Cabs2<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		this->getParameterT(0).connectT(0, smoothed_parameter); // Filter -> smoothed_parameter::Value
		
		// Modulation Connections ------------------------------------------------------------------
		
		minmax.getWrappedObject().getParameter().connectT(0, Cabs2);  // minmax -> Cabs2::Lowpass
		pma.getWrappedObject().getParameter().connectT(0, minmax);    // pma -> minmax::Value
		minmax1.getWrappedObject().getParameter().connectT(0, Cabs2); // minmax1 -> Cabs2::Hipass
		pma1.getWrappedObject().getParameter().connectT(0, minmax1);  // pma1 -> minmax1::Value
		smoothed_parameter.getParameter().connectT(0, pma);           // smoothed_parameter -> pma::Value
		smoothed_parameter.getParameter().connectT(1, pma1);          // smoothed_parameter -> pma1::Value
		
		// Default Values --------------------------------------------------------------------------
		
		;                                           // smoothed_parameter::Value is automated
		smoothed_parameter.setParameterT(1, 234.1); // control::smoothed_parameter::SmoothingTime
		smoothed_parameter.setParameterT(2, 1.);    // control::smoothed_parameter::Enabled
		
		;                         // pma::Value is automated
		pma.setParameterT(1, 2.); // control::pma::Multiply
		pma.setParameterT(2, 0.); // control::pma::Add
		
		;                           // pma1::Value is automated
		pma1.setParameterT(1, 2.);  // control::pma::Multiply
		pma1.setParameterT(2, -1.); // control::pma::Add
		
		;                                   // minmax::Value is automated
		minmax.setParameterT(1, 0.0682554); // control::minmax::Minimum
		minmax.setParameterT(2, 1.);        // control::minmax::Maximum
		minmax.setParameterT(3, 0.287609);  // control::minmax::Skew
		minmax.setParameterT(4, 0.);        // control::minmax::Step
		minmax.setParameterT(5, 0.);        // control::minmax::Polarity
		
		;                                   // minmax1::Value is automated
		minmax1.setParameterT(1, 0.);       // control::minmax::Minimum
		minmax1.setParameterT(2, 0.831805); // control::minmax::Maximum
		minmax1.setParameterT(3, 3.30985);  // control::minmax::Skew
		minmax1.setParameterT(4, 0.);       // control::minmax::Step
		minmax1.setParameterT(5, 0.);       // control::minmax::Polarity
		
		; // Cabs2::Lowpass is automated
		; // Cabs2::Hipass is automated
		
		this->setParameterT(0, 0.587443);
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



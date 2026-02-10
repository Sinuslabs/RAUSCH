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
// ============================| Node & Parameter type declarations |============================

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

namespace Filter_t_parameters
{

template <int NV>
using Filter = parameter::chain<ranges::Identity, 
                                parameter::plain<Filter_impl::pma_t<NV>, 0>, 
                                parameter::plain<Filter_impl::pma1_t<NV>, 0>>;

}

template <int NV>
using Filter_t_ = container::chain<Filter_t_parameters::Filter<NV>, 
                                   wrap::fix<2, pma_t<NV>>, 
                                   pma1_t<NV>, 
                                   minmax_t<NV>, 
                                   minmax1_t<NV>, 
                                   project::Cabs2<NV>>;

// ================================| Root node initialiser class |================================

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
            0x0000, 0x0000, 0x3F80, 0xDF99, 0x3F10, 0x0000, 0x3F80, 0x0000, 
            0x0000, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References ----------------------------------------------------------------------
		
		auto& pma = this->getT(0);     // Filter_impl::pma_t<NV>
		auto& pma1 = this->getT(1);    // Filter_impl::pma1_t<NV>
		auto& minmax = this->getT(2);  // Filter_impl::minmax_t<NV>
		auto& minmax1 = this->getT(3); // Filter_impl::minmax1_t<NV>
		auto& Cabs2 = this->getT(4);   // project::Cabs2<NV>
		
		// Parameter Connections ----------------------------------------------------------------
		
		auto& Filter_p = this->getParameterT(0);
		Filter_p.connectT(0, pma);  // Filter -> pma::Value
		Filter_p.connectT(1, pma1); // Filter -> pma1::Value
		
		// Modulation Connections ---------------------------------------------------------------
		
		minmax.getWrappedObject().getParameter().connectT(0, Cabs2);  // minmax -> Cabs2::Lowpass
		pma.getWrappedObject().getParameter().connectT(0, minmax);    // pma -> minmax::Value
		minmax1.getWrappedObject().getParameter().connectT(0, Cabs2); // minmax1 -> Cabs2::Hipass
		pma1.getWrappedObject().getParameter().connectT(0, minmax1);  // pma1 -> minmax1::Value
		
		// Default Values -----------------------------------------------------------------------
		
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
		
		this->setParameterT(0, 0.565912);
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
using Filter = wrap::node<Filter_impl::instance<NV>>;
}



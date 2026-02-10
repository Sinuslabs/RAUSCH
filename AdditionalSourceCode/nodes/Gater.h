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

namespace Gater_impl
{
// ==============================| Node & Parameter type declarations |==============================

template <int NV>
using oscillator_t = wrap::no_data<core::oscillator<NV>>;

template <int NV>
using pma_unscaled_t = control::pma_unscaled<NV, 
                                             parameter::plain<project::Faust_Gater<NV>, 0>>;
template <int NV>
using minmax_t = control::minmax<NV, 
                                 parameter::plain<pma_unscaled_t<NV>, 2>>;
template <int NV>
using peak_t = wrap::mod<parameter::plain<minmax_t<NV>, 0>, 
                         wrap::no_data<core::peak>>;
using oscilloscope_t = wrap::no_data<analyse::oscilloscope>;

template <int NV>
using modchain_t_ = container::chain<parameter::empty, 
                                     wrap::fix<1, oscillator_t<NV>>, 
                                     math::sig2mod<NV>, 
                                     peak_t<NV>, 
                                     minmax_t<NV>, 
                                     oscilloscope_t>;

template <int NV>
using modchain_t = wrap::control_rate<modchain_t_<NV>>;

template <int NV>
using tempo_sync_t = wrap::mod<parameter::plain<pma_unscaled_t<NV>, 0>, 
                               control::tempo_sync<NV>>;

namespace Gater_t_parameters
{
// Parameter list for Gater_impl::Gater_t ----------------------------------------------------------

template <int NV>
using Tempo = parameter::plain<Gater_impl::tempo_sync_t<NV>, 
                               0>;
template <int NV>
using Mix = parameter::plain<project::Faust_Gater<NV>, 
                             1>;
template <int NV>
using Smoothness = parameter::plain<project::Faust_Gater<NV>, 
                                    2>;
template <int NV>
using Gater_t_plist = parameter::list<Tempo<NV>, 
                                      Mix<NV>, 
                                      Smoothness<NV>>;
}

template <int NV>
using Gater_t_ = container::chain<Gater_t_parameters::Gater_t_plist<NV>, 
                                  wrap::fix<2, modchain_t<NV>>, 
                                  tempo_sync_t<NV>, 
                                  pma_unscaled_t<NV>, 
                                  project::Faust_Gater<NV>>;

// =================================| Root node initialiser class |=================================

template <int NV> struct instance: public Gater_impl::Gater_t_<NV>
{
	
	struct metadata
	{
		static const int NumTables = 0;
		static const int NumSliderPacks = 0;
		static const int NumAudioFiles = 0;
		static const int NumFilters = 0;
		static const int NumDisplayBuffers = 0;
		
		SNEX_METADATA_ID(Gater);
		SNEX_METADATA_NUM_CHANNELS(2);
		SNEX_METADATA_ENCODED_PARAMETERS(52)
		{
			0x005C, 0x0000, 0x0000, 0x6554, 0x706D, 0x006F, 0x0000, 0x0000, 
            0x0000, 0x9000, 0x0041, 0x8000, 0x0040, 0x8000, 0x003F, 0x8000, 
            0x5C3F, 0x0100, 0x0000, 0x4D00, 0x7869, 0x0000, 0x0000, 0x0000, 
            0x0000, 0x42C8, 0x0000, 0x4258, 0x0000, 0x3F80, 0x0000, 0x3F80, 
            0x005C, 0x0002, 0x0000, 0x6D53, 0x6F6F, 0x6874, 0x656E, 0x7373, 
            0x0000, 0x0000, 0x3F00, 0x0000, 0x4248, 0x0000, 0x4248, 0x0000, 
            0x3F80, 0xCCCD, 0x3DCC, 0x0000
		};
		SNEX_METADATA_ENCODED_MOD_INFO(2)
		{
			0x3D3B, 0x003E
		};
	};
	
	instance()
	{
		// Node References -------------------------------------------------------------------------
		
		auto& modchain = this->getT(0);             // Gater_impl::modchain_t<NV>
		auto& oscillator = this->getT(0).getT(0);   // Gater_impl::oscillator_t<NV>
		auto& sig2mod = this->getT(0).getT(1);      // math::sig2mod<NV>
		auto& peak = this->getT(0).getT(2);         // Gater_impl::peak_t<NV>
		auto& minmax = this->getT(0).getT(3);       // Gater_impl::minmax_t<NV>
		auto& oscilloscope = this->getT(0).getT(4); // Gater_impl::oscilloscope_t
		auto& tempo_sync = this->getT(1);           // Gater_impl::tempo_sync_t<NV>
		auto& pma_unscaled = this->getT(2);         // Gater_impl::pma_unscaled_t<NV>
		auto& faust = this->getT(3);                // project::Faust_Gater<NV>
		
		// Parameter Connections -------------------------------------------------------------------
		
		this->getParameterT(0).connectT(0, tempo_sync); // Tempo -> tempo_sync::Tempo
		
		this->getParameterT(1).connectT(0, faust); // Mix -> faust::Mix
		
		this->getParameterT(2).connectT(0, faust); // Smoothness -> faust::Smoothness
		
		// Modulation Connections ------------------------------------------------------------------
		
		pma_unscaled.getWrappedObject().getParameter().connectT(0, faust);  // pma_unscaled -> faust::GateTime
		minmax.getWrappedObject().getParameter().connectT(0, pma_unscaled); // minmax -> pma_unscaled::Add
		peak.getParameter().connectT(0, minmax);                            // peak -> minmax::Value
		tempo_sync.getParameter().connectT(0, pma_unscaled);                // tempo_sync -> pma_unscaled::Value
		
		// Default Values --------------------------------------------------------------------------
		
		oscillator.setParameterT(0, 0.);    // core::oscillator::Mode
		oscillator.setParameterT(1, 0.042); // core::oscillator::Frequency
		oscillator.setParameterT(2, 1.);    // core::oscillator::FreqRatio
		oscillator.setParameterT(3, 1.);    // core::oscillator::Gate
		oscillator.setParameterT(4, 0.);    // core::oscillator::Phase
		oscillator.setParameterT(5, 1.);    // core::oscillator::Gain
		
		sig2mod.setParameterT(0, 0.690625); // math::sig2mod::Value
		
		;                                  // minmax::Value is automated
		minmax.setParameterT(1, -2.94168); // control::minmax::Minimum
		minmax.setParameterT(2, 1.41351);  // control::minmax::Maximum
		minmax.setParameterT(3, 1.);       // control::minmax::Skew
		minmax.setParameterT(4, 0.);       // control::minmax::Step
		minmax.setParameterT(5, 0.);       // control::minmax::Polarity
		
		;                                  // tempo_sync::Tempo is automated
		tempo_sync.setParameterT(1, 1.);   // control::tempo_sync::Multiplier
		tempo_sync.setParameterT(2, 1.);   // control::tempo_sync::Enabled
		tempo_sync.setParameterT(3, 200.); // control::tempo_sync::UnsyncedTime
		
		;                                  // pma_unscaled::Value is automated
		pma_unscaled.setParameterT(1, 1.); // control::pma_unscaled::Multiply
		;                                  // pma_unscaled::Add is automated
		
		; // faust::GateTime is automated
		; // faust::Mix is automated
		; // faust::Smoothness is automated
		
		this->setParameterT(0, 4.);
		this->setParameterT(1, 54.);
		this->setParameterT(2, 50.);
		this->setExternalData({}, -1);
	}
	~instance() override
	{
		// Cleanup external data references --------------------------------------------------------
		
		this->setExternalData({}, -1);
	}
	
	static constexpr bool isPolyphonic() { return NV > 1; };
	
	static constexpr bool isProcessingHiseEvent() { return true; };
	
	static constexpr bool hasTail() { return true; };
	
	static constexpr bool isSuspendedOnSilence() { return false; };
	
	void setExternalData(const ExternalData& b, int index)
	{
		// External Data Connections ---------------------------------------------------------------
		
		this->getT(0).getT(0).setExternalData(b, index); // Gater_impl::oscillator_t<NV>
		this->getT(0).getT(2).setExternalData(b, index); // Gater_impl::peak_t<NV>
		this->getT(0).getT(4).setExternalData(b, index); // Gater_impl::oscilloscope_t
	}
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
using Gater = wrap::node<Gater_impl::instance<NV>>;
}



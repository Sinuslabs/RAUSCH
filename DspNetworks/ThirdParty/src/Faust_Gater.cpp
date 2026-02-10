/* ------------------------------------------------------------
name: "Gater"
Code generated with Faust 2.79.2 (https://faust.grame.fr)
Compilation options: -lang cpp -rui -nvi -ct 1 -cn _Faust_Gater -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0
------------------------------------------------------------ */

#ifndef  ___Faust_Gater_H__
#define  ___Faust_Gater_H__

#ifndef FAUSTFLOAT
#define FAUSTFLOAT float
#endif 

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <math.h>

#ifndef FAUSTCLASS 
#define FAUSTCLASS _Faust_Gater
#endif

#ifdef __APPLE__ 
#define exp10f __exp10f
#define exp10 __exp10
#endif

#if defined(_WIN32)
#define RESTRICT __restrict
#else
#define RESTRICT __restrict__
#endif


struct _Faust_Gater final : public ::faust::dsp {
	
	int fSampleRate;
	float fConst0;
	float fConst1;
	FAUSTFLOAT fHslider0;
	float fConst2;
	int iVec0[2];
	float fRec0[2];
	FAUSTFLOAT fHslider1;
	float fRec2[2];
	float fConst3;
	float fConst4;
	FAUSTFLOAT fHslider2;
	float fRec4[2];
	float fRec3[2];
	float fRec1[2];
	
	_Faust_Gater() {
	}
	
	void metadata(Meta* m) { 
		m->declare("basics.lib/name", "Faust Basic Element Library");
		m->declare("basics.lib/version", "1.21.0");
		m->declare("compile_options", "-lang cpp -rui -nvi -ct 1 -cn _Faust_Gater -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0");
		m->declare("description", "Simple volume gater with ms control");
		m->declare("filename", "Faust_Gater.dsp");
		m->declare("maths.lib/author", "GRAME");
		m->declare("maths.lib/copyright", "GRAME");
		m->declare("maths.lib/license", "LGPL with exception");
		m->declare("maths.lib/name", "Faust Math Library");
		m->declare("maths.lib/version", "2.8.1");
		m->declare("name", "Gater");
		m->declare("oscillators.lib/name", "Faust Oscillator Library");
		m->declare("oscillators.lib/version", "1.6.0");
		m->declare("platform.lib/name", "Generic Platform Library");
		m->declare("platform.lib/version", "1.3.0");
		m->declare("signals.lib/name", "Faust Signal Routing Library");
		m->declare("signals.lib/version", "1.6.0");
	}

	static constexpr int getStaticNumInputs() {
		return 2;
	}
	static constexpr int getStaticNumOutputs() {
		return 2;
	}
	int getNumInputs() {
		return 2;
	}
	int getNumOutputs() {
		return 2;
	}
	
	static void classInit(int sample_rate) {
	}
	
	void instanceConstants(int sample_rate) {
		fSampleRate = sample_rate;
		fConst0 = std::min<float>(1.92e+05f, std::max<float>(1.0f, float(fSampleRate)));
		fConst1 = 44.1f / fConst0;
		fConst2 = 1.0f - fConst1;
		fConst3 = 1.0f / fConst0;
		fConst4 = 1e+03f / fConst0;
	}
	
	void instanceResetUserInterface() {
		fHslider0 = FAUSTFLOAT(1e+02f);
		fHslider1 = FAUSTFLOAT(5.0f);
		fHslider2 = FAUSTFLOAT(2e+02f);
	}
	
	void instanceClear() {
		for (int l0 = 0; l0 < 2; l0 = l0 + 1) {
			iVec0[l0] = 0;
		}
		for (int l1 = 0; l1 < 2; l1 = l1 + 1) {
			fRec0[l1] = 0.0f;
		}
		for (int l2 = 0; l2 < 2; l2 = l2 + 1) {
			fRec2[l2] = 0.0f;
		}
		for (int l3 = 0; l3 < 2; l3 = l3 + 1) {
			fRec4[l3] = 0.0f;
		}
		for (int l4 = 0; l4 < 2; l4 = l4 + 1) {
			fRec3[l4] = 0.0f;
		}
		for (int l5 = 0; l5 < 2; l5 = l5 + 1) {
			fRec1[l5] = 0.0f;
		}
	}
	
	void init(int sample_rate) {
		classInit(sample_rate);
		instanceInit(sample_rate);
	}
	
	void instanceInit(int sample_rate) {
		instanceConstants(sample_rate);
		instanceResetUserInterface();
		instanceClear();
	}
	
	_Faust_Gater* clone() {
		return new _Faust_Gater();
	}
	
	int getSampleRate() {
		return fSampleRate;
	}
	
	void buildUserInterface(UI* ui_interface) {
		ui_interface->openVerticalBox("Gater");
		ui_interface->declare(&fHslider2, "unit", "ms");
		ui_interface->addHorizontalSlider("Gate Time", &fHslider2, FAUSTFLOAT(2e+02f), FAUSTFLOAT(1e+01f), FAUSTFLOAT(2e+03f), FAUSTFLOAT(1.0f));
		ui_interface->declare(&fHslider0, "unit", "%");
		ui_interface->addHorizontalSlider("Mix", &fHslider0, FAUSTFLOAT(1e+02f), FAUSTFLOAT(0.0f), FAUSTFLOAT(1e+02f), FAUSTFLOAT(1.0f));
		ui_interface->declare(&fHslider1, "unit", "ms");
		ui_interface->addHorizontalSlider("Smoothness", &fHslider1, FAUSTFLOAT(5.0f), FAUSTFLOAT(0.5f), FAUSTFLOAT(5e+01f), FAUSTFLOAT(0.1f));
		ui_interface->closeBox();
	}
	
	void compute(int count, FAUSTFLOAT** RESTRICT inputs, FAUSTFLOAT** RESTRICT outputs) {
		FAUSTFLOAT* input0 = inputs[0];
		FAUSTFLOAT* input1 = inputs[1];
		FAUSTFLOAT* output0 = outputs[0];
		FAUSTFLOAT* output1 = outputs[1];
		float fSlow0 = fConst1 * std::max<float>(0.0f, std::min<float>(1e+02f, float(fHslider0)));
		float fSlow1 = fConst1 * std::max<float>(0.5f, std::min<float>(5e+01f, float(fHslider1)));
		float fSlow2 = fConst1 * std::max<float>(1e+01f, std::min<float>(2e+03f, float(fHslider2)));
		for (int i0 = 0; i0 < count; i0 = i0 + 1) {
			iVec0[0] = 1;
			fRec0[0] = fSlow0 + fConst2 * fRec0[1];
			fRec2[0] = fSlow1 + fConst2 * fRec2[1];
			float fTemp0 = 0.001f * fRec2[0];
			int iTemp1 = std::fabs(fTemp0) < 1.1920929e-07f;
			float fTemp2 = ((iTemp1) ? 0.0f : std::exp(-(fConst3 / ((iTemp1) ? 1.0f : fTemp0))));
			fRec4[0] = fSlow2 + fConst2 * fRec4[1];
			float fTemp3 = ((1 - iVec0[1]) ? 0.0f : fRec3[1] + fConst4 / fRec4[0]);
			fRec3[0] = fTemp3 - std::floor(fTemp3);
			fRec1[0] = (1.0f - fTemp2) * float(fRec3[0] > 0.5f) + fTemp2 * fRec1[1];
			float fTemp4 = 1.0f - 0.01f * fRec0[0] + 0.01f * fRec0[0] * fRec1[0];
			output0[i0] = FAUSTFLOAT(float(input0[i0]) * fTemp4);
			output1[i0] = FAUSTFLOAT(float(input1[i0]) * fTemp4);
			iVec0[1] = iVec0[0];
			fRec0[1] = fRec0[0];
			fRec2[1] = fRec2[0];
			fRec4[1] = fRec4[0];
			fRec3[1] = fRec3[0];
			fRec1[1] = fRec1[0];
		}
	}

};

#ifdef FAUST_UIMACROS
	
	#define FAUST_FILE_NAME "Faust_Gater.dsp"
	#define FAUST_CLASS_NAME "_Faust_Gater"
	#define FAUST_COMPILATION_OPIONS "-lang cpp -rui -nvi -ct 1 -cn _Faust_Gater -scn ::faust::dsp -es 1 -mcd 16 -mdd 1024 -mdy 33 -uim -single -ftz 0"
	#define FAUST_INPUTS 2
	#define FAUST_OUTPUTS 2
	#define FAUST_ACTIVES 3
	#define FAUST_PASSIVES 0

	FAUST_ADDHORIZONTALSLIDER("Gate Time", fHslider2, 2e+02f, 1e+01f, 2e+03f, 1.0f);
	FAUST_ADDHORIZONTALSLIDER("Mix", fHslider0, 1e+02f, 0.0f, 1e+02f, 1.0f);
	FAUST_ADDHORIZONTALSLIDER("Smoothness", fHslider1, 5.0f, 0.5f, 5e+01f, 0.1f);

	#define FAUST_LIST_ACTIVES(p) \
		p(HORIZONTALSLIDER, Gate_Time, "Gate Time", fHslider2, 2e+02f, 1e+01f, 2e+03f, 1.0f) \
		p(HORIZONTALSLIDER, Mix, "Mix", fHslider0, 1e+02f, 0.0f, 1e+02f, 1.0f) \
		p(HORIZONTALSLIDER, Smoothness, "Smoothness", fHslider1, 5.0f, 0.5f, 5e+01f, 0.1f) \

	#define FAUST_LIST_PASSIVES(p) \

#endif

#endif

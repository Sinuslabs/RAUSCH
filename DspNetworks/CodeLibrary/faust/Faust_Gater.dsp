// Faust Source File: Faust_Gater
// Created with HISE on 2026-02-10
declare name "Gater";
declare description "Simple volume gater with ms control";

import("stdfaust.lib");

// Parameters
gate_time = hslider("Gate Time[unit:ms]", 200, 10, 2000, 1) : si.smoo;
smoothness = hslider("Smoothness[unit:ms]", 5, 0.5, 50, 0.1) : si.smoo;
mix = hslider("Mix[unit:%]", 100, 0, 100, 1) : si.smoo : /(100);

// Gate LFO: phasor-based square gate
gate_freq = 1000.0 / gate_time;
phasor = os.phasor(1, gate_freq);
gate_raw = phasor > 0.5;

// Smooth the gate to avoid clicks (smoothness in ms -> one-pole coeff)
smooth_coeff = ba.tau2pole(smoothness * 0.001);
gate_smooth = gate_raw : si.smooth(smooth_coeff);

// Dry/wet
gater(x) = x * (1 - mix) + x * gate_smooth * mix;

process = gater, gater;
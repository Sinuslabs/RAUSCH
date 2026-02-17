/**
 * @file Random.js
 * @description Randomization engine with biased random generation and smooth transitions.
 *   On button click, generates new random targets for knobs, XY pad, tempo, and sound
 *   selection, then interpolates from current to target values using cubic ease-in-out.
 *
 * @outline
 *   Random_btn           Dice-style button triggering randomization
 *   Filter / Gater       DSP effect references updated during transition
 *   KNOB_PARAMS          Config array: id, min, max, bias, strength per knob
 *   XY_CONFIG            X/Y axis bias config for XYPad
 *   TEMPO_CONFIG         Tempo bias config for Motion segment selector
 *   TRANSITION_*         Timer interval, step count, increment for smooth lerp
 *   biasedRandom()       Generates value clustered around a bias point
 *   easeInOut()          Cubic ease-in-out curve for smooth acceleration
 *   transitionTimer      Timer driving per-frame interpolation of all parameters
 *   randomize()          Captures current state, generates targets, starts transition
 *   randomRoutine()      Custom paint: 3x3 grid of randomly sized dots (dice icon)
 *   setMouseCallback     Triggers randomize() on mouse-up
 *
 * @dependencies XYPad, Motion, FileLoader, Theme, Synth.getEffect("Filter"/"Gater")
 * @ui Random_btn
 */
namespace Random {

	const var Random_btn = Content.getComponent("Random_btn");

	// DSP references
	const var Filter = Synth.getEffect("Filter");
	const var Gater = Synth.getEffect("Gater");

	// ─── Randomization Config ───────────────────────────────────────
	// Each entry: id, min, max, bias (0-1 normalized target), strength (1=uniform, higher=tighter)
	//
	// bias:     where the random values cluster (normalized 0-1 within the min/max range)
	//           0.0 = cluster near min, 0.5 = center, 1.0 = cluster near max
	// strength: how tightly values cluster around the bias
	//           1.0 = uniform/no bias, 2.0 = moderate, 4.0+ = very tight

	const var KNOB_PARAMS = [
		{ "id": "Rate_defaultKnb", "min": 0.1, "max": 0.9, "bias": 0.5, "strength": 1.5 },
		{ "id": "Mix_defaultKnb", "min": 0.0, "max": 0.7, "bias": 0.3, "strength": 2.0 },
		{ "id": "Volyme_RingKnb", "min": 0.2, "max": 0.8, "bias": 0.5, "strength": 1.0 },
		{ "id": "Rez_defaultKnb", "min": 0.18, "max": 0.8, "bias": 0.4, "strength": 2.5 }
	];

	const var XY_CONFIG = {
		"x": { "min": 0.1, "max": 0.9, "bias": 0.5, "strength": 1.5 },
		"y": { "min": 0.0, "max": 0.8, "bias": 0.3, "strength": 2.0 }
	};

	const var TEMPO_CONFIG = { "min": 0, "max": 15, "bias": 0.2, "strength": 2.0 };

	// ─── Transition Config ──────────────────────────────────────────
	const TRANSITION_TIME_MS = 15;  // timer interval in ms
	const TRANSITION_STEPS = 30;    // total steps (~450ms transition)
	const TRANSITION_INCREMENT = 1.0 / TRANSITION_STEPS;

	reg transitionProgress = 0.0;
	reg isTransitioning = false;

	// Per-knob start/target values (parallel to KNOB_PARAMS)
	reg knobStartValues = [0.0, 0.0, 0.0, 0.0];
	reg knobTargetValues = [0.0, 0.0, 0.0, 0.0];

	// XY pad start/target
	reg xyStartX = 0.5;
	reg xyStartY = 0.5;
	reg xyTargetX = 0.5;
	reg xyTargetY = 0.5;

	// Tempo start/target
	reg tempoStart = 4;
	reg tempoTarget = 4;

	const var transitionTimer = Engine.createTimerObject();

	// Cubic ease-in-out for smooth acceleration/deceleration
	inline function easeInOut(t) {
		if (t < 0.5)
			return 4.0 * t * t * t;
		else {
			local f = (2.0 * t - 2.0);
			return 0.5 * f * f * f + 1.0;
		}
	}

	transitionTimer.setTimerCallback(function () {
		transitionProgress += TRANSITION_INCREMENT;

		if (transitionProgress >= 1.0) {
			transitionProgress = 1.0;
			isTransitioning = false;
			transitionTimer.stopTimer();
		}

		var t = easeInOut(transitionProgress);

		// Interpolate knobs
		for (i = 0; i < KNOB_PARAMS.length; i++) {
			var val = knobStartValues[i] + t * (knobTargetValues[i] - knobStartValues[i]);
			var comp = Content.getComponent(KNOB_PARAMS[i].id);
			comp.setValue(val);
			comp.changed();
		}

		// Interpolate XY pad
		var currentX = xyStartX + t * (xyTargetX - xyStartX);
		var currentY = xyStartY + t * (xyTargetY - xyStartY);

		XYPad.setXY(currentX, currentY);
		Filter.setAttribute(Filter.Filter, currentX);
		Gater.setAttribute(Gater.Mix, (1.0 - currentY) * 100.0);

		// Interpolate Tempo
		var currentTempo = Math.round(tempoStart + t * (tempoTarget - tempoStart));
		Motion.setValue(currentTempo);
		Gater.setAttribute(Gater.Tempo, currentTempo);
	});

	// ─── Biased Random ──────────────────────────────────────────────
	inline function biasedRandom(min, max, bias, strength) {
		local r = Math.random();

		if (strength > 1.0) {
			local r2 = Math.random();
			local avg = (r + r2) / 2.0;

			local t = 1.0 - (1.0 / strength);
			r = avg * (1.0 - t) + bias * t;
		}

		return min + r * (max - min);
	}

	// ─── Randomize ──────────────────────────────────────────────────
	inline function randomize() {
		// If already transitioning, use current interpolated position as new start
		if (isTransitioning) {
			transitionTimer.stopTimer();
			isTransitioning = false;
		}

		// Capture current knob values as start, generate targets
		for (i = 0; i < KNOB_PARAMS.length; i++) {
			local comp = Content.getComponent(KNOB_PARAMS[i].id);
			knobStartValues[i] = comp.getValue();
			knobTargetValues[i] = biasedRandom(KNOB_PARAMS[i].min, KNOB_PARAMS[i].max, KNOB_PARAMS[i].bias, KNOB_PARAMS[i].strength);
		}

		// Capture current XY position as start, generate targets
		xyStartX = XYPad.getX();
		xyStartY = XYPad.getY();

		local xCfg = XY_CONFIG.x;
		local yCfg = XY_CONFIG.y;
		xyTargetX = biasedRandom(xCfg.min, xCfg.max, xCfg.bias, xCfg.strength);
		xyTargetY = biasedRandom(yCfg.min, yCfg.max, yCfg.bias, yCfg.strength);

		// Capture current tempo as start, generate target
		tempoStart = Motion.getValue();
		tempoTarget = Math.round(biasedRandom(TEMPO_CONFIG.min, TEMPO_CONFIG.max, TEMPO_CONFIG.bias, TEMPO_CONFIG.strength));

		// Start smooth transition
		transitionProgress = 0.0;
		isTransitioning = true;
		transitionTimer.startTimer(TRANSITION_TIME_MS);

		// Randomize sound within current category (instant, no lerp)
		local newIndex = FileLoader.getRandomIndexInCurrentCategory();
		FileLoader.SoundSelector_cmb.setValue(newIndex);
		FileLoader.SoundSelector_cmb.changed();
	}

	// ─── Button Paint Routine ───────────────────────────────────────
	Random_btn.setPaintRoutine(randomRoutine);
	 inline function randomRoutine(g) {
		local a = this.getLocalBounds(0);
		local padding = 6;
		local width = a[2] - padding * 2;
		local height = a[3] - padding * 2;

		local cellWidth = width / 3;
		local cellHeight = height / 3;

		local smallSize = Math.min(cellWidth, cellHeight) * 0.5;
		local bigSize = Math.min(cellWidth, cellHeight) * 0.8;

		local COLOUR = TC.Display.on_display;

		if (this.data.mouseDown)
			COLOUR = Colours.withAlpha(COLOUR, 0.6);

		g.setColour(COLOUR);

		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				local centerX = padding + (j + 0.5) * cellWidth;
				local centerY = padding + (i + 0.5) * cellHeight;

				local ellipseSize = Math.randInt(0, 2) == 0 ? smallSize : bigSize;

				g.fillEllipse([
					centerX - ellipseSize / 2,
					centerY - ellipseSize / 2,
					ellipseSize,
					ellipseSize
				]);
			}
		}
	}

	// ─── Mouse Callback ─────────────────────────────────────────────
	Random_btn.setMouseCallback(function (event) {
		if (event.clicked) {
			this.data.mouseDown = true;
			this.repaint();
		}

		if (event.mouseUp) {
			this.data.mouseDown = false;
			randomize();

			// Repaint a few times for the animated dice effect
			this.repaint();
			this.repaint();
			this.repaint();
		}
	});
}

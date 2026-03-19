/**
 * @file Motion.js
 * @description Tempo/Filter step selector rendered as a horizontal segmented bar.
 *   Draws 16 segments on "Tempo_pnl" that shrink left-to-right. Click or drag
 *   to select a segment, which sets the Filter effect's Tempo parameter.
 *
 * @outline
 *   Tempo_pnl            Panel hosting the segmented bar
 *   Filter                DSP effect receiving Tempo attribute changes
 *   CONFIG               numSegments, maxSegmentRatio, minSegmentRatio, gap, padding, alpha values
 *   currentValue         Currently selected segment index (0-15)
 *   segmentRatios[]      Precomputed per-segment width ratios (rebuilt on CONFIG change)
 *   totalRatio           Precomputed sum of all ratios
 *   cachedMixNorm        Cached Filter.Mix normalised value (updated in knob callback)
 *   rebuildSegments()    Recomputes segmentRatios[] and totalRatio
 *   setPaintRoutine      Draws segments with active/inactive states using Theme colors
 *   setMouseCallback     Click/drag to select segment, updates Filter.Tempo
 *   getValue()           Returns current segment index
 *   setValue(val)        Programmatically set segment index
 *   repaint()            Force repaint of the panel
 *
 * @dependencies Theme (colors), Synth.getEffect("Filter")
 * @ui Tempo_pnl
 */
namespace Motion {

	const var Tempo_pnl = Content.getComponent("Tempo_pnl");
	const var Tempo_lbl = Content.getComponent("Tempo_lbl");
	const var Tempo_knb = Content.getComponent("Tempo_knb");
	const var Filter = Synth.getEffect("Filter");

	const var CONFIG = {
		numSegments: 16,
		maxSegmentRatio: 20.0,
		minSegmentRatio: 1.0,
		segmentGap: 2,
		padding: 4,
		segmentAlpha: 0.12,
		activeAlpha: 1.0,
		pulseFalloff: 3,
		pulseMinAlpha: 0.15,
		pulseMaxAlpha: 0.9
	};

	var currentValue = 4;
	var lastHoveredValue = -1; // guard: avoid redundant label sets on hover

	// Animation state
	var animationStep = -1;
	var animStartTime = 0.0;  // Engine.getUptime() * 1000 at animation start (ms)
	var stepDurationMs = 0.0;  // tempo-derived ms per step

	// Cached segment geometry — recomputed once in rebuildSegments(), read every frame.
	var segmentRatios = [];
	var totalRatio = 1.0;

	// Cached DSP value — updated in knob callback, not read from DSP every repaint.
	var cachedMixNorm = 0.0;

	inline function rebuildSegments() {
		totalRatio = 0.0;
		var n = CONFIG.numSegments;
		var maxR = CONFIG.maxSegmentRatio;
		var rangeR = CONFIG.minSegmentRatio - maxR;
		var denom = Math.max(1, n - 1);

		for (var i = 0; i < n; i++) {
			var ratio = maxR + (i / denom) * rangeR;
			segmentRatios[i] = ratio;
			totalRatio += ratio;
		}
	}

	const var animTimer = Engine.createTimerObject();

	inline function startAnimation() {
		local ms = Engine.getMilliSecondsForTempo(currentValue);
		stepDurationMs = ms / CONFIG.numSegments;
		animStartTime = Engine.getUptime() * 1000.0;
		animationStep = 0;
		animTimer.startTimer(33); // fixed ~30 fps
	}

	inline function updateAnimationSpeed() {
		if (animationStep < 0) return;
		local ms = Engine.getMilliSecondsForTempo(currentValue);
		stepDurationMs = ms / CONFIG.numSegments;
		// preserve current visual phase in the new tempo
		animStartTime = Engine.getUptime() * 1000.0 - animationStep * stepDurationMs;
	}

	inline function stopAnimation() {
		animTimer.stopTimer();
		animationStep = -1;
		Tempo_pnl.repaint();
	}

	animTimer.setTimerCallback(function () {
		var elapsed = Engine.getUptime() * 1000.0 - animStartTime;
		animationStep = Math.floor(elapsed / stepDurationMs) % CONFIG.numSegments;
		Tempo_pnl.repaint();
	});

	Tempo_pnl.setPaintRoutine(function (g) {
		var area = this.getLocalBounds(0);
		var w = area[2];
		var h = area[3];

		var totalGaps = (CONFIG.numSegments - 1) * CONFIG.segmentGap;
		var availableW = w - CONFIG.padding * 2 - totalGaps;
		var xOffset = CONFIG.padding;
		var segH = h - CONFIG.padding * 2;
		var yOffset = CONFIG.padding;
		var colour = Theme.THEME.Colors.Display.on_display;
		var n = CONFIG.numSegments;

		for (var i = 0; i < n; i++) {
			var segW = (segmentRatios[i] / totalRatio) * availableW;
			var alpha = CONFIG.segmentAlpha;

			if (animationStep >= 0 && i <= currentValue) {
				var dist = animationStep - i;
				if (dist >= 0 && dist <= CONFIG.pulseFalloff) {
					var t = 1.0 - (dist / CONFIG.pulseFalloff);
					alpha = CONFIG.pulseMinAlpha + t * (CONFIG.pulseMaxAlpha - CONFIG.pulseMinAlpha);
					alpha = Math.max(CONFIG.segmentAlpha, alpha * cachedMixNorm);
				}
			}

			g.setColour(Colours.withAlpha(colour, alpha));
			g.fillRoundedRectangle([xOffset, yOffset, segW, segH], 1.0);

			if (i == currentValue) {
				g.setColour(Colours.withAlpha(colour, CONFIG.activeAlpha));
				g.drawRoundedRectangle([xOffset, yOffset, segW, segH], 1.0, 1.0);
			}

			xOffset += segW + CONFIG.segmentGap;
		}
	});

	Tempo_pnl.setMouseCallback(function (event) {
		// Guard: only update label when hovered value actually changes
		if (event.hover && currentValue != lastHoveredValue) {
			Tempo_lbl.set("text", Engine.getTempoName(currentValue));
			lastHoveredValue = currentValue;
		}

		if (!event.hover && !event.drag) {
			Tempo_lbl.set("text", "Motion");
			lastHoveredValue = -1;
		}

		if (event.clicked || event.drag) {
			var area = this.getLocalBounds(0);
			var w = area[2];

			var totalGaps = (CONFIG.numSegments - 1) * CONFIG.segmentGap;
			var availableW = w - CONFIG.padding * 2 - totalGaps;
			var xOffset = CONFIG.padding;

			for (var i = 0; i < CONFIG.numSegments; i++) {
				var segW = (segmentRatios[i] / totalRatio) * availableW;

				if (event.x >= xOffset && event.x < xOffset + segW) {
					currentValue = i;
					Tempo_knb.setValue(i);
					Tempo_knb.changed();
					Tempo_lbl.set("text", Engine.getTempoName(currentValue));
					lastHoveredValue = currentValue;
					updateAnimationSpeed();
					this.repaint();
					this.changed();
					return;
				}

				xOffset += segW + CONFIG.segmentGap;
			}
		}
	});

	// Define onTempo before registering it as callback
	inline function onTempo(component, value) {
		currentValue = Math.round(value);
		cachedMixNorm = Filter.getAttribute(Filter.Mix) / 100.0;
		Tempo_lbl.set("text", Engine.getTempoName(currentValue));
		updateAnimationSpeed();
		Tempo_pnl.repaint();
		Filter.setAttribute(Filter.Tempo, currentValue);
	}

	// Sync UI when Tempo_knb is changed via DAW automation
	Tempo_knb.setControlCallback(onTempo);

	inline function getValue() {
		return currentValue;
	}

	inline function setValue(val) {
		currentValue = Math.max(0, Math.min(CONFIG.numSegments - 1, val));
		Tempo_knb.setValue(currentValue);
		Tempo_pnl.repaint();
	}

	inline function repaint() {
		Tempo_pnl.repaint();
	}

	Theme.registerThemePanel(Tempo_pnl);

	// --- Init ---
	rebuildSegments();
	cachedMixNorm = Filter.getAttribute(Filter.Mix) / 100.0;

	// startAnimation(); // TODO: enable on note-on only
}

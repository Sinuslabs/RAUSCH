/**
 * @file Motion.js
 * @description Tempo/gater step selector rendered as a horizontal segmented bar.
 *   Draws 16 segments on "Tempo_pnl" that shrink left-to-right. Click or drag
 *   to select a segment, which sets the Gater effect's Tempo parameter.
 *
 * @outline
 *   Tempo_pnl            Panel hosting the segmented bar
 *   Gater                DSP effect receiving Tempo attribute changes
 *   CONFIG               numSegments, maxSegmentRatio, minSegmentRatio, gap, padding, alpha values
 *   currentValue         Currently selected segment index (0-15)
 *   getSegmentRatio()    Returns width ratio for a segment (wider on left, narrower on right)
 *   getTotalRatio()      Sum of all segment ratios (for proportional sizing)
 *   setPaintRoutine      Draws segments with active/inactive states using Theme colors
 *   setMouseCallback     Click/drag to select segment, updates Gater.Tempo
 *   getValue()           Returns current segment index
 *   setValue(val)         Programmatically set segment index
 *   repaint()            Force repaint of the panel
 *
 * @dependencies Theme (colors), Synth.getEffect("Gater")
 * @ui Tempo_pnl
 */
namespace Motion {

	// Tempo_pnl: Horizontal stepped slider with 16 segments.
	// Segments shrink left-to-right (configurable max/min width).
	// No background color. Each segment uses TC.Display.on_display at 12% alpha.
	// Selection callback returns a value from 0 to 16.

	const var Tempo_pnl = Content.getComponent("Tempo_pnl");
	const var Tempo_lbl = Content.getComponent("Tempo_lbl");
	const var Gater = Synth.getEffect("Gater");

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

	// Animation state
	var animationStep = -1;
	// TODO: Toggle animation on note-on only, for now always active
	var animationActive = true;

	const var animTimer = Engine.createTimerObject();

	inline function startAnimation() {
		animationStep = 0;
		local ms = Engine.getMilliSecondsForTempo(currentValue);
		local stepMs = ms / CONFIG.numSegments;
		animTimer.startTimer(Math.max(20, Math.round(stepMs)));
	}

	inline function updateAnimationSpeed() {
		if (animationStep < 0) return;
		local ms = Engine.getMilliSecondsForTempo(currentValue);
		local stepMs = ms / CONFIG.numSegments;
		animTimer.startTimer(Math.max(20, Math.round(stepMs)));
	}

	inline function stopAnimation() {
		animTimer.stopTimer();
		animationStep = -1;
		Tempo_pnl.repaint();
	}

	animTimer.setTimerCallback(function () {
		animationStep++;

		if (animationStep >= CONFIG.numSegments)
			animationStep = 0;

		Tempo_pnl.repaint();
	});

	inline function getSegmentRatio(index) {
		local t = index / Math.max(1, CONFIG.numSegments - 1);
		return CONFIG.maxSegmentRatio + t * (CONFIG.minSegmentRatio - CONFIG.maxSegmentRatio);
	}

	inline function getTotalRatio() {
		local total = 0.0;

		for (i = 0; i < CONFIG.numSegments; i++)
			total += getSegmentRatio(i);

		return total;
	}

	Tempo_pnl.setPaintRoutine(function (g) {
		var area = this.getLocalBounds(0);
		var w = area[2];
		var h = area[3];

		var totalGaps = (CONFIG.numSegments - 1) * CONFIG.segmentGap;
		var availableW = w - CONFIG.padding * 2 - totalGaps;
		var totalRatio = getTotalRatio();

		var xOffset = CONFIG.padding;
		var segH = h - CONFIG.padding * 2;
		var yOffset = CONFIG.padding;

		var colour = Theme.THEME.Colors.Display.on_display;

		var mix = Gater.getAttribute(Gater.Mix);
		var mixNorm = mix / 100.0;

		for (i = 0; i < CONFIG.numSegments; i++) {
			var segW = (getSegmentRatio(i) / totalRatio) * availableW;
			var alpha = CONFIG.segmentAlpha;

			if (animationStep >= 0 && i <= currentValue) {
				var dist = animationStep - i;

				if (dist >= 0 && dist <= CONFIG.pulseFalloff) {
					var t = 1.0 - (dist / CONFIG.pulseFalloff);
					alpha = CONFIG.pulseMinAlpha + t * (CONFIG.pulseMaxAlpha - CONFIG.pulseMinAlpha);
					alpha = alpha * mixNorm;
					alpha = Math.max(CONFIG.segmentAlpha, alpha);
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
		if (event.hover)
			Tempo_lbl.set("text", Engine.getTempoName(currentValue));

		if (!event.hover && !event.drag)
			Tempo_lbl.set("text", "Motion");

		if (event.clicked || event.drag) {
			var area = this.getLocalBounds(0);
			var w = area[2];

			var totalGaps = (CONFIG.numSegments - 1) * CONFIG.segmentGap;
			var availableW = w - CONFIG.padding * 2 - totalGaps;
			var totalRatio = getTotalRatio();
			var xOffset = CONFIG.padding;

			for (i = 0; i < CONFIG.numSegments; i++) {
				var segW = (getSegmentRatio(i) / totalRatio) * availableW;

				if (event.x >= xOffset && event.x < xOffset + segW) {
					currentValue = i;
					Gater.setAttribute(Gater.Tempo, i);
					Tempo_lbl.set("text", Engine.getTempoName(currentValue));
					updateAnimationSpeed();
					this.repaint();
					this.changed();
					return;
				}

				xOffset += segW + CONFIG.segmentGap;
			}
		}
	});

	inline function getValue() {
		return currentValue;
	}

	inline function setValue(val) {
		currentValue = Math.max(0, Math.min(CONFIG.numSegments - 1, val));
		Tempo_pnl.repaint();
	}

	inline function repaint() {
		Tempo_pnl.repaint();
	}

	Theme.registerThemePanel(Tempo_pnl);

	// Start animation on init (always on for now)
	//startAnimation();
}
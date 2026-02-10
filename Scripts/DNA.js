/**
 * @file DNA.js
 * @description Animated DNA double-helix tunnel visualization rendered on "DNA_pnl".
 *   Draws two spiraling dot strands that rotate and move forward in a 3D tunnel effect.
 *   Runs on a 30 fps timer.
 *
 * @outline
 *   - DNA_pnl          Panel reference for the visualization
 *   - rotationAngle     Current rotation offset (animated)
 *   - zDepthOffset      Forward-motion offset along the z-axis (animated)
 *   - setPaintRoutine   Renders two opposing spiral strands with depth-based sizing/opacity
 *   - setTimerCallback  Advances rotationAngle and zDepthOffset each frame
 *   - startTimer(30)    Kicks off animation at 30 fps
 *
 * @dependencies None (self-contained namespace)
 * @ui DNA_pnl
 */
namespace DNA {
	
	const var DNA_pnl = Content.getComponent("DNA_pnl");
	
	// Animation timer variables
	var rotationAngle = 0;
	var zDepthOffset = 0;
	
	// Paint routine for DNA spine visualization
	DNA_pnl.setPaintRoutine(function(g) {
		var width = this.getWidth();
		var height = this.getHeight();
		var centerX = width / 2;
		var centerY = height / 2;
		
		// Fill background with black
		g.setColour(Colours.black);
		g.fillRect([0, 0, width, height]);
		
		// DNA spiral parameters
		var maxDistance = Math.sqrt(width * width + height * height) / 2;
		var spiralTurns = 5; // number of spiral rotations
		var dotRadiusMax = 10;
		var dotRadiusMin = 2;
		var layerCount = 150; // increased for smoother tunnel
		
		// Draw multiple spiral layers for tunnel effect
		for (var i = 0; i < layerCount; i++) {
			// Normalize t with z-offset to create forward motion
			var t = ((i + zDepthOffset) % layerCount) / layerCount;
			var distance = t * maxDistance;
			
			// Skip if distance is too small (at the edge of the tunnel going away)
			if (t < 0.01 || t > 0.99) continue;
			
			// First strand (animated with rotation)
			var angle1 = t * spiralTurns * Math.PI * 2 + rotationAngle;
			var x1 = centerX + Math.cos(angle1) * distance;
			var y1 = centerY + Math.sin(angle1) * distance;
			
			// Size and opacity based on distance (outside = bigger and brighter)
			var depthFactor = t; // 0 at center, 1 at edge
			var radius1 = dotRadiusMin + depthFactor * (dotRadiusMax - dotRadiusMin);
			var opacity1 = 0.2 + depthFactor * 0.8;
			
			g.setColour(Colours.withAlpha(Colours.white, opacity1));
			g.fillEllipse([x1 - radius1, y1 - radius1, radius1 * 2, radius1 * 2]);
			
			// Second strand (offset by half rotation)
			var angle2 = angle1 + Math.PI;
			var x2 = centerX + Math.cos(angle2) * distance;
			var y2 = centerY + Math.sin(angle2) * distance;
			
			var radius2 = dotRadiusMin + depthFactor * (dotRadiusMax - dotRadiusMin);
			var opacity2 = 0.2 + depthFactor * 0.8;
			
			g.setColour(Colours.withAlpha(Colours.white, opacity2));
			g.fillEllipse([x2 - radius2, y2 - radius2, radius2 * 2, radius2 * 2]);
		}
	});
	
	// Timer callback for animation
	DNA_pnl.setTimerCallback(function() {
		rotationAngle += 0.05; // rotation
		zDepthOffset += 1.5; // forward motion along z-axis
		this.repaint(); // redraw the panel
	});
	
	// Start the timer (30 fps)
	DNA_pnl.startTimer(30);
}
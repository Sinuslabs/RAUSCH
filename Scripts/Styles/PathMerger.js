namespace PathMerger {

    const var Path_Merger = Content.getComponent("Path_Merger");

    const var NUM_POINTS = 100;
    const var MORPH_DURATION_MS = 2000;
    const var TIMER_INTERVAL = 30;
    const var STEPS = Math.round(MORPH_DURATION_MS / TIMER_INTERVAL);

    const var morphTimer = Engine.createTimerObject();

    const var pathA = Icons.get.logo;
    const var pathB = Icons.get.logo1;
    const var morphedPath = Content.createPath();

    const var pointsA = [];
    const var pointsB = [];

    var morphProgress = 0;
    var direction = 1;
    var morphT = 0.0;
    var ready = 0;

    inline function samplePoints(path, pointArray)
    {
        pointArray.clear();

        for (i = 0; i < NUM_POINTS; i++)
        {
            local t = i / (NUM_POINTS - 1);
            local pt = path.getPointOnPath(t);
            pointArray.push([pt[0], pt[1]]);
        }
    }

    inline function lerp(a, b, t)
    {
        return a + (b - a) * t;
    }

    inline function buildMorphedPath(t)
    {
        morphedPath.clear();

        morphedPath.startNewSubPath(
            lerp(pointsA[0][0], pointsB[0][0], t),
            lerp(pointsA[0][1], pointsB[0][1], t)
        );

        for (i = 1; i < NUM_POINTS; i++)
        {
            local x = lerp(pointsA[i][0], pointsB[i][0], t);
            local y = lerp(pointsA[i][1], pointsB[i][1], t);
            morphedPath.lineTo(x, y);
        }

        morphedPath.closeSubPath();
    }

    inline function easeInOut(t)
    {
        return t * t * (3.0 - 2.0 * t);
    }

    inline function init()
    {
        samplePoints(pathA, pointsA);
        samplePoints(pathB, pointsB);
        ready = 1;
        buildMorphedPath(0.0);
    }

    morphTimer.setTimerCallback(function()
    {
        morphProgress += direction;

        if (morphProgress >= STEPS)
        {
            morphProgress = STEPS;
            direction = -1;
        }
        else if (morphProgress <= 0)
        {
            morphProgress = 0;
            direction = 1;
        }

        morphT = easeInOut(morphProgress / STEPS);
        buildMorphedPath(morphT);
        Path_Merger.repaint();
    });

    Path_Merger.setPaintRoutine(function(g)
    {
        if (!ready)
            return;

        var a = this.getLocalBounds(0);
        var colour = Theme.THEME.Colors.Display.on_display;

        if (!isDefined(colour))
            return;

        g.setColour(Colours.withAlpha(colour, 1.0));
        g.fillPath(morphedPath, [a[0], a[1], a[2], a[3]]);
    });

    Theme.registerThemePanel(Path_Merger);

    inline function start()
    {
        init();
        morphTimer.startTimer(TIMER_INTERVAL);
    }

    inline function stop()
    {
        morphTimer.stopTimer();
    }

    inline function repaint()
    {
        Path_Merger.repaint();
    }

    start();
}

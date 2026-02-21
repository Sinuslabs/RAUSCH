/**
 * @file DotVideo.js
 * @description Plays back pre-rendered dot matrix video frames on a panel.
 *   Loads JSON files containing frame arrays (from video_to_dots converter)
 *   and steps through them on a timer. Supports loading different clips,
 *   play/pause/stop, looping, and speed control.
 *
 * @outline
 *   CONFIG                  Dot grid layout: dotSize, gap, padding, dotColour
 *   PLAYBACK                fps, loop, playing state
 *   loadClip(filename)      Load a JSON dot video file from Scripts folder
 *   play()                  Start/resume playback
 *   pause()                 Pause playback (keeps position)
 *   stop()                  Stop and reset to frame 0
 *   setFps(fps)             Change playback speed
 *   setLoop(loop)           Enable/disable looping
 *   isPlaying()             Returns current playback state
 *   getFrameIndex()         Returns current frame index
 *   getFrameCount()         Returns total frame count
 *
 * @dependencies None (self-contained namespace)
 * @ui DotVideo_pnl
 */
namespace DotVideo {

    const var DotVideo_pnl = Content.getComponent("DotVideo_pnl");

    const var CONFIG = {
        dotSize: 5,
        gap: 3,
        padding: 2,
        dotColour: 0x88FFFFFF
    };

    var clipData = {};
    var frames = [];
    var cols = 0;
    var rows = 0;
    var frameCount = 0;
    var frameIndex = 0;

    var playing = false;
    var loop = true;
    var fps = 5;

    const var Timer = Engine.createTimerObject();

    // --- Paint routine ---
    DotVideo_pnl.setPaintRoutine(function (g) {
        var area = this.getLocalBounds(0);
        var w = area[2];
        var h = area[3];

        var dotSize = CONFIG.dotSize;
        var gapSize = CONFIG.gap;
        var padding = CONFIG.padding;

        var gridCols = Math.floor((w - padding * 2 + gapSize) / (dotSize + gapSize));
        var gridRows = Math.floor((h - padding * 2 + gapSize) / (dotSize + gapSize));

        var useCols = Math.min(gridCols, cols);
        var useRows = Math.min(gridRows, rows);

        var totalGridW = useCols * dotSize + (useCols - 1) * gapSize;
        var totalGridH = useRows * dotSize + (useRows - 1) * gapSize;
        var offsetX = (w - totalGridW) / 2;
        var offsetY = (h - totalGridH) / 2;

        var currentFrame = [];
        if (frameIndex < frames.length)
            currentFrame = frames[frameIndex];

        for (var row = 0; row < useRows; row++) {
            for (var col = 0; col < useCols; col++) {
                var x = offsetX + col * (dotSize + gapSize);
                var y = offsetY + row * (dotSize + gapSize);

                var dotIndex = row * cols + col;
                var alpha = 0.0;

                if (dotIndex < currentFrame.length)
                    alpha = currentFrame[dotIndex];

                g.setColour(Colours.withAlpha(CONFIG.dotColour, alpha));
                g.fillEllipse([x, y, dotSize, dotSize]);
            }
        }
    });

    // --- Timer callback ---
    Timer.setTimerCallback(function () {
        if (!playing || frameCount == 0)
            return;

        frameIndex++;

        if (frameIndex >= frameCount) {
            if (loop) {
                frameIndex = 0;
            }
            else {
                frameIndex = frameCount - 1;
                playing = false;
                Timer.stopTimer();
            }
        }

        DotVideo_pnl.repaint();
    });

    // --- Public API ---

    /** Load a JSON dot video clip from the Scripts folder. */
    inline function loadClip(filename) {
        local audioFolder = FileSystem.getFolder(FileSystem.AudioFiles);
        local file = audioFolder.getChildFile("../Scripts/" + filename);

        clipData = file.loadAsObject();

        if (isDefined(clipData.frames)) {
            frames = clipData.frames;
            cols = clipData.cols;
            rows = clipData.rows;
            fps = clipData.fps;
            frameCount = clipData.frameCount;
            frameIndex = 0;

            Console.print("DotVideo: Loaded " + filename + " (" + frameCount + " frames, " + cols + "x" + rows + " @ " + fps + "fps)");
        }
        else {
            Console.print("DotVideo: Invalid clip data in " + filename);
            frames = [];
            frameCount = 0;
        }

        DotVideo_pnl.repaint();
    }

    inline function play() {
        if (frameCount == 0) return;

        playing = true;
        local intervalMs = Math.max(10, Math.round(1000.0 / fps));
        Timer.startTimer(intervalMs);
    }

    inline function pause() {
        playing = false;
        Timer.stopTimer();
    }

    inline function stop() {
        playing = false;
        Timer.stopTimer();
        frameIndex = 0;
        DotVideo_pnl.repaint();
    }

    inline function setFps(newFps) {
        fps = Math.max(1, newFps);

        if (playing) {
            local intervalMs = Math.max(10, Math.round(1000.0 / fps));
            Timer.startTimer(intervalMs);
        }
    }

    inline function setLoop(shouldLoop) {
        loop = shouldLoop;
    }

    inline function isPlaying() {
        return playing;
    }

    inline function getFrameIndex() {
        return frameIndex;
    }

    inline function getFrameCount() {
        return frameCount;
    }

    inline function setDotSize(size) {
        CONFIG.dotSize = size;
        DotVideo_pnl.repaint();
    }

    inline function setGap(g) {
        CONFIG.gap = g;
        DotVideo_pnl.repaint();
    }

    inline function setPadding(p) {
        CONFIG.padding = p;
        DotVideo_pnl.repaint();
    }

    inline function setDotColour(c) {
        CONFIG.dotColour = c;
        DotVideo_pnl.repaint();
    }

    inline function setGridSize(newCols, newRows) {
        cols = newCols;
        rows = newRows;
        DotVideo_pnl.repaint();
    }

    inline function repaint() {
        DotVideo_pnl.repaint();
    }

    /** Load clip data from an embedded JS object (e.g. EyesData). */
    inline function loadData(data) {
        if (isDefined(data.frames)) {
            frames = data.frames;
            cols = data.cols;
            rows = data.rows;
            fps = data.fps;
            frameCount = data.frameCount;
            frameIndex = 0;

            Console.print("DotVideo: Loaded embedded clip (" + frameCount + " frames, " + cols + "x" + rows + " @ " + fps + "fps)");
        }
        else {
            Console.print("DotVideo: Invalid embedded clip data");
            frames = [];
            frameCount = 0;
        }

        DotVideo_pnl.repaint();
    }

    // --- Init: load default clip from embedded data ---
    loadData(EyesData);
}

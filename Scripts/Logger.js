/**
 * @file Logger.js
 * @description In-plugin debug logger with a floating overlay.
 *   Toggle with the red "D" dot in the top-left corner (DEV_MODE only).
 *   Overlay has COPY (copies all logs to clipboard) and CLOSE buttons.
 *   Set DEV_MODE = false before shipping.
 *
 * @usage
 *   Logger.log("something happened: " + value);
 *
 * @setup in Interface.js
 *   include("Logger.js");           // first, before everything else
 *   // ... all other includes ...
 *   Logger.createUI();              // last, so overlay renders on top
 */
namespace Logger {

    var DEV_MODE = true;

    var _logs = [];
    var _visible = false;
    var _overlay = null;
    var _toggle = null;

    /** Append a timestamped message. No-op when DEV_MODE is false. */
    inline function log(msg)
    {
        if (!DEV_MODE) return;
        local t = Math.round(Engine.getUptime() * 100) / 100;
        _logs[_logs.length] = "[" + t + "s] " + msg;
        if (_visible && _overlay != null) _overlay.repaint();
    }

    /** Clear all log entries. */
    inline function clear()
    {
        _logs = [];
        if (_visible && _overlay != null) _overlay.repaint();
    }

    /**
     * Create the debug UI. Call this LAST in Interface.js so the overlay
     * is always rendered on top of every other component.
     */
    inline function createUI()
    {
        if (!DEV_MODE) return;

        // ── Toggle dot (top-left corner) ─────────────────────────────────
        _toggle = Content.addPanel("_LogToggle", 0, 0);
        _toggle.set("width", 20);
        _toggle.set("height", 20);
        _toggle.set("allowCallbacks", "Clicks & Hover");

        _toggle.setPaintRoutine(function(g)
        {
            g.setColour(0xCCFF3333);
            g.fillEllipse([3, 3, 14, 14]);
            g.setColour(0xFFFFFFFF);
            g.drawText("D", [0, 0, 20, 20]);
        });

        _toggle.setMouseCallback(function(event)
        {
            if (event.clicked)
            {
                _visible = !_visible;
                _overlay.set("visible", _visible);
                if (_visible) _overlay.repaint();
            }
        });

        // ── Full-screen overlay ───────────────────────────────────────────
        _overlay = Content.addPanel("_LogOverlay", 0, 0);
        _overlay.set("width", 336);
        _overlay.set("height", 427);
        _overlay.set("visible", false);
        _overlay.set("allowCallbacks", "Clicks & Hover");

        _overlay.setPaintRoutine(function(g)
        {
            // background
            g.fillAll(0xF0101010);

            // header bar
            g.setColour(0xFF222222);
            g.fillRect([0, 0, 336, 30]);

            // title
            g.setColour(0xFFAAAAAA);
            g.drawText("Rausch  DEBUG LOG", [8, 0, 180, 30]);

            // COPY button
            g.setColour(0xFF2255CC);
            g.fillRoundedRectangle([192, 5, 60, 20], 4.0);
            g.setColour(0xFFFFFFFF);
            g.drawText("COPY", [192, 5, 60, 20]);

            // CLOSE button
            g.setColour(0xFF882222);
            g.fillRoundedRectangle([258, 5, 68, 20], 4.0);
            g.drawText("CLOSE", [258, 5, 68, 20]);

            // log lines (newest at bottom)
            g.setColour(0xFF55FF88);
            var lineH = 13;
            var maxLines = Math.floor((427 - 32) / lineH);
            var start = 0;
            if (_logs.length > maxLines) start = _logs.length - maxLines;

            var y = 33;
            for (var i = start; i < _logs.length; i++)
            {
                g.drawText(_logs[i], [4, y, 328, lineH]);
                y += lineH;
            }
        });

        _overlay.setMouseCallback(function(event)
        {
            if (!event.clicked) return;

            // COPY button area
            if (event.x >= 192 && event.x <= 252 && event.y >= 5 && event.y <= 25)
            {
                local text = "";
                for (var i = 0; i < _logs.length; i++)
                    text = text + _logs[i] + "\n";
                Engine.copyToClipboard(text);
                log(">>> Logs copied to clipboard");
                return;
            }

            // CLOSE button area
            if (event.x >= 258 && event.x <= 326 && event.y >= 5 && event.y <= 25)
            {
                _visible = false;
                _overlay.set("visible", false);
                return;
            }
        });

        log("Logger ready. DEV_MODE = " + DEV_MODE);
    }
}

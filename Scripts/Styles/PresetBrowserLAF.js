/**
 * @file Styles/PresetBrowserLAF.js
 * @description Complete look-and-feel for HISE's built-in PresetBrowser component.
 *   Registers paint functions for search bar, column headers, list items, scrollbar,
 *   dialog buttons, dialog background, browser background, alert windows, and tags.
 *
 * @outline
 *   drawPresetBrowserSearchBar      Rounded rect with subtle fill + border
 *   drawPresetBrowserColumnHeader   Dark header bar with left-aligned text
 *   drawPresetBrowserListItem       Selectable list row with hover/selected states
 *   drawScrollbar                   Minimal rounded scrollbar thumb
 *   drawDialogButton                Bordered button with hover highlight
 *   drawPresetBrowserDialog         Dark dialog with centered title
 *   drawPresetBrowserBackground     Solid dark background fill
 *   drawAlertWindow                 Alert dialog with header bar and title
 *   drawPresetBrowserTag            Tag pill with filled/hover states
 *   laf                             Local LAF applied to all "PresetBrowser" components
 *
 * @dependencies None (uses hardcoded hex colors)
 * @ui PresetBrowser
 */
namespace PresetBrowserLAF {

    const var laf = Content.createLocalLookAndFeel();

    laf.registerFunction("drawPresetBrowserSearchBar", function(g, obj) {
        var a = obj.area;
        g.setColour(0x1AFFFFFF);
        g.fillRoundedRectangle(a, 3);
        g.setColour(0x4D1A1A1A);
        g.drawRoundedRectangle(a, 3, 1);
    });

    laf.registerFunction("drawPresetBrowserColumnHeader", function(g, obj) {
        var a = obj.area;
        g.setColour(0x801A1A1A);
        g.fillRect(a);
        g.setFont("Regular", 14);
        g.setColour(0xFFBECBCF);
        g.drawAlignedText(obj.text, [a[0] + 10, a[1], a[2] - 10, a[3]], "left");
    });

    laf.registerFunction("drawPresetBrowserListItem", function(g, obj) {
        var a = obj.area;

        if (obj.selected) {
            g.setColour(0xFF3A4550);
            g.fillRoundedRectangle(a, 3);
        } else if (obj.hover) {
            g.setColour(0x803A4550);
            g.fillRoundedRectangle(a, 3);
        }

        g.setFont("Regular", 16);
        if (obj.selected) {
            g.setColour(0xFFBECBCF);
        } else {
            g.setColour(obj.hover ? 0xE6BECBCF : 0xB3BECBCF);
        }
        g.drawAlignedText(obj.text, [a[0] + 12, a[1], a[2] - 12, a[3]], "left");
    });

    laf.registerFunction("drawScrollbar", function(g, obj) {
        var a = obj.handle;
        var pa = [a[0] + 2, a[1] + 2, a[2] - 4, a[3] - 4];

        g.setColour(obj.over ? 0xB31A1A1A : 0x661A1A1A);
        g.fillRoundedRectangle(pa, 2);
    });

    laf.registerFunction("drawDialogButton", function(g, obj) {
        var a = [obj.area[0] + 1, obj.area[1] + 1, obj.area[2] - 2, obj.area[3] - 2];

        g.setFont("Regular", 16);
        g.setColour(0x4D1A1A1A);
        g.drawRoundedRectangle(a, 3, 1);

        if (obj.over) {
            g.setColour(0x333A4550);
            g.fillRoundedRectangle(a, 3);
        }

        g.setColour(obj.over ? 0xE6BECBCF : 0xB3BECBCF);
        g.drawAlignedText(obj.text.toUpperCase(), a, "centred");
    });

    laf.registerFunction("drawPresetBrowserDialog", function(g, obj) {
        var a = obj.area;

        g.fillAll(0xFF0D0D0D);
        g.setColour(0x801A1A1A);
        g.drawRect(a, 1);

        g.setFont("Regular", 18);
        g.setColour(0xFFBECBCF);
        g.drawAlignedText(obj.text, [a[0], a[1], a[2], 40], "centred");
    });

    laf.registerFunction("drawPresetBrowserBackground", function(g, obj) {
        g.fillAll(0xFF0D0D0D);
    });

    laf.registerFunction("drawAlertWindow", function(g, obj) {
        var a = obj.area;
        var headerA = [0, 0, a[2], 40];

        g.fillAll(0xFF0D0D0D);
        g.setColour(0x1A3A4550);
        g.fillRect(headerA);
        g.setColour(0x4D1A1A1A);
        g.drawRect(a, 1);

        g.setFont("Regular", 16);
        g.setColour(0xFFBECBCF);
        g.drawAlignedText(obj.title, headerA, "centred");
    });

    laf.registerFunction("drawPresetBrowserTag", function(g, obj) {
        var a = obj.area;

        if (obj.value) {
            g.setColour(0xFF3A4550);
            g.fillRoundedRectangle(a, 3);
        } else if (obj.hover) {
            g.setColour(0x4D3A4550);
            g.fillRoundedRectangle(a, 3);
        }

        g.setFont("Regular", 12);
        g.setColour(obj.value ? 0xFFBECBCF : 0x99BECBCF);
        g.drawAlignedText(obj.text, a, "centred");
    });

    const var presetBrowser = Content.getAllComponents("PresetBrowser");
    for (pb in presetBrowser) pb.setLocalLookAndFeel(laf);
}

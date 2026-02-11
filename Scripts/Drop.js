/**
 * @file Drop.js
 * @description Drag-and-drop overlay panel for importing user audio samples.
 *   Shows a visual overlay when a file drag is detected, copies dropped audio
 *   files into AudioFiles/User/, reloads the audio pool, rebuilds the combobox,
 *   and triggers a crossfaded load into the active player.
 *
 * @dependencies FileLoader, Engine
 * @ui Drop_pnl
 */
namespace Drop {

	const var Drop_pnl = Content.getComponent("Drop_pnl");
	const var audioFolder = FileSystem.getFolder(FileSystem.AudioFiles);

	reg isDragOver = false;

	Console.print("Drop: namespace loaded");
	Console.print("Drop: audioFolder = " + audioFolder.toString(0));

	Drop_pnl.setPaintRoutine(function(g)
	{
		if (!isDragOver) return;

		var a = this.getLocalBounds(0);

		g.setColour(0x60000000);
		g.fillRoundedRectangle(a, 4.0);

		g.setColour(0x88FFFFFF);
		g.drawRoundedRectangle([a[0] + 8, a[1] + 8, a[2] - 16, a[3] - 16], 4.0, 1.5);

		g.setFont("default", 14.0);
		g.setColour(0xCCFFFFFF);
		g.drawAlignedText("Drop audio file here", a, "centred");
	});

	inline function handleFileDrop(f)
	{
		Console.print("Drop: handleFileDrop called");
		Console.print("Drop: dropped file = " + f.toString(0));

		// Create User folder if it doesn't exist
		local userFolder = audioFolder.getChildFile("User");
		Console.print("Drop: userFolder = " + userFolder.toString(0));

		if (!userFolder.isDirectory())
		{
			Console.print("Drop: creating User directory");
			userFolder.createDirectory("");
		}

		// Copy the dropped file into the User folder
		local fileName = f.toString(f.Filename);
		Console.print("Drop: fileName = " + fileName);
		local targetFile = userFolder.getChildFile(fileName);
		Console.print("Drop: targetFile = " + targetFile.toString(0));
		f.copy(targetFile);
		Console.print("Drop: file copied");

		// Reload audio pool so HISE sees the new file
		Engine.loadAudioFilesIntoPool();
		Console.print("Drop: audio pool reloaded");

		// Rebuild the combobox with the new User category entry
		FileLoader.setupComboboxItems();
		FileLoader.totalItems = FileLoader.SoundSelector_cmb.get("items").split("\n").length;
		Console.print("Drop: combobox rebuilt, totalItems = " + FileLoader.totalItems);

		// Find the new item and select it (triggers crossfade via existing callback)
		local displayName = f.toString(f.NoExtension);
		local newKey = "User::" + displayName;
		Console.print("Drop: looking for key = " + newKey);
		local items = FileLoader.SoundSelector_cmb.get("items").split("\n");

		for (i = 0; i < items.length; i++)
		{
			if (items[i] == newKey)
			{
				Console.print("Drop: found at index " + (i + 1) + ", selecting");
				FileLoader.SoundSelector_cmb.setValue(i + 1);
				FileLoader.SoundSelector_cmb.changed();
				break;
			}
		}
	}

	Drop_pnl.setFileDropCallback("onFileDrop", "*.wav", function(f)
	{
		Console.print("Drop: callback fired");
		Console.print("Drop: typeof f = " + typeof(f));
		Console.print("Drop: f = " + trace(f));

		if (f.hover)
		{
			Console.print("Drop: hover detected");
			isDragOver = true;
			this.repaint();
			return;
		}

		if (f.drop)
		{
			Console.print("Drop: drop detected");
			isDragOver = false;
			this.repaint();
			handleFileDrop(f);
			return;
		}

		// Drag left the panel
		Console.print("Drop: drag left panel");
		isDragOver = false;
		this.repaint();
	});

	Console.print("Drop: setFileDropCallback registered");
}

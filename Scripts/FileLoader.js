/**
 * @file FileLoader.js
 * @description Audio file loader with dual-player crossfade system.
 *   Auto-discovers category sub-folders in AudioFiles, builds a categorised combobox
 *   menu, and crossfades between two AudioLoopPlayers using equal-power (cos/sin)
 *   gain curves for click-free sound switching.
 *
 * @outline
 *   AudioLoopPlayer1/2                Two audio loop players for crossfading
 *   Gain1/2                           Gain effects controlling each player's volume
 *   SoundSelector_cmb                 Combobox populated with "Category::Name" items
 *   Next_iconBtn / Prev_iconBtn       Navigation buttons
 *   discoverCategories()              Scans AudioFiles folder for sub-directories
 *   buildMenuItems()                  Builds "Category::DisplayName" list and fileMap lookup
 *   setupComboboxItems()              Populates the combobox with discovered items
 *   onSoundSelectorControl()          Loads file into inactive player, starts crossfade
 *   crossfadeTimer                    Timer driving equal-power fade between players
 *   onNavButton()                     Next/Prev navigation through combobox items
 *   getRandomIndexInCurrentCategory() Returns random index within same category (used by Random.js)
 *
 * @dependencies Synth (AudioLoopPlayer1/2, Gain1/2)
 * @ui SoundSelector_cmb, Next_iconBtn, Prev_iconBtn
 */
namespace FileLoader {

	// --- References ---
	const var AudioLoopPlayer1 = Synth.getAudioSampleProcessor("Audio Loop Player1");
	const var AudioLoopPlayer2 = Synth.getAudioSampleProcessor("Audio Loop Player2");

	const var Gain1 = Synth.getEffect("Gain1");
	const var Gain2 = Synth.getEffect("Gain2");
	
	Engine.loadAudioFilesIntoPool();

	const var SoundSelector_cmb = Content.getComponent("SoundSelector_cmb");
	const var Next_iconBtn = Content.getComponent("Next_iconBtn");
	const var Prev_iconBtn = Content.getComponent("Prev_iconBtn");

	// --- Categories (auto-discovered from AudioFiles subfolders) ---
	const var audioFolder = FileSystem.getFolder(FileSystem.AudioFiles);

	inline function discoverCategories()
	{
		local result = [];
		local children = FileSystem.findFiles(audioFolder, "*", false);

		for (child in children)
		{
			if (child.isDirectory())
				result.push(child.toString(child.Filename));
		}

		return result;
	}

	const var categories = discoverCategories();

	// Flat lookup: maps "Category::DisplayName" -> File reference
	reg fileMap = {};

	// --- Build categorised menu items & file map ---
	inline function buildMenuItems()
	{
		local items = [];

		for (c in categories)
		{
			local catFolder = audioFolder.getChildFile(c);
			if (!catFolder.isDirectory()) continue;

			local wavFiles = FileSystem.findFiles(catFolder, "*.wav", false);
			local mp3Files = FileSystem.findFiles(catFolder, "*.mp3", false);

			local allFiles = wavFiles;
			for (m in mp3Files)
				allFiles.push(m);

			for (f in allFiles)
			{
				local displayName = f.toString(f.NoExtension);
				local fileName = f.toString(f.Filename);
				local key = c + "::" + displayName;
				fileMap[key] = "{PROJECT_FOLDER}" + c + "/" + fileName;
				items.push(key);
			}
		}

		return items.join("\n");
	}

	inline function setupComboboxItems()
	{
		if (isDefined(SoundSelector_cmb))
		{
			SoundSelector_cmb.set("items", buildMenuItems());
		}
	}

	// --- Crossfade State ---
	const FADE_TIME_MS = 30;
	const FADE_STEPS = 30;
	const FADE_INCREMENT = 1.0 / FADE_STEPS;

	reg activePlayer = 1;
	reg fadeProgress = 0.0;
	reg isFading = false;
	reg fadeTarget = 2;

	// Initialise: Player1 active at full volume, Player2 silent
	Gain1.setAttribute(Gain1.Gain, 0.0);
	Gain2.setAttribute(Gain2.Gain, -100.0);

	// --- Crossfade Timer ---
	const var crossfadeTimer = Engine.createTimerObject();

	crossfadeTimer.setTimerCallback(function()
	{
		fadeProgress += FADE_INCREMENT;

		if (fadeProgress >= 1.0)
		{
			fadeProgress = 1.0;
			isFading = false;
			crossfadeTimer.stopTimer();

			if (fadeTarget == 2)
			{
				Gain1.setAttribute(Gain1.Gain, -100.0);
				Gain2.setAttribute(Gain2.Gain, 0.0);
				activePlayer = 2;
			}
			else
			{
				Gain1.setAttribute(Gain1.Gain, 0.0);
				Gain2.setAttribute(Gain2.Gain, -100.0);
				activePlayer = 1;
			}
			return;
		}

		// Equal-power crossfade (cos/sin curve)
		var fadeOut = Math.cos(fadeProgress * Math.PI * 0.5);
		var fadeIn  = Math.sin(fadeProgress * Math.PI * 0.5);

		var dbOut = fadeOut > 0.001 ? 20.0 * Math.log10(fadeOut) : -100.0;
		var dbIn  = fadeIn  > 0.001 ? 20.0 * Math.log10(fadeIn)  : -100.0;

		if (fadeTarget == 2)
		{
			Gain1.setAttribute(Gain1.Gain, dbOut);
			Gain2.setAttribute(Gain2.Gain, dbIn);
		}
		else
		{
			Gain1.setAttribute(Gain1.Gain, dbIn);
			Gain2.setAttribute(Gain2.Gain, dbOut);
		}
	});

	// --- ComboBox Callback ---
	inline function onSoundSelectorControl(component, value)
	{
		local items = component.get("items").split("\n");
		if (value < 1 || value > items.length) return;

		local selectedKey = items[value - 1];
		if (!isDefined(fileMap[selectedKey])) return;

		local fileRef = fileMap[selectedKey];

		// If a fade is in progress, snap to its target before starting a new one
		if (isFading)
		{
			crossfadeTimer.stopTimer();

			if (fadeTarget == 2)
			{
				Gain1.setAttribute(Gain1.Gain, -100.0);
				Gain2.setAttribute(Gain2.Gain, 0.0);
				activePlayer = 2;
			}
			else
			{
				Gain1.setAttribute(Gain1.Gain, 0.0);
				Gain2.setAttribute(Gain2.Gain, -100.0);
				activePlayer = 1;
			}

			isFading = false;
		}

		// Load into the INACTIVE player, then crossfade
		if (activePlayer == 1)
		{
			AudioLoopPlayer2.setFile(fileRef);
			fadeTarget = 2;
		}
		else
		{
			AudioLoopPlayer1.setFile(fileRef);
			fadeTarget = 1;
		}

		fadeProgress = 0.0;
		isFading = true;
		crossfadeTimer.startTimer(FADE_TIME_MS);
	}

	// --- Next / Prev Navigation ---
	inline function onNavButton(component, value)
	{
		if (!value) return;

		local current = SoundSelector_cmb.getValue();
		local newVal;

		if (component == Next_iconBtn)
			newVal = current >= totalItems ? 1 : current + 1;
		else
			newVal = current <= 1 ? totalItems : current - 1;

		SoundSelector_cmb.setValue(newVal);
		SoundSelector_cmb.changed();
	}

	// --- Public API for Random ───────────────────────────────────
	// Returns a random combobox index (1-based) within the same category as the current selection.
	inline function getRandomIndexInCurrentCategory()
	{
		local items = SoundSelector_cmb.get("items").split("\n");
		local current = SoundSelector_cmb.getValue();

		if (current < 1 || current > items.length) return current;

		local currentKey = items[current - 1];
		local currentCategory = currentKey.substring(0, currentKey.indexOf("::"));

		// Collect all indices belonging to this category
		local categoryIndices = [];
		for (i = 0; i < items.length; i++)
		{
			if (items[i].indexOf(currentCategory + "::") == 0)
				categoryIndices.push(i + 1);
		}

		if (categoryIndices.length <= 1) return current;

		// Pick a random one (excluding the current selection)
		local pick = current;
		while (pick == current)
			pick = categoryIndices[Math.randInt(0, categoryIndices.length)];

		return pick;
	}

	// --- Init ---
	setupComboboxItems();
	reg totalItems = SoundSelector_cmb.get("items").split("\n").length;

	SoundSelector_cmb.setControlCallback(onSoundSelectorControl);
	Next_iconBtn.setControlCallback(onNavButton);
	Prev_iconBtn.setControlCallback(onNavButton);
}

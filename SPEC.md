# SPEC.md - Rausch (Textural Noise Generator)

## 1. Project Concept
**Rausch** is a boutique textural noise generator designed for lo-fi, techno, and ambient production. It moves beyond standard white/pink noise by using processed organic, cosmic, and industrial recordings as a sound source.

## 2. Target Audience
- **US/EU Boutique Market:** High-end lo-fi producers, techno artists, and sound designers.
- **Value Prop:** "Boutique noise for professional texture."

## 3. Core Engine (HISE)
- **Sound Source:** 12-15 high-quality, loopable Public Domain/CC0 textures (NASA, Industrial, Nature).
- **Movement Engine:** Slow LFO modulation (random/sine) on Sample Start and Pan to prevent loop fatigue.

## 4. Signal Chain & FX (The "Sinuslabs" Vibe)
Since we have access to Airwindows and Faust, we will focus on **subtractive grit** and **spatial aging**.

### FX Chain Idea:
1.  **Input:** Sampler Engine (12 curated textures).
2.  **DATA DECAY (Airwindows - HipCrush):** 
    - **Low Crush:** Targeting sub-harmonics and "thump" (Industrial/Factory focus).
    - **Mid Crush:** Targeting core texture and "shmoo" (Archive/Tape focus).
    - **High Crush:** Targeting "top-end shizzle" and digital artifacts (Cosmos/Vinyl focus).
3.  **MOVEMENT (HISE LFO):** Dual-stage LFO on Filter Cutoff and Volume to ensure organic evolution.
4.  **TILT (Faust):** Simple Tilt EQ for quick tone balance (Dark ↔ Bright).
5.  **SPACE (Faust):** Virtual Distance/Reverb to place noise in a physical context.

## 5. UI/UX Design
- **Color Palette:** Signal Orange (#ff3e00) vs. Deep Slate Gray.
- **Main Interaction:** One big "TEXTURE" selector knob and a "WEAR" (Airwindows Saturation) slider.
- **Visuals:** Waveform visualization using WaveSurfer-style HISE components.

## 6. Scope (The "2-Day Build")
- **Day 1:** Load textures, setup sampler, wire up Airwindows integration.
- **Day 2:** Build UI, map Tilt EQ and Wear slider, export installers.

## 7. Licensing
- **Code:** GPLv3.
- **Product:** Paid Commercial Binaries (Boutique positioning).

# The Lost Letters of Us

A 3D web game made as a 2nd-anniversary gift for a long-distance girlfriend, Vaishali.
She drives a pink convertible around a night-time fairy island with Prateek riding beside her.
She solves 5 puzzles about their relationship to find 5 hidden letters, and at the end
"The Last Door" opens and Prateek walks out of it to meet her.

> **Content:** the real story is in. It covers how they met (Banaras, the IIT Patna techfest, the
> call on 23 October 2024), the first date, Rishikesh, Mumbai and the proposal at the Taj, with 20 real
> photos. One detail is still a placeholder: the secret word for puzzle 5.

---

## How to run it

**On Windows, double-click `Start-Game.bat`.** It starts a tiny local server (needed for the photos
to show inside the 3D world) and opens the game in your browser. Keep its black window open while playing.

Or, in this folder, run:

```
python -m http.server 8123
```

Then open <http://localhost:8123>.

**To put it online:** drag this whole folder onto <https://app.netlify.com/drop>.

### Requirements
- Plain HTML, CSS and JavaScript in tidy files (see **Folder contents**): no build step, no npm, no install.
- three.js r128 and the bloom post-processing are included in `js/lib`, so it works offline.
- All music and sound effects are generated live with WebAudio, so there are no audio files.
- Only the Google Fonts are loaded from the internet; if they're unavailable, the page falls back to system fonts.

---

## Controls

| | Computer | Phone |
|---|---|---|
| Drive / walk | WASD / arrow keys | Joystick (bottom left) |
| Get out and walk together, or get back in | **F** or 🚶 / 🚗 button | 🚶 / 🚗 button |
| Turbo (driving) / run (walking) | Shift | Hold ⚡ |
| Drift | Space | — |
| Honk | H | ♥ button |
| Use / open a place | **E**, or **left-click** it when you're close | Tap the button that appears |
| Look around | Drag with the mouse, scroll to zoom | Drag; pinch to zoom |
| Island map + teleport | **M** or 🗺 button | 🗺 button |
| Take a Polaroid of the moment | **P** or 📸 button | 📸 button |
| Extra-big burst during the firework show | **Space** | — |
| Close a letter / map / telescope / photo | **Esc** | × |

A mouse click **never moves the car**; the car is driven with the keyboard only. On phones,
tapping empty ground drives (or walks) there.

---

## What's in it

### The story (the main goal)
- **5 letter spots**, each unlocked by a puzzle:
  1. **The Techfest Night:** a date lock (the night she called)
  2. **The Ghats of Banaras:** type the city where it started
  3. **The First Date:** pick the right place (buy 1 get 1 🍕)
  4. **The Rishikesh Viewpoint:** a 9-piece photo puzzle (look-alike pieces such as plain sky count as interchangeable)
  5. **The Two Lighthouses:** a two-word password; she must call him to get the second word
- Each letter reveals one hidden word. Together they read **"Sab thik ho jayega, Vaishali"** and open **The Last Door**.
- **The finale:** the door opens and Prateek walks out. There are lanterns and fireworks, the proposal
  photo from the Taj, the next time they'll meet, and his final letter. Afterwards she can take him for a drive.
- Progress is saved in the browser (↺ resets it).

### Riding and walking together
- **In the car:** Prateek (curly hair, clear glasses, the blue check shirt from the Taj night) rides beside her.
- **Walking:** press F (or 🚶) and they both step out and walk the whole island side by side. He keeps
  to her right and catches up if she runs. They can walk across the lagoon bridge and out along the pier.
- **Getting back in:** press F again. If she has wandered far, the fairy brings the car over.

### Romantic moments together
- **🎡 Ferris wheel ride:** the two of you sit side by side in an open basket. The wheel takes one
  full turn and pauses at the very top, where a message appears and shooting stars cross the sky.
  The camera looks out over the lit-up island, the sea and the moon.
- **🏮 Lantern Meadow:** a heart-shaped picnic blanket with candles, inside a ring of glowing lantern posts.
  "Release lanterns together" fills the sky with ~44 floating lanterns, the first two from your own hands.
- **🪑 Benches:** sit together, her head on your shoulder, while the camera looks out at the view.
  There are five: the hill lookout, Whispering Falls (with the rainbow), the end of the pier, the Moon
  Lagoon shore and Lantern Meadow.
- "Stand up ×" / "End the ride ×" (or Esc, F, E) ends a moment.

### The island
The island is roughly 140 m across. Its central meadow is the original island; a ring road
surrounds it and leads out to the newer areas:

| Area | What's there |
|---|---|
| **Heart Meadow** (centre) | The Last Door, wishing well, swing, fairy ring, gallery of moments, jukebox + dance floor, Map of Us table, **gift boxes** (each opens a love coupon), jump ramp, fireworks button |
| **Ring road** | Lamp posts, signposts, 3 jump ramps, the 6-hoop **Love Lap** time trial |
| **⭐ Stargazer Hill** | A road over a hill, a lookout bench and a **telescope** (see below) |
| **🌙 Moon Lagoon** | An arched bridge with railings and string lights, lily pads, floating lanterns |
| **💧 Whispering Falls** | An 8 m waterfall over a boulder cliff into a glowing pool. Splashes, ripples, mist, a water sound that gets louder as you approach, a bench, and a **rainbow** when she sits |
| **🌲 Firefly Forest** | Pines and lantern trees, glowing mushrooms, lots of fireflies |
| **🏡 Fairy Village** | 8 glowing cottages, a heart fountain, **Café Us** |
| **🌊 Starlight Pier + 🎡 Ferris wheel** | A pier you can drive or walk along, with a heart arch and a bench at the end; a Ferris wheel with open baskets you can ride together |
| **🏮 Lantern Meadow** | A picnic blanket, candles, a ring of lantern posts and a bench facing the sea; release sky lanterns together |
| **Beach** | The last two letter spots |

**Also:**
- 30 floating hearts to collect (by car or on foot)
- shooting stars
- sky lanterns
- a fairy guide ("Lumi") who gives hints
- an island map where she can tap any place to teleport there

### 🎁 Gift boxes
Driving into the stack of gift boxes in the meadow, or opening them with E or a click, sends them
flying. Each time, the next **love coupon** appears: a hug with no time limit, a buy-1-get-1 pizza date
he pays for, a movie she picks, and more.

### 🔭 The telescope (Stargazer Hill)
Click the telescope (or press E near it) to look through an eyepiece at a **real night sky**:
- **Real stars:** 11 constellations plotted from real star coordinates and brightness (right
  ascension, declination, magnitude): Orion, Taurus (with the Pleiades), Gemini, Canis Major,
  Leo, the Big Dipper, Cassiopeia, Cygnus, Lyra, Scorpius and the Southern Cross. Famous bright
  stars like Polaris, Arcturus and Capella are included, along with thousands of faint stars and
  the Milky Way drawn along the real galactic plane.
- **Moving around:** use ‹ › (or the arrow keys) to glide between constellations, and drag to look around. Each constellation has a short "how to find it" line.
- **Random sky events:** 🛰️ a **satellite** crossing (sometimes flashing), ☄️ **meteor showers**, and single shooting stars.

### 🎆 The grand firework show (red button in the meadow)
- About 30 seconds of fireworks, viewed from a raised camera.
- **Shell types:** round bursts, rings, hearts, two-colour bursts, glitter, golden willows and palms.
- **Running order:** single shells, then mirrored pairs, then a golden willow fan, then a rapid finale barrage.
- **The ending:** four rockets burst and their sparks fly into place to spell **"I LOVE U"** across the sky, with floating hearts and heart-shaped fireworks either side. On a phone held upright the words stack (I / LOVE / U).
- "End the show ×" (or Esc) stops it early.

### 📸 Polaroid keepsakes
- Press **P** (or tap 📸) at any moment to take a real photo of the scene: the waterfall rainbow,
  the "I LOVE U" fireworks, or even the view through the telescope.
- The screen flashes with a shutter sound. The picture floats down into the corner and
  *develops* like a real Polaroid.
- **Opening one:** click the photo to see it large and flip it over (click, F or Space). The back has a
  handwritten note, the place and the date. ‹ › browse the photos, and ⬇ saves one as a picture.
- **Kept:** the last 12 photos stay in the browser between visits.

### Made for a computer screen too (phones keep their own layout)
- **Letters on a wide screen:** the letter slides in on the left while the island stays visible
  behind a light blur. A stack of their real photos sits on the right: click one for the next photo,
  or drag them around like photos on a desk. Esc or "Back" folds the letter away.
- **A glowing cursor:** a soft ring follows the mouse. Near something usable it is gently pulled toward
  it and turns gold with a little floating heart. A pink ring means "get a little closer first".
- **A clean screen:** the corner buttons fade to 35% and come back when the mouse nears the top or bottom edge.

### ✨ Graphics
- **Water:** waves animate on the graphics card, with moonlight glints and a soft purple sheen at grazing angles.
- **Night sky:** pink and blue nebula bands and a warm glow around the moon.
- **Stars:** about 3,000 soft, round stars of different sizes that twinkle; a few are tinted blue, pink or gold.
- **Colour grade:** a gentle cinematic grade (plum shadows, slightly richer colour, a touch of contrast) and a soft vignette.

### 🎵 Your own music
Put MP3/M4A files in `music/` and list them in `js/story.js` (`music: [{ title, file }]`). They play in order
when the game starts, and the jukebox skips to the next one. The dance floor pulses to the **real beat** of the
song (detected live from the audio). An optional `finaleSong` starts when the Last Door opens. A missing or
misspelled file is simply skipped, and the built-in generated tunes play after your songs.

### Little games
- The Love Lap time trial, with the best time saved
- A heart hunt
- A jukebox with 4 original generated songs and a music-reactive dance floor
- Fireworks
- (Bowling and football were removed to keep the island focused on the two of them.)

### Photos
- **The gallery board** shows each photo whole. Tall photos are centred on a soft blurred copy of
  themselves, so nothing gets cropped.
- **The Map of Us:** 6 places, with labels that move out of each other's way.

---

## Performance (phones)

**Measured on the same meadow view (desktop browser, same resolution):** 2,050 → 839 draw calls,
and 16.7 → 7.7 ms to draw a frame (more than twice as fast). On a phone-sized screen it's about 460–660 draw calls.
What made the difference:
- **The 8 small point lights are now glow sprites.** Real lights make every pixel slower; this alone saved about 40%.
- **~500 small objects that never move are merged into 15 meshes** (mushrooms, rocks, crystals, stepping stones, meadow trees).
- **Many-part objects are merged inside their own group** (the car, flower pots, gift boxes, gallery, benches…), so they still move and get knocked over normally.
- **The sky lanterns** are one instanced mesh plus one glow layer (2 draw calls for up to 110 lanterns).
- **The water waves run on the graphics card** instead of being recalculated on the CPU every frame.
- **Shadows** are redrawn every 2nd frame.
- **Adaptive quality** steps down one notch at a time (sharpness, then shadow rate, then shadows, then bloom) when the frame rate drops, and back up when there's headroom.

**Other techniques:**
- **Low draw-call count:** repeated objects (trees, grass, cottages, lamp posts, bridge planks)
  use instancing, and **all fireworks share one GPU particle system**, so a big show is a single
  draw call.
- **No extra real-time lights** were added for the new areas; they use glowing materials and bloom instead.
- **Shadows** are only computed near the player.
- **Far-away areas** are hidden automatically, which the fog makes invisible.
- **The telescope view** pauses the 3D rendering while it's open.
- **Phones get lighter versions automatically:** less grass, fewer trees and particles, and a lower resolution.
- **Automatic fallback:** if the frame rate drops below 28 FPS, the game turns off bloom and shadows by itself.

**Not yet verified on a real phone.** All testing so far was in a desktop browser, at desktop size and an emulated phone size (375×812).

---

## Where to change the content
Everything personal is in **`js/story.js`** (the `GAME` object):
- `herName`, `himName`, `yourName` (the sign-off), `lede`, `fairyName`
- `chapters` (the 5 puzzles, letters and hidden words)
- `wishes`, `swingMemory`, `fairyRing`
- `gallery` (19 moments) and `places` (6 places for the map)
- `world`: messages for the outer areas, the telescope line, and `fireworksText` ("I LOVE U")
- `gifts`: the love coupons in the gift boxes
- `snapNotes`: the hidden notes on the back of her Polaroids
- `finale`

Photos are in `photos/` (`photo-01.jpg` … `photo-20.jpg`) and are referenced like `"photos/photo-01.jpg"`.

`DEVELOPER-NOTES.md` is the technical map of the code (sections, conventions, gotchas).

---

## Folder contents
```
Lost-Letters-of-Us/
├── Start-Game.bat        double-click to play on Windows
├── index.html            the page (markup + script list)
├── css/style.css         all the styles
├── js/
│   ├── story.js          ← all personal content (names, letters, puzzles, photos, music list)
│   ├── lib/              three.js r128 + post-processing
│   ├── core/             setup (renderer, sky, terrain, water), roads, optimize, post-fx
│   ├── world/            scenery, characters, car, meadow, fireworks, outer areas, moments, telescope…
│   ├── ui/               panels (gallery, maps), input
│   └── game/             interactions, audio, letters & puzzles, keepsakes, finale, walking, main loop
├── photos/               the 20 real photos
├── music/                put your own songs here
├── screenshots/          screenshots of the main features
├── README.md             this file
└── DEVELOPER-NOTES.md    code map and conventions
```

## Credits
- 3D engine: [three.js](https://threejs.org) r128 (MIT).
- The "big explorable world" feel (roads, ramps, turbo, follow camera) was inspired by
  Bruno Simon's portfolio. **No code or assets from it are used**; everything is drawn
  procedurally in this file.
- Star positions are from standard astronomical catalogue values (approximate, J2000).

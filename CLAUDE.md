# The Lost Letters of Us — fairy island anniversary gift

A 3D web game made as a 2nd-anniversary gift for a long-distance girlfriend (Vaishali). She drives a
pink convertible around a night-time fairy island with Prateek (the boyfriend) riding beside her,
solves 5 memory puzzles, and opens "The Last Door" where Prateek walks out to meet her.
Keep it romantic, cute and personal. The owner is not an experienced developer: explain simply.

## Run / deploy
- Needs a local web server (photos and music are loaded as files). Double-click `Start-Game.bat`
  (python http.server on port 8123 + opens the browser), or `python -m http.server 8123`.
- Claude's own preview: `.claude/launch.json` serves on port **8124** (so it never clashes with the user's 8123).
- Deploy: drag the whole folder onto https://app.netlify.com/drop (index.html, css/, js/, photos/, music/).
- `Lost-Letters-of-Us/` + `Lost-Letters-of-Us.zip` = a copy for judging/sharing: refresh it after changes.

## Structure (no build step, plain classic <script> tags sharing one global scope, loaded IN ORDER)
- `index.html` — markup only + the script list. `css/style.css` — all styles.
- `js/lib/three.min.js` (three.js r128) and `js/lib/postprocessing.js` (EffectComposer, RenderPass, ShaderPass,
  UnrealBloomPass, CopyShader, LuminosityHighPassShader). Do not upgrade three.js without checking r128 APIs.
- `js/story.js` — the `GAME` object: ALL personal content (edit here).
- `js/core/setup.js` — globals ($, isTouch, save), renderer, sky shader, lights, materials M()/E(), sprite(),
  glowLight(), STATIC list, terrain (coastR / coastR0 / groundH / walkH), water (GPU waves + moon glints).
- `js/core/roads.js` — P(), place(), block() colliders, regions[], the road network + roadMask/onRoad.
- `js/world/scenery.js` — grass, trees, mushrooms, crystals, the 5 letter landmarks (SPOTS), Last Door, well,
  swing, fairy ring, stars (twinkle shader), moon, clouds, sky lanterns (instanced), fireflies, petals, bursts.
- `js/world/characters.js` — person() (`her`, `him` = Prateek with curly hair + glasses), Lumi the fairy.
- `js/world/vehicle.js` — car, updateCar() physics, ramps, bridge/pier heights, tracks, knockable props.
- `js/world/meadow.js` (gallery board, jukebox), `fireworks.js` (GPU particle pool, grand show + "I LOVE U"),
  `map-of-us.js`, `outer-areas.js` (Stargazer Hill, Moon Lagoon, Fairy Village, pier, Ferris wheel, Whispering
  Falls), `moments.js` (sitting together: benches, Ferris ride, Lantern Meadow, dancing together on the dance floor), `roadside.js` (signposts, lamp
  posts, forest), `telescope.js` (real constellations), `world-update.js` (shooting stars, updateWorld),
  `games.js` (heart hunt, Love Lap, updateZones / dance floor), `blockworld.js` ("Our Block World" Minecraft corner at BW:
  one 16px pixel-tile atlas + bwBox()/bwMerge() so all still blocks are ONE mesh; minable ore pile with a hidden diamond,
  friendly Creeper that pops into hearts, pink sheep, crafting table panel, bed/respawn; texts in GAME.blockworld).
- `js/ui/panels.js` (gallery/map/island panels, teleport), `js/ui/input.js` (keys, joystick, camera drag, clicks).
- `js/core/optimize.js` — merges static meshes (STATIC → mergeStatic) and many-part groups (mergeLocal) into a
  few draw calls. Must run after all world files. `js/core/postfx.js` — bloom + colour-grade/vignette pass.
- `js/game/state.js` (interactables, labels, doInteract), `audio.js` (generated songs + YOUR music playlist,
  musicBeat()), `flow.js` (start, letters, puzzles), `keepsakes.js` (gift coupons, desk letters, glowing cursor,
  Polaroids), `achievements.js` (Minecraft-style pop-ups: achieve(id) from anywhere, saved in localStorage; mcChat()), `finale.js` (startFinale, hearts()), `walking.js` (collide, toggleWalk), `loop.js` (adaptive
  quality, frame(), camera).
- Because files are separate scripts, a function used at LOAD time must be defined in the same or an earlier
  file (hoisting only works inside one file). Using things from later files inside functions is fine.

## Content (js/story.js → GAME)
herName, himName, yourName (sign-off), lede, fairyName, chapters[5] {place, prompt, story, puzzle {type:
code|text|choice|tiles|call}, letter {title, text, photo}, word}, wishes, swingMemory, fairyRing, gallery[],
places[] (Map of Us), world {lookout, lagoon, cafe, pier, ferris, falls, lanterns, lanternBench, telescope,
fireworksText}, gifts[] (love coupons), snapNotes[], music[] {title, file} + finaleSong, finale.
Photos: photos/photo-01..20.jpg. Music: put MP3/M4A in music/ and list them in GAME.music.
Puzzle 5 (`call`) answer is final: "chill mar" (she calls Prateek for "mar"). Still TODO: unknown dates (empty = hidden).

## Performance rules (it must run well on her phone)
- No new PointLights/SpotLights (each one slows every pixel): use glowLight()/sprite()/emissive instead.
- Static decoration → push to STATIC; repeated shapes → instanced(); many-part movable groups get mergeLocal.
- InstancedMesh needs frustumCulled = false in r128 (done globally in panels.js). Shadow camera near/far is
  tight (45–90) on purpose; shadows redraw every 2nd/4th frame (renderer.shadowMap.autoUpdate = false).
- loop.js `QUALITY` steps sharpness → shadow rate → shadows → bloom when FPS < 40, and back up when > 57.
- Test on a phone-sized viewport too (375×812). Text uses curly quotes/apostrophes.

## Conventions
- Colliders: block(x,z,r,ref?); car uses allColliders(). Place on the ground with groundH(x,z).
- New tappable 3D objects: mesh.userData.onClick + push to `clickables`.
- New drive/walk-up interactions: add to `interactables` + updateInteract() + doInteract() (state.js).
- "Moments" (cinematic, frozen controls): beginMoment()/endMoment() + a branch in updateSitting() with sitting.cam.
- Mouse clicks never drive the car (keyboard only); touch taps on empty ground still move her.
- Credit: the big explorable world feel is inspired by Bruno Simon's folio; no code or assets from it are used.

# 3D scenes for the homepage exploration

Blender scenes built by script. Plan and progress: `docs/superpowers/plans/2026-11-25-3d-homepage.md`.
Render only on the Mac (Apple Silicon GPU through Metal), never in the cloud session.

## One-time setup on the Mac

1. Free about 20 GB of disk.
2. Install the current Blender for Apple Silicon from blender.org into Applications.
3. Get the branch:

```bash
cd ~/Development/aims-website && git fetch origin && git checkout explore/3d-homepage && git pull
```

## Assets (not in git)

The street outside the lobby is a photographed city, a CC0 HDRI from Poly Haven: "Docklands 02" by Savva
Zakharov (4K HDR, 25.4 MB), clear sky and hard sun. The script measures the HDRI's sun (direction, colour,
strength), clips it out of the world light and puts a sun lamp in its place, so shadows inside and outside
agree. Without the file the scene falls back to a plain sky and modelled blocks. "Canary Wharf" by Andreas
Mischok (overcast) also works: `--hdri 3d/assets/hdri/canary_wharf_4k.exr --hdri-rotation 150`.

The dusk version uses "Golden Bay" by Greg Zaal (4K HDR, 22.6 MB, blue hour across water). Its brightest
light is a street lamp, so dusk turns the sun lamp off (`--sun none`) and the lobby's own lights lead.

```bash
mkdir -p 3d/assets/hdri
curl -L -o 3d/assets/hdri/docklands_02_4k.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/docklands_02_4k.hdr
curl -L -o 3d/assets/hdri/golden_bay_4k.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/golden_bay_4k.hdr
```

## Look test

Quick preview (about a minute):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee --out 3d/renders/looktest-eevee.png
```

Dusk (blue-hour street, no sun, warm ceiling lights and a light grazing the oak slats):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --mood dusk
```

Realistic still (about 2.5 minutes on the M1 once Cycles has compiled its Metal kernels; the very first run
adds a few minutes for that; keep the Mac plugged in):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles --samples 192
```

The picture lands in `3d/renders/`. Options: `--res 800x500 --samples 64` (a 20 second draft), `--exposure 1.3`
(brighter), `--open 1` (flaps swung open), `--hdri-rotation 150` (what the window looks onto), `--no-finish`
(no bloom, dispersion, vignette or grain), `--save 3d/renders/looktest.blend` (keep the scene to open in Blender).

## Devices

Each device is a function in `aims3d/`, built to the catalogue's dimensions where `content/products.json` gives
them (estimates are marked in each module's docstring). Check them in a grey studio (about 40 s each):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot parking   # BGM-1030 + UHF10
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot lobby --zones 18   # ZK-D3180S, door, ProFace X
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot desk      # terminals, maglock, monitor
```

`--open 1` raises the boom and opens the door; `--zones 0..18` lights the detector's zones from the floor up.
Screen pictures are drawn by `python3 3d/make_textures.py` into `3d/textures/` (no figures or records on them).

## The building (all chapters, at dusk)

One scene holds every chapter, so the camera path can later run through it. Render a chapter's still (about
1-2.5 minutes each at 1600x1000, 96 samples):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot hero --samples 96
```

Shots: `hero` (the tower from across the street), `parking` (driving up to the BGM-1030), `lobby` (through
the metal detector to the gates), `corridor` (floor 11, the door with the ProFace X), `clockin` (SpeedFace V5L
and the attendance screen), `finale` (the skyline from the office windows). States: `--boom`, `--zones`,
`--gates`, `--door`. The sky is Blender's physical sky after sunset (`--sky 4 --sun-elevation -4`): a
street-level HDRI puts its own buildings beside the tower at the wrong scale. Floors nobody enters, and the
whole city around, wear one procedural lit-window facade (`materials.tower_facade`).

## The journey (camera path and device motion)

`--shot journey` adds the visitor's camera and every device's motion on one 80 s timeline (24 fps,
`aims3d/journey.py`). Each product gets a beat: the camera slows and arcs round it, focus goes shallow
(f/2.8), an accent light fades up and the device does its job in frame. `journey.PRODUCTS` lists each beat's
frames, position and catalogue slug for the scroll overlays. The path runs: hero push, glide to the driver's seat, the boom rising in 1.5 s, the sliding doors,
the detector's zones lighting floor-up, Gate A's flaps, the lift (a hidden cut while its doors are shut),
the corridor, the ProFace X match and the door swinging, the SpeedFace V5L clock-in, and out through the
office glass over the city. `journey.CHAPTERS` gives each chapter's frame range for the scroll mapping.

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot journey --frames 1,320,560,1030
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot journey --video --engine eevee --res 960x600 --step 2
```

Output goes to `3d/renders/journey/`. The homepage will use route B: this film as a frame sequence scrubbed
by scroll (decided 26 Nov), so the final render is the journey at full quality with `--blur`.

## Files

- `aims3d/materials.py`: brushed steel, black glass, clear and window glass, LEDs, polished stone, plaster, oak,
  planter, leaf, dark stone
- `aims3d/build.py`: bevelled boxes, cylinders, extruded profiles (flat shading unless bevelled)
- `aims3d/dressing.py`: snake-plant planter, reception desk
- `aims3d/barrier.py`: BGM-1030 boom barrier, UHF10 reader on its pole
- `aims3d/detector.py`: ZK-D3180S walk-through metal detector
- `aims3d/terminals.py`: ProFace X, SpeedFace V5L
- `aims3d/door.py`: ALF-M560 maglock, frameless glass door with armature and handle
- `aims3d/monitor.py`: 24-inch monitor with the attendance dashboard
- `aims3d/render.py`: shared command line and Cycles settings
- `aims3d/tower.py`: the tower, its street and forecourt, street lights, canopy, skyline and city blocks
- `aims3d/spaces.py`: the rooms: lobby and car park portal (ground floor), corridor, door and clock-in (floor 11)
- `aims3d/journey.py`: the camera path, device keyframes and chapter frame ranges
- `aims3d/hdri.py`: finds an HDRI's sun and aims the sun lamp at it
- `aims3d/finish.py`: the photographic finish (compositor: bloom, dispersion, vignette, grain)
- `aims3d/speedgate.py`: ZKTeco MARS-B1200 (proportions estimated from AIMS's product photo)
- `looktest.py`: the lobby corner, daylight, camera and render settings

## Realism notes (learned in the look test)

- Window glass must let shadow rays through (`window_glass`, `_glass_shadow_mix`); refractive glass blocks
  Cycles' sun and sky and the room goes flat.
- Never smooth-shade an unbevelled box: big walls and glass shade and reflect as if curved.
- Brushed steel only looks bright when it has something bright to mirror: keep glazing or light walls
  behind the camera.
- Put the sun behind the camera: looking toward it through glass shows the street's shaded side, darker than
  the room. Lower it below the photo's real elevation if it must reach deep into the room.
- Use real albedos (white paint ~0.7, light stone ~0.5); hold the camera level and frame with lens shift.

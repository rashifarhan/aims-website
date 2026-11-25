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

The street outside the lobby is a photographed city, a CC0 HDRI from Poly Haven ("Canary Wharf" by Andreas
Mischok, 4K EXR, 23.6 MB). Without it the scene falls back to a plain sky and modelled blocks.

```bash
mkdir -p 3d/assets/hdri && curl -L -o 3d/assets/hdri/canary_wharf_4k.exr https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/4k/canary_wharf_4k.exr
```

## Look test

Quick preview (about a minute):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee --out 3d/renders/looktest-eevee.png
```

Realistic still (about 2.5 minutes on the M1 once Cycles has compiled its Metal kernels; the very first run
adds a few minutes for that; keep the Mac plugged in):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles --samples 192
```

The picture lands in `3d/renders/`. Options: `--res 800x500 --samples 64` (a 20 second draft), `--exposure 1.3`
(brighter), `--open 1` (flaps swung open), `--hdri-rotation 150` (what the window looks onto), `--no-finish`
(no bloom, dispersion, vignette or grain), `--save 3d/renders/looktest.blend` (keep the scene to open in Blender).

## Files

- `aims3d/materials.py`: brushed steel, black glass, clear and window glass, LEDs, polished stone, plaster, oak,
  planter, leaf, dark stone
- `aims3d/build.py`: bevelled boxes, cylinders, extruded profiles (flat shading unless bevelled)
- `aims3d/dressing.py`: snake-plant planter, reception desk
- `aims3d/finish.py`: the photographic finish (compositor: bloom, dispersion, vignette, grain)
- `aims3d/speedgate.py`: ZKTeco MARS-B1200 (proportions estimated from AIMS's product photo)
- `looktest.py`: the lobby corner, daylight, camera and render settings

## Realism notes (learned in the look test)

- Window glass must let shadow rays through (`window_glass`, `_glass_shadow_mix`); refractive glass blocks
  Cycles' sun and sky and the room goes flat.
- Never smooth-shade an unbevelled box: big walls and glass shade and reflect as if curved.
- Brushed steel only looks bright when it has something bright to mirror: keep glazing or light walls
  behind the camera.
- Use real albedos (white paint ~0.7, light stone ~0.5); hold the camera level and frame with lens shift.

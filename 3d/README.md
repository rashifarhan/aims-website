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

## Look test

Quick preview (about a minute):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee --out 3d/renders/looktest-eevee.png
```

Realistic still (several minutes on an M1; keep the Mac plugged in):

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles --samples 192
```

The picture lands in `3d/renders/`. Options: `--res 1600x1000`, `--exposure 0.5` (brighter), `--open 1`
(flaps swung open), `--save 3d/renders/looktest.blend` (keep the scene to open in Blender).

## Files

- `aims3d/materials.py`: brushed steel, black glass, clear glass, LEDs, polished stone, plaster, oak
- `aims3d/build.py`: bevelled boxes, cylinders, extruded profiles
- `aims3d/speedgate.py`: ZKTeco MARS-B1200 (proportions estimated from AIMS's product photo)
- `looktest.py`: the lobby corner, daylight, camera and render settings

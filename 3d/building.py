"""The homepage's building: one scene holding every chapter, at dusk. Render a chapter's still on the Mac:

  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot hero
  (shots: hero, parking, lobby, corridor, clockin, finale)
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot journey --frames 1,300,560
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/building.py -- --shot journey --video --engine eevee --res 960x600 --step 2

Options: --sky 4 (twilight strength)  --sun-elevation -4  --sun-azimuth 200  --samples 128  --res 1600x1000  --exposure 0  --boom 0..1  --zones 0..18  --gates 0..1  --door 0..1
         --save 3d/renders/building.blend (the whole scene, for the camera path)  --no-render
"""

import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from aims3d import journey  # noqa: E402
from aims3d.build import look_at  # noqa: E402
from aims3d.finish import photographic_finish  # noqa: E402
from aims3d.render import parse_args, render_settings  # noqa: E402
from aims3d.spaces import car_park_portal, ground_floor, office_floor  # noqa: E402
from aims3d.tower import OFFICE_FLOOR, city_fabric, entrance_canopy, floor_z, neighbours, street_and_forecourt, street_lights, tower  # noqa: E402

Z_OFFICE = floor_z(OFFICE_FLOOR)

# Each chapter's camera: location, target, lens, vertical lens shift (verticals stay straight), exposure.
SHOTS = {
    # Across the street at eye height, the whole tower in frame: the hero.
    "hero": ((-32.0, -72.0, 1.7), (-2.0, 0.0, 1.7), 18, 0.2, 0.0),
    # In the driver's seat, rolling up the driveway to the barrier.
    "parking": ((11.7, -7.5, 1.25), (9.4, 0.0, 1.1), 28, -0.05, 0.3),
    # Through the sliding doors: the metal detector frames the speed gates and the lifts beyond.
    "lobby": ((0.0, 0.8, 1.6), (0.0, 10.0, 1.6), 24, -0.06, 0.3),
    # Out of the lift on floor 11, down the corridor to the glass door and its ProFace X.
    "corridor": ((0.2, 15.2, Z_OFFICE + 1.6), (0.4, 9.0, Z_OFFICE + 1.6), 26, -0.08, 0.3),
    # Through the door: the SpeedFace V5L on its stand and the attendance screen beside it.
    "clockin": ((3.2, 8.7, Z_OFFICE + 1.6), (1.2, 6.4, Z_OFFICE + 1.6), 32, -0.06, 0.3),
    # To the windows: the skyline at dusk.
    "finale": ((0.0, 3.6, Z_OFFICE + 1.6), (-8.0, -100.0, Z_OFFICE + 1.6), 24, 0.0, 0.0),
}


def args():
    opts = {"shot": "hero", "engine": "cycles", "samples": "128", "res": "1600x1000", "save": "",
            "sun-elevation": "-4", "sun-azimuth": "200", "sky": "4"}
    opts, flags = parse_args(opts, {k: {"shot": k} for k in SHOTS})
    opts.setdefault("exposure", str(SHOTS[opts["shot"]][4]) if opts["shot"] in SHOTS else "0.2")
    opts.setdefault("out", os.path.join(HERE, "renders", f"building-{opts['shot']}.png"))
    return opts, flags


def world(opts):
    """Twilight from Blender's physical sky, the sun a few degrees below the horizon: a real blue-hour
    gradient with nothing standing on the horizon, so the modelled skyline is the only city. (A street-level
    HDRI puts its own apartment blocks beside the tower at the wrong scale.)"""
    sc = bpy.context.scene
    w = bpy.data.worlds.new("Twilight")
    sc.world = w
    nodes, links = w.node_tree.nodes, w.node_tree.links
    sky = nodes.new("ShaderNodeTexSky")
    for kind in ("MULTIPLE_SCATTERING", "NISHITA", "SINGLE_SCATTERING"):
        try:
            sky.sky_type = kind
            break
        except TypeError:
            continue
    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False
    sky.sun_elevation = math.radians(float(opts["sun-elevation"]))
    sky.sun_rotation = math.radians(float(opts["sun-azimuth"]))
    links.new(sky.outputs[0], nodes["Background"].inputs["Color"])
    nodes["Background"].inputs["Strength"].default_value = float(opts["sky"])


def camera(shot):
    loc, target, lens, shift, _ = SHOTS[shot]
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object
    cam.name = f"Camera {shot}"
    look_at(cam, target)
    cam.data.lens, cam.data.shift_y = lens, shift
    cam.data.clip_end = 3000
    bpy.context.scene.camera = cam


def main():
    opts, flags = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    world(opts)
    street_and_forecourt()
    street_lights([(x, -18.5) for x in (-40, -20, 0, 20, 40)] + [(x, -33.5) for x in (-30, -10, 10, 30)])
    tower()
    entrance_canopy()
    neighbours()
    city_fabric()
    ground_floor(opts)
    car_park_portal(opts)
    office_floor(opts)
    if opts["shot"] == "journey":
        journey.build()
    else:
        camera(opts["shot"])
    render_settings(opts)
    photographic_finish(bpy.context.scene)
    if opts["save"]:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opts["save"]))
    if "no-render" in flags:
        print("BUILDING_BUILT", len(bpy.data.objects), "objects")
        return
    if opts["shot"] == "journey":
        render_journey(opts, flags)
        return
    os.makedirs(os.path.dirname(os.path.abspath(opts["out"])), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print("BUILDING_RENDERED", opts["out"])


def render_journey(opts, flags):
    """`--frames 1,300,560` renders those frames as stills; `--video` renders the whole journey (every
    `--step` frames, played back at real speed) to an MP4 for review."""
    sc = bpy.context.scene
    out_dir = os.path.join(HERE, "renders", "journey")
    os.makedirs(out_dir, exist_ok=True)
    if "video" in flags:
        step = int(opts.get("step", "2"))
        sc.frame_step = step
        sc.render.fps = journey.FPS // step if journey.FPS % step == 0 else journey.FPS
        settings = sc.render.image_settings
        if hasattr(settings, "media_type"):  # Blender 5 splits image and video output
            settings.media_type = "VIDEO"
        settings.file_format = "FFMPEG"
        sc.render.ffmpeg.format, sc.render.ffmpeg.codec = "MPEG4", "H264"
        sc.render.ffmpeg.constant_rate_factor = "HIGH"
        sc.render.filepath = os.path.join(out_dir, "journey-")
        bpy.ops.render.render(animation=True)
        print("JOURNEY_VIDEO", out_dir)
        return
    for frame in [int(f) for f in opts.get("frames", "1").split(",")]:
        sc.frame_set(frame)
        sc.render.filepath = os.path.join(out_dir, f"frame-{frame:04d}.png")
        bpy.ops.render.render(write_still=True)
        print("JOURNEY_FRAME", frame)


main()

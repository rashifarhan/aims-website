"""Look test: two MARS-B1200 speed gates in a daylit lobby corner.

Run on the Mac (never in the cloud session):
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee     # ~1 min preview
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles    # final still
Options: --samples N  --res 1600x1000  --exposure 0.0  --open 0.0..1.0  --out 3d/renders/looktest.png
         --save 3d/renders/looktest.blend (keep the scene)  --no-render (build only)
"""

import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from aims3d import materials as M  # noqa: E402
from aims3d.build import DEG, box, look_at  # noqa: E402
from aims3d.speedgate import W, speed_gate  # noqa: E402


def args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    opts = {
        "engine": "cycles",
        "samples": "192",
        "res": "1600x1000",
        "exposure": "0",
        "open": "0",
        "out": os.path.join(HERE, "renders", "looktest.png"),
        "save": "",
    }
    flags = set()
    i = 0
    while i < len(argv):
        key = argv[i].lstrip("-")
        if i + 1 < len(argv) and not argv[i + 1].startswith("--"):
            opts[key] = argv[i + 1]
            i += 2
        else:
            flags.add(key)
            i += 1
    return opts, flags


def lobby():
    floor, wall, wood = M.marble_floor(), M.plaster(), M.oak()
    frame, glass = M.dark_metal("Mullion"), M.clear_glass("Curtain wall", (0.9, 0.95, 0.97))
    box("Floor", (16, 14, 0.1), (0, 0, -0.05), floor, 0)
    box("Ceiling", (16, 14, 0.1), (0, 0, 3.45), wall, 0)
    # Back: a glass curtain wall onto the street, mullions every 1.5 m.
    for i in range(-5, 6):
        box(f"Mullion {i}", (0.06, 0.12, 3.4), (i * 1.5, 5.0, 1.7), frame, 0.004)
    box("Transom", (16, 0.12, 0.08), (0, 5.0, 2.6), frame, 0.004)
    box("Curtain glass", (16, 0.02, 3.4), (0, 5.02, 1.7), glass, 0)
    # Left: oak slat feature wall, the warm surface a Dubai office lobby would have.
    box("Feature wall backing", (0.1, 10, 3.4), (-5.2, 0, 1.7), wall, 0)
    for j in range(-48, 49):
        box(f"Slat {j}", (0.05, 0.045, 3.4), (-5.12, j * 0.1, 1.7), wood, 0.004)
    box("Front wall", (16, 0.1, 3.4), (0, -6.5, 1.7), wall, 0)
    box("Right wall", (0.1, 14, 3.4), (6.5, 0, 1.7), wall, 0)
    # Street outside: a pavement and a few distant blocks, soft through the glass and depth of field.
    box("Pavement", (60, 30, 0.1), (0, 20, -0.06), M.plaster("Pavement", (0.6, 0.58, 0.55)), 0)
    for k, (x, y, w, h) in enumerate([(-8, 26, 6, 28), (1, 32, 8, 46), (10, 24, 5, 18), (17, 34, 7, 60)]):
        box(f"Tower {k}", (w, w, h), (x, y, h / 2), M.plaster(f"Tower {k}", (0.62, 0.66, 0.7)), 0)
    # Recessed linear lights in the ceiling.
    led = M.led("Ceiling light", (1.0, 0.92, 0.82), 6.0)
    for k in range(-3, 4):
        box(f"Linear light {k}", (0.06, 6, 0.02), (k * 1.8, -0.5, 3.395), led, 0)


def light(sun_elevation=28, sun_azimuth=200):
    sc = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    sc.world = world
    if hasattr(world, "use_nodes"):  # always on from Blender 5
        world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    sky = nodes.new("ShaderNodeTexSky")
    for kind in ("NISHITA", "MULTIPLE_SCATTERING", "SINGLE_SCATTERING", "HOSEK_WILKIE"):
        try:
            sky.sky_type = kind
            break
        except TypeError:
            continue
    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False  # the sun lamp below draws the sun and its shadows
    if hasattr(sky, "sun_elevation"):
        sky.sun_elevation = sun_elevation * DEG
        sky.sun_rotation = sun_azimuth * DEG
    links.new(sky.outputs[0], nodes["Background"].inputs[0])
    nodes["Background"].inputs[1].default_value = 0.35
    bpy.ops.object.light_add(type="SUN", rotation=((90 - sun_elevation) * DEG, 0, sun_azimuth * DEG))
    sun = bpy.context.object
    sun.data.energy = 4.0
    sun.data.angle = 0.6 * DEG
    sun.data.color = (1.0, 0.95, 0.88)
    # Soft fill from the ceiling so the steel has something to reflect besides the window.
    bpy.ops.object.light_add(type="AREA", location=(0.5, -1.5, 3.3))
    fill = bpy.context.object
    fill.data.shape = "RECTANGLE"
    fill.data.size, fill.data.size_y = 6.0, 3.0
    fill.data.energy = 900
    fill.data.color = (1.0, 0.94, 0.86)


def camera():
    bpy.ops.object.camera_add(location=(3.0, -4.4, 1.6))
    cam = bpy.context.object
    look_at(cam, (0.9, 0.0, 0.5))  # both units whole, three-quarter, at eye height
    cam.data.lens = 40
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    cam.data.dof.focus_distance = math.dist(cam.location, (0.78, 0.0, 0.6))
    bpy.context.scene.camera = cam


def render_settings(opts):
    sc = bpy.context.scene
    x, y = (int(v) for v in opts["res"].lower().split("x"))
    sc.render.resolution_x, sc.render.resolution_y = x, y
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    sc.view_settings.exposure = float(opts["exposure"])
    if opts["engine"] == "eevee":
        engines = [e.identifier for e in sc.render.bl_rna.properties["engine"].enum_items]
        sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
        ee = sc.eevee
        for attr, val in (("use_raytracing", True), ("use_shadows", True), ("taa_render_samples", 64)):
            if hasattr(ee, attr):
                setattr(ee, attr, val)
    else:
        sc.render.engine = "CYCLES"
        sc.cycles.samples = int(opts["samples"])
        sc.cycles.use_denoising = True
        sc.cycles.use_adaptive_sampling = True
        try:  # Apple Silicon GPU through Metal; falls back to CPU anywhere else
            prefs = bpy.context.preferences.addons["cycles"].preferences
            prefs.compute_device_type = "METAL"
            prefs.get_devices()
            for d in prefs.devices:
                d.use = True
            sc.cycles.device = "GPU"
        except (KeyError, TypeError, AttributeError):
            sc.cycles.device = "CPU"
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = opts["out"]


def main():
    opts, flags = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    lobby()
    mats = {"steel": M.brushed_steel(), "dark": M.dark_metal(), "cap": M.black_glass(), "glass": M.clear_glass(), "led": M.led()}
    opening = float(opts["open"])
    speed_gate("Gate A", (0, 0, 0), opening, mats)
    speed_gate("Gate B", (W + 0.02, 0, 0), opening, mats)  # a second unit beside it, as in a lobby row
    light()
    camera()
    render_settings(opts)
    if opts["save"]:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opts["save"]))
    if "no-render" in flags:
        print("LOOKTEST_BUILT", len(bpy.data.objects), "objects")
        return
    os.makedirs(os.path.dirname(os.path.abspath(opts["out"])), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print("LOOKTEST_RENDERED", opts["out"])


main()

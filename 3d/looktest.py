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
        "exposure": "0.9",
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
    """A lobby corner: curtain wall on the left onto the street, oak slat wall behind the gates (dark and warm,
    so the steel reads against it), plaster elsewhere. The visitor walks along +Y through the gates."""
    floor, wall, wood = M.marble_floor(), M.plaster(), M.oak()
    frame, glass = M.dark_metal("Mullion"), M.window_glass("Curtain wall")
    x_win, y_back, x_right, y_front = -5.0, 4.5, 6.5, -6.5
    cx, cy = (x_win + x_right) / 2, (y_back + y_front) / 2
    sx, sy = x_right - x_win, y_back - y_front
    box("Floor", (sx, sy, 0.1), (cx, cy, -0.05), floor, 0)
    box("Ceiling", (sx, sy, 0.1), (cx, cy, 3.45), wall, 0)
    # Left: a full-height glass curtain wall, mullions every 1.5 m and one transom.
    for j in range(-4, 4):
        box(f"Mullion {j}", (0.12, 0.06, 3.4), (x_win, j * 1.5, 1.7), frame, 0.004)
    box("Transom", (0.12, sy, 0.08), (x_win, cy, 2.6), frame, 0.004)
    box("Curtain glass", (0.02, sy, 3.4), (x_win - 0.02, cy, 1.7), glass, 0)
    # Back: oak slats on a dark backing, one slat repeated by an Array modifier (fewer objects, same look).
    box("Feature wall backing", (sx, 0.1, 3.4), (cx, y_back + 0.05, 1.7), M.plaster("Backing", (0.05, 0.045, 0.04)), 0)
    slat = box("Slats", (0.045, 0.05, 3.4), (x_win + 0.08, y_back - 0.03, 1.7), wood, 0.004)
    arr = slat.modifiers.new("Array", "ARRAY")
    arr.use_relative_offset, arr.use_constant_offset = False, True
    arr.constant_offset_displace = (0.1, 0, 0)
    arr.count = int((sx - 0.1) / 0.1)
    box("Right wall", (0.1, sy, 3.4), (x_right + 0.05, cy, 1.7), wall, 0)
    box("Front wall", (sx, 0.1, 3.4), (cx, y_front - 0.05, 1.7), wall, 0)
    # Street outside: pavement and a few distant blocks, soft through the glass and the depth of field.
    box("Pavement", (40, 60, 0.1), (x_win - 20.1, 0, -0.06), M.plaster("Pavement", (0.42, 0.4, 0.37)), 0)
    # Kept behind the sun's path (y > 5) so they never shade the lobby.
    blocks = [(-18, 7, 6, 26), (-30, 2, 9, 55), (-20, 14, 6, 22), (-40, 22, 10, 70), (-26, 34, 8, 40)]
    for k, (x, y, w, h) in enumerate(blocks):
        box(f"Tower {k}", (w, w, h), (x, y, h / 2), M.plaster(f"Tower {k}", (0.45, 0.48, 0.52)), 0)
    # Recessed linear lights in the ceiling, running with the walk.
    led = M.led("Ceiling light", (1.0, 0.9, 0.78), 8.0)
    for k in range(-2, 4):
        box(f"Linear light {k}", (0.05, 8, 0.02), (k * 1.8, -1.0, 3.395), led, 0)


def light(sun_elevation=24, sun_azimuth=294):
    """Low afternoon sun from the left-front through the curtain wall: it rakes across the floor, throws the
    mullion shadows in long stripes and catches the gates' entry faces at a grazing angle."""
    sc = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    sc.world = world
    if bpy.app.version < (5, 0, 0):  # node worlds are always on from Blender 5
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
    nodes["Background"].inputs[1].default_value = 0.5
    bpy.ops.object.light_add(type="SUN", rotation=((90 - sun_elevation) * DEG, 0, sun_azimuth * DEG))
    sun = bpy.context.object
    sun.data.energy = 4.0
    sun.data.angle = 0.53 * DEG  # the real sun's disc: crisp shadows that soften with distance
    sun.data.color = (1.0, 0.93, 0.84)


def camera():
    """The visitor's eye: standing back and to the right, at eye height, both gates whole."""
    bpy.ops.object.camera_add(location=(3.7, -3.5, 1.55))
    cam = bpy.context.object
    look_at(cam, (0.55, 0.4, 0.6))
    cam.data.lens = 35
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    cam.data.dof.focus_distance = math.dist(cam.location, (0.8, -0.14, 0.6))
    bpy.context.scene.camera = cam


def render_settings(opts):
    sc = bpy.context.scene
    x, y = (int(v) for v in opts["res"].lower().split("x"))
    sc.render.resolution_x, sc.render.resolution_y = x, y
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    sc.view_settings.exposure = float(opts["exposure"])
    for look in ("AgX - Medium High Contrast", "Medium High Contrast"):  # the name differs by version
        try:
            sc.view_settings.look = look
            break
        except TypeError:
            continue
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
        sc.cycles.adaptive_threshold = 0.02
        # No caustics and a clamp on indirect light: the usual archviz trade, fewer fireflies, much faster.
        sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
        sc.cycles.sample_clamp_indirect = 10.0
        sc.cycles.diffuse_bounces, sc.cycles.glossy_bounces = 4, 4
        sc.cycles.transmission_bounces, sc.cycles.transparent_max_bounces = 8, 16
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
    mats = {"steel": M.brushed_steel(), "steel_v": M.brushed_steel("Brushed steel vertical", axis="Z"), "dark": M.dark_metal(), "cap": M.black_glass(), "glass": M.clear_glass(), "led": M.led()}
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

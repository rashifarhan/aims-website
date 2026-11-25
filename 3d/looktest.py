"""Look test: two MARS-B1200 speed gates in a daylit lobby corner.

Run on the Mac (never in the cloud session):
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee     # ~1 min preview
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles    # final still
Options: --samples N  --res 1600x1000  --exposure 1.0  --open 0.0..1.0  --out 3d/renders/looktest.png
         --hdri path.exr (default 3d/assets/hdri/canary_wharf_4k.exr; a plain sky when missing)
         --hdri-rotation 150  --no-finish (skip bloom, vignette, grain)
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
from aims3d.dressing import planter, reception_desk  # noqa: E402
from aims3d.finish import photographic_finish  # noqa: E402
from aims3d.speedgate import W, default_materials, speed_gate  # noqa: E402

# The room, in metres. The visitor walks along +Y through the gates, which stand in a row along X at y = 0.
X_WIN, Y_BACK, X_RIGHT, Y_FRONT, CEILING = -5.0, 4.5, 6.5, -6.5, 3.4


def args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    opts = {
        "engine": "cycles",
        "samples": "192",
        "res": "1600x1000",
        "exposure": "1.0",
        "open": "0",
        "out": os.path.join(HERE, "renders", "looktest.png"),
        "save": "",
        "hdri": os.path.join(HERE, "assets", "hdri", "canary_wharf_4k.exr"),
        "hdri-rotation": "150",  # the plaza steps and towers outside the window, not the waterfront cafe
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


def lobby(street):
    """Curtain wall on the left onto the street, oak slat wall behind the gates (dark and warm, so the steel
    reads against it), plaster elsewhere, linear lights in the ceiling."""
    floor, wall, wood = M.marble_floor(), M.plaster(), M.oak()
    frame, glass = M.dark_metal("Mullion"), M.window_glass("Curtain wall")
    cx, cy = (X_WIN + X_RIGHT) / 2, (Y_BACK + Y_FRONT) / 2
    sx, sy = X_RIGHT - X_WIN, Y_BACK - Y_FRONT
    box("Floor", (sx, sy, 0.1), (cx, cy, -0.05), floor, 0)
    box("Ceiling", (sx, sy, 0.1), (cx, cy, CEILING + 0.05), M.plaster("Ceiling", (0.7, 0.69, 0.66)), 0)
    # Full-height curtain wall: mullions every 1.5 m, one transom, a sill track and a head trim.
    for j in range(-4, 4):
        box(f"Mullion {j}", (0.12, 0.06, CEILING), (X_WIN, j * 1.5, CEILING / 2), frame, 0.004)
    box("Transom", (0.12, sy, 0.08), (X_WIN, cy, 2.6), frame, 0.004)
    box("Sill", (0.16, sy, 0.04), (X_WIN, cy, 0.02), frame, 0.003)
    box("Head", (0.16, sy, 0.06), (X_WIN, cy, CEILING - 0.03), frame, 0.003)
    box("Curtain glass", (0.02, sy, CEILING), (X_WIN - 0.02, cy, CEILING / 2), glass, 0)
    # Oak slats on a dark backing, stopping short of floor and ceiling (the shadow gaps a joiner leaves).
    box("Feature wall backing", (sx, 0.1, CEILING), (cx, Y_BACK + 0.05, CEILING / 2), M.plaster("Backing", (0.03, 0.028, 0.026)), 0)
    slat = box("Slats", (0.045, 0.05, CEILING - 0.06), (X_WIN + 0.08, Y_BACK - 0.03, CEILING / 2), wood, 0.004)
    arr = slat.modifiers.new("Array", "ARRAY")
    arr.use_relative_offset, arr.use_constant_offset = False, True
    arr.constant_offset_displace = (0.1, 0, 0)
    arr.count = int((sx - 0.1) / 0.1)
    box("Right wall", (0.1, sy, CEILING), (X_RIGHT + 0.05, cy, CEILING / 2), wall, 0)
    # Behind the visitor: the glazed entrance they just came through. Out of frame, but its daylight is what
    # the gates' entry faces reflect, and brushed steel only looks bright when it has something bright to mirror.
    for i in range(-3, 5):
        box(f"Entrance mullion {i}", (0.06, 0.12, CEILING), (i * 1.5, Y_FRONT, CEILING / 2), frame, 0.004)
    box("Entrance transom", (sx, 0.12, 0.08), (cx, Y_FRONT, 2.6), frame, 0.004)
    box("Entrance glass", (sx, 0.02, CEILING), (cx, Y_FRONT - 0.02, CEILING / 2), glass, 0)
    if street:  # without a photographed street, a pavement and a few blocks stand in for it
        box("Pavement", (40, 60, 0.1), (X_WIN - 20.1, 0, -0.06), M.plaster("Pavement", (0.42, 0.4, 0.37)), 0)
        # Kept behind the sun's path (y > 5) so they never shade the lobby.
        for k, (x, y, w, h) in enumerate([(-18, 7, 6, 26), (-30, 2, 9, 55), (-20, 14, 6, 22), (-40, 22, 10, 70)]):
            box(f"Tower {k}", (w, w, h), (x, y, h / 2), M.plaster(f"Tower {k}", (0.45, 0.48, 0.52)), 0)
    # Linear lights recessed in the ceiling, each in a dark trim, running with the walk.
    led, trim = M.led("Ceiling light", (1.0, 0.9, 0.78), 8.0), M.dark_metal("Light trim")
    for k in range(-2, 4):
        box(f"Linear trim {k}", (0.08, 8.04, 0.012), (k * 1.8, -1.0, CEILING - 0.004), trim, 0)
        box(f"Linear light {k}", (0.05, 8, 0.012), (k * 1.8, -1.0, CEILING - 0.006), led, 0)
    planter("Planter", (-3.7, 2.6, 0))
    reception_desk("Reception", (4.3, 3.2, 0))


def world(opts):
    """The street seen through the glass and reflected in the steel: a photographed city (CC0 HDRI) when it
    is on disk, otherwise a physical sky. Returns True when the street needs modelling."""
    sc = bpy.context.scene
    w = bpy.data.worlds.new("World")
    sc.world = w
    if bpy.app.version < (5, 0, 0):  # node worlds are always on from Blender 5
        w.use_nodes = True
    nodes, links = w.node_tree.nodes, w.node_tree.links
    bg = nodes["Background"]
    path = opts["hdri"]
    if path and os.path.exists(path):
        coord = nodes.new("ShaderNodeTexCoord")
        mapping = nodes.new("ShaderNodeMapping")
        mapping.inputs["Rotation"].default_value = (0, 0, float(opts["hdri-rotation"]) * DEG)
        env = nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(os.path.abspath(path))
        links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
        links.new(mapping.outputs["Vector"], env.inputs["Vector"])
        links.new(env.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 1.0
        return False
    sky = nodes.new("ShaderNodeTexSky")
    for kind in ("NISHITA", "MULTIPLE_SCATTERING", "SINGLE_SCATTERING", "HOSEK_WILKIE"):
        try:
            sky.sky_type = kind
            break
        except TypeError:
            continue
    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False
    links.new(sky.outputs[0], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.5
    return True


def sun(elevation=17, azimuth=294):
    """Low afternoon sun from the left-front through the curtain wall: it rakes across the floor, throws the
    mullion shadows in long stripes and catches the gates' entry faces at a grazing angle."""
    bpy.ops.object.light_add(type="SUN", rotation=((90 - elevation) * DEG, 0, azimuth * DEG))
    lamp = bpy.context.object
    lamp.data.energy = 4.0
    lamp.data.angle = 0.53 * DEG  # the real sun's disc: crisp shadows that soften with distance
    lamp.data.color = (1.0, 0.93, 0.84)


def camera():
    """The visitor's eye, held level like an architectural photograph (verticals stay vertical); the frame is
    moved down with lens shift instead of tilting the camera."""
    bpy.ops.object.camera_add(location=(3.4, -3.7, 1.55))
    cam = bpy.context.object
    look_at(cam, (0.4, 0.6, 1.55))
    cam.data.lens = 28
    cam.data.shift_y = -0.07
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 4.0
    cam.data.dof.focus_distance = math.dist(cam.location, (0.8, -0.14, 0.6))
    bpy.context.scene.camera = cam


def render_settings(opts):
    sc = bpy.context.scene
    x, y = (int(v) for v in opts["res"].lower().split("x"))
    sc.render.resolution_x, sc.render.resolution_y = x, y
    sc.render.film_transparent = False
    transforms = [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items]
    sc.view_settings.view_transform = "AgX" if "AgX" in transforms else "Filmic"
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
        sc.cycles.sample_clamp_indirect = float(opts.get("clamp", "10"))
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
    street = world(opts)
    lobby(street)
    mats = default_materials()
    opening = float(opts["open"])
    speed_gate("Gate A", (0, 0, 0), opening, mats)
    speed_gate("Gate B", (W + 0.02, 0, 0), opening, mats)  # a second unit beside it, as in a lobby row
    if "no-sun" not in flags:
        sun()
    camera()
    render_settings(opts)
    if "no-finish" not in flags:
        photographic_finish(bpy.context.scene)
    if opts["save"]:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opts["save"]))
    if "no-render" in flags:
        print("LOOKTEST_BUILT", len(bpy.data.objects), "objects")
        return
    os.makedirs(os.path.dirname(os.path.abspath(opts["out"])), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print("LOOKTEST_RENDERED", opts["out"])


main()

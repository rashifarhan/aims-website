"""Look test: two MARS-B1200 speed gates in a daylit lobby corner.

Run on the Mac (never in the cloud session):
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine eevee     # ~1 min preview
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/looktest.py -- --engine cycles    # final still
Options: --samples N  --res 1600x1000  --exposure 0.5  --open 0.0..1.0  --out 3d/renders/looktest.png
         --mood day|dusk (dusk: blue-hour street, no sun, warm room lights)  --lights 8
         --hdri path (default 3d/assets/hdri/docklands_02_4k.hdr; a plain sky when missing)
         --hdri-rotation 24  --sun-elevation 13 (lower the HDRI's sun)  --no-finish (no bloom, vignette, grain)
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
from aims3d.hdri import find_sun, sun_lamp_rotation  # noqa: E402
from aims3d.render import parse_args, render_settings  # noqa: E402
from aims3d.speedgate import W, default_materials, speed_gate  # noqa: E402

# The room, in metres. The visitor walks along +Y through the gates, which stand in a row along X at y = 0.
X_WIN, Y_BACK, X_RIGHT, Y_FRONT, CEILING = -5.0, 4.5, 6.5, -6.5, 3.4


# Times of day. Each is a set of defaults the command line can still override.
MOODS = {
    "day": {},
    # Blue hour across the water (Poly Haven "Golden Bay", CC0): no sun, the lobby's own warm lights lead.
    "dusk": {
        "hdri": os.path.join(HERE, "assets", "hdri", "golden_bay_4k.hdr"),
        "hdri-rotation": "3",  # open water, the far shore's lights and most of the blue sky
        "sun": "none",
        "lights": "8",
        "grazer": "450",
        "exposure": "0.3",
        "out": os.path.join(HERE, "renders", "looktest-dusk.png"),
    },
}


def args():
    opts = {
        "engine": "cycles",
        "samples": "192",
        "res": "1600x1000",
        "exposure": "0.5",
        "open": "0",
        "out": os.path.join(HERE, "renders", "looktest.png"),
        "save": "",
        "hdri": os.path.join(HERE, "assets", "hdri", "docklands_02_4k.hdr"),
        # Turns the street so the sun comes from behind the visitor, through the entrance, and the window looks
        # across sunlit water at a glass office (a creek-side lobby, as AIMS's Deira showroom is).
        "hdri-rotation": "24",
        "sun-elevation": "13",  # lower than the photo's 35 deg so the sun reaches the oak wall (see sun())
        "sun": "hdri",  # "none" for dusk: an HDRI's brightest light may be a street lamp, not the sun
        "lights": "8",  # ceiling light strength; at dusk they carry the room
        "grazer": "0",  # watts of the warm light grazing down the oak slats from a ceiling slot
    }
    return parse_args(opts, MOODS)


def lobby(street, opts):
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
    led, trim = M.led("Ceiling light", (1.0, 0.86, 0.7), float(opts["lights"])), M.dark_metal("Light trim")
    for k in range(-2, 4):
        box(f"Linear trim {k}", (0.08, 8.04, 0.012), (k * 1.8, -1.0, CEILING - 0.004), trim, 0)
        box(f"Linear light {k}", (0.05, 8, 0.012), (k * 1.8, -1.0, CEILING - 0.006), led, 0)
    # A concealed warm light in a ceiling slot, grazing down the slats: invisible by day, the glow of the room
    # at dusk. The spread keeps it close to the wall so it rakes the slats instead of lighting the floor.
    if float(opts["grazer"]) > 0:
        bpy.ops.object.light_add(type="AREA", location=(cx, Y_BACK - 0.1, CEILING - 0.02))
        graze = bpy.context.object
        graze.data.shape = "RECTANGLE"
        graze.data.size, graze.data.size_y = sx - 0.4, 0.04
        graze.data.energy = float(opts["grazer"])
        graze.data.color = (1.0, 0.72, 0.45)
        graze.data.spread = 30 * DEG
        graze.rotation_euler = (-8 * DEG, 0, 0)  # tipped toward the wall
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
        bg.inputs["Strength"].default_value = 1.0
        found = find_sun(env.image)
        if found:  # clip the photographed sun out of the world light; the sun lamp carries it instead
            clip = nodes.new("ShaderNodeVectorMath")
            clip.operation = "MINIMUM"
            clip.inputs[1].default_value = (found["clip"],) * 3
            links.new(env.outputs["Color"], clip.inputs[0])
            links.new(clip.outputs["Vector"], bg.inputs["Color"])
            print("LOOKTEST_SUN", {k: (round(v, 3) if isinstance(v, float) else v) for k, v in found.items()})
        else:
            links.new(env.outputs["Color"], bg.inputs["Color"])
        return False, (found if opts["sun"] != "none" else None)
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
    return True, None


def sun(found, opts):
    """The sun lamp. With a sunny HDRI it shines from the photographed sun with its measured strength and
    colour, so shadows outside and inside agree. `--sun-elevation` may lower it (a photographer's cheat: a
    low sun reaches deeper into the lobby). Without one: a low afternoon sun from the left-front."""
    if opts["sun"] == "none":
        return
    if found:
        rgb = found["rgb"]
        top = max(rgb)
        elevation = float(opts["sun-elevation"]) if opts.get("sun-elevation") else found["elevation"]
        rot = sun_lamp_rotation(found["u"], elevation, float(opts["hdri-rotation"]))
        energy, colour = top, tuple(c / top for c in rgb)
    else:
        rot, energy, colour = (90 - 17, 0, 294), 4.0, (1.0, 0.93, 0.84)
    bpy.ops.object.light_add(type="SUN", rotation=tuple(a * DEG for a in rot))
    lamp = bpy.context.object
    lamp.data.energy = energy
    lamp.data.angle = 0.53 * DEG  # the real sun's disc: crisp shadows that soften with distance
    lamp.data.color = colour


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


def main():
    opts, flags = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    street, found = world(opts)
    lobby(street, opts)
    mats = default_materials()
    opening = float(opts["open"])
    speed_gate("Gate A", (0, 0, 0), opening, mats)
    speed_gate("Gate B", (W + 0.02, 0, 0), opening, mats)  # a second unit beside it, as in a lobby row
    if "no-sun" not in flags:
        sun(found, opts)
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

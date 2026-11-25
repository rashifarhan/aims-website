"""Device check: the models in a grey photo studio, to compare against AIMS's product photos before they go
into the homepage's spaces. Run on the Mac:

  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot parking
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot lobby
  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/devices.py -- --shot desk

Options: --samples 128  --res 1600x1000  --exposure 0  --open 0..1 (boom up, door open)  --zones 0..18
         --save 3d/renders/devices.blend  --no-render
"""

import math
import os
import sys

import bmesh
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from aims3d import materials as M  # noqa: E402
from aims3d.barrier import bgm_1030, pole_with_reader  # noqa: E402
from aims3d.build import DEG, box, empty, look_at  # noqa: E402
from aims3d.detector import zk_d3180s  # noqa: E402
from aims3d.door import alf_m560, glass_door  # noqa: E402
from aims3d.finish import photographic_finish  # noqa: E402
from aims3d.monitor import monitor  # noqa: E402
from aims3d.render import parse_args, render_settings  # noqa: E402
from aims3d.terminals import proface_x, speedface_v5l  # noqa: E402

# Camera (location, target, lens) per shot.
SHOTS = {
    "parking": {"cam": ((-2.6, -5.6, 1.5), (1.15, 0.0, 0.85), 35)},
    "lobby": {"cam": ((-1.4, -5.4, 1.55), (1.35, 0.0, 1.15), 30)},
    "desk": {"cam": ((0.12, -1.75, 1.2), (0.1, 0.15, 0.9), 40)},
}


def args():
    opts = {
        "shot": "parking",
        "engine": "cycles",
        "samples": "128",
        "res": "1600x1000",
        "exposure": "0",
        "open": "0",
        "zones": "0",
        "save": "",
    }
    opts, flags = parse_args(opts, {k: {"shot": k} for k in SHOTS})
    opts.setdefault("out", os.path.join(HERE, "renders", f"devices-{opts['shot']}.png"))
    return opts, flags


def cyclorama(width=60.0, depth=20.0, height=10.0, radius=2.5, back=6.0):
    """A seamless studio sweep: floor curving up into a back wall, so there is no horizon line."""
    profile = [(y, 0.0) for y in (-depth + back, back - radius)]
    for k in range(1, 16):
        a = k / 16 * math.pi / 2
        profile.append((back - radius + radius * math.sin(a), radius - radius * math.cos(a)))
    profile.append((back, height))
    bm = bmesh.new()
    rows = []
    for y, z in profile:
        rows.append((bm.verts.new((-width / 2, y, z)), bm.verts.new((width / 2, y, z))))
    for (a0, a1), (b0, b1) in zip(rows, rows[1:]):
        bm.faces.new((a0, a1, b1, b0))
    mesh = bpy.data.meshes.new("Cyclorama")
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new("Cyclorama", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(M.plaster("Studio grey", (0.42, 0.42, 0.42)))
    return obj


def studio_lights():
    """A large soft key from the front-left, a fill from the right and a strip from behind for the edges:
    the steel, glass and black gloss read by what they reflect, so the sources are big."""
    sc = bpy.context.scene
    world = bpy.data.worlds.new("Studio")
    sc.world = world
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.5, 0.5, 0.5, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.12
    for name, loc, size, energy in (
        ("Key", (-4.0, -4.0, 4.0), (4.0, 3.0), 900),
        ("Fill", (5.0, -3.5, 2.5), (3.0, 3.0), 250),
        ("Rim", (1.0, 4.5, 4.5), (6.0, 1.0), 600),
    ):
        bpy.ops.object.light_add(type="AREA", location=loc)
        lamp = bpy.context.object
        lamp.name = name
        lamp.data.shape = "RECTANGLE"
        lamp.data.size, lamp.data.size_y = size
        lamp.data.energy = energy
        look_at(lamp, (1.0, 0.0, 1.0))


def shot_parking(opts):
    bgm_1030("BGM-1030", (0, 0, 0), boom_open=float(opts["open"]))
    pole_with_reader("UHF10 pole", (-0.75, -0.55, 0), facing_deg=-20)


def shot_lobby(opts):
    zk_d3180s("ZK-D3180S", (0, 0, 0), zones_lit=int(opts["zones"]))
    # Door, wall and terminal turned toward the camera, so the glass mirrors the studio rather than the key.
    group = empty("Door group", (1.3, 0.4, 0))
    group.rotation_euler = (0, 0, -20 * DEG)
    glass_door("Office door", (0, 0, 0), open_deg=70 * float(opts["open"])).parent = group
    box("Door wall", (0.5, 0.15, 2.4), (1.3, 0, 1.2), M.plaster("Wall", (0.62, 0.6, 0.56)), 0.004, parent=group)
    proface_x("ProFace X", (1.3, -0.075 - 0.013, 1.45)).parent = group


def shot_desk(opts):
    desk = M.plastic("Desk laminate", (0.55, 0.54, 0.52), 0.35)
    box("Desk", (1.8, 0.8, 0.04), (0.0, 0.15, 0.73), desk, 0.003)
    box("Desk leg L", (0.04, 0.7, 0.71), (-0.86, 0.15, 0.355), M.dark_metal("Desk legs"), 0.002)
    box("Desk leg R", (0.04, 0.7, 0.71), (0.86, 0.15, 0.355), M.dark_metal("Desk legs 2"), 0.002)
    monitor("Monitor", (-0.42, 0.25, 0.75))
    # The terminals stand on small display blocks, as in a showroom, tilted back slightly.
    stand = M.plastic("Display block", (0.75, 0.75, 0.74), 0.5)
    for name, x, build, h in (("ProFace X", 0.16, proface_x, 0.227), ("SpeedFace V5L", 0.42, speedface_v5l, 0.203)):
        box(f"{name} block", (0.12, 0.08, 0.04), (x, 0.02, 0.77), stand, 0.004)
        dev = build(name, (x, 0.0, 0.79 + h / 2 * math.cos(8 * DEG)))
        dev.rotation_euler = (-8 * DEG, 0, 0)
    lock = alf_m560("ALF-M560", (0.66, -0.06, 0.75 + 0.024))
    lock.rotation_euler = (0, 0, 8 * DEG)


def camera(shot):
    loc, target, lens = SHOTS[shot]["cam"]
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object
    look_at(cam, target)
    cam.data.lens = lens
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 8.0 if shot != "desk" else 5.6
    cam.data.dof.focus_distance = math.dist(loc, target)
    bpy.context.scene.camera = cam


def main():
    opts, flags = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    cyclorama()
    studio_lights()
    {"parking": shot_parking, "lobby": shot_lobby, "desk": shot_desk}[opts["shot"]](opts)
    camera(opts["shot"])
    render_settings(opts)
    photographic_finish(bpy.context.scene, vignette=0.2)
    if opts["save"]:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opts["save"]))
    if "no-render" in flags:
        print("DEVICES_BUILT", len(bpy.data.objects), "objects")
        return
    os.makedirs(os.path.dirname(os.path.abspath(opts["out"])), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print("DEVICES_RENDERED", opts["out"])


main()

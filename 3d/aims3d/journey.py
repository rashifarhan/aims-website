"""The visitor's journey: one camera move through the building and every device's motion, keyframed on a
single 60-second timeline (24 fps) that the homepage will map to scroll.

The camera is the visitor's eye, kept level (it tracks a target at about its own height and frames with
lens shift), so verticals stay vertical as in an architectural photograph. Between the ground floor and
floor 11 it rides the lift: the doors close in front of it and, while the frame is only closed steel, it
jumps 42 m up (a hidden cut), so the journey is one unbroken take.

CHAPTERS gives each chapter's frame range; the web scroll uses the same table.
"""

import math

import bpy

from .build import empty
from .tower import OFFICE_FLOOR, floor_z

FPS, END = 24, 1440
Z1 = floor_z(OFFICE_FLOOR)

CHAPTERS = {  # name: (first frame, last frame)
    "hero": (1, 96),
    "parking": (97, 336),
    "lobby": (337, 830),
    "office": (831, 1110),
    "clockin": (1111, 1250),
    "finale": (1251, END),
}

# (frame, camera location, target location, lens mm, vertical shift). Keys are eased by Blender's default
# Bezier; the pair at 831/832 is the lift's hidden cut (constant, so the camera jumps between them).
CAMERA = [
    (1, (-32.0, -72.0, 1.7), (-2.0, 0.0, 1.7), 18, 0.2),
    (96, (-26.0, -60.0, 1.7), (-1.0, 0.0, 1.7), 18, 0.2),
    (156, (-5.0, -40.0, 6.0), (5.0, 0.0, 2.0), 22, 0.05),
    (216, (12.6, -17.0, 1.25), (10.2, 0.0, 1.2), 26, -0.03),
    (300, (11.8, -6.0, 1.25), (10.5, 2.0, 1.25), 26, -0.03),
    (336, (11.6, -4.6, 1.25), (10.0, 0.0, 2.1), 26, -0.03),  # look up at the raised boom
    (396, (5.0, -6.5, 1.6), (0.0, -1.0, 1.6), 24, -0.03),
    (446, (0.0, -4.5, 1.6), (0.0, 2.0, 1.6), 24, -0.03),
    (480, (0.0, 0.8, 1.6), (0.0, 8.0, 1.6), 24, -0.05),
    (560, (0.0, 3.6, 1.6), (-0.3, 9.0, 1.55), 24, -0.05),
    (600, (-0.5, 5.6, 1.6), (-0.79, 9.5, 1.0), 24, -0.05),  # down to Gate A's flaps as they open
    (650, (-0.79, 8.0, 1.6), (-1.0, 13.0, 1.5), 24, -0.05),
    (700, (-1.2, 12.5, 1.6), (-1.4, 16.0, 1.5), 24, -0.05),
    (750, (-1.4, 15.4, 1.6), (-1.4, 19.0, 1.5), 24, -0.05),
    (780, (-1.4, 17.3, 1.6), (-0.2, 17.6, 1.5), 22, -0.05),
    (800, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (831, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (832, (-1.4, 17.4, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (870, (-1.4, 17.2, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (900, (-1.4, 15.4, Z1 + 1.6), (-1.0, 12.0, Z1 + 1.5), 24, -0.05),
    (940, (-0.3, 13.8, Z1 + 1.6), (0.2, 9.0, Z1 + 1.5), 24, -0.05),
    (1010, (0.0, 10.4, Z1 + 1.6), (0.7, 9.0, Z1 + 1.45), 26, -0.05),
    (1080, (0.0, 9.9, Z1 + 1.6), (0.0, 6.0, Z1 + 1.5), 24, -0.05),
    (1110, (0.0, 8.4, Z1 + 1.6), (0.8, 6.5, Z1 + 1.45), 24, -0.05),
    (1150, (1.75, 8.0, Z1 + 1.55), (1.9, 7.3, Z1 + 1.4), 30, -0.03),
    (1210, (1.7, 8.1, Z1 + 1.55), (1.0, 6.0, Z1 + 1.3), 28, -0.03),
    (1290, (0.75, 2.0, Z1 + 1.6), (0.75, -50.0, Z1 + 1.0), 24, 0.0),
    (1330, (0.75, -1.5, Z1 + 2.2), (0.75, -100.0, Z1), 24, 0.0),
    (END, (0.75, -60.0, Z1 + 18.0), (0.0, -800.0, 60.0), 24, 0.0),  # hold on the horizon, not the roofs
]
CUT = 831  # the last ground-floor key; held constant so the camera jumps to 832 inside the closed lift


def fcurves(id_data):
    """An ID's F-curves, on Blender versions with and without layered actions (slots and channel bags)."""
    ad = id_data.animation_data
    if ad is None or ad.action is None:
        return []
    act = ad.action
    if hasattr(act, "fcurves") and len(getattr(act, "fcurves", [])):
        return act.fcurves
    from bpy_extras import anim_utils

    bag = anim_utils.action_get_channelbag_for_slot(act, ad.action_slot)
    return bag.fcurves if bag else []


def _key(owner, path, frame, value):
    setattr(owner, path, value)
    owner.keyframe_insert(path, frame=frame)


def _key_socket(socket, frame, value):
    socket.default_value = value
    socket.keyframe_insert("default_value", frame=frame)


def _ramp(owner, path, frames_values):
    for frame, value in frames_values:
        _key(owner, path, frame, value)


def camera_rig():
    """A level camera that tracks a target empty; both fly the CAMERA keys."""
    bpy.ops.object.camera_add(location=CAMERA[0][1])
    cam = bpy.context.object
    cam.name = "Journey camera"
    cam.data.clip_end = 3000
    target = empty("Journey target", CAMERA[0][2])
    track = cam.constraints.new("TRACK_TO")
    track.target, track.track_axis, track.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    for frame, loc, tgt, lens, shift in CAMERA:
        _key(cam, "location", frame, loc)
        _key(target, "location", frame, tgt)
        _key(cam.data, "lens", frame, lens)
        _key(cam.data, "shift_y", frame, shift)
    for owner in (cam, target):
        for fc in fcurves(owner):
            for kp in fc.keyframe_points:
                if round(kp.co.x) == CUT:
                    kp.interpolation = "CONSTANT"
    bpy.context.scene.camera = cam
    return cam


def _obj(name):
    obj = bpy.data.objects.get(name)
    if obj is None:
        raise KeyError(f"journey: no object named {name!r} in the scene")
    return obj


def _slide(name, axis, frames_offsets):
    obj = _obj(name)
    start = obj.location[axis]
    for frame, offset in frames_offsets:
        obj.location[axis] = start + offset
        obj.keyframe_insert("location", index=axis, frame=frame)


def _turn(name, axis, frames_degrees):
    obj = _obj(name)
    for frame, deg in frames_degrees:
        obj.rotation_euler[axis] = math.radians(deg)
        obj.keyframe_insert("rotation_euler", index=axis, frame=frame)


def _glow(material_name, frames_strengths, colour=None):
    mat = bpy.data.materials[material_name]
    p = mat.node_tree.nodes["Principled BSDF"]
    if colour:
        p.inputs["Emission Color"].default_value = (*colour, 1)
    for frame, strength in frames_strengths:
        _key_socket(p.inputs["Emission Strength"], frame, strength)


def detector_sweep(start, step=2, strength=3.5):
    """Light the ZK-D3180S's zones from the floor up as the visitor walks through: each lamp gets its own
    green material, keyed dark until its turn, then lit and left lit (a clear pass)."""
    from . import materials as M

    order = []
    for k in range(6):  # post lamps, both sides together, floor up
        order.append([f"ZK-D3180S zone -1{k}", f"ZK-D3180S zone 1{k}"])
    panel = [f"ZK-D3180S led {r}{c}" for r in range(3) for c in range(6)]
    for i, names in enumerate(order):
        names.extend(panel[i * 3:(i + 1) * 3])
        frame = start + i * step * 3
        for name in names:
            mat = M.led(f"{name} lamp", (0.12, 1.0, 0.25), 0.0)
            obj = _obj(name)
            obj.data.materials.clear()
            obj.data.materials.append(mat)
            _glow(mat.name, ((frame - 1, 0.0), (frame + 1, strength)))


def devices():
    """Every device's motion on the shared timeline."""
    _turn("BGM-1030 boom pivot", 1, ((290, 0), (326, -90)))  # BGM-1030 opens in about 1.5 s (catalogue)
    _slide("Sliding leaf -1", 0, ((430, 0), (460, -1.5)))
    _slide("Sliding leaf 1", 0, ((430, 0), (460, 1.5)))
    detector_sweep(500)  # lights while the visitor approaches, so the lit posts frame the view
    for side in (-1, 1):  # Gate A's flaps swing open ahead of the visitor and close behind
        _turn(f"Gate A flap pivot {side}", 2, ((575, 0), (599, -side * 90), (670, -side * 90), (694, 0)))
    for side, name in ((-1, "Lobby lift leaf 0-1"), (1, "Lobby lift leaf 01")):
        _slide(name, 0, ((690, 0), (720, side * 0.55), (800, side * 0.55), (830, 0)))
    for side, name in ((-1, "Office lift leaf 0-1"), (1, "Office lift leaf 01")):
        _slide(name, 0, ((840, 0), (870, side * 0.55)))
    _glow("ProFace X verified", ((1014, 0.0), (1018, 4.0), (1100, 4.0), (1120, 0.0)))
    _turn("Office door leaf", 2, ((1040, 0), (1080, -95)))
    _glow("SpeedFace V5L light bar", ((1138, 0.0), (1146, 3.0)), colour=(0.95, 0.97, 1.0))
    _glow("SpeedFace V5L verified", ((1158, 0.0), (1162, 4.0)))


# One grade across the film: the same view transform and look throughout, with exposure eased between
# chapters (night street, lit lobby, lit office, out into the dusk) so each reads without a jump.
EXPOSURE = ((1, 0.0), (180, 0.0), (240, 0.3), (430, 0.3), (480, 0.25), (832, 0.25), (870, 0.35), (1250, 0.35), (1320, 0.1), (END, 0.0))


def build():
    scene = bpy.context.scene
    scene.render.fps = FPS
    scene.frame_start, scene.frame_end = 1, END
    cam = camera_rig()
    devices()
    for frame, ev in EXPOSURE:
        _key(scene.view_settings, "exposure", frame, ev)
    return cam

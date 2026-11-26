"""The visitor's journey: one camera move through the building and every device's motion, keyframed on a
single 80-second timeline (24 fps) that the homepage will map to scroll.

The camera is the visitor's eye. Between places it walks, level, at eye height; at each product it slows into
a beat: the device fills the frame, the camera arcs a little round it, focus goes shallow so the device stands
off its background, an accent light fades up on it, and the device does its job while it is framed. Between
the ground floor and floor 11 the camera rides the lift: the doors close in front of it and, while the frame is
only closed steel, it jumps 42 m up (a hidden cut), so the journey is one unbroken take.

CHAPTERS and PRODUCTS give the frame ranges the web scroll and its overlays use.
"""

import math

import bpy

from .build import empty, look_at
from .tower import OFFICE_FLOOR, floor_z

FPS, END = 24, 1920
Z1 = floor_z(OFFICE_FLOOR)

CHAPTERS = {  # name: (first frame, last frame)
    "hero": (1, 215),
    "parking": (216, 559),
    "lobby": (560, 1051),
    "office": (1052, 1439),
    "clockin": (1440, 1700),
    "finale": (1701, END),
}

# Each product's beat: its frames, where it stands (focus and accent light aim there), and its catalogue
# slug for the overlay that names it. The attendance screen's BioTime edition is AIMS's to name (the
# catalogue lists four), so it has no slug yet.
PRODUCTS = {
    "UHF10": {"frames": (216, 300), "at": (9.1, -3.4, 2.05), "slug": "uhf-10", "light": ((8.0, -5.2, 2.7), 60)},
    "BGM-1030": {"frames": (300, 420), "at": (9.2, -1.55, 0.75), "slug": "barrier-gates-zkteco-bgm-1030", "light": ((10.7, -3.4, 2.3), 90)},
    "ZK-D3180S": {"frames": (580, 715), "at": (0.0, 3.6, 1.15), "slug": "zk-d3180s", "light": ((1.6, 1.4, 3.3), 160)},
    "MARS-B1200": {"frames": (755, 850), "at": (-0.4, 8.0, 0.65), "slug": "zkteco-mars-b1200-double-swing-barrier-gate", "light": ((0.9, 6.3, 2.7), 160)},
    "ProFace X": {"frames": (1190, 1285), "at": (1.05, 9.06, Z1 + 1.45), "slug": "proface-x", "light": ((0.3, 10.1, Z1 + 2.2), 25)},
    "ALF-M560": {"frames": (1340, 1430), "at": (-0.345, 8.96, Z1 + 2.17), "slug": "alf-m560-electromagnetic-locks", "light": ((0.25, 7.95, Z1 + 1.3), 25)},
    "SpeedFace V5L": {"frames": (1445, 1560), "at": (1.9, 7.3, Z1 + 1.4), "slug": "speedface-v5l-p", "light": ((1.25, 8.2, Z1 + 2.0), 25)},
    "Attendance screen": {"frames": (1580, 1670), "at": (-0.6, 5.55, Z1 + 1.36), "slug": None, "light": None},
}

# (frame, camera location, target location, lens mm, vertical shift). Keys are eased by Blender's default
# Bezier; CUT and CUT + 1 are the lift's hidden cut (constant, so the camera jumps between them).
CAMERA = [
    (1, (-32.0, -72.0, 1.7), (-2.0, 0.0, 1.7), 18, 0.2),
    (96, (-26.0, -60.0, 1.7), (-1.0, 0.0, 1.7), 18, 0.2),
    (156, (-5.0, -40.0, 6.0), (5.0, 0.0, 2.0), 22, 0.05),
    (216, (8.3, -5.3, 1.75), (9.1, -3.4, 2.0), 35, 0.0),  # beat: UHF10 reads the car's tag
    (290, (9.2, -5.4, 1.85), (9.1, -3.4, 2.0), 35, 0.0),
    (320, (10.2, -4.2, 1.2), (9.3, -1.5, 0.85), 32, 0.0),  # beat: BGM-1030, then follow the boom up
    (345, (10.3, -4.3, 1.2), (9.3, -1.5, 0.95), 32, 0.0),
    (385, (10.4, -5.6, 1.4), (9.4, -1.4, 1.9), 26, 0.0),  # cabinet and raised boom in one frame
    (420, (10.5, -5.8, 1.4), (9.4, -1.4, 2.0), 26, 0.0),
    (470, (5.0, -6.5, 1.6), (0.0, -1.0, 1.6), 24, -0.03),
    (520, (0.0, -4.5, 1.6), (0.0, 2.0, 1.6), 24, -0.03),
    (565, (0.0, 0.6, 1.5), (0.0, 3.6, 1.2), 24, -0.03),
    (590, (0.9, 0.9, 1.3), (0.0, 3.6, 1.15), 22, 0.0),  # beat: ZK-D3180S lights floor-up
    (680, (-0.7, 1.0, 1.3), (0.0, 3.6, 1.15), 22, 0.0),
    (720, (0.0, 3.6, 1.6), (0.2, 8.0, 1.3), 24, -0.03),
    (760, (0.6, 6.0, 1.35), (-0.4, 8.0, 0.65), 30, 0.0),  # beat: MARS-B1200 flaps open
    (820, (-0.2, 6.2, 1.4), (-0.6, 8.0, 0.7), 30, 0.0),
    (845, (-0.79, 6.9, 1.6), (-0.9, 11.0, 1.4), 24, -0.03),
    (870, (-0.79, 8.0, 1.6), (-1.0, 13.0, 1.5), 24, -0.05),
    (920, (-1.2, 12.5, 1.6), (-1.4, 16.0, 1.5), 24, -0.05),
    (970, (-1.4, 15.4, 1.6), (-1.4, 19.0, 1.5), 24, -0.05),
    (1000, (-1.4, 17.3, 1.6), (-0.2, 17.6, 1.5), 22, -0.05),
    (1020, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (1051, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (1052, (-1.4, 17.4, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (1090, (-1.4, 17.2, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (1120, (-1.4, 15.4, Z1 + 1.6), (-1.0, 12.0, Z1 + 1.5), 24, -0.05),
    (1160, (-0.3, 13.8, Z1 + 1.6), (0.2, 9.0, Z1 + 1.5), 24, -0.05),
    (1200, (0.45, 10.3, Z1 + 1.55), (1.05, 9.06, Z1 + 1.45), 40, 0.0),  # beat: ProFace X matches the face
    (1275, (0.7, 10.1, Z1 + 1.5), (1.05, 9.06, Z1 + 1.45), 40, 0.0),
    (1305, (0.0, 9.9, Z1 + 1.6), (0.0, 6.0, Z1 + 1.5), 26, -0.03),
    (1335, (0.05, 8.3, Z1 + 1.6), (-0.2, 7.0, Z1 + 1.7), 26, 0.0),
    (1360, (0.05, 8.1, Z1 + 1.75), (-0.345, 8.96, Z1 + 2.17), 50, 0.0),  # beat: ALF-M560 under the header
    (1425, (0.25, 8.05, Z1 + 1.7), (-0.345, 8.96, Z1 + 2.17), 50, 0.0),
    (1455, (1.75, 8.0, Z1 + 1.55), (1.9, 7.3, Z1 + 1.4), 32, 0.0),  # beat: SpeedFace V5L clocks the visitor in
    (1545, (1.55, 8.05, Z1 + 1.5), (1.9, 7.3, Z1 + 1.38), 32, 0.0),
    (1590, (-0.05, 6.75, Z1 + 1.5), (-0.6, 5.55, Z1 + 1.36), 40, 0.0),  # beat: the entry on the attendance screen
    (1665, (-0.2, 6.45, Z1 + 1.45), (-0.6, 5.55, Z1 + 1.36), 40, 0.0),
    (1690, (0.9, 6.5, Z1 + 1.6), (1.0, 2.0, Z1 + 1.5), 26, -0.03),  # round the counter's free end
    (1715, (1.2, 5.0, Z1 + 1.6), (0.75, -20.0, Z1 + 1.3), 24, 0.0),
    (1760, (0.75, 2.0, Z1 + 1.6), (0.75, -50.0, Z1 + 1.0), 24, 0.0),
    (1800, (0.75, -1.5, Z1 + 2.2), (0.75, -100.0, Z1), 24, 0.0),
    (END, (0.75, -60.0, Z1 + 18.0), (0.0, -800.0, 60.0), 24, 0.0),  # hold on the horizon, not the roofs
]
CUT = 1051  # the last ground-floor key; held constant so the camera jumps to 1052 inside the closed lift


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
    """Every device's motion on the shared timeline, each inside its product beat."""
    _turn("BGM-1030 boom pivot", 1, ((345, 0), (381, -90)))  # BGM-1030 opens in about 1.5 s (catalogue)
    _slide("Sliding leaf -1", 0, ((515, 0), (545, -1.5)))
    _slide("Sliding leaf 1", 0, ((515, 0), (545, 1.5)))
    detector_sweep(610)
    for side in (-1, 1):  # Gate A's flaps swing open in the beat and close behind the visitor
        _turn(f"Gate A flap pivot {side}", 2, ((770, 0), (794, -side * 90), (890, -side * 90), (914, 0)))
    for side, name in ((-1, "Lobby lift leaf 0-1"), (1, "Lobby lift leaf 01")):
        _slide(name, 0, ((905, 0), (935, side * 0.55), (1020, side * 0.55), (1050, 0)))
    for side, name in ((-1, "Office lift leaf 0-1"), (1, "Office lift leaf 01")):
        _slide(name, 0, ((1060, 0), (1090, side * 0.55)))
    _glow("ProFace X verified", ((1236, 0.0), (1240, 4.0), (1330, 4.0), (1350, 0.0)))
    _turn("Office door leaf", 2, ((1285, 0), (1325, -95)))
    _glow("SpeedFace V5L light bar", ((1470, 0.0), (1478, 3.0)), colour=(0.95, 0.97, 1.0))
    _glow("SpeedFace V5L verified", ((1490, 0.0), (1494, 4.0)))


def product_beats(cam):
    """Shallow focus and an accent light for each product's beat. Focus follows the camera's target, which
    sits on the product during its beat; the aperture opens to f/2.8 in the beat and closes to f/8 between."""
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = _obj("Journey target")
    stops = [(1, 8.0)]
    for name, beat in PRODUCTS.items():
        f0, f1 = beat["frames"]
        stops += [(f0 - 12, 8.0), (f0 + 6, 2.8), (f1 - 6, 2.8), (f1 + 12, 8.0)]
        if beat["light"]:
            loc, watts = beat["light"]
            bpy.ops.object.light_add(type="SPOT", location=loc)
            spot = bpy.context.object
            spot.name = f"Accent {name}"
            look_at(spot, beat["at"])
            spot.data.spot_size, spot.data.spot_blend = math.radians(35), 0.6
            spot.data.color = (1.0, 0.95, 0.9)
            _ramp(spot.data, "energy", ((f0 - 15, 0.0), (f0 + 10, watts), (f1 - 10, watts), (f1 + 15, 0.0)))
    for frame, fstop in sorted(stops):
        _key(cam.data.dof, "aperture_fstop", frame, fstop)


# One grade across the film: the same view transform and look throughout, with exposure eased between
# chapters (night street, lit lobby, lit office, out into the dusk) so each reads without a jump.
EXPOSURE = ((1, 0.0), (180, 0.0), (240, 0.3), (510, 0.3), (560, 0.25), (1052, 0.25), (1090, 0.35), (1700, 0.35), (1790, 0.1), (END, 0.0))


def build():
    scene = bpy.context.scene
    scene.render.fps = FPS
    scene.frame_start, scene.frame_end = 1, END
    cam = camera_rig()
    devices()
    product_beats(cam)
    for frame, ev in EXPOSURE:
        _key(scene.view_settings, "exposure", frame, ev)
    return cam

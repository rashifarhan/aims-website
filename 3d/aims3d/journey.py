"""The visitor's journey: one camera move through the building and every device's motion, keyframed on a
single 54-second timeline (24 fps) that the homepage will map to scroll.

The camera is the visitor's eye. Between places it walks, level, at eye height; at each product it slows into
a beat: the device fills the frame, the camera arcs a little round it, focus goes shallow so the device stands
off its background, an accent light fades up on it, and the device does its job while it is framed. Between
the ground floor and floor 11 the camera rides the lift: the doors close in front of it and, while the frame is
only closed steel, it jumps 42 m up (a hidden cut), so the journey is one unbroken take.

CHAPTERS, TOPICS and PRODUCTS give the frame ranges and words the web scroll and its overlays use.
"""

import math

import bpy

from .build import empty, look_at
from .tower import OFFICE_FLOOR, floor_z

FPS, END = 24, 1300
Z1 = floor_z(OFFICE_FLOOR)

CHAPTERS = {  # name: (first frame, last frame)
    "hero": (1, 215),
    "parking": (216, 450),
    "lobby": (451, 791),
    "office": (792, 1079),
    "clockin": (1080, 1180),
    "software": (1181, END),
}

# What each chapter answers, in AIMS's own search topics (supplied by the user, 26 Nov), for the overlay
# headings and the page's metadata. "Distributor" wording follows the claims policy in src/lib/site.ts.
TOPICS = {
    "hero": ("ZKTeco Distributor in UAE", "ZKTeco Distributor in Dubai", "ZKTeco Distributor in Abu Dhabi"),
    "parking": ("Parking Barrier Suppliers UAE",),
    "lobby": ("Metal Detector Machines UAE", "Security Gate Suppliers in UAE", "Turnstile Suppliers in Dubai"),
    "office": ("Door Access Control Systems UAE", "Access Control Systems", "ZKTeco Biometric Devices"),
    "clockin": ("Face recognition Attendance", "Time Attendance Machines"),
    "software": ("BioTime Software and integration Solutions", "ZKTeco Attendance Software UAE"),
}

# One product per category (user, 26 Nov: "from each category only one product is enough"). Each beat: its
# frames, where the product stands (focus, accent light and the web's tracked line aim there), its catalogue slug.
# Software is its own category (user, 26 Nov): BioTime 9.5 on the attendance screen. The UHF10, ZK-D3180S and
# ALF-M560 stay in the building, unfeatured.
PRODUCTS = {
    "BGM-1030": {"frames": (216, 336), "at": (9.2, -1.55, 0.75), "slug": "barrier-gates-zkteco-bgm-1030", "light": ((10.7, -3.4, 2.3), 90)},
    "MARS-B1200": {"frames": (520, 620), "at": (-0.4, 8.0, 0.65), "slug": "zkteco-mars-b1200-double-swing-barrier-gate", "light": ((0.9, 6.3, 2.7), 160)},
    "ProFace X": {"frames": (930, 1030), "at": (1.05, 9.06, Z1 + 1.45), "slug": "proface-x", "light": ((0.3, 10.1, Z1 + 2.2), 25)},
    "SpeedFace V5L": {"frames": (1080, 1180), "at": (1.9, 7.3, Z1 + 1.4), "slug": "speedface-v5l-p", "light": ((1.25, 8.2, Z1 + 2.0), 25)},
    "BioTime 9.5": {"frames": (1200, 1300), "at": (-0.6, 5.55, Z1 + 1.36), "slug": "biotime-9-5", "light": None},
}

# (frame, camera location, target location, lens mm, vertical shift). Keys are eased by Blender's default
# Bezier; CUT and CUT + 1 are the lift's hidden cut (constant, so the camera jumps between them). Each close-up
# frames its product on the left third (target shifted right of it by distance x 6 / lens), leaving the right
# two thirds for the web's card.
CAMERA = [
    (1, (-32.0, -72.0, 1.7), (-2.0, 0.0, 1.7), 18, 0.2),
    (96, (-26.0, -60.0, 1.7), (-1.0, 0.0, 1.7), 18, 0.2),
    (156, (-5.0, -40.0, 6.0), (5.0, 0.0, 2.0), 22, 0.05),
    (216, (10.6, -5.9, 1.45), (9.9, -1.5, 1.0), 28, 0.0),  # BGM-1030 whole, by the kerb
    (250, (9.55, -2.7, 0.97), (9.43, -1.5, 0.84), 40, 0.0),  # push in: the lit face, product on the left third
    (268, (9.6, -2.75, 0.98), (9.45, -1.5, 0.86), 40, 0.0),
    (300, (10.4, -5.6, 1.4), (10.0, -1.4, 1.9), 26, 0.0),  # pull back as the boom rises
    (336, (10.5, -5.8, 1.4), (10.05, -1.4, 2.0), 26, 0.0),
    (380, (5.0, -6.5, 1.6), (0.0, -1.0, 1.6), 24, -0.03),
    (420, (0.0, -4.5, 1.6), (0.0, 2.0, 1.6), 24, -0.03),
    (450, (0.0, 0.8, 1.6), (0.0, 8.0, 1.6), 24, -0.05),
    (500, (0.0, 3.6, 1.6), (0.1, 8.0, 1.4), 24, -0.03),
    (520, (0.6, 6.0, 1.35), (-0.4, 8.0, 0.65), 30, 0.0),  # MARS-B1200 row whole
    (545, (0.1, 6.95, 1.2), (-0.21, 8.09, 0.75), 35, 0.0),  # push in: cap, LED strip, flaps; left third
    (590, (-0.1, 7.0, 1.2), (-0.26, 8.09, 0.75), 35, 0.0),
    (605, (-0.79, 6.9, 1.6), (-0.9, 11.0, 1.4), 24, -0.03),
    (630, (-0.79, 8.0, 1.6), (-1.0, 13.0, 1.5), 24, -0.05),
    (670, (-1.2, 12.5, 1.6), (-1.4, 16.0, 1.5), 24, -0.05),
    (715, (-1.4, 15.4, 1.6), (-1.4, 19.0, 1.5), 24, -0.05),
    (740, (-1.4, 17.3, 1.6), (-0.2, 17.6, 1.5), 22, -0.05),
    (760, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (791, (-1.4, 17.4, 1.6), (-1.4, 14.0, 1.5), 22, -0.05),
    (792, (-1.4, 17.4, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (830, (-1.4, 17.2, Z1 + 1.6), (-1.4, 14.0, Z1 + 1.5), 22, -0.05),
    (860, (-1.4, 15.4, Z1 + 1.6), (-1.0, 12.0, Z1 + 1.5), 24, -0.05),
    (900, (-0.3, 13.8, Z1 + 1.6), (0.2, 9.0, Z1 + 1.5), 24, -0.05),
    (930, (0.45, 10.3, Z1 + 1.55), (1.05, 9.06, Z1 + 1.45), 40, 0.0),  # ProFace X on its panel
    (955, (0.92, 9.66, Z1 + 1.47), (0.977, 9.06, Z1 + 1.45), 50, 0.0),  # push in: face-on; left third
    (1000, (0.86, 9.7, Z1 + 1.47), (0.94, 9.06, Z1 + 1.45), 50, 0.0),
    (1040, (0.0, 9.9, Z1 + 1.6), (0.0, 6.0, Z1 + 1.5), 26, -0.03),
    (1065, (0.05, 8.3, Z1 + 1.6), (0.8, 6.5, Z1 + 1.45), 26, 0.0),
    (1080, (1.75, 8.0, Z1 + 1.55), (1.9, 7.3, Z1 + 1.4), 32, 0.0),  # SpeedFace V5L on its stand
    (1105, (1.82, 7.88, Z1 + 1.42), (1.83, 7.3, Z1 + 1.39), 50, 0.0),  # push in; left third
    (1160, (1.76, 7.9, Z1 + 1.41), (1.77, 7.3, Z1 + 1.39), 50, 0.0),
    (1200, (-0.05, 6.75, Z1 + 1.5), (-0.6, 5.55, Z1 + 1.36), 40, 0.0),  # BioTime 9.5 on the attendance screen
    (1225, (-0.28, 6.23, Z1 + 1.4), (-0.7, 5.6, Z1 + 1.36), 40, 0.0),  # push in: the dashboard; left third
    (1270, (-0.25, 6.2, Z1 + 1.4), (-0.67, 5.6, Z1 + 1.36), 40, 0.0),
    # The film ends on the last product (user, 26 Nov: "it should directly reach our system, not the skyline"):
    # the next gesture leaves the film for "Your system" on the page.
    (END, (-0.24, 6.19, Z1 + 1.4), (-0.67, 5.6, Z1 + 1.36), 40, 0.0),
]
CUT = 791  # the last ground-floor key; held constant so the camera jumps to 792 inside the closed lift

# The "access granted" moments, each the frame a device finishes saying yes; the web pulses green on each.
MOMENTS = {"Boom up": 306, "Gate open": 569, "Face matched": 969, "Clocked in": 1119}
LIFT = (760, 830)  # doors closing on the lobby to doors open on floor 11: the web counts the floors


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
    """Every device's motion on the shared timeline; the featured four do theirs inside their beats."""
    _turn("BGM-1030 boom pivot", 1, ((270, 0), (306, -90)))  # BGM-1030 opens in about 1.5 s (catalogue)
    _slide("Sliding leaf -1", 0, ((400, 0), (430, -1.5)))
    _slide("Sliding leaf 1", 0, ((400, 0), (430, 1.5)))
    detector_sweep(470)  # lights as the visitor walks through
    for side in (-1, 1):  # Gate A's flaps swing open in the beat and close behind the visitor
        _turn(f"Gate A flap pivot {side}", 2, ((545, 0), (569, -side * 90), (645, -side * 90), (669, 0)))
    for side, name in ((-1, "Lobby lift leaf 0-1"), (1, "Lobby lift leaf 01")):
        _slide(name, 0, ((660, 0), (690, side * 0.55), (760, side * 0.55), (790, 0)))
    for side, name in ((-1, "Office lift leaf 0-1"), (1, "Office lift leaf 01")):
        _slide(name, 0, ((800, 0), (830, side * 0.55)))
    _glow("ProFace X verified", ((965, 0.0), (969, 4.0), (1030, 4.0), (1050, 0.0)))
    _turn("Office door leaf", 2, ((1010, 0), (1050, -95)))
    _glow("SpeedFace V5L light bar", ((1095, 0.0), (1103, 3.0)), colour=(0.95, 0.97, 1.0))
    _glow("SpeedFace V5L verified", ((1115, 0.0), (1119, 4.0)))


def product_beats(cam):
    """Shallow focus and an accent light for each product's beat. Focus follows the camera's target, which
    sits on the product during its beat; the aperture opens to f/5.6 in the beat and closes to f/8 between."""
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = _obj("Journey target")
    stops = [(1, 8.0)]
    for name, beat in PRODUCTS.items():
        f0, f1 = beat["frames"]
        # f/5.6 in the beat: at the close-ups' half a metre, f/2.8 would hold barely a centimetre in focus.
        stops += [(f0 - 12, 8.0), (f0 + 6, 5.6), (f1 - 6, 5.6), (f1 + 12, 8.0)]
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
EXPOSURE = ((1, 0.0), (180, 0.0), (240, 0.3), (400, 0.3), (450, 0.25), (792, 0.25), (830, 0.35), (END, 0.35))


def timeline(step):
    """The film's structure for the web player: frames on disk (every `step`), chapters with AIMS's search
    topics, and each product beat with its catalogue slug (kind "software" for BioTime)."""
    def chapter_of(frame):
        return next(k for k, (a, b) in CHAPTERS.items() if a <= frame <= b)

    return {
        "fps": FPS,
        "frames": END,
        "step": step,
        "cut": CUT,
        "moments": [{"key": k, "frame": f} for k, f in MOMENTS.items()],
        "lift": {"from": LIFT[0], "to": LIFT[1], "floor": OFFICE_FLOOR},
        "chapters": [{"key": k, "from": a, "to": b, "topics": list(TOPICS[k])} for k, (a, b) in CHAPTERS.items()],
        "beats": [
            {"key": name, "chapter": chapter_of(beat["frames"][0]), "from": beat["frames"][0], "to": beat["frames"][1],
             "slug": beat["slug"], "kind": "software" if name.startswith("BioTime") else "product"}
            for name, beat in PRODUCTS.items()
        ],
    }


def anchors(margin=48, step=2):
    """Where each product sits on screen, frame by frame through its beat (plus `margin` frames either side),
    as fractions of the film frame (x right, y down) and whether it is in front of the camera: the web pins
    each product's label to it as the film moves."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector

    scene, cam = bpy.context.scene, bpy.context.scene.camera
    out = {}
    for name, beat in PRODUCTS.items():
        f0, f1 = beat["frames"]
        point, track = Vector(beat["at"]), []
        for frame in range(max(1, f0 - margin), min(END, f1 + margin) + 1, step):
            scene.frame_set(frame)
            x, y, depth = world_to_camera_view(scene, cam, point)
            track.append([frame, round(x, 4), round(1 - y, 4), 1 if depth > 0 else 0])
        out[name] = track
    return out


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

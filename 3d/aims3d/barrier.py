"""ZKTeco BGM-1030 boom barrier and the UHF10 long-range reader that opens it.

BGM-1030 (catalogue): chassis 350 x 280 x 1000 mm, 3 m straight boom, opens in about 1.5 s, left or right
hand. The look follows AIMS's photo (public/images/products/barrier-gates-zkteco-bgm-1030.webp): a gloss
black cabinet with rounded corners, a lit red "P" and a red no-entry ring on the face toward the traffic,
and a white boom with a red edge and red blocks. The manufacturer's logo is left off.

UHF10: the catalogue gives no size; 440 x 440 x 60 mm is estimated from the photo (uhf-10.webp): a white
square housing with a raised, softly rounded radome.
"""

from . import materials as M
from .build import DEG, box, cylinder, empty, rounded_box, text

W, D, H = 0.35, 0.28, 1.0
BOOM = 3.0
HINGE_Z = 0.88


def _ring(name, radius, tube, location, material, parent):
    import bpy

    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=tube, major_segments=64, minor_segments=12,
                                     location=location, rotation=(90 * DEG, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.parent = parent
    return obj


def bgm_1030(name="BGM-1030", location=(0, 0, 0), rotation_z=0.0, boom_open=0.0, hand="R"):
    """Build the barrier. The boom runs along +X (hand "R") or -X ("L"); `boom_open` 0 is down, 1 is up."""
    root = empty(name, location)
    root.rotation_euler = (0, 0, rotation_z)
    paint = M.plastic(f"{name} gloss black", (0.012, 0.012, 0.013), 0.12)
    red_led = M.led(f"{name} red LED", (1.0, 0.04, 0.03), 9.0)
    white, red = M.plastic(f"{name} boom white", (0.8, 0.8, 0.78), 0.3), M.plastic(f"{name} boom red", (0.55, 0.02, 0.02), 0.3)
    dark = M.dark_metal(f"{name} hub")
    rounded_box(f"{name} cabinet", (W, D, H), (0, 0, H / 2), 0.035, paint, 0.004, parent=root)
    box(f"{name} plinth", (W - 0.02, D - 0.02, 0.02), (0, 0, 0.01), dark, 0.002, parent=root)
    face = -D / 2 - 0.0012
    # The lit graphics: a "P" over a no-entry ring with a dotted bar.
    text(f"{name} P", "P", 0.13, (0, face, 0.81), red_led, 0.0015, parent=root)
    _ring(f"{name} ring", 0.065, 0.0045, (0, face, 0.6), red_led, root)
    for k in range(6):
        cylinder(f"{name} dot {k}", 0.0045, 0.002, (-0.03 + k * 0.012, face, 0.6), red_led, (90 * DEG, 0, 0), vertices=16, bevel=0, parent=root)
    # The boom on its hub at the cabinet's side.
    s = 1 if hand == "R" else -1
    hx = s * (W / 2 + 0.03)
    cylinder(f"{name} hub", 0.055, 0.09, (hx, 0, HINGE_Z), dark, (90 * DEG, 0, 0), parent=root)
    pivot = empty(f"{name} boom pivot", (hx, 0, HINGE_Z), parent=root)
    pivot.rotation_euler = (0, -s * 90 * DEG * boom_open, 0)
    length = BOOM - 0.04
    cx = s * (0.04 + length / 2)
    rounded_box(f"{name} boom", (length, 0.045, 0.09), (cx, 0, 0), 0.014, white, 0.002, axis="X", parent=pivot)
    for face_y in (-1, 1):
        box(f"{name} edge {face_y}", (length - 0.02, 0.002, 0.014), (cx, face_y * 0.0235, -0.032), red, 0, parent=pivot)
        for k in range(int(length / 0.6)):
            x = s * (0.35 + k * 0.6)
            box(f"{name} band {face_y}{k}", (0.2, 0.002, 0.03), (x, face_y * 0.0235, 0.022), red, 0, parent=pivot)
    box(f"{name} tip", (0.05, 0.05, 0.095), (s * (0.04 + length + 0.02), 0, 0), M.plastic(f"{name} rubber", (0.02, 0.02, 0.02), 0.7), 0.01, parent=pivot)
    return root


def uhf10(name="UHF10", location=(0, 0, 0), rotation=(0, 0, 0)):
    """The reader alone, centred on its origin with the radome facing -Y."""
    root = empty(name, location)
    root.rotation_euler = rotation
    shell = M.plastic(f"{name} white", (0.78, 0.78, 0.76), 0.4)
    rounded_box(f"{name} housing", (0.44, 0.045, 0.44), (0, 0.0075, 0), 0.02, shell, 0.006, parent=root)
    rounded_box(f"{name} radome", (0.37, 0.016, 0.37), (0, -0.022, 0), 0.035, shell, 0.009, parent=root)
    bracket = M.dark_metal(f"{name} bracket")
    box(f"{name} bracket", (0.12, 0.05, 0.12), (0, 0.055, 0), bracket, 0.003, parent=root)
    return root


def pole_with_reader(name="UHF10 pole", location=(0, 0, 0), facing_deg=0.0, height=2.0, tilt_deg=-12):
    """A steel pole with the UHF10 at `height`, turned to face approaching cars and tipped down a little."""
    root = empty(name, location)
    root.rotation_euler = (0, 0, facing_deg * DEG)
    steel = M.brushed_steel(f"{name} steel", axis="Z")
    cylinder(f"{name} pole", 0.038, height + 0.1, (0, 0.12, (height + 0.1) / 2), steel, parent=root)
    cylinder(f"{name} cap", 0.042, 0.012, (0, 0.12, height + 0.106), M.dark_metal(f"{name} cap"), parent=root)
    box(f"{name} arm", (0.05, 0.1, 0.05), (0, 0.07, height), M.dark_metal(f"{name} arm"), 0.003, parent=root)
    uhf10(f"{name} reader", (0, 0, height), (tilt_deg * DEG, 0, 0)).parent = root
    return root

"""The office door: a frameless glass door held by an Alpha ALF-M560 electromagnetic lock.

ALF-M560: the catalogue lists no size; 250 x 48 x 26 mm is estimated from AIMS's photo
(public/images/products/alf-m560-electromagnetic-locks.webp), the usual size of a single-door maglock. Satin
aluminium body, the magnet face black with two bright steel cores over two thirds of its length. The photo
shows no status LED, so none is modelled.

The door: 12 mm glass leaf, top and bottom patch fittings on the pivot side, a steel pull handle on both
faces, an aluminium header; the lock hangs under the header on the secure side (+Y) and meets an armature
plate clamped to the glass.
"""

from . import materials as M
from .build import DEG, box, cylinder, empty

LEAF_W, LEAF_H, GLASS = 0.95, 2.2, 0.012


def alf_m560(name="ALF-M560", location=(0, 0, 0), parent=None):
    """The lock body, centred on `location`, magnet face toward -Y."""
    root = empty(name, location, parent=parent)
    alu, steel, black = M.aluminium(f"{name} body"), M.brushed_steel(f"{name} cores"), M.plastic(f"{name} face", (0.015, 0.015, 0.016), 0.3)
    box(f"{name} body", (0.25, 0.026, 0.048), (0, 0, 0), alu, 0.002, parent=root)
    box(f"{name} face", (0.165, 0.002, 0.042), (-0.035, -0.0135, 0), black, 0.0005, parent=root)
    for z in (-0.009, 0.009):
        box(f"{name} core {z}", (0.162, 0.0022, 0.008), (-0.035, -0.0137, z), steel, 0.0004, parent=root)
    for x in (-0.115, 0.115):
        cylinder(f"{name} screw {x}", 0.0025, 0.002, (x, -0.0135, 0), M.dark_metal(f"{name} screw"), (90 * DEG, 0, 0), vertices=16, bevel=0, parent=root)
    return root


def glass_door(name="Office door", location=(0, 0, 0), rotation_z=0.0, open_deg=0.0):
    """A glass door in the plane y = 0, hinged at x = 0, the leaf running toward +X; opens toward -Y."""
    root = empty(name, location)
    root.rotation_euler = (0, 0, rotation_z)
    glass, steel, alu = M.clear_glass(f"{name} glass"), M.brushed_steel(f"{name} steel", axis="Z"), M.aluminium(f"{name} header")
    box(f"{name} header", (LEAF_W + 0.1, 0.1, 0.1), (LEAF_W / 2, 0, LEAF_H + 0.06), alu, 0.003, parent=root)
    leaf = empty(f"{name} leaf", (0, 0, 0), parent=root)
    leaf.rotation_euler = (0, 0, -open_deg * DEG)
    box(f"{name} pane", (LEAF_W - 0.01, GLASS, LEAF_H - 0.01), (LEAF_W / 2 + 0.005, 0, LEAF_H / 2 + 0.005), glass, 0.0015, parent=leaf)
    for z in (0.06, LEAF_H - 0.05):  # patch fittings on the pivot side
        box(f"{name} patch {z}", (0.17, 0.045, 0.075), (0.09, 0, z), steel, 0.004, parent=leaf)
    # Pull handle on both faces near the free edge, on stand-offs through the glass.
    hx = LEAF_W - 0.1
    for face in (-1, 1):
        cylinder(f"{name} handle {face}", 0.0125, 0.6, (hx, face * 0.065, 1.05), steel, parent=leaf)
        for z in (0.85, 1.25):
            cylinder(f"{name} standoff {face}{z}", 0.007, 0.055, (hx, face * 0.034, z), steel, (90 * DEG, 0, 0), parent=leaf)
    # Armature: a U-clamp on the glass top at the free edge, the plate facing the lock.
    box(f"{name} clamp", (0.19, 0.03, 0.05), (LEAF_W - 0.13, 0, LEAF_H - 0.025), alu, 0.002, parent=leaf)
    box(f"{name} armature", (0.18, 0.012, 0.045), (LEAF_W - 0.13, 0.021, LEAF_H - 0.025), steel, 0.001, parent=leaf)
    # The lock under the header, on the secure side, face toward the armature.
    lock = alf_m560("ALF-M560", (LEAF_W - 0.13, 0.027 + 0.013 + 0.001, LEAF_H - 0.025), parent=root)
    lock.rotation_euler = (0, 0, 180 * DEG)  # face toward -Y, i.e. toward the armature
    box(f"{name} lock bracket", (0.26, 0.04, 0.012), (LEAF_W - 0.13, 0.041, LEAF_H + 0.004), alu, 0.001, parent=root)
    return root

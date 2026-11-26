"""The building and its street: the office tower AIMS's visitor arrives at, its neighbours and the forecourt.

Coordinates in metres. The tower's footprint is x -15..15, y 0..24; its front faces the street (-Y). The
ground floor is a double-height lobby (0..6 m); typical floors are 3.6 m. Only the floors the camera walks
through are built as rooms (spaces.py); every other floor is a box wearing the lit-window facade shader.
"""

import math
import random

import bpy

from . import materials as M
from .build import box, cylinder, empty

X0, X1, Y0, Y1 = -15.0, 15.0, 0.0, 24.0
GROUND_H, FLOOR_H, FLOORS = 6.0, 3.6, 18
OFFICE_FLOOR = 11  # the floor the visitor's lift goes to


def floor_z(k):
    """Finished floor level of floor k (0 is the ground floor)."""
    return 0.0 if k == 0 else GROUND_H + (k - 1) * FLOOR_H


def curtain_wall(name, axis, at, a0, a1, z0, z1, frame, glass, bay=1.5, transoms=(), gaps=(), depth=0.15):
    """A straight glass wall: mullions every `bay` along X (axis "X", wall at y = at) or along Y (axis "Y",
    wall at x = at), from a0 to a1 and z0 to z1, with horizontal transoms and no glass inside `gaps`."""
    root = empty(name)
    length, h = a1 - a0, z1 - z0
    n = max(1, round(length / bay))

    def place(a, size_a, z, size_z, mat, label, thick):
        if axis == "X":
            box(label, (size_a, thick, size_z), (a, at, z), mat, 0.003 if mat is frame else 0, parent=root)
        else:
            box(label, (thick, size_a, size_z), (at, a, z), mat, 0.003 if mat is frame else 0, parent=root)

    for i in range(n + 1):
        place(a0 + i * length / n, 0.06, z0 + h / 2, h, frame, f"{name} mullion {i}", depth)
    for k, tz in enumerate((z0 + 0.03, z1 - 0.03, *transoms)):
        place(a0 + length / 2, length, tz, 0.06, frame, f"{name} transom {k}", depth)
    # Glass in runs between the gaps.
    edges = [a0] + [v for g in sorted(gaps) for v in g] + [a1]
    for k in range(0, len(edges), 2):
        s, e = edges[k], edges[k + 1]
        if e - s > 0.01:
            place((s + e) / 2, e - s, z0 + h / 2, h, glass, f"{name} glass {k}", 0.02)
    return root


def tower():
    """The tower above the lobby: facade boxes for the floors nobody enters, and the office floor's three
    solid sides (its front is real glass, built in spaces.py)."""
    facade = M.tower_facade("Our tower facade", lit=0.35, glow=1.6)
    slab = M.concrete("Slab edge", (0.2, 0.2, 0.21))
    w, d = X1 - X0, Y1 - Y0
    cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2
    z_office = floor_z(OFFICE_FLOOR)
    box("Tower lower floors", (w, d, z_office - GROUND_H), (cx, cy, (GROUND_H + z_office) / 2), facade, 0)
    top = floor_z(FLOORS + 1)
    box("Tower upper floors", (w, d, top - (z_office + FLOOR_H)), (cx, cy, (z_office + FLOOR_H + top) / 2), facade, 0)
    # The office floor: back and sides as facade, the front left open for the real curtain wall.
    for label, size, loc in (
        ("Office floor back", (w, 0.3, FLOOR_H), (cx, Y1 - 0.15, z_office + FLOOR_H / 2)),
        ("Office floor left", (0.3, d, FLOOR_H), (X0 + 0.15, cy, z_office + FLOOR_H / 2)),
        ("Office floor right", (0.3, d, FLOOR_H), (X1 - 0.15, cy, z_office + FLOOR_H / 2)),
    ):
        box(label, size, loc, facade, 0)
    box("Crown", (w + 0.6, d + 0.6, 2.4), (cx, cy, top + 1.2), M.dark_metal("Crown"), 0.01)
    # The ground floor behind and beside the rooms that are built: solid stone, so nothing shows through.
    stone = M.concrete("Podium stone", (0.42, 0.4, 0.37))
    # Starts behind the lift cars (y 16.1-18), which sit in the gap between it and the lobby's oak wall.
    box("Podium back", (w, Y1 - 18.2, GROUND_H), (cx, (18.2 + Y1) / 2, GROUND_H / 2), stone, 0)
    box("Podium right", (0.8, 16.1, GROUND_H), (X1 - 0.4, 8.05, GROUND_H / 2), stone, 0)
    box("Slab above lobby", (w + 0.2, d + 0.2, 0.4), (cx, cy, GROUND_H - 0.2), slab, 0.004)


def neighbours(seed=3):
    """A dusk skyline: towers of the same facade at 300-1200 m, most of them ahead of the office windows
    (-Y), so the finale looks out over lit floors; far enough that none crowds the tower in the hero."""
    rng = random.Random(seed)
    facade = M.tower_facade("Skyline facade", lit=0.3, glow=2.0)
    for k in range(44):
        ahead = k < 32
        angle = math.radians(rng.uniform(-165, -15) if ahead else rng.uniform(15, 165))
        dist = rng.uniform(300, 1200)
        x, y = dist * math.cos(angle), dist * math.sin(angle) + Y1 / 2
        w, d = rng.uniform(25, 50), rng.uniform(25, 50)
        h = rng.uniform(40, min(260, dist * 0.3))  # nothing near looms over the view
        box(f"Skyline tower {k}", (w, d, h), (x, y, h / 2), facade, 0)
        if h > 180 and rng.random() < 0.5:  # a few spires, as Gulf skylines have
            cylinder(f"Spire {k}", 1.5, h * 0.15, (x, y, h + h * 0.075), M.dark_metal("Spire"), vertices=12, bevel=0)


def city_fabric(seed=7):
    """The city between the towers: mid-rises along the tower's own street (they frame the hero) and a few
    hundred low blocks out to 1.5 km (they fill the view from the office floor)."""
    rng = random.Random(seed)
    near = M.tower_facade("Street block facade", bay=2.0, lit=0.3, glow=1.4)
    far = M.tower_facade("City facade", bay=2.0, lit=0.25, glow=2.0)
    x = -130.0
    while x < 130:  # the tower's side of the street, either side of the plot
        w = rng.uniform(18, 34)
        if not (-40 < x + w / 2 and x - w / 2 < 40):
            h, d = rng.uniform(14, 48), rng.uniform(18, 30)
            box(f"Street block {round(x)}", (w, d, h), (x, 6 + d / 2, h / 2), near, 0)
        x += w + rng.uniform(6, 14)
    for k in range(260):
        angle = math.radians(rng.uniform(0, 360))
        dist = rng.uniform(180, 1500)
        bx, by = dist * math.cos(angle), dist * math.sin(angle)
        w, d, h = rng.uniform(20, 60), rng.uniform(20, 60), rng.uniform(8, 36)
        box(f"City block {k}", (w, d, h), (bx, by, h / 2), far, 0)


def street_and_forecourt():
    """The ground outside: a wide street with a median, a pavement, the paved forecourt and the driveway to
    the car park portal, all set under a far ground plane so the HDRI's own ground never shows."""
    box("Far ground", (4000, 4000, 0.1), (0, 0, -0.16), M.city_carpet(), 0)
    tarmac = M.asphalt()
    box("Street", (400, 16, 0.1), (0, -26, -0.05), tarmac, 0)
    box("Median", (400, 1.2, 0.2), (0, -26, 0.05), M.concrete("Median", (0.3, 0.3, 0.29)), 0.01)
    box("Pavement", (400, 4, 0.16), (0, -16, 0.03), M.paving("Pavement", (0.3, 0.3, 0.29), 0.4), 0.004)
    box("Forecourt", (30, 14, 0.1), (-1.5, -7, 0.0), M.paving("Forecourt", (0.36, 0.35, 0.32), 0.8), 0.004)
    box("Driveway", (5.0, 14, 0.1), (11.5, -7, -0.01), tarmac, 0)
    for k in range(6):  # lane marking on the driveway: a dashed centre line
        box(f"Dash {k}", (0.12, 1.0, 0.005), (11.5, -13 + k * 2.2, 0.042), M.plastic("Road white", (0.7, 0.7, 0.68), 0.6), 0)


def street_lights(positions, height=8.0):
    """Slim poles with a warm LED head, each a real spot light so the street pools as it does at dusk."""
    pole_m, head_m = M.dark_metal("Lamp pole"), M.led("Street lamp", (1.0, 0.82, 0.6), 30.0)
    for k, (x, y) in enumerate(positions):
        cylinder(f"Lamp pole {k}", 0.08, height, (x, y, height / 2), pole_m, vertices=16)
        box(f"Lamp head {k}", (0.7, 0.25, 0.08), (x + 0.3, y, height), pole_m, 0.01)
        box(f"Lamp lens {k}", (0.6, 0.18, 0.01), (x + 0.3, y, height - 0.045), head_m, 0)
        bpy.ops.object.light_add(type="SPOT", location=(x + 0.3, y, height - 0.1))
        spot = bpy.context.object
        spot.name = f"Lamp light {k}"
        spot.data.energy = 900
        spot.data.color = (1.0, 0.8, 0.58)
        spot.data.spot_size = 120 * math.pi / 180
        spot.data.spot_blend = 0.6
        spot.data.shadow_soft_size = 0.3


def entrance_canopy():
    """A steel and glass canopy over the main doors, lit from beneath."""
    steel, glass = M.dark_metal("Canopy steel"), M.window_glass("Canopy glass")
    box("Canopy frame", (8.0, 4.0, 0.12), (-2.0, -2.0, 4.2), steel, 0.004)
    box("Canopy glass", (7.8, 3.8, 0.02), (-2.0, -2.0, 4.29), glass, 0)
    for x in (-5.6, 1.6):
        cylinder(f"Canopy column {x}", 0.08, 4.2, (x, -3.8, 2.1), steel, vertices=24)
    led = M.led("Canopy downlight", (1.0, 0.85, 0.65), 25.0)
    for x in (-4.5, -2.0, 0.5):
        cylinder(f"Canopy light {x}", 0.08, 0.01, (x, -2.0, 4.135), led, vertices=24, bevel=0)

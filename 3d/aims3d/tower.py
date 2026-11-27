"""The building and its street: the office tower AIMS's visitor arrives at, its neighbours and the forecourt.

Coordinates in metres. The tower's footprint is x -15..15, y 0..24; its front faces the street (-Y). The
ground floor is a double-height lobby (0..6 m); typical floors are 3.6 m. Only the floors the camera walks
through are built as rooms (spaces.py); every other floor is a box wearing the lit-window facade shader.
"""

import math
import random

import bpy

from . import materials as M
from .build import box, boxes, cylinder, empty

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
    facade = M.tower_facade("Our tower facade", lit=(0.5, 0.5), glow=1.6, haze=False)
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
    # A thin line of light under the crown, as most towers on the Gulf have: it draws the roofline at dusk.
    box("Crown light", (w + 0.64, d + 0.64, 0.06), (cx, cy, top + 0.25), M.led("Crown light", (1.0, 0.92, 0.82), 6.0), 0)
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
    facade = M.tower_facade("Skyline facade", bay=(1.2, 2.4), floor=(3.4, 4.2), lit=(0.3, 0.6), glow=2.0)
    for k in range(44):
        ahead = k < 32
        angle = math.radians(rng.uniform(-165, -15) if ahead else rng.uniform(15, 165))
        dist = rng.uniform(300, 1200)
        x, y = dist * math.cos(angle), dist * math.sin(angle) + Y1 / 2
        w, d = rng.uniform(25, 50), rng.uniform(25, 50)
        h = rng.uniform(40, min(260, dist * 0.3))  # nothing near looms over the view
        # Gulf towers step back as they rise: a base and up to two narrower tiers.
        tiers = 1 if h < 120 else rng.choice((2, 3))
        parts, z = [], 0.0
        for t in range(tiers):
            th, scale = h / tiers, 1.0 - 0.18 * t
            parts.append(((w * scale, d * scale, th), (x, y, z + th / 2)))
            z += th
        boxes(f"Skyline tower {k}", parts, facade)
        if h > 180 and rng.random() < 0.5:  # a few spires, as Gulf skylines have
            cylinder(f"Spire {k}", 1.5, h * 0.15, (x, y, h + h * 0.075), M.dark_metal("Spire"), vertices=12, bevel=0)
            cylinder(f"Spire light {k}", 0.6, 0.6, (x, y, h * 1.15 + 0.3), M.led("Aircraft warning", (1.0, 0.1, 0.05), 20.0), vertices=12, bevel=0)


def city_fabric(seed=7):
    """The city between the towers: mid-rises along the tower's own street (they frame the hero) and a few
    hundred low blocks out to 1.5 km (they fill the view from the office floor)."""
    rng = random.Random(seed)
    near = M.tower_facade("Street block facade", bay=(1.5, 3.0), floor=(3.2, 4.0), lit=(0.35, 0.6), glow=1.4)
    far = M.tower_facade("City facade", bay=(1.8, 3.2), floor=(3.2, 4.2), lit=(0.3, 0.55), glow=2.0)
    roof_m = M.powder_coat("Roof plant", (0.18, 0.18, 0.19), 0.6)
    x = -130.0
    while x < 130:  # the tower's side of the street, either side of the plot
        w = rng.uniform(18, 34)
        if not (-40 < x + w / 2 and x - w / 2 < 40):
            h, d = rng.uniform(14, 48), rng.uniform(18, 30)
            box(f"Street block {round(x)}", (w, d, h), (x, 6 + d / 2, h / 2), near, 0)
            # A parapet and the plant on the roof: a flat-topped box reads as a model, these as a building.
            box(f"Parapet {round(x)}", (w + 0.3, d + 0.3, 1.1), (x, 6 + d / 2, h + 0.55), roof_m, 0.01)
            for j in range(rng.randint(1, 3)):
                pw, pd, ph = rng.uniform(2, 5), rng.uniform(2, 4), rng.uniform(1.5, 3)
                box(f"Roof plant {round(x)} {j}", (pw, pd, ph), (x + rng.uniform(-w / 3, w / 3), 6 + d / 2 + rng.uniform(-d / 4, d / 4), h + ph / 2), roof_m, 0.02)
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
    tarmac = M.scanned("Asphalt", "asphalt_02", 3.0, rough=(0.5, 0.9)) or M.asphalt()
    box("Street", (400, 16, 0.1), (0, -26, -0.05), tarmac, 0)
    box("Median", (400, 1.2, 0.2), (0, -26, 0.05), M.concrete("Median", (0.3, 0.3, 0.29)), 0.01)
    box("Pavement", (400, 4, 0.16), (0, -16, 0.03), M.paving("Pavement", (0.3, 0.3, 0.29), 0.4), 0.004)
    # The far side, where the visitor first stands: a pavement and a paved plaza, so the hero's foreground is
    # a lit, textured ground rather than the dark far plane.
    box("Far pavement", (400, 3, 0.16), (0, -35.5, 0.03), M.paving("Far pavement", (0.3, 0.3, 0.29), 0.4), 0.004)
    plaza = M.scanned("Plaza", "large_grey_tiles", 3.0, tint=(0.8, 0.8, 0.8), rough=(0.35, 0.8)) or M.paving("Plaza", (0.33, 0.32, 0.3), 0.8)
    box("Plaza", (160, 60, 0.1), (-20, -67, 0.0), plaza, 0.004)
    box("Kerb far", (400, 0.2, 0.16), (0, -34.0, 0.03), M.concrete("Kerb far", (0.5, 0.49, 0.46)), 0.01)
    # Lane lines: a dashed line between the two lanes each way, a solid one along each edge.
    paint = M.plastic("Lane paint", (0.62, 0.62, 0.6), 0.55)
    for y in (-22.1, -29.9):
        for x in range(-200, 200, 9):
            box(f"Lane dash {y} {x}", (3.0, 0.12, 0.004), (x, y, 0.002), paint, 0)
    for y in (-18.4, -24.9, -27.1, -33.6):
        box(f"Lane edge {y}", (400, 0.12, 0.004), (0, y, 0.002), paint, 0)
    # Ends at the driveway's kerb (x 8.9): it used to run over the driveway and hide its asphalt.
    box("Forecourt", (25.4, 14, 0.1), (-3.8, -7, 0.0), (M.scanned("Forecourt", "large_grey_tiles", 3.0, rough=(0.4, 0.85)) or M.paving("Forecourt", (0.36, 0.35, 0.32), 0.8)), 0.004)
    box("Driveway", (5.0, 14, 0.1), (11.5, -7, -0.01), tarmac, 0)
    for k in range(4):  # a dashed centre line, starting past the painted read zone (signage.py)
        box(f"Dash {k}", (0.12, 1.0, 0.005), (11.5, -8.6 + k * 2.2, 0.042), M.plastic("Road white", (0.7, 0.7, 0.68), 0.6), 0)


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


def forecourt_dressing():
    """Kerbs, date palms and lit bollards: the street furniture that makes a forecourt read as a real one."""
    from .dressing import date_palm

    kerb = M.concrete("Kerb", (0.5, 0.49, 0.46))
    box("Kerb street", (400, 0.2, 0.16), (0, -18.0, 0.03), kerb, 0.01)
    box("Kerb median north", (400, 0.15, 0.2), (0, -25.3, 0.05), kerb, 0.01)
    for x in (8.95, 14.05):
        box(f"Kerb driveway {x}", (0.2, 14, 0.14), (x, -7, 0.02), kerb, 0.01)
    k = 0
    for x in (-13.0, -8.5, 4.5):  # forecourt palms, either side of the entrance
        date_palm(f"Forecourt palm {k}", (x, -9.5, 0.05), seed=40 + k)
        k += 1
    for x in range(-60, 61, 12):  # pavement palms, clear of the driveway
        if 6 < x < 17:
            continue
        date_palm(f"Pavement palm {k}", (x + 2.5, -16.2, 0.11), seed=40 + k, uplight=abs(x) < 40)
        k += 1
    steel, ring = M.brushed_steel("Bollard steel", axis="Z"), M.led("Bollard light", (1.0, 0.82, 0.6), 6.0)
    for i, x in enumerate([-14.0 + 1.6 * j for j in range(15)]):
        if -2.5 < x < 2.5:  # leave the walk to the doors open
            continue
        cylinder(f"Bollard {i}", 0.08, 0.9, (x, -13.8, 0.45), steel, vertices=24)
        cylinder(f"Bollard ring {i}", 0.082, 0.04, (x, -13.8, 0.82), ring, vertices=24, bevel=0)


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

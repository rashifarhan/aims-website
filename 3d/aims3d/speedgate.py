"""ZKTeco MARS-B1200 swing barrier, modelled from AIMS's product photo
(public/images/products/zkteco-mars-b1200-double-swing-barrier-gate.webp).

The catalogue gives no dimensions, so the proportions are estimated from the photo: a brushed steel
portal about 1.55 m wide, 1.0 m tall and 0.28 m deep. Two vertically brushed pillars carry a steel beam.
Each face of the beam is a dark glass band that runs the full width at the top and tapers down the pillars
on a diagonal, with the green LED strip along each diagonal. The pillar tops are dark reader panels (card
and QR windows), a green direction arrow sits high on the entry pillar, and two clear glass flaps with
rounded outer corners swing open from a pair of central posts above a low steel plinth.
"""

import math

from . import materials as M
from .build import DEG, box, cylinder, empty, prism

W, H, D = 1.55, 0.985, 0.28
PILLAR = 0.2
BEAM_LOW = 0.84
TOP = 0.012  # the dark reader panel on each pillar top
FLAP_LOW, FLAP_HIGH = 0.2, 0.78


def _rounded_rect(u0, u1, v0, v1, r_near, r_far, steps=6):
    """Profile of a flap: corners at u0 (the post side) rounded by r_near, at u1 (the free edge) by r_far."""
    pts = []
    corners = (
        (u1 - r_far, v0 + r_far, r_far, -90),
        (u1 - r_far, v1 - r_far, r_far, 0),
        (u0 + r_near, v1 - r_near, r_near, 90),
        (u0 + r_near, v0 + r_near, r_near, 180),
    )
    for cu, cv, r, start in corners:
        for k in range(steps + 1):
            a = (start + 90 * k / steps) * DEG
            pts.append((cu + r * math.cos(a), cv + r * math.sin(a)))
    return pts


def default_materials():
    return {
        "steel": M.brushed_steel(),
        "steel_v": M.brushed_steel("Brushed steel vertical", axis="Z"),
        "dark": M.dark_metal(),
        "cap": M.black_glass(),
        "glass": M.clear_glass(),
        "led": M.led(),
    }


def speed_gate(name="MARS-B1200", location=(0, 0, 0), flap_open=0.0, mats=None):
    """Build one gate. `flap_open` is 0 (closed) to 1 (fully swung open, 90 degrees)."""
    m = mats or default_materials()
    root = empty(name, location)
    x0 = W / 2
    inner = W - 2 * PILLAR

    for side in (-1, 1):
        cx = side * (x0 - PILLAR / 2)
        box(f"{name} pillar {side}", (PILLAR, D, H - TOP), (cx, 0, (H - TOP) / 2), m["steel_v"], 0.006, parent=root)
        box(f"{name} top {side}", (PILLAR, D, TOP), (cx, 0, H - TOP / 2), m["cap"], 0.003, parent=root)
        # Card / QR reader window on the pillar top, set toward the beam as in the photo.
        box(f"{name} reader {side}", (0.09, 0.12, 0.002), (cx - side * 0.02, 0, H + 0.001), m["dark"], 0.001, parent=root)

    box(f"{name} beam", (inner, D, H - BEAM_LOW), (0, 0, (BEAM_LOW + H) / 2), m["steel"], 0.004, parent=root)
    box(f"{name} beam trim", (inner, D - 0.04, 0.01), (0, 0, BEAM_LOW - 0.005), m["dark"], 0.002, parent=root)

    # The dark band on each face: full width at the top, tapering down the pillars on a diagonal.
    band = [(-x0 + 0.004, H - 0.002), (x0 - 0.004, H - 0.002), (x0 - PILLAR, BEAM_LOW), (-x0 + PILLAR, BEAM_LOW)]
    rise, run = H - BEAM_LOW, PILLAR
    slope = math.atan2(rise, run)
    length = math.hypot(rise, run)
    for face in (-1, 1):
        prism(f"{name} band {face}", band, 0.003, (0, face * (D / 2 + 0.0015), 0), m["cap"], 0.001, parent=root)
        for side in (-1, 1):
            box(
                f"{name} led {side}{face}",
                (length, 0.004, 0.006),
                (side * (x0 - PILLAR / 2), face * (D / 2 + 0.0035), (H + BEAM_LOW) / 2),
                m["led"],
                0,
                rotation=(0, -side * slope, 0),
                parent=root,
            )

    # Direction arrow high on the entry face of the left pillar.
    ax, az = -(x0 - PILLAR / 2), 0.7
    cylinder(f"{name} arrow disc", 0.055, 0.006, (ax, -D / 2 - 0.003, az), m["cap"], (90 * DEG, 0, 0), parent=root)
    s = 0.028
    arrow = [(-s, 0.0), (0.0, s), (0.0, 0.4 * s), (s, 0.4 * s), (s, -0.4 * s), (0.0, -0.4 * s), (0.0, -s)]
    arrow_obj = prism(f"{name} arrow", arrow, 0.004, (ax, -D / 2 - 0.007, az), m["led"], 0, parent=root)
    arrow_obj.rotation_euler = (0, -45 * DEG, 0)

    # Low steel plinth with a dark kick strip on both faces and two floor grooves.
    box(f"{name} base", (inner, D, 0.06), (0, 0, 0.03), m["steel"], 0.003, parent=root)
    for face in (-1, 1):
        box(f"{name} kick {face}", (inner, 0.004, 0.03), (0, face * (D / 2 + 0.001), 0.018), m["dark"], 0, parent=root)
    for y in (-0.07, 0.07):
        box(f"{name} base groove {y}", (inner - 0.08, 0.008, 0.002), (0, y, 0.0605), m["dark"], 0, parent=root)

    # Central posts and the two glass flaps. Each flap hangs from a pivot so it can swing open.
    width = inner / 2 - 0.06
    for side in (-1, 1):
        px = side * 0.035
        cylinder(f"{name} post {side}", 0.02, BEAM_LOW - 0.06, (px, 0, 0.06 + (BEAM_LOW - 0.06) / 2), m["dark"], parent=root)
        pivot = empty(f"{name} flap pivot {side}", (px, 0, 0), parent=root)
        pivot.rotation_euler = (0, 0, -side * 90 * DEG * flap_open)
        profile = _rounded_rect(0.025, 0.025 + width, FLAP_LOW, FLAP_HIGH, 0.006, 0.035)
        if side < 0:
            profile = [(-u, v) for u, v in profile]
        prism(f"{name} flap {side}", profile, 0.012, (0, 0, 0), m["glass"], 0.002, parent=pivot)
        for z in (0.34, 0.66):
            box(f"{name} clamp {side}{z}", (0.04, 0.03, 0.05), (side * 0.03, 0, z), m["steel"], 0.003, parent=pivot)
    return root

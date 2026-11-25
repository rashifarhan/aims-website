"""ZKTeco MARS-B1200 swing barrier, modelled from AIMS's product photo
(public/images/products/zkteco-mars-b1200-double-swing-barrier-gate.webp).

The catalogue gives no dimensions, so the proportions are estimated from the photo: a brushed steel
portal about 1.55 m wide, 1.0 m tall and 0.28 m deep, two pillars joined by a top beam under a black
glass cap with chamfered ends, green LED strips on the chamfers, a direction arrow on the pillar, and
two glass flaps that swing open from a pair of central posts.
"""

from . import materials as M
from .build import DEG, box, cylinder, empty, prism

W, H, D = 1.55, 0.985, 0.28
PILLAR = 0.2
BEAM_LOW, BEAM_TOP, CHAMFER = 0.8, 0.9, 0.08


def speed_gate(name="MARS-B1200", location=(0, 0, 0), flap_open=0.0, mats=None):
    """Build one gate. `flap_open` is 0 (closed) to 1 (fully swung open, 90 degrees)."""
    m = mats or {
        "steel": M.brushed_steel(),
        "dark": M.dark_metal(),
        "cap": M.black_glass(),
        "glass": M.clear_glass(),
        "led": M.led(),
    }
    root = empty(name, location)
    x0 = W / 2

    for side in (-1, 1):
        cx = side * (x0 - PILLAR / 2)
        box(f"{name} pillar {side}", (PILLAR, D, BEAM_LOW), (cx, 0, BEAM_LOW / 2), m["steel"], 0.006, parent=root)

    box(f"{name} beam", (W, D, BEAM_TOP - BEAM_LOW), (0, 0, (BEAM_LOW + BEAM_TOP) / 2), m["steel"], 0.004, parent=root)
    inner = W - 2 * PILLAR
    box(f"{name} beam trim", (inner, D - 0.04, 0.012), (0, 0, BEAM_LOW - 0.006), m["dark"], 0.002, parent=root)

    cap = [(-x0, BEAM_TOP), (x0, BEAM_TOP), (x0 - CHAMFER, H), (-x0 + CHAMFER, H)]
    prism(f"{name} cap", cap, D, (0, 0, 0), m["cap"], 0.003, parent=root)

    # LED strips run up each chamfer on both faces (the green lines in the photo).
    length = (2 * CHAMFER**2) ** 0.5
    for side in (-1, 1):
        for face in (-1, 1):
            box(
                f"{name} led {side}{face}",
                (length, 0.004, 0.007),
                (side * (x0 - CHAMFER / 2), face * (D / 2 + 0.001), (BEAM_TOP + H) / 2),
                m["led"],
                0,
                rotation=(0, side * 45 * DEG, 0),
                parent=root,
            )
        # Card and QR reader windows on the cap, one at each end.
        box(f"{name} reader {side}", (0.16, 0.1, 0.003), (side * (x0 - 0.26), 0, H + 0.0015), m["dark"], 0.001, parent=root)

    # Direction arrow on the entry face of the left pillar.
    disc = cylinder(
        f"{name} arrow disc", 0.045, 0.006, (-(x0 - PILLAR / 2), -D / 2 - 0.003, 0.58), m["cap"], (90 * DEG, 0, 0), parent=root
    )
    arrow = [(-0.022, 0.0), (0.0, 0.022), (0.0, 0.009), (0.022, 0.009), (0.022, -0.009), (0.0, -0.009), (0.0, -0.022)]
    prism(f"{name} arrow", arrow, 0.004, (-(x0 - PILLAR / 2), -D / 2 - 0.007, 0.58), m["led"], 0, parent=root).rotation_euler = (
        0,
        -45 * DEG,
        0,
    )
    del disc

    box(f"{name} base", (inner, D, 0.06), (0, 0, 0.03), m["steel"], 0.003, parent=root)
    for y in (-0.07, 0.07):
        box(f"{name} base groove {y}", (inner - 0.08, 0.008, 0.002), (0, y, 0.0605), m["dark"], 0, parent=root)

    # Central posts and the two glass flaps. Each flap hangs from a pivot so it can swing open.
    for side in (-1, 1):
        px = side * 0.035
        cylinder(f"{name} post {side}", 0.02, BEAM_LOW - 0.06, (px, 0, 0.06 + (BEAM_LOW - 0.06) / 2), m["dark"], parent=root)
        pivot = empty(f"{name} flap pivot {side}", (px, 0, 0), parent=root)
        pivot.rotation_euler = (0, 0, -side * 90 * DEG * flap_open)
        width = inner / 2 - 0.06
        box(f"{name} flap {side}", (width, 0.012, 0.56), (side * (0.025 + width / 2), 0, 0.47), m["glass"], 0.004, parent=pivot)
        for z in (0.3, 0.64):
            box(f"{name} clamp {side}{z}", (0.04, 0.03, 0.05), (side * 0.03, 0, z), m["steel"], 0.003, parent=pivot)
    return root

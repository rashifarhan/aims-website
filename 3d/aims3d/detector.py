"""ZKTeco ZK-D3180S walk-through metal detector.

Catalogue: outside 2220 (H) x 835 (W) x 578 (D) mm, inside 1990 x 700 mm, 18 detection zones. The look
follows AIMS's photo (public/images/products/zk-d3180s.webp): light grey posts with dark grey front and
back edges and flared feet, and a header unit carrying a blue LCD, a green indicator panel and a green
light line along its lower front edge. The manufacturer's logo is left off.

`zones_lit` (0..18) lights the indicator panel and the posts' zone lamps from the floor up, so a scene
can play the sweep; 0 leaves them dark.
"""

from . import materials as M
from .build import box, empty, rounded_box

H_OUT, W_OUT, DEPTH = 2.22, 0.835, 0.578
H_IN, W_IN = 1.99, 0.70
POST = (W_OUT - W_IN) / 2


def zk_d3180s(name="ZK-D3180S", location=(0, 0, 0), rotation_z=0.0, zones_lit=0):
    root = empty(name, location)
    root.rotation_euler = (0, 0, rotation_z)
    shell = M.powder_coat(f"{name} grey", (0.6, 0.61, 0.62))
    trim = M.powder_coat(f"{name} trim", (0.12, 0.125, 0.13), 0.4)
    green = M.led(f"{name} green", (0.12, 1.0, 0.25), 3.5)  # brighter washes to white under AgX
    off = M.plastic(f"{name} lamp off", (0.04, 0.06, 0.045), 0.2)
    for side in (-1, 1):
        x = side * (W_IN / 2 + POST / 2)
        rounded_box(f"{name} post {side}", (POST, DEPTH - 0.06, H_IN), (x, 0, H_IN / 2), 0.015, shell, 0.004, axis="Z", parent=root)
        for face in (-1, 1):
            rounded_box(f"{name} edge {side}{face}", (POST + 0.004, 0.035, H_IN), (x, face * (DEPTH / 2 - 0.0175), H_IN / 2), 0.012, trim, 0.003, axis="Z", parent=root)
        rounded_box(f"{name} foot {side}", (POST + 0.05, DEPTH + 0.04, 0.035), (x, 0, 0.0175), 0.02, trim, 0.006, axis="Z", parent=root)
        # Six zone lamps up the inner face of each post (6 heights x 3 widths = the 18 zones).
        for k in range(6):
            lit = zones_lit >= (k + 1) * 3
            z = 0.25 + k * 0.3
            box(f"{name} zone {side}{k}", (0.002, 0.05, 0.012), (x - side * (POST / 2 + 0.001), -DEPTH / 2 + 0.07, z), green if lit else off, 0, parent=root)
    header_h = H_OUT - H_IN
    rounded_box(f"{name} header", (W_OUT, DEPTH - 0.04, header_h), (0, 0, H_IN + header_h / 2), 0.02, shell, 0.004, parent=root)
    front = -(DEPTH - 0.04) / 2 - 0.001
    box(f"{name} panel", (W_OUT - 0.08, 0.002, header_h - 0.06), (0, front, H_IN + header_h / 2 + 0.01), trim, 0.001, parent=root)
    lcd = M.screen(f"{name} LCD", None, (0.05, 0.3, 0.9), 2.0)
    box(f"{name} lcd", (0.12, 0.002, 0.05), (-0.06, front - 0.0015, H_IN + header_h / 2 + 0.015), lcd, 0, parent=root)
    for r in range(3):
        for c in range(6):
            lit = zones_lit > r * 6 + c
            box(f"{name} led {r}{c}", (0.008, 0.002, 0.008), (0.1 + c * 0.018, front - 0.0015, H_IN + 0.08 + r * 0.02), green if lit else off, 0, parent=root)
    box(f"{name} line", (W_OUT - 0.1, 0.003, 0.006), (0, front - 0.0015, H_IN + 0.025), green, 0, parent=root)
    return root

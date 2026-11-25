"""Wall-mounted face terminals: ZKTeco ProFace X and SpeedFace V5L (the P model, with a fingerprint sensor).

Each is built centred on its own origin, front facing -Y, so a scene places it on a wall or a pedestal
with one location and a Z rotation. Sizes come from AIMS's catalogue (content/products.json); the layout
of the front follows AIMS's product photos (public/images/products/proface-x.webp, speedface-v5l-p.webp).
"""

import os

from . import materials as M
from .build import cylinder, empty, panel, rounded_box

TEXTURES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "textures")


def _lens(name, location, parent, mats):
    x, y, z = location
    cylinder(f"{name} ring", 0.0045, 0.001, (x, y, z), mats["dark"], (1.5708, 0, 0), vertices=32, bevel=0, parent=parent)
    cylinder(f"{name} glass", 0.003, 0.0012, (x, y - 0.0003, z), mats["cap"], (1.5708, 0, 0), vertices=32, bevel=0, parent=parent)


def proface_x(name="ProFace X", location=(0, 0, 0), mats=None, screen_image="proface_idle.png"):
    """ZKTeco ProFace X: 227 x 143 x 26 mm (catalogue). A black glass front over an 8-inch portrait screen,
    two square frosted IR windows in the top corners and the camera pair between them."""
    m = mats or {"dark": M.dark_metal(), "cap": M.black_glass()}
    root = empty(name, location)
    w, h, d = 0.143, 0.227, 0.026
    rounded_box(f"{name} body", (w, d - 0.003, h), (0, 0.0015, 0), 0.008, m["dark"], 0.002, parent=root)
    front = -d / 2
    rounded_box(f"{name} glass", (w, 0.003, h), (0, front + 0.0015, 0), 0.008, m["cap"], 0.0008, parent=root)
    # 8-inch 16:10 screen, 108 x 172 mm, set low in the glass as on the photo.
    scr = M.screen(f"{name} screen", os.path.join(TEXTURES, screen_image), strength=1.2)
    panel(f"{name} display", 0.108, 0.172, (0, front - 0.0002, -h / 2 + 0.015 + 0.086), scr, parent=root)
    ir = M.frosted(f"{name} IR window", (0.92, 0.93, 0.94))
    for side in (-1, 1):
        rounded_box(f"{name} IR {side}", (0.021, 0.0012, 0.021), (side * 0.046, front - 0.0004, h / 2 - 0.022), 0.003, ir, 0.0004, parent=root)
        _lens(f"{name} camera {side}", (side * 0.012, front - 0.0002, h / 2 - 0.02), root, m)
    return root


def speedface_v5l(name="SpeedFace V5L", location=(0, 0, 0), mats=None, screen_image="speedface_idle.png"):
    """ZKTeco SpeedFace V5L: 92 x 203 x 21.5 mm (the catalogue's V5L [QR] size; the P model shares the
    body). Silver aluminium sides around a black glass front: a frosted light bar across the top, the
    camera pair under it, a 5-inch portrait screen and the fingerprint sensor below."""
    m = mats or {"dark": M.dark_metal(), "cap": M.black_glass(), "alu": M.aluminium()}
    root = empty(name, location)
    w, h, d = 0.092, 0.203, 0.0215
    rounded_box(f"{name} body", (w, d - 0.002, h), (0, 0.001, 0), 0.007, m.get("alu") or M.aluminium(), 0.002, parent=root)
    front = -d / 2
    rounded_box(f"{name} glass", (w - 0.005, 0.002, h - 0.003), (0, front + 0.001, 0), 0.006, m["cap"], 0.0006, parent=root)
    bar = M.frosted(f"{name} light bar", (0.93, 0.94, 0.95))
    rounded_box(f"{name} light bar", (w - 0.012, 0.001, 0.013), (0, front - 0.0002, h / 2 - 0.012), 0.004, bar, 0.0003, parent=root)
    for side in (-1, 1):
        _lens(f"{name} camera {side}", (side * 0.009, front - 0.0002, h / 2 - 0.03), root, m)
    scr = M.screen(f"{name} screen", os.path.join(TEXTURES, screen_image), strength=1.2)
    panel(f"{name} display", 0.062, 0.110, (0, front - 0.0002, 0.012), scr, parent=root)
    # Fingerprint window in a satin bezel.
    rounded_box(f"{name} sensor bezel", (0.02, 0.0015, 0.026), (0, front - 0.0006, -h / 2 + 0.038), 0.004, m.get("alu") or M.aluminium(), 0.0004, parent=root)
    rounded_box(f"{name} sensor", (0.014, 0.0016, 0.019), (0, front - 0.0008, -h / 2 + 0.038), 0.003, m["dark"], 0.0003, parent=root)
    return root

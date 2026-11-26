"""A 24-inch office monitor showing the time-attendance dashboard (no brand: any desktop screen).

On the web the dashboard is live HTML laid over this screen; here it is a drawn picture with no figures.
"""

import os

from . import materials as M
from .build import box, cylinder, empty, panel, rounded_box

TEXTURES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "textures")
SCREEN_W, SCREEN_H = 0.531, 0.299  # 24-inch 16:9 active area


def monitor(name="Monitor", location=(0, 0, 0), rotation_z=0.0, screen_image="dashboard.png"):
    """Stands on a desk at `location` (the foot's underside), screen facing -Y."""
    root = empty(name, location)
    root.rotation_euler = (0, 0, rotation_z)
    body = M.plastic(f"{name} body", (0.02, 0.021, 0.023), 0.45)
    z0 = 0.12 + SCREEN_H / 2  # screen centre above the desk
    rounded_box(f"{name} bezel", (SCREEN_W + 0.012, 0.012, SCREEN_H + 0.03), (0, 0, z0 - 0.008), 0.004, body, 0.0015, parent=root)
    rounded_box(f"{name} back", (SCREEN_W - 0.12, 0.035, SCREEN_H - 0.08), (0, 0.022, z0), 0.03, body, 0.004, parent=root)
    image = os.path.join(TEXTURES, screen_image) if screen_image else None  # None: a dark, idle screen
    scr = M.screen(f"{name} screen", image, strength=1.0 if image else 0.3)
    panel(f"{name} display", SCREEN_W, SCREEN_H, (0, -0.0062, z0), scr, parent=root)
    box(f"{name} neck", (0.06, 0.025, 0.2), (0, 0.05, 0.11), body, 0.004, parent=root)
    cylinder(f"{name} foot", 0.11, 0.012, (0, 0.04, 0.006), body, vertices=64, bevel=0.003, parent=root)
    return root

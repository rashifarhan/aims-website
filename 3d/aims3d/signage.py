"""Environmental typography: words and numbers built into the building, lit and reflected like the rest of it.

Type laid flat over a film reads as a caption; type painted on the road, inlaid in the floor or etched on the
glass belongs to the place. Display type is Mona Sans (static instances made from the variable web font,
3d/assets/fonts/, not in git: see 3d/README.md).
"""

import math
import os

import bpy

from . import materials as M
from .build import box, empty

FONTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")


def _font(name):
    path = os.path.join(FONTS, f"{name}.ttf")
    return bpy.data.fonts.load(path, check_existing=True) if os.path.exists(path) else None


def _type(name, body, size, location, rotation, material, font="MonaSans-WideHeavy", extrude=0.0005, scale=(1, 1, 1), parent=None):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body, curve.size, curve.extrude = body, size, extrude
    curve.align_x, curve.align_y = "CENTER", "CENTER"
    f = _font(font)
    if f:
        curve.font = f
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location, obj.rotation_euler, obj.scale = location, rotation, scale
    curve.materials.append(material)
    if parent:
        obj.parent = parent
    return obj


def road_paint(name="Road paint"):
    """Thermoplastic road paint: off-white, a little rough, worn where wheels run."""
    m, p, n, l = M._principled(name)
    M._set(p, "Base Color", (0.72, 0.71, 0.66, 1))
    M._smudges(n, l, p.inputs["Roughness"], 0.45, 0.7, scale=1.2)
    return m


def brass(name="Brushed brass"):
    m, p, n, l = M._principled(name)
    M._set(p, "Base Color", (0.86, 0.66, 0.36, 1))
    M._set(p, "Metallic", 1.0)
    M._smudges(n, l, p.inputs["Roughness"], 0.16, 0.26, scale=4.0)
    return m


def etched_glass(name="Etched glass"):
    """Acid-etched manifestation on clear glass: a frosted white that lets light through."""
    m, p, *_ = M._principled(name)
    M._set(p, "Base Color", (0.9, 0.91, 0.92, 1))
    M._set(p, "Roughness", 0.6)
    M._set(p, "Alpha", 0.85)
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "BLENDED"
    return m


def parking_read_zone(reader_y=-3.4, lane_x=11.5, reach=10.0):
    """"10 m" painted across the driveway where the UHF10's 10 m read range begins (catalogue: up to 10 m),
    stretched along the lane as real road markings are, so it reads true to a driver coming up the ramp."""
    paint = road_paint()
    y = reader_y - reach
    _type("Read zone 10 m", "10 m", 1.1, (lane_x, y + 1.7, 0.043), (0, 0, 0), paint, scale=(1.0, 2.4, 1.0))
    for k in range(8):  # a dashed line across the lane at the exact read distance
        box(f"Read zone dash {k}", (0.32, 0.18, 0.004), (lane_x - 2.0 + k * 0.57, y, 0.042), paint, 0)


def detector_inlay(y=2.6):
    """"18" inlaid flush in the marble before the ZK-D3180S: its 18 detection zones (catalogue)."""
    _type("Lobby inlay 18", "18", 1.25, (0.0, y, 0.0012), (0, 0, 0), brass(), extrude=0.0008)


def door_etching():
    """Etched lettering on the office door's glass, moving with the leaf when it swings."""
    leaf = bpy.data.objects.get("Office door leaf")
    if leaf is None:
        return
    glass = etched_glass()
    # In the leaf's own space the pane runs along +X from the hinge, centred about y = 0.
    for face, y in ((-1, -0.0065), (1, 0.0065)):
        _type(f"Door etching {face}", "11", 0.42, (0.5, y, 1.55), (math.pi / 2, 0, 0 if face < 0 else math.pi), glass,
              font="MonaSans-SemiCondensedBold", parent=leaf)
    band = empty("Door band", (0, 0, 0), parent=leaf)
    for k in range(18):  # a dotted band at eye level, the usual safety manifestation
        box(f"Door band dot {k}", (0.03, 0.013, 0.03), (0.1 + k * 0.045, 0, 1.15), glass, 0, parent=band)


def build():
    parking_read_zone()
    detector_inlay()
    door_etching()

"""The rooms the visitor passes through, built inside the tower (tower.py gives the coordinates).

Ground floor: the car park portal with the BGM-1030 and UHF10 at the front right, and the double-height
lobby behind the main doors: the ZK-D3180S metal detector first, then the row of MARS-B1200 speed gates,
then the lifts in the oak wall. Office floor: out of the lift, down a corridor to the glass door with the
ProFace X and the ALF-M560, into the office where the SpeedFace V5L and the attendance screen stand, and
on to the windows over the skyline.
"""

import math

import bpy

from . import materials as M
from .barrier import bgm_1030, pole_with_reader
from .build import DEG, box, cylinder, empty
from .detector import zk_d3180s
from .door import glass_door
from .dressing import planter, reception_desk
from .monitor import monitor
from .speedgate import W as GATE_W
from .speedgate import default_materials, speed_gate
from .terminals import proface_x, speedface_v5l
from .tower import GROUND_H, OFFICE_FLOOR, X0, X1, Y1, curtain_wall, floor_z

LOBBY_X1 = 8.0  # the lobby's right wall; the car park ramp is beyond it
LOBBY_Y1 = 16.0  # the oak wall with the lifts
GATES_Y = 8.0
DETECTOR_Y = 3.6


def _linear_lights(name, xs, y0, y1, z, strength, colour=(1.0, 0.86, 0.7)):
    led, trim = M.led(f"{name} LED", colour, strength), M.dark_metal(f"{name} trim")
    for k, x in enumerate(xs):
        box(f"{name} trim {k}", (0.08, y1 - y0 + 0.04, 0.012), (x, (y0 + y1) / 2, z - 0.004), trim, 0)
        box(f"{name} {k}", (0.05, y1 - y0, 0.012), (x, (y0 + y1) / 2, z - 0.006), led, 0)


def _lift_portals(name, y, z0, xs=(-1.4, 1.4)):
    """Lift entrances facing -Y: a dark frame (two jambs and a head) around a 1.1 x 2.35 m opening, closed by
    two brushed steel leaves that slide apart. Returns {lift index: (left leaf, right leaf)} for animation."""
    steel, frame = M.brushed_steel(f"{name} doors", axis="Z"), M.dark_metal(f"{name} frame")
    arrow = M.led(f"{name} arrow", (1.0, 0.9, 0.8), 3.0)
    leaves = {}
    for k, x in enumerate(xs):
        for side in (-1, 1):
            box(f"{name} jamb {k}{side}", (0.2, 0.14, 2.6), (x + side * 0.65, y - 0.07, z0 + 1.3), frame, 0.004)
        box(f"{name} head {k}", (1.5, 0.14, 0.25), (x, y - 0.07, z0 + 2.475), frame, 0.004)
        leaves[k] = tuple(box(f"{name} leaf {k}{side}", (0.55, 0.04, 2.35), (x + side * 0.277, y - 0.16, z0 + 1.175), steel, 0.002)
                          for side in (-1, 1))
        box(f"{name} indicator {k}", (0.18, 0.01, 0.05), (x, y - 0.145, z0 + 2.45), arrow, 0)
    return leaves


def _cut_opening(targets, location, size):
    """Cut a doorway through wall objects with a hidden Boolean cutter (it survives their Array modifiers)."""
    cutter = box(f"Cutter {location}", size, location, None, 0)
    cutter.hide_render, cutter.display_type = True, "WIRE"
    for obj in targets:
        mod = obj.modifiers.new("Opening", "BOOLEAN")
        mod.operation, mod.object = "DIFFERENCE", cutter
    return cutter


def lift_car(name, x, y_front, z0):
    """The car behind a lift door: steel walls, a stone floor, a lit ceiling. Only ever seen through its own
    door, and as the room the camera rides between floors."""
    steel, floor = M.brushed_steel(f"{name} walls", axis="Z"), M.plastic(f"{name} floor", (0.04, 0.04, 0.042), 0.4)
    depth, half, h = 1.8, 0.95, 2.5
    yc = y_front + depth / 2
    box(f"{name} floor", (2 * half, depth, 0.05), (x, yc, z0 + 0.025), floor, 0)
    box(f"{name} ceiling", (2 * half, depth, 0.05), (x, yc, z0 + h), M.plaster(f"{name} ceiling", (0.1, 0.1, 0.1)), 0)
    box(f"{name} back", (2 * half, 0.04, h), (x, y_front + depth, z0 + h / 2), steel, 0)
    for side in (-1, 1):
        box(f"{name} side {side}", (0.04, depth, h), (x + side * half, yc, z0 + h / 2), steel, 0)
    box(f"{name} light", (1.2, 1.0, 0.01), (x, yc, z0 + h - 0.03), M.led(f"{name} light", (1.0, 0.92, 0.82), 4.0), 0)
    bpy.ops.object.light_add(type="AREA", location=(x, yc, z0 + h - 0.05))
    lamp = bpy.context.object
    lamp.name, lamp.data.energy, lamp.data.size = f"{name} lamp", 60, 1.0


def ground_floor(opts):
    """Lobby and car park portal. `opts` carries the motion states (boom, zones, gates)."""
    frame, glass = M.dark_metal("Lobby mullion"), M.window_glass("Lobby glass")
    stone = M.concrete("Stone cladding", (0.42, 0.4, 0.37))
    lx0, lx1 = X0, LOBBY_X1
    cx = (lx0 + lx1) / 2
    box("Lobby floor", (lx1 - lx0, LOBBY_Y1, 0.1), (cx, LOBBY_Y1 / 2, -0.05), M.marble_floor(), 0)
    box("Lobby ceiling", (lx1 - lx0, LOBBY_Y1, 0.1), (cx, LOBBY_Y1 / 2, GROUND_H - 0.35), M.plaster("Lobby ceiling", (0.7, 0.69, 0.66)), 0)
    # The street front: glass from the left corner to the lobby's right wall, sliding doors in the middle.
    curtain_wall("Lobby front", "X", 0.0, lx0, lx1, 0.0, GROUND_H - 0.3, frame, glass, transoms=(3.2,), gaps=((-1.6, 1.6),))
    door_glass = M.window_glass("Sliding door")
    for side in (-1, 1):
        box(f"Sliding leaf {side}", (1.55, 0.02, 2.9), (side * 0.8, -0.1, 1.45), door_glass, 0)
        box(f"Sliding rail {side}", (1.55, 0.06, 0.06), (side * 0.8, -0.1, 2.93), frame, 0.003)
    box("Door head", (3.3, 0.3, 0.3), (0, -0.05, 3.05), M.dark_metal("Door head"), 0.004)
    # Sides and back of the lobby.
    box("Lobby left wall", (0.3, LOBBY_Y1, GROUND_H), (lx0 + 0.15, LOBBY_Y1 / 2, GROUND_H / 2), stone, 0)
    box("Lobby right wall", (0.2, LOBBY_Y1, GROUND_H), (lx1 + 0.1, LOBBY_Y1 / 2, GROUND_H / 2), M.plaster("Lobby wall"), 0)
    backing = box("Oak wall backing", (lx1 - lx0, 0.1, GROUND_H), (cx, LOBBY_Y1 + 0.05, GROUND_H / 2), M.plaster("Oak backing", (0.03, 0.028, 0.026)), 0)
    slat = box("Oak slats", (0.045, 0.05, GROUND_H - 0.5), (lx0 + 0.35, LOBBY_Y1 - 0.03, (GROUND_H - 0.4) / 2 + 0.03), M.oak(), 0.004)
    arr = slat.modifiers.new("Array", "ARRAY")
    arr.use_relative_offset, arr.use_constant_offset = False, True
    arr.constant_offset_displace = (0.1, 0, 0)
    arr.count = int((lx1 - lx0 - 0.5) / 0.1)
    _lift_portals("Lobby lift", LOBBY_Y1 - 0.06, 0.0)
    _cut_opening((backing, slat), (-1.4, LOBBY_Y1 + 0.05, 1.175), (1.1, 0.6, 2.35))
    lift_car("Lobby lift car", -1.4, LOBBY_Y1 + 0.1, 0.0)
    # Screening first, then the gates, with glass balustrades closing the line either side.
    zk_d3180s("ZK-D3180S", (0, DETECTOR_Y, 0), zones_lit=int(opts.get("zones", "0")))
    mats = default_materials()
    opening = float(opts.get("gates", "0"))
    speed_gate("Gate A", (-GATE_W / 2 - 0.01, GATES_Y, 0), opening, mats)
    speed_gate("Gate B", (GATE_W / 2 + 0.01, GATES_Y, 0), opening, mats)
    rail_glass, post = M.clear_glass("Balustrade glass"), M.brushed_steel("Balustrade post", axis="Z")
    for s0, s1 in ((lx0 + 0.3, -GATE_W - 0.02), (GATE_W + 0.02, lx1)):
        box(f"Balustrade {s0}", (s1 - s0, 0.012, 1.0), ((s0 + s1) / 2, GATES_Y, 0.55), rail_glass, 0.002)
        for k in range(int((s1 - s0) / 1.5) + 1):
            box(f"Balustrade post {s0}{k}", (0.05, 0.05, 1.05), (s0 + k * 1.5, GATES_Y, 0.525), post, 0.003)
    reception_desk("Lobby reception", (-10.5, 5.0, 0), length=3.6, rotation_z=90 * DEG)
    planter("Lobby planter left", (-13.8, 14.6, 0), seed=11)
    planter("Lobby planter right", (6.8, 14.6, 0), seed=5)
    _linear_lights("Lobby light", [lx0 + 2.0 + 2.5 * k for k in range(9)], 1.0, LOBBY_Y1 - 1.0, GROUND_H - 0.4, 14.0)
    # A warm grazer down the oak wall, as in the dusk look test.
    bpy.ops.object.light_add(type="AREA", location=(cx, LOBBY_Y1 - 0.12, GROUND_H - 0.45))
    graze = bpy.context.object
    graze.data.shape, graze.data.size, graze.data.size_y = "RECTANGLE", lx1 - lx0 - 0.6, 0.05
    graze.data.energy, graze.data.color, graze.data.spread = 600, (1.0, 0.72, 0.45), 25 * DEG
    graze.rotation_euler = (-14 * DEG, 0, 0)  # tipped into the wall so it rakes the slats, not the floor


def car_park_portal(opts):
    """The car park entrance at the front right: a stone frame, a ramp falling into the basement under
    cool strip lights, and the barrier with its UHF reader on the kerb before it."""
    stone, conc = M.concrete("Portal stone", (0.42, 0.4, 0.37)), M.concrete("Ramp concrete")
    px0, px1, ph = 9.0, 14.0, 3.2
    box("Portal left", (px0 - LOBBY_X1, 0.6, GROUND_H), ((LOBBY_X1 + px0) / 2, 0.0, GROUND_H / 2), stone, 0.004)
    box("Portal right", (X1 - px1, 0.6, GROUND_H), ((px1 + X1) / 2, 0.0, GROUND_H / 2), stone, 0.004)
    box("Portal lintel", (px1 - px0, 0.6, GROUND_H - ph), ((px0 + px1) / 2, 0.0, (ph + GROUND_H) / 2), stone, 0.004)
    length, drop = 14.0, 3.0
    slope = math.atan2(drop, length)
    ramp = box("Ramp", (px1 - px0, math.hypot(length, drop), 0.2), ((px0 + px1) / 2, length / 2, -drop / 2 - 0.1), conc, 0)
    ramp.rotation_euler = (-slope, 0, 0)
    for x in (px0 - 0.1, px1 + 0.1):
        box(f"Ramp wall {x}", (0.2, length, ph + drop), (x, length / 2, (ph - drop) / 2), conc, 0)
    box("Ramp ceiling", (px1 - px0 + 0.4, length, 0.2), ((px0 + px1) / 2, length / 2, ph + 0.1), conc, 0)
    box("Ramp end", (px1 - px0, 0.2, ph + drop), ((px0 + px1) / 2, length, (ph - drop) / 2), M.plaster("Ramp end", (0.05, 0.05, 0.05)), 0)
    cool = M.led("Car park strip", (0.85, 0.92, 1.0), 12.0)
    for k in range(5):
        box(f"Ramp strip {k}", (1.2, 0.08, 0.03), ((px0 + px1) / 2, 1.5 + k * 2.8, ph - 0.02), cool, 0)
    # Barrier on the lane's left kerb, boom across the lane; the reader before it, turned to the driver.
    box("Barrier island", (0.9, 3.2, 0.15), (px0 + 0.15, -2.2, 0.075), M.concrete("Island", (0.5, 0.48, 0.44)), 0.01)
    bgm_1030("BGM-1030", (px0 + 0.2, -1.4, 0.15), rotation_z=0.0, boom_open=float(opts.get("boom", "0")))
    pole_with_reader("UHF10 pole", (px0 + 0.1, -3.4, 0.15), facing_deg=-15, height=1.9)


def office_floor(opts):
    """Floor 11: lift lobby, a corridor to the glass door (ProFace X, ALF-M560), the clock-in point
    (SpeedFace V5L, attendance screen) and an open office running to the windows."""
    z0 = floor_z(OFFICE_FLOOR)
    ceil = 2.9
    frame, glass = M.dark_metal("Office mullion"), M.window_glass("Office glass")
    wall = M.plaster("Office wall", (0.66, 0.65, 0.62))
    # 1 cm proud of the tower box below, so the two top faces never fight.
    box("Office floor", (X1 - X0, Y1, 0.1), (0, Y1 / 2, z0 - 0.04), M.carpet(), 0)
    box("Office ceiling", (X1 - X0, Y1, 0.1), (0, Y1 / 2, z0 + ceil + 0.05), M.plaster("Office ceiling", (0.72, 0.72, 0.7)), 0)
    box("Slab below office", (X1 - X0 + 0.2, 0.3, 0.6), (0, 0.0, z0 - 0.3), M.concrete("Office slab edge", (0.2, 0.2, 0.21)), 0.004)
    box("Plenum above office", (X1 - X0 + 0.2, 0.3, 0.6), (0, 0.0, z0 + ceil + 0.4), M.concrete("Office plenum", (0.2, 0.2, 0.21)), 0.004)
    curtain_wall("Office front", "X", 0.0, X0, X1, z0, z0 + ceil + 0.1, frame, glass)
    for label, size, loc in (("Office lining left", (0.05, Y1, ceil), (X0 + 0.35, Y1 / 2, z0 + ceil / 2)),
                             ("Office lining right", (0.05, Y1, ceil), (X1 - 0.35, Y1 / 2, z0 + ceil / 2)),
                             ("Office lining back", (X1 - X0, 0.05, ceil), (0, Y1 - 0.35, z0 + ceil / 2))):
        box(label, size, loc, wall, 0)
    # Lift lobby and corridor.
    lift_wall = box("Lift wall", (8.0, 0.2, ceil), (0, 16.1, z0 + ceil / 2), wall, 0)
    _lift_portals("Office lift", 16.0, z0)
    _cut_opening((lift_wall,), (-1.4, 16.1, z0 + 1.175), (1.1, 0.6, 2.35))
    lift_car("Office lift car", -1.4, 16.2, z0)
    # The corridor stops 1.4 m short of the lift wall, leaving a lift lobby the doors open into.
    for x in (-1.6, 1.6):
        box(f"Corridor wall {x}", (0.2, 5.6, ceil), (x, 11.8, z0 + ceil / 2), wall, 0)
    box("Corridor ceiling", (3.0, 5.6, 0.3), (0, 11.8, z0 + 2.6 + 0.15), M.plaster("Corridor ceiling", (0.72, 0.72, 0.7)), 0)
    down = M.led("Corridor downlight", (1.0, 0.86, 0.72), 30.0)
    for k in range(4):
        cylinder(f"Corridor downlight {k}", 0.05, 0.01, (0, 10.0 + k * 1.8, z0 + 2.595), down, vertices=24, bevel=0)
        bpy.ops.object.light_add(type="SPOT", location=(0, 10.0 + k * 1.8, z0 + 2.58))
        spot = bpy.context.object
        spot.data.energy, spot.data.color = 220, (1.0, 0.85, 0.7)
        spot.data.spot_size, spot.data.spot_blend = 70 * DEG, 0.5
    # The secure door: sidelight on the left, the door, a solid panel on the right carrying the ProFace X.
    side_glass = M.clear_glass("Sidelight")
    box("Sidelight", (0.95, 0.012, 2.2), (-1.0, 9.0, z0 + 1.1), side_glass, 0.002)
    box("Door bulkhead", (3.2, 0.2, ceil - 2.3), (0, 9.0, z0 + 2.3 + (ceil - 2.3) / 2), wall, 0)
    box("Reader panel", (1.0, 0.1, 2.3), (1.05, 9.0, z0 + 1.15), M.oak("Reader panel oak"), 0.004)
    glass_door("Office door", (0.475, 9.0, z0), rotation_z=math.pi, open_deg=70 * float(opts.get("door", "0")))
    reader = proface_x("ProFace X", (1.05, 9.05 + 0.013, z0 + 1.45))
    reader.rotation_euler = (0, 0, math.pi)  # faces the visitor coming down the corridor
    # Clock-in: the SpeedFace V5L on a slim steel stand, the attendance screen on the counter beside it.
    stand = M.brushed_steel("Terminal stand", axis="Z")
    box("Terminal stand", (0.1, 0.1, 1.28), (1.9, 7.3, z0 + 0.64), stand, 0.003)
    box("Terminal stand foot", (0.32, 0.32, 0.015), (1.9, 7.3, z0 + 0.0075), stand, 0.003)
    sf = speedface_v5l("SpeedFace V5L", (1.9, 7.3 + 0.06, z0 + 1.28 + 0.1))
    sf.rotation_euler = (0, 0, math.pi)
    reception_desk("Office counter", (-0.9, 5.6, z0), length=2.6, rotation_z=math.pi)
    monitor("Attendance screen", (-0.6, 5.55, z0 + 1.09), rotation_z=math.pi - 25 * DEG)
    # Workstations by the windows.
    top, legs = M.plastic("Desk top", (0.6, 0.59, 0.56), 0.4), M.dark_metal("Desk legs")
    for k, x in enumerate((-11, -7, -3, 3, 7, 11)):
        box(f"Desk {k}", (1.6, 0.8, 0.03), (x, 2.4, z0 + 0.735), top, 0.003)
        for lx in (-0.75, 0.75):
            box(f"Desk leg {k}{lx}", (0.04, 0.7, 0.72), (x + lx, 2.4, z0 + 0.36), legs, 0.002)
        monitor(f"Desk monitor {k}", (x, 2.65, z0 + 0.75), rotation_z=math.pi, screen_image=None)
    planter("Office planter", (-13.6, 1.2, z0), seed=21)
    planter("Office planter 2", (13.6, 1.2, z0), seed=9)
    panel = M.led("Ceiling panel", (1.0, 0.95, 0.88), 3.0)
    for x in range(-12, 13, 4):
        for y in (2.0, 5.5):
            box(f"Ceiling panel {x}{y}", (1.2, 0.6, 0.01), (x, y, z0 + ceil - 0.006), panel, 0)

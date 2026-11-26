"""Lobby dressing: what makes a corner read as a real, used building rather than a set.

Kept procedural and seeded, so every render of the look test is identical.
"""

import math
import random

import bmesh
import bpy

from . import materials as M
from .build import box, cylinder, empty


def _leaf(bm, base, height, width, yaw, lean):
    """One snake-plant leaf: lance-shaped, folded slightly along its midrib, leaning out and curving."""
    rows = 12
    fold = width * 0.18
    cols = []
    for i in range(rows + 1):
        t = i / rows
        half = width / 2 * max(0.0, math.sin(math.pi * min(1.0, 0.15 + 0.95 * t))) ** 0.7
        out = lean * height * t * t  # curves outward more toward the tip
        z = height * t
        row = []
        for u, depth in ((-half, 0.0), (0.0, fold * (1 - t)), (half, 0.0)):
            x, y = u, out + depth
            c, s = math.cos(yaw), math.sin(yaw)
            row.append(bm.verts.new((base[0] + x * c - y * s, base[1] + x * s + y * c, base[2] + z)))
        cols.append(row)
    for i in range(rows):
        for j in range(2):
            bm.faces.new((cols[i][j], cols[i][j + 1], cols[i + 1][j + 1], cols[i + 1][j]))


def planter(name, location, seed=7):
    """A charcoal fibreglass planter with a clump of snake plant (Sansevieria), common in Gulf offices."""
    rng = random.Random(seed)
    x, y, z = location
    cylinder(f"{name} pot", 0.24, 0.62, (x, y, z + 0.31), M.ceramic(), vertices=64, bevel=0.01)
    cylinder(f"{name} soil", 0.225, 0.02, (x, y, z + 0.6), M.soil(), vertices=64, bevel=0.002)
    mesh = bpy.data.meshes.new(f"{name} leaves")
    bm = bmesh.new()
    for _ in range(22):
        r = 0.12 * math.sqrt(rng.random())
        a = rng.random() * 2 * math.pi
        base = (x + r * math.cos(a), y + r * math.sin(a), z + 0.6)
        _leaf(bm, base, rng.uniform(0.55, 1.05), rng.uniform(0.05, 0.08), a - math.pi / 2 + rng.uniform(-0.5, 0.5), rng.uniform(0.05, 0.25))  # lean away from the centre
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(f"{name} leaves", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(M.leaf())
    return obj


def reception_desk(name, location, length=3.2, rotation_z=0.0):
    """A long reception desk: oak front and a dark stone top that overhangs on the visitor side (-Y)."""
    root = empty(name, location)
    root.rotation_euler = (0, 0, rotation_z)
    box(f"{name} body", (length, 0.7, 0.99), (0, 0, 0.555), M.oak("Desk oak"), 0.004, parent=root)
    box(f"{name} top", (length + 0.06, 0.82, 0.04), (0, -0.04, 1.07), M.dark_stone(), 0.003, parent=root)
    # A recessed dark plinth makes the desk float a little, as joinery does.
    box(f"{name} plinth", (length - 0.08, 0.6, 0.06), (0, 0.03, 0.03), M.dark_metal("Desk plinth"), 0, parent=root)
    return root


def date_palm(name, location, seed=1, height=None, uplight=True):
    """A date palm, as every Dubai forecourt has: a ringed trunk with a slight lean, about 22 fronds arching
    out and drooping, and a warm uplight in its tree pit."""
    rng = random.Random(seed)
    x, y, z = location
    h = height or rng.uniform(5.5, 7.5)
    lean = (rng.uniform(-0.25, 0.25), rng.uniform(-0.25, 0.25))
    top = (x + lean[0], y + lean[1], z + h)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.3, radius2=0.22, depth=h, location=((x + top[0]) / 2, (y + top[1]) / 2, z + h / 2))
    trunk = bpy.context.object
    trunk.name = f"{name} trunk"
    trunk.rotation_euler = (-lean[1] / h, lean[0] / h, 0)
    trunk.data.materials.append(M.palm_bark())
    for poly in trunk.data.polygons:
        poly.use_smooth = True
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    for k in range(22):
        yaw = k / 22 * 2 * math.pi + rng.uniform(-0.15, 0.15)
        pitch = math.radians(rng.uniform(-10, 60))
        length, droop = rng.uniform(2.6, 3.4), rng.uniform(0.25, 0.5)
        _frond(bm, uv, top, yaw, pitch, length, droop)
    mesh = bpy.data.meshes.new(f"{name} fronds")
    bm.to_mesh(mesh)
    bm.free()
    fronds = bpy.data.objects.new(f"{name} fronds", mesh)
    bpy.context.collection.objects.link(fronds)
    fronds.data.materials.append(M.palm_frond())
    box(f"{name} grate", (1.2, 1.2, 0.02), (x, y, z + 0.01), M.dark_metal("Tree grate"), 0)
    if uplight:
        bpy.ops.object.light_add(type="SPOT", location=(x + 0.4, y - 0.4, z + 0.05), rotation=(0, 0, 0))
        spot = bpy.context.object
        spot.name = f"{name} uplight"
        spot.rotation_euler = (math.radians(180 - 8), 0, 0)  # pointing up, tipped into the crown
        spot.data.energy, spot.data.color = 400, (1.0, 0.78, 0.5)
        spot.data.spot_size, spot.data.spot_blend = math.radians(40), 0.4
    return fronds


def _frond(bm, uv, base, yaw, pitch, length, droop, rows=14, width=0.6):
    """One frond as a ribbon along an arching curve, folded a little along its midrib."""
    dx, dy = math.cos(yaw), math.sin(yaw)
    px, py = -dy, dx  # across the frond, horizontal
    rows_v = []
    for i in range(rows + 1):
        t = i / rows
        along = length * t
        cx = base[0] + dx * along * math.cos(pitch)
        cy = base[1] + dy * along * math.cos(pitch)
        cz = base[2] + along * math.sin(pitch) - droop * length * t * t
        half = width / 2 * math.sin(math.pi * min(1.0, 0.1 + t)) ** 0.6
        fold = 0.08 * half
        rows_v.append([bm.verts.new((cx + px * s * half, cy + py * s * half, cz + (fold if s == 0 else 0)))
                       for s in (-1, 0, 1)])
    for i in range(rows):
        for j in range(2):
            face = bm.faces.new((rows_v[i][j], rows_v[i][j + 1], rows_v[i + 1][j + 1], rows_v[i + 1][j]))
            for loop, (u, v) in zip(face.loops, ((j / 2, i / rows), ((j + 1) / 2, i / rows), ((j + 1) / 2, (i + 1) / rows), (j / 2, (i + 1) / rows))):
                loop[uv].uv = (u, v)

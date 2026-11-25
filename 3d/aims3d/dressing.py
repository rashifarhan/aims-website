"""Lobby dressing: what makes a corner read as a real, used building rather than a set.

Kept procedural and seeded, so every render of the look test is identical.
"""

import math
import random

import bmesh
import bpy

from . import materials as M
from .build import box, cylinder


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


def reception_desk(name, location, length=3.2):
    """A long reception desk: oak front and a dark stone top that overhangs on the visitor side."""
    x, y, z = location
    box(f"{name} body", (length, 0.7, 0.99), (x, y, z + 0.555), M.oak("Desk oak"), 0.004)
    box(f"{name} top", (length + 0.06, 0.82, 0.04), (x, y - 0.04, z + 1.07), M.dark_stone(), 0.003)
    # A recessed dark plinth makes the desk float a little, as joinery does.
    box(f"{name} plinth", (length - 0.08, 0.6, 0.06), (x, y + 0.03, z + 0.03), M.dark_metal("Desk plinth"), 0)

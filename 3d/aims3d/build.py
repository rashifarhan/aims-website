"""Small geometry helpers: bevelled boxes, cylinders and parenting, in metres."""

import math

import bpy


def _finish(obj, material, bevel, smooth=False):
    if material is not None:
        obj.data.materials.append(material)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
        mod.harden_normals = True
    # Smooth only with a hardened bevel: on a bare 8-vertex box, smooth shading bends the normals across
    # each face, so big flat walls and glass shade (and reflect) as if curved.
    for poly in obj.data.polygons:
        poly.use_smooth = bool(bevel) or smooth
    return obj


def box(name, size, location, material=None, bevel=0.004, rotation=(0, 0, 0), parent=None):
    """A box of `size` (x, y, z) metres whose centre sits at `location`."""
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if parent:
        obj.parent = parent
    return _finish(obj, material, bevel)


def cylinder(name, radius, depth, location, material=None, rotation=(0, 0, 0), vertices=48, bevel=0.002, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rotation, vertices=vertices)
    obj = bpy.context.object
    obj.name = name
    if parent:
        obj.parent = parent
    return _finish(obj, material, bevel, smooth=True)  # round sides want smooth normals even unbevelled


def prism(name, profile, depth, location, material=None, bevel=0.003, axis="Y", parent=None):
    """Extrude a 2D profile [(u, v), ...] by `depth` along `axis` (for chamfered caps and wedges)."""
    mesh = bpy.data.meshes.new(name)
    n = len(profile)
    half = depth / 2
    if axis == "Y":
        verts = [(u, -half, v) for u, v in profile] + [(u, half, v) for u, v in profile]
    elif axis == "Z":  # profile in plan (u = x, v = y), extruded upward
        verts = [(u, v, -half) for u, v in profile] + [(u, v, half) for u, v in profile]
    else:  # X
        verts = [(-half, u, v) for u, v in profile] + [(half, u, v) for u, v in profile]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    faces += [[i, (i + 1) % n, n + (i + 1) % n, n + i] for i in range(n)]
    mesh.from_pydata(verts, [], faces)
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)  # the profile may be wound either way
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    if parent:
        obj.parent = parent
    return _finish(obj, material, bevel)


def rounded_rect(w, h, r, steps=8):
    """A w x h rectangle centred on the origin with corners of radius r, as a closed 2D profile."""
    r = min(r, w / 2, h / 2)
    pts = []
    for cu, cv, start in ((w / 2 - r, -h / 2 + r, -90), (w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180)):
        for k in range(steps + 1):
            a = math.radians(start + 90 * k / steps)
            pts.append((cu + r * math.cos(a), cv + r * math.sin(a)))
    return pts


def rounded_box(name, size, location, radius, material=None, bevel=0.002, axis="Y", parent=None):
    """A box of `size` (x, y, z) whose corners are rounded by `radius` as seen along `axis`:
    "Y" rounds the front outline (a terminal or a cabinet seen face-on), "Z" rounds it in plan."""
    sx, sy, sz = size
    if axis == "Y":
        return prism(name, rounded_rect(sx, sz, radius), sy, location, material, bevel, "Y", parent)
    if axis == "Z":
        return prism(name, rounded_rect(sx, sy, radius), sz, location, material, bevel, "Z", parent)
    return prism(name, rounded_rect(sy, sz, radius), sx, location, material, bevel, "X", parent)


def text(name, body, size, location, material=None, extrude=0.001, rotation=(math.pi / 2, 0, 0), parent=None):
    """Extruded text standing upright and facing -Y (toward the default camera), centred on `location`."""
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = body
    curve.size = size
    curve.extrude = extrude
    curve.align_x, curve.align_y = "CENTER", "CENTER"
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location, obj.rotation_euler = location, rotation
    if material is not None:
        curve.materials.append(material)
    if parent:
        obj.parent = parent
    return obj


def panel(name, width, height, location, material=None, parent=None):
    """A flat w x h rectangle facing -Y with 0..1 UVs (u across, v up): for screens and printed graphics."""
    bpy.ops.mesh.primitive_plane_add(location=location, rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (width / 2, height / 2, 1)
    bpy.ops.object.transform_apply(scale=True)
    if parent:
        obj.parent = parent
    return _finish(obj, material, 0)


def empty(name, location=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    if parent:
        obj.parent = parent
    return obj


def look_at(obj, target):
    from mathutils import Vector

    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


DEG = math.pi / 180

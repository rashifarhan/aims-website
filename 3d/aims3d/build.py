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

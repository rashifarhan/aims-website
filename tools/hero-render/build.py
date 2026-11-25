"""
AIMS hero film render kit: builds the photoreal SpeedFace scene and renders its 8 s loop (240 frames).

  blender -b -P build.py                      # landscape 1600x900, GPU if present, frames in ./out
  FRAME=portrait blender -b -P build.py       # the 720x900 cut for the small hero box
  SAMPLES=64 RENDER=0 blender -b -P build.py  # fewer samples, or only build the .blend

Needs Blender 4.5 LTS. Textures are in ./tex; the studio HDRI (Poly Haven, CC0) downloads on first run.
"""
import bpy, bmesh, math, sys, os
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); TEX = HERE + "/tex"; OUT = os.environ.get("OUT", HERE + "/out")
os.makedirs(OUT, exist_ok=True)
HDRI = HERE + "/studio_small_09_2k.hdr"
if not os.path.exists(HDRI):  # free studio light from Poly Haven (CC0), fetched once
    import urllib.request
    urllib.request.urlretrieve("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr", HDRI)
LANDSCAPE = os.environ.get("FRAME", "landscape") == "landscape"
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = 30; sc.frame_start = 1; sc.frame_end = 240

W, H, D = 0.92, 1.97, 0.20
R = 0.055 * W / 0.92 * 1.0  # corner radius in plan

def rrect_mesh(name, w, h, depth, r, seg=10):
    """A rounded-rectangle prism, front face at y=0 facing -y, extruded back by depth."""
    bm = bmesh.new()
    pts = []
    for cx, cy, a0 in [(w/2-r, h/2-r, 0), (-w/2+r, h/2-r, 90), (-w/2+r, -h/2+r, 180), (w/2-r, -h/2+r, 270)]:
        for i in range(seg+1):
            a = math.radians(a0 + 90*i/seg)
            pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    front = [bm.verts.new((x, 0, z)) for x, z in pts]
    face = bm.faces.new(front)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.y += depth
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    return ob

def bevel(ob, w=0.012, seg=4):
    m = ob.modifiers.new("bevel", "BEVEL"); m.width = w; m.segments = seg; m.limit_method = "ANGLE"
    ob.modifiers.new("wn", "WEIGHTED_NORMAL")
    for p in ob.data.polygons: p.use_smooth = True

def principled(name, color, rough=0.5, metal=0.0, coat=0.0, aniso=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal; b.inputs["Coat Weight"].default_value = coat
    if aniso: b.inputs["Anisotropic"].default_value = aniso
    return m

def image_node(m, path, alpha=False):
    nt = m.node_tree; img = bpy.data.images.load(path)
    tn = nt.nodes.new("ShaderNodeTexImage"); tn.image = img; tn.interpolation = "Cubic"
    if not alpha: img.alpha_mode = "NONE"
    return tn

def planar_uv(ob):
    """UVs from the front projection (x→u, z→v) over the object's own bounds."""
    me = ob.data; xs = [v.co.x for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
    uv = me.uv_layers.new(name="UV")
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = ((co.x - x0)/(x1 - x0), (co.z - z0)/(z1 - z0))

rig = bpy.data.objects.new("rig", None); sc.collection.objects.link(rig)
rig.location = (0, 0, H/2 + 0.25)

# --- back shell (matte black plastic) and back plate (metal mount) ---
shell = rrect_mesh("shell", W, H, D*0.72, R); shell.location = (0, 0.035, 0); bevel(shell, 0.03, 6)
shell.data.materials.append(principled("shell", (0.012, 0.013, 0.014), rough=0.42, coat=0.2)); shell.parent = rig
plate = rrect_mesh("plate", W*0.82, H*0.86, 0.03, R); plate.location = (0, D*0.72 + 0.05, 0); bevel(plate, 0.01, 3)
plate.data.materials.append(principled("plate", (0.6, 0.62, 0.63), rough=0.35, metal=1.0)); plate.parent = rig
# --- circuit board inside ---
pcb = rrect_mesh("pcb", W*0.84, H*0.8, 0.018, 0.02); pcb.location = (0, 0.06, 0); bevel(pcb, 0.004, 2)
pcb.data.materials.append(principled("pcb", (0.02, 0.17, 0.07), rough=0.45, coat=0.4)); pcb.parent = rig
chipm = principled("chip", (0.02, 0.02, 0.022), rough=0.3)
goldm = principled("gold", (0.9, 0.7, 0.3), rough=0.25, metal=1.0)
for (x, z, w, h, d) in [(-0.16, 0.45, 0.24, 0.24, 0.03), (0.17, 0.42, 0.16, 0.3, 0.03), (0.0, 0.0, 0.42, 0.18, 0.025),
                        (-0.2, -0.38, 0.12, 0.12, 0.02), (0.2, -0.38, 0.12, 0.12, 0.02), (0.0, -0.62, 0.5, 0.06, 0.03)]:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0.05 - d/2, z)); c = bpy.context.active_object
    c.scale = (w, d, h); c.data.materials.append(chipm if h > 0.07 else goldm); c.parent = pcb
    c.location = (x, -d/2, z)
# --- brushed aluminium rim ---
rim_o = rrect_mesh("rim", W + 0.02, H + 0.02, 0.07, R + 0.01); rim_i = rrect_mesh("rim_cut", W - 0.012, H - 0.012, 0.2, R - 0.006)
rim_i.location = (0, -0.05, 0); bo = rim_o.modifiers.new("cut", "BOOLEAN"); bo.object = rim_i; bo.operation = "DIFFERENCE"
rim_i.hide_render = True; rim_i.hide_viewport = True; rim_o.location = (0, 0.0, 0); bevel(rim_o, 0.012, 5)
rim_o.data.materials.append(principled("alu", (0.72, 0.73, 0.74), rough=0.22, metal=1.0, aniso=0.6)); rim_o.parent = rig; rim_i.parent = rig
# --- screen (two textures mixed by 'verified') ---
sw, sh, sz = 254/362*W, 444/776*H, (388-376)/776*H
bpy.ops.mesh.primitive_plane_add(size=1); scr = bpy.context.active_object; scr.name = "screen"
scr.rotation_euler = (math.radians(90), 0, 0); scr.scale = (sw, sh, 1); bpy.ops.object.transform_apply(rotation=True, scale=True)
scr.location = (0, 0.012, sz); planar_uv(scr); scr.parent = rig
ms = bpy.data.materials.new("screen"); ms.use_nodes = True; nt = ms.node_tree
for n in list(nt.nodes):
    if n.type != "OUTPUT_MATERIAL": nt.nodes.remove(n)
t1 = image_node(ms, TEX + "/screen_idle.png"); t2 = image_node(ms, TEX + "/screen_ok.png")
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.name = "verify"
nt.links.new(t1.outputs["Color"], mix.inputs[6]); nt.links.new(t2.outputs["Color"], mix.inputs[7])
em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 0.9
nt.links.new(mix.outputs[2], em.inputs["Color"]); nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0])
scr.data.materials.append(ms)
# --- lime scan line ---
bpy.ops.mesh.primitive_plane_add(size=1); scan = bpy.context.active_object; scan.name = "scan"
scan.rotation_euler = (math.radians(90), 0, 0); scan.scale = (sw*0.98, 0.012, 1); bpy.ops.object.transform_apply(rotation=True, scale=True)
scan.parent = rig; scan.location = (0, 0.008, sz + sh/2)
mscan = bpy.data.materials.new("scan"); mscan.use_nodes = True; e2 = mscan.node_tree.nodes.new("ShaderNodeEmission")
e2.inputs["Color"].default_value = (0.47, 0.75, 0.13, 1); e2.inputs["Strength"].default_value = 0.0; e2.name = "scanem"
mscan.node_tree.links.new(e2.outputs[0], mscan.node_tree.nodes["Material Output"].inputs[0]); scan.data.materials.append(mscan)
# --- printed front (photo texture; screen window cut by alpha) ---
front = rrect_mesh("front", W - 0.006, H - 0.006, 0.004, R - 0.003); front.location = (0, -0.004, 0); front.parent = rig
for p in front.data.polygons: p.use_smooth = False
planar_uv(front)
mf = principled("print", (0.01, 0.01, 0.01), rough=0.06, coat=0.0)
mf.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.5; tf = image_node(mf, TEX + "/front_holed.png", alpha=True)
b = mf.node_tree.nodes["Principled BSDF"]; mf.node_tree.links.new(tf.outputs["Color"], b.inputs["Base Color"])
mf.node_tree.links.new(tf.outputs["Alpha"], b.inputs["Alpha"]); front.data.materials.append(mf)
# --- clear glass cover ---
glass = rrect_mesh("glass", W - 0.006, H - 0.006, 0.006, R - 0.003); glass.location = (0, -0.012, 0); glass.parent = rig; bevel(glass, 0.003, 2)
mg = principled("glass", (1, 1, 1), rough=0.0); mg.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1.0
mg.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.5; glass.data.materials.append(mg)

# --- floor (shadow catcher) ---
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); floor = bpy.context.active_object; floor.is_shadow_catcher = True
# --- world: studio HDRI for light and reflections; the camera sees a plain white backdrop ---
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; wn = w.node_tree
env = wn.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI)
bg = wn.nodes["Background"]; bg.inputs["Strength"].default_value = 0.35; wn.links.new(env.outputs["Color"], bg.inputs["Color"])
# --- lights ---
def area(name, loc, rot, energy, size, color=(1, 1, 1), shape="RECTANGLE", sx=1, sy=1):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot); l = bpy.context.active_object; l.name = name
    l.data.energy = energy; l.data.shape = shape; l.data.size = sx; l.data.size_y = sy; l.data.color = color; return l
key = area("key", (-3.2, -4.0, 4.6), (math.radians(55), 0, math.radians(-38)), 1500, 6, sx=6, sy=6)
softbox = area("softbox", (0.6, -4.2, 4.2), (math.radians(48), 0, math.radians(6)), 420, 3, sx=4.5, sy=1.2)
fill = area("fill", (5.2, -1.2, 0.9), (math.radians(85), 0, math.radians(78)), 220, 2, sx=2, sy=2)
rimL = area("rim", (3.4, 2.0, 3.6), (math.radians(-60), math.radians(30), math.radians(130)), 700, 2, sx=0.6, sy=4)
sweep = area("sweep", (-3.0, -2.6, 1.3), (math.radians(90), 0, 0), 360, 1, sx=0.35, sy=5)

# --- camera ---
cam_d = bpy.data.cameras.new("cam"); cam_d.lens = 70 if LANDSCAPE else 85
if LANDSCAPE: cam_d.shift_x = -0.17  # the terminal sits right of centre; text and labels take the left
cam = bpy.data.objects.new("cam", cam_d); sc.collection.objects.link(cam); sc.camera = cam
tgt = bpy.data.objects.new("tgt", None); sc.collection.objects.link(tgt); tgt.location = (0, 0, H/2 + 0.25)
tr = cam.constraints.new("TRACK_TO"); tr.target = tgt; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"

# --- animation ---
def key_at(obj, path, frame, value, index=-1):
    if index >= 0:
        v = list(getattr(obj, path)); v[index] = value; setattr(obj, path, v); obj.keyframe_insert(path, index=index, frame=frame)
    else:
        setattr(obj, path, value); obj.keyframe_insert(path, frame=frame)
yaw = [(1, 26), (60, 8), (100, 4), (118, 4), (160, 36), (182, 36), (214, 14), (240, 26)]
for f, a in yaw: key_at(rig, "rotation_euler", f, math.radians(a), 2)
for f, z in [(1, H/2 + 0.25), (120, H/2 + 0.31), (240, H/2 + 0.25)]: key_at(rig, "location", f, z, 2)
K = 1.67 if LANDSCAPE else 1.0  # the wider landscape frame needs the camera further back for the same size
for f, (y, z) in [(1, (-6.3, 1.48)), (90, (-5.7, 1.42)), (140, (-7.0, 1.55)), (200, (-6.4, 1.5)), (240, (-6.3, 1.48))]:
    cam.location = (0.0, y * K, 1.25 + (z - 1.25) * K); cam.keyframe_insert("location", frame=f)
# light sweep across the glass from the first frame; it parks off-screen and jumps back unseen
for f, x in [(1, -2.6), (42, 2.8), (228, 2.8)]: key_at(sweep, "location", f, x, 0)
sweep.location.x = -2.6; sweep.keyframe_insert("location", index=0, frame=229)
for fc in sweep.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        if kp.co[0] >= 228: kp.interpolation = "CONSTANT"
# scan line down the screen, then the screen turns verified
for f, z in [(1, sz + sh/2), (46, sz + sh/2), (74, sz - sh/2)]: key_at(scan, "location", f, z, 2)
se = mscan.node_tree.nodes["scanem"].inputs["Strength"]
for f, v in [(44, 0.0), (48, 6.0), (72, 6.0), (76, 0.0)]: se.default_value = v; se.keyframe_insert("default_value", frame=f)
fac = ms.node_tree.nodes["verify"].inputs[0]
for f, v in [(1, 0.0), (72, 0.0), (77, 1.0), (204, 1.0), (214, 0.0), (240, 0.0)]: fac.default_value = v; fac.keyframe_insert("default_value", frame=f)
# the terminal opens into its layers along its depth, and closes again
base = {"glass": -0.012, "front": -0.004, "screen": 0.012, "pcb": 0.06, "shell": 0.035, "plate": D*0.72 + 0.05, "rim": 0.0}
spread = {"glass": -0.95, "front": -0.62, "screen": -0.32, "pcb": 0.12, "shell": 0.42, "plate": 0.78, "rim": -0.62}
objs = {"glass": glass, "front": front, "screen": scr, "pcb": pcb, "shell": shell, "plate": plate, "rim": rim_o}
for n, ob in objs.items():
    for f, k in [(1, 0), (118, 0), (156, 1), (182, 1), (212, 0), (240, 0)]:
        key_at(ob, "location", f, base[n] + spread[n]*k, 1)
for f, k in [(118, 0), (156, 1), (182, 1), (212, 0)]:
    key_at(scan, "location", f, 0.008 - 0.32*k, 1)
rim_i.parent = rim_o; rim_i.location = (0, -0.05, 0)
# The clear cover only shows while the layers are apart: assembled, its reflections greyed the black front.
for f, hidden in [(1, True), (119, False), (211, True)]:
    glass.hide_render = hidden; glass.keyframe_insert("hide_render", frame=f)

# --- render settings ---
sc.render.engine = "CYCLES"; sc.cycles.samples = int(os.environ.get("SAMPLES", "128"))
# Use the graphics card when there is one (OptiX/CUDA on NVIDIA, HIP on AMD, Metal on Apple, oneAPI on Intel).
prefs = bpy.context.preferences.addons["cycles"].preferences; sc.cycles.device = "CPU"
for kind in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
    try:
        prefs.compute_device_type = kind; prefs.get_devices()
    except TypeError:
        continue
    gpus = [d for d in prefs.devices if d.type != "CPU"]
    if gpus:
        for d in prefs.devices: d.use = d.type != "CPU"
        sc.cycles.device = "GPU"; print("GPU:", kind, [d.name for d in gpus]); break
print("Render device:", sc.cycles.device)
sc.cycles.use_denoising = True; sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.cycles.max_bounces = 8; sc.cycles.transmission_bounces = 8; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = (1600, 900) if LANDSCAPE else (720, 900); sc.render.film_transparent = True
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.render.filepath = OUT + "/f####"
bpy.ops.wm.save_as_mainfile(filepath=OUT + "/terminal.blend")
print("BUILT")
if os.environ.get("RENDER", "1") == "1":
    bpy.ops.render.render(animation=True)
    print("RENDERED", OUT)

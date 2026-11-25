"""Physically based materials for the AIMS 3D homepage (Blender Cycles / EEVEE).

Each function returns a bpy material built from nodes, so the look is versioned with the code and the
same materials bake and export to glTF for the web scene later.
"""

import bpy


def _principled(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    return m, p, m.node_tree.nodes, m.node_tree.links


def _set(p, label, value):
    # Input names moved between Blender versions (e.g. "Transmission" -> "Transmission Weight").
    for key in (label, f"{label} Weight"):
        if key in p.inputs:
            p.inputs[key].default_value = value
            return


def brushed_steel(name="Brushed steel"):
    """Satin stainless (the turnstile housings): long, fine streaks along the object's X axis."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.78, 0.79, 0.8, 1))
    _set(p, "Metallic", 1.0)
    _set(p, "Roughness", 0.26)
    _set(p, "Anisotropic", 0.55)
    coord = n.new("ShaderNodeTexCoord")
    mapping = n.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 260.0, 260.0)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 8.0
    ramp = n.new("ShaderNodeMapRange")
    ramp.inputs["To Min"].default_value = 0.2
    ramp.inputs["To Max"].default_value = 0.34
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    l.new(coord.outputs["Object"], mapping.inputs["Vector"])
    l.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    l.new(noise.outputs["Fac"], ramp.inputs["Value"])
    l.new(ramp.outputs["Result"], p.inputs["Roughness"])
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def dark_metal(name="Dark anodised metal"):
    m, p, *_ = _principled(name)
    _set(p, "Base Color", (0.035, 0.038, 0.04, 1))
    _set(p, "Metallic", 1.0)
    _set(p, "Roughness", 0.38)
    return m


def black_glass(name="Black glass"):
    """The gate's top cover: glossy black with a clear coat, so the lobby reflects in it."""
    m, p, *_ = _principled(name)
    _set(p, "Base Color", (0.012, 0.013, 0.014, 1))
    _set(p, "Roughness", 0.06)
    _set(p, "Coat", 1.0)
    _set(p, "Coat Roughness", 0.02)
    return m


def clear_glass(name="Clear glass", tint=(0.92, 0.97, 0.95)):
    m, p, *_ = _principled(name)
    _set(p, "Base Color", (*tint, 1))
    _set(p, "Roughness", 0.015)
    _set(p, "IOR", 1.5)
    _set(p, "Transmission", 1.0)
    if hasattr(m, "surface_render_method"):  # EEVEE previews: refract instead of rendering opaque
        m.surface_render_method = "BLENDED"
    return m


def led(name="LED green", colour=(0.12, 1.0, 0.25), strength=12.0):
    """ZKTeco's status green. Emission only; the glow on the web comes from bloom."""
    m, p, *_ = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _set(p, "Emission Color", (*colour, 1))
    _set(p, "Emission Strength", strength)
    _set(p, "Roughness", 0.3)
    return m


def marble_floor(name="Polished stone floor", tile=1.2):
    """Large-format light stone tiles with fine grout and soft veining, polished to a mirror sheen."""
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    brick = n.new("ShaderNodeTexBrick")
    brick.offset = 0.0
    brick.inputs["Scale"].default_value = 1.0 / tile
    brick.inputs["Mortar Size"].default_value = 0.002
    brick.inputs["Brick Width"].default_value = 1.0
    brick.inputs["Row Height"].default_value = 1.0
    brick.inputs["Color1"].default_value = (0.82, 0.8, 0.76, 1)
    brick.inputs["Color2"].default_value = (0.86, 0.84, 0.8, 1)
    brick.inputs["Mortar"].default_value = (0.55, 0.53, 0.5, 1)
    vein = n.new("ShaderNodeTexWave")
    vein.inputs["Scale"].default_value = 0.6
    vein.inputs["Distortion"].default_value = 14.0
    vein.inputs["Detail"].default_value = 6.0
    mix = n.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 0.12
    l.new(coord.outputs["Object"], brick.inputs["Vector"])
    l.new(coord.outputs["Object"], vein.inputs["Vector"])
    l.new(brick.outputs["Color"], mix.inputs[6])
    l.new(vein.outputs["Color"], mix.inputs[7])
    l.new(mix.outputs[2], p.inputs["Base Color"])
    _set(p, "Roughness", 0.07)
    _set(p, "Coat", 0.4)
    return m


def plaster(name="Warm plaster", colour=(0.78, 0.75, 0.7)):
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _set(p, "Roughness", 0.85)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 40.0
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.05
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def oak(name="Oak slats"):
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    mapping = n.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (40.0, 40.0, 2.0)
    wave = n.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 1.5
    wave.inputs["Distortion"].default_value = 6.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.32, 0.2, 0.11, 1)
    ramp.color_ramp.elements[1].color = (0.55, 0.38, 0.22, 1)
    l.new(coord.outputs["Object"], mapping.inputs["Vector"])
    l.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    l.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    _set(p, "Roughness", 0.55)
    return m

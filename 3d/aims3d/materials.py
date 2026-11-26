"""Physically based materials for the AIMS 3D homepage (Blender Cycles / EEVEE).

Each function returns a bpy material built from nodes, so the look is versioned with the code and the
same materials bake and export to glTF for the web scene later.

Albedos follow measured real-world values (white paint ~0.7, light stone ~0.5 linear, stainless F0 ~0.6):
anything brighter reads as CG and blows out under daylight.
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


def _smudges(n, l, target, low, high, scale=3.0, coords="Object"):
    """Drive `target` (a roughness socket) with soft, uneven wear: real surfaces are never uniform."""
    coord = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6.0
    noise.inputs["Roughness"].default_value = 0.6
    rng = n.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = 0.35
    rng.inputs["From Max"].default_value = 0.7
    rng.inputs["To Min"].default_value = low
    rng.inputs["To Max"].default_value = high
    l.new(coord.outputs[coords], noise.inputs["Vector"])
    l.new(noise.outputs["Fac"], rng.inputs["Value"])
    l.new(rng.outputs["Result"], target)
    return rng


def brushed_steel(name="Brushed steel", axis="X"):
    """Satin stainless (the turnstile housings). Fine streaks run along `axis` ("X" beams, "Z" pillars),
    as in the product photo where the pillars are brushed vertically."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.6, 0.6, 0.6, 1))
    _set(p, "Metallic", 1.0)
    coord = n.new("ShaderNodeTexCoord")
    mapping = n.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 300.0, 300.0) if axis == "X" else (300.0, 300.0, 1.0)
    streaks = n.new("ShaderNodeTexNoise")
    streaks.inputs["Scale"].default_value = 4.0
    streaks.inputs["Detail"].default_value = 10.0
    rough = n.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.22
    rough.inputs["To Max"].default_value = 0.3
    # Larger, soft patches of handling wear on top of the streaks.
    wear = _smudges(n, l, rough.inputs["To Max"], 0.27, 0.34, scale=2.0)
    del wear
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.008  # streaks felt, not seen as stripes
    l.new(coord.outputs["Object"], mapping.inputs["Vector"])
    l.new(mapping.outputs["Vector"], streaks.inputs["Vector"])
    l.new(streaks.outputs["Fac"], rough.inputs["Value"])
    l.new(rough.outputs["Result"], p.inputs["Roughness"])
    l.new(streaks.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def dark_metal(name="Dark anodised metal"):
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.035, 0.038, 0.04, 1))
    _set(p, "Metallic", 1.0)
    _smudges(n, l, p.inputs["Roughness"], 0.32, 0.45, scale=5.0)
    return m


def black_glass(name="Black glass"):
    """The gate's top cover: glossy black glass, so the lobby reflects in it, with faint fingerprints."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.01, 0.011, 0.012, 1))
    _set(p, "Specular IOR Level", 0.5)
    _smudges(n, l, p.inputs["Roughness"], 0.02, 0.14, scale=8.0)
    return m


def _glass_shadow_mix(m, n, l, surface, tint):
    """Let shadow rays pass through glass as a tinted transparency: Cycles cannot find the sun through
    refractive glass, so without this the room behind a window gets no direct sunlight at all."""
    out = n["Material Output"]
    path = n.new("ShaderNodeLightPath")
    clear = n.new("ShaderNodeBsdfTransparent")
    clear.inputs["Color"].default_value = (*tint, 1)
    mix = n.new("ShaderNodeMixShader")
    l.new(path.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    l.new(surface, mix.inputs[1])
    l.new(clear.outputs["BSDF"], mix.inputs[2])
    l.new(mix.outputs["Shader"], out.inputs["Surface"])
    if hasattr(m, "surface_render_method"):  # EEVEE previews: refract instead of rendering opaque
        m.surface_render_method = "BLENDED"


def clear_glass(name="Clear glass", tint=(0.86, 0.9, 0.88)):
    """Solid glass with real refraction (the gate flaps): faint grey-green body tint, light smudges."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*tint, 1))
    _set(p, "IOR", 1.52)
    _set(p, "Transmission", 1.0)
    _smudges(n, l, p.inputs["Roughness"], 0.0, 0.05, scale=6.0)
    _glass_shadow_mix(m, n, l, p.outputs["BSDF"], tint)
    return m


def window_glass(name="Window glass", tint=(0.88, 0.93, 0.93)):
    """Thin architectural glass: reflection by Fresnel over a straight see-through, no refraction offset.
    Cheaper and cleaner than solid glass for a 16 m curtain wall, and it lets the sun in."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    n.remove(n["Principled BSDF"])
    fresnel = n.new("ShaderNodeFresnel")
    fresnel.inputs["IOR"].default_value = 1.52
    clear = n.new("ShaderNodeBsdfTransparent")
    clear.inputs["Color"].default_value = (*tint, 1)
    gloss = n.new("ShaderNodeBsdfGlossy")
    gloss.inputs["Roughness"].default_value = 0.0
    mix = n.new("ShaderNodeMixShader")
    l.new(fresnel.outputs["Fac"], mix.inputs["Fac"])
    l.new(clear.outputs["BSDF"], mix.inputs[1])
    l.new(gloss.outputs["BSDF"], mix.inputs[2])
    l.new(mix.outputs["Shader"], n["Material Output"].inputs["Surface"])
    if hasattr(m, "surface_render_method"):
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
    """Large-format light stone tiles: each tile a slightly different shade, fine dark grout, soft veining,
    and a polish that is uneven where people walk."""
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    brick = n.new("ShaderNodeTexBrick")
    brick.offset = 0.0
    brick.inputs["Scale"].default_value = 1.0 / tile
    brick.inputs["Mortar Size"].default_value = 0.0025
    brick.inputs["Bias"].default_value = 0.0
    brick.inputs["Brick Width"].default_value = 1.0
    brick.inputs["Row Height"].default_value = 1.0
    brick.inputs["Color1"].default_value = (0.5, 0.48, 0.45, 1)
    brick.inputs["Color2"].default_value = (0.58, 0.56, 0.52, 1)
    brick.inputs["Mortar"].default_value = (0.2, 0.19, 0.18, 1)
    vein = n.new("ShaderNodeTexWave")
    vein.inputs["Scale"].default_value = 0.5
    vein.inputs["Distortion"].default_value = 16.0
    vein.inputs["Detail"].default_value = 8.0
    mix = n.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs[0].default_value = 0.1
    l.new(coord.outputs["Object"], brick.inputs["Vector"])
    l.new(coord.outputs["Object"], vein.inputs["Vector"])
    l.new(brick.outputs["Color"], mix.inputs[6])
    l.new(vein.outputs["Color"], mix.inputs[7])
    l.new(mix.outputs[2], p.inputs["Base Color"])
    _smudges(n, l, p.inputs["Roughness"], 0.05, 0.2, scale=1.5)
    return m


def plaster(name="Warm plaster", colour=(0.62, 0.6, 0.56)):
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    # Matte emulsion: very rough and low specular. At 0.85 / default specular the ceiling mirrored the
    # bright curtain wall at grazing angles as a hard-edged arc that no painted ceiling shows.
    _set(p, "Roughness", 0.95)
    _set(p, "Specular IOR Level", 0.25)
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
    ramp.color_ramp.elements[0].color = (0.2, 0.11, 0.05, 1)
    ramp.color_ramp.elements[1].color = (0.36, 0.22, 0.11, 1)
    l.new(coord.outputs["Object"], mapping.inputs["Vector"])
    l.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    l.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    _set(p, "Roughness", 0.5)
    return m


def ceramic(name="Charcoal planter"):
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.035, 0.034, 0.033, 1))
    _smudges(n, l, p.inputs["Roughness"], 0.35, 0.5, scale=4.0)
    return m


def soil(name="Bark mulch"):
    m, p, n, l = _principled(name)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 180.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.02, 0.012, 0.008, 1)
    ramp.color_ramp.elements[1].color = (0.09, 0.055, 0.03, 1)
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    l.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    _set(p, "Roughness", 0.95)
    return m


def leaf(name="Snake plant leaf"):
    """Deep green with the pale cross-bands of Sansevieria, waxy, a little light coming through."""
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    bands = n.new("ShaderNodeTexWave")
    bands.bands_direction = "Z"
    bands.inputs["Scale"].default_value = 9.0
    bands.inputs["Distortion"].default_value = 12.0
    bands.inputs["Detail"].default_value = 4.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.012, 0.04, 0.012, 1)
    ramp.color_ramp.elements[1].color = (0.06, 0.12, 0.045, 1)
    l.new(coord.outputs["Object"], bands.inputs["Vector"])
    l.new(bands.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    _set(p, "Roughness", 0.38)
    _set(p, "Transmission", 0.0)
    _set(p, "Subsurface", 0.08)
    return m


def dark_stone(name="Dark stone"):
    """Honed nero marquina style top: near-black with faint pale veins."""
    m, p, n, l = _principled(name)
    vein = n.new("ShaderNodeTexWave")
    vein.inputs["Scale"].default_value = 1.2
    vein.inputs["Distortion"].default_value = 18.0
    vein.inputs["Detail"].default_value = 10.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.9
    ramp.color_ramp.elements[0].color = (0.018, 0.018, 0.019, 1)
    ramp.color_ramp.elements[1].color = (0.25, 0.25, 0.24, 1)
    coord = n.new("ShaderNodeTexCoord")
    l.new(coord.outputs["Object"], vein.inputs["Vector"])
    l.new(vein.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    _smudges(n, l, p.inputs["Roughness"], 0.12, 0.25, scale=3.0)
    return m


def plastic(name, colour, roughness=0.35):
    """Moulded ABS / PC housings (the UHF reader, the barrier boom)."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _smudges(n, l, p.inputs["Roughness"], roughness * 0.85, roughness * 1.2, scale=5.0)
    return m


def powder_coat(name, colour, roughness=0.45):
    """Powder-coated steel (the metal detector's posts): a fine orange-peel texture under a soft sheen."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _set(p, "Roughness", roughness)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 900.0
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.04
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def aluminium(name="Satin aluminium"):
    """Bead-blasted anodised aluminium (the maglock body, terminal side frames): soft and bright."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.82, 0.83, 0.84, 1))
    _set(p, "Metallic", 1.0)
    _smudges(n, l, p.inputs["Roughness"], 0.3, 0.42, scale=6.0)
    return m


def frosted(name="Frosted window", colour=(0.9, 0.92, 0.94), glow=0.0):
    """Diffused acrylic over IR or white fill lights; `glow` > 0 when the light behind it is on."""
    m, p, *_ = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _set(p, "Roughness", 0.5)
    _set(p, "Subsurface", 0.3)
    if glow:
        _set(p, "Emission Color", (*colour, 1))
        _set(p, "Emission Strength", glow)
    return m


def screen(name, image_path=None, colour=(0.02, 0.05, 0.09), strength=1.0):
    """A display under cover glass: the picture is emission (an image, or a flat colour), the glass on top
    is a clear coat, so the room still reflects in it as it does in a real screen."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.0, 0.0, 0.0, 1))
    _set(p, "Roughness", 0.3)
    _set(p, "Coat", 1.0)
    _set(p, "Coat Roughness", 0.02)
    _set(p, "Emission Strength", strength)
    if image_path:
        tex = n.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(image_path, check_existing=True)
        l.new(tex.outputs["Color"], p.inputs["Emission Color"])
    else:
        _set(p, "Emission Color", (*colour, 1))
    return m


HAZE = (0.075, 0.085, 0.14)  # the dusk air between the camera and the far city


def _haze_over(n, l, shader_out, near=200.0, far=1800.0, most=0.75):
    """Aerial perspective: blend toward the dusk haze with distance from the camera (ray length), so the
    city recedes in layers instead of every block standing at the same contrast."""
    path, rng = n.new("ShaderNodeLightPath"), n.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value, rng.inputs["From Max"].default_value = near, far
    rng.inputs["To Max"].default_value = most
    l.new(path.outputs["Ray Length"], rng.inputs["Value"])
    haze = n.new("ShaderNodeEmission")
    haze.inputs["Color"].default_value = (*HAZE, 1)
    mix = n.new("ShaderNodeMixShader")
    l.new(rng.outputs["Result"], mix.inputs["Fac"])
    l.new(shader_out, mix.inputs[1])
    l.new(haze.outputs["Emission"], mix.inputs[2])
    return mix.outputs["Shader"]


def tower_facade(name="Tower facade", bay=(1.5, 1.5), floor=(3.6, 3.6), lit=(0.3, 0.3), glow=1.5, haze=True):
    """A whole office tower's curtain wall in one shader, for the floors nobody walks through: mullions, a dark
    spandrel at the foot of each floor, and dark glass in which some windows glow at dusk, each at its own
    brightness and warmth, brighter toward its ceiling (offices are never lit evenly). `bay`, `floor` and `lit`
    are (min, max) ranges: each object picks its own values from its random number, so one material gives a
    whole city of different buildings. The grid runs along X + Y and up Z in world space, so the boxes a
    tower is built from line up."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    out = n["Material Output"]
    n.remove(n["Principled BSDF"])

    def math_node(op, a=None, b=None, c=None):
        node = n.new("ShaderNodeMath")
        node.operation = op
        for i, v in enumerate((a, b, c)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                node.inputs[i].default_value = v
            else:
                l.new(v, node.inputs[i])
        return node.outputs[0]

    obj = n.new("ShaderNodeObjectInfo").outputs["Random"]

    def per_object(lo_hi, salt):
        lo, hi = lo_hi
        if lo == hi:
            return lo
        return math_node("MULTIPLY_ADD", math_node("FRACT", math_node("MULTIPLY", obj, salt)), hi - lo, lo)

    bay_v, floor_v, lit_v = per_object(bay, 1.0), per_object(floor, 13.7), per_object(lit, 7.31)
    geo, sep = n.new("ShaderNodeNewGeometry"), n.new("ShaderNodeSeparateXYZ")
    l.new(geo.outputs["Position"], sep.inputs[0])
    u = math_node("DIVIDE", math_node("ADD", sep.outputs["X"], sep.outputs["Y"]), bay_v)
    v = math_node("DIVIDE", sep.outputs["Z"], floor_v)
    fu, fv = math_node("FRACT", u), math_node("FRACT", v)
    # Mullions and the floor joint: thin bands at the cell edges.
    mull = math_node("MAXIMUM", math_node("GREATER_THAN", math_node("ABSOLUTE", math_node("SUBTRACT", fu, 0.5)), 0.47),
                     math_node("GREATER_THAN", math_node("ABSOLUTE", math_node("SUBTRACT", fv, 0.5)), 0.49))
    # One random number per window (and per building), and two more derived from it (brightness, warmth).
    cell = n.new("ShaderNodeCombineXYZ")
    l.new(math_node("FLOOR", u), cell.inputs["X"])
    l.new(math_node("FLOOR", v), cell.inputs["Y"])
    l.new(obj, cell.inputs["Z"])
    noise = n.new("ShaderNodeTexWhiteNoise")
    noise.noise_dimensions = "3D"
    l.new(cell.outputs[0], noise.inputs["Vector"])
    r = noise.outputs["Value"]
    on = math_node("GREATER_THAN", r, math_node("SUBTRACT", 1.0, lit_v))
    bright = math_node("MULTIPLY_ADD", math_node("FRACT", math_node("MULTIPLY", r, 7.13)), 0.75, 0.25)
    warm = math_node("FRACT", math_node("MULTIPLY", r, 3.71))
    above_spandrel = math_node("GREATER_THAN", fv, 0.28)
    # Ceiling lights: a lit window is brightest just under its ceiling and dimmer toward the sill.
    ceiling = n.new("ShaderNodeMapRange")
    ceiling.inputs["From Min"].default_value, ceiling.inputs["From Max"].default_value = 0.28, 1.0
    ceiling.inputs["To Min"].default_value, ceiling.inputs["To Max"].default_value = 0.5, 1.25
    l.new(fv, ceiling.inputs["Value"])
    strength = math_node("MULTIPLY", math_node("MULTIPLY", on, above_spandrel),
                         math_node("MULTIPLY", math_node("MULTIPLY", bright, ceiling.outputs["Result"]), glow))
    tint = n.new("ShaderNodeMix")
    tint.data_type = "RGBA"
    # Socket names repeat per data type on this node, so the colour pair is addressed by index.
    tint.inputs[6].default_value = (1.0, 0.7, 0.42, 1)  # warm office light
    tint.inputs[7].default_value = (0.82, 0.88, 1.0, 1)  # cool panels
    l.new(warm, tint.inputs[0])
    glass = n.new("ShaderNodeBsdfPrincipled")
    glass.inputs["Base Color"].default_value = (0.012, 0.015, 0.02, 1)
    glass.inputs["Roughness"].default_value = 0.05
    l.new(tint.outputs[2], glass.inputs["Emission Color"])
    l.new(strength, glass.inputs["Emission Strength"])
    mullion = n.new("ShaderNodeBsdfPrincipled")
    mullion.inputs["Base Color"].default_value = (0.25, 0.26, 0.27, 1)
    mullion.inputs["Metallic"].default_value = 1.0
    mullion.inputs["Roughness"].default_value = 0.35
    # Roofs (faces pointing up or down) are plant and parapet, not windows: dark metal, unlit.
    nsep = n.new("ShaderNodeSeparateXYZ")
    l.new(geo.outputs["Normal"], nsep.inputs[0])
    roof = math_node("GREATER_THAN", math_node("ABSOLUTE", nsep.outputs["Z"]), 0.5)
    mix = n.new("ShaderNodeMixShader")
    l.new(math_node("MAXIMUM", mull, roof), mix.inputs["Fac"])
    l.new(glass.outputs["BSDF"], mix.inputs[1])
    l.new(mullion.outputs["BSDF"], mix.inputs[2])
    l.new(_haze_over(n, l, mix.outputs["Shader"]) if haze else mix.outputs["Shader"], out.inputs["Surface"])
    return m


def asphalt(name="Asphalt"):
    m, p, n, l = _principled(name)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 300.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.025, 0.025, 0.026, 1)
    ramp.color_ramp.elements[1].color = (0.06, 0.06, 0.062, 1)
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.3
    l.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    _smudges(n, l, p.inputs["Roughness"], 0.55, 0.85, scale=0.3)  # damp patches catch the street lights
    return m


def paving(name="Paving", colour=(0.32, 0.31, 0.29), size=0.6):
    """Square stone pavers with dark joints."""
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    brick = n.new("ShaderNodeTexBrick")
    brick.offset = 0.5
    brick.inputs["Scale"].default_value = 1.0 / size
    brick.inputs["Mortar Size"].default_value = 0.004
    brick.inputs["Brick Width"].default_value = 1.0
    brick.inputs["Row Height"].default_value = 1.0
    brick.inputs["Color1"].default_value = (*colour, 1)
    brick.inputs["Color2"].default_value = (*(c * 1.12 for c in colour), 1)
    brick.inputs["Mortar"].default_value = (*(c * 0.4 for c in colour), 1)
    l.new(coord.outputs["Object"], brick.inputs["Vector"])
    l.new(brick.outputs["Color"], p.inputs["Base Color"])
    _smudges(n, l, p.inputs["Roughness"], 0.45, 0.75, scale=0.5)
    return m


def concrete(name="Concrete", colour=(0.36, 0.35, 0.33)):
    m, p, n, l = _principled(name)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6.0
    noise.inputs["Detail"].default_value = 10.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*(c * 0.85 for c in colour), 1)
    ramp.color_ramp.elements[1].color = (*colour, 1)
    l.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    _set(p, "Roughness", 0.8)
    return m


def carpet(name="Office carpet", colour=(0.07, 0.072, 0.075)):
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (*colour, 1))
    _set(p, "Roughness", 0.95)
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 400.0
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    l.new(noise.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def city_carpet(name="City at night", block=140.0, clear_radius=180.0):
    """The ground seen from a tower at dusk: dark, crossed every `block` metres by dotted lines of street
    lamps. Nothing lights up within `clear_radius` of the origin, where the modelled street takes over."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.02, 0.021, 0.024, 1))
    _set(p, "Roughness", 0.7)
    geo, sep = n.new("ShaderNodeNewGeometry"), n.new("ShaderNodeSeparateXYZ")
    l.new(geo.outputs["Position"], sep.inputs[0])

    def node(op, a, b=None):
        x = n.new("ShaderNodeMath")
        x.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                x.inputs[i].default_value = v
            else:
                l.new(v, x.inputs[i])
        return x.outputs[0]

    def line(axis, along):
        """A street along `along`: a 1.2 m band at every `block`, broken into lamps every 30 m."""
        f = node("FRACT", node("DIVIDE", sep.outputs[axis], block))
        band = node("LESS_THAN", node("ABSOLUTE", node("SUBTRACT", f, 0.5)), 0.6 / block)
        lamps = node("LESS_THAN", node("FRACT", node("DIVIDE", sep.outputs[along], 30.0)), 0.25)
        return node("MULTIPLY", band, lamps)

    streets = node("MAXIMUM", line("X", "Y"), line("Y", "X"))
    dist = node("SQRT", node("ADD", node("MULTIPLY", sep.outputs["X"], sep.outputs["X"]), node("MULTIPLY", sep.outputs["Y"], sep.outputs["Y"])))
    far = node("GREATER_THAN", dist, clear_radius)
    _set(p, "Emission Color", (1.0, 0.62, 0.32, 1))
    l.new(node("MULTIPLY", node("MULTIPLY", streets, far), 3.0), p.inputs["Emission Strength"])
    l.new(_haze_over(n, l, p.outputs["BSDF"]), n["Material Output"].inputs["Surface"])
    return m


def palm_bark(name="Palm bark"):
    """Date palm trunk: brown-grey with the ring scars of old frond bases."""
    m, p, n, l = _principled(name)
    coord = n.new("ShaderNodeTexCoord")
    rings = n.new("ShaderNodeTexWave")
    rings.bands_direction = "Z"
    rings.inputs["Scale"].default_value = 14.0
    rings.inputs["Distortion"].default_value = 3.0
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.06, 0.045, 0.03, 1)
    ramp.color_ramp.elements[1].color = (0.16, 0.12, 0.08, 1)
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    l.new(coord.outputs["Object"], rings.inputs["Vector"])
    l.new(rings.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    l.new(rings.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    _set(p, "Roughness", 0.9)
    return m


def palm_frond(name="Palm frond"):
    """A frond ribbon whose UVs (u across, v along) are cut into angled leaflets by an alpha mask."""
    m, p, n, l = _principled(name)
    _set(p, "Base Color", (0.035, 0.06, 0.022, 1))
    _set(p, "Roughness", 0.45)
    _set(p, "Subsurface", 0.1)
    uv, sep = n.new("ShaderNodeTexCoord"), n.new("ShaderNodeSeparateXYZ")
    l.new(uv.outputs["UV"], sep.inputs[0])

    def node(op, a, b=None):
        x = n.new("ShaderNodeMath")
        x.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                x.inputs[i].default_value = v
            else:
                l.new(v, x.inputs[i])
        return x.outputs[0]

    across = node("ABSOLUTE", node("SUBTRACT", sep.outputs["X"], 0.5))
    # Leaflets slant back from the midrib: stripes along v, offset by the distance from the middle.
    stripes = node("FRACT", node("ADD", node("MULTIPLY", sep.outputs["Y"], 60.0), node("MULTIPLY", across, 9.0)))
    leaf = node("MAXIMUM", node("LESS_THAN", stripes, 0.5), node("LESS_THAN", across, 0.04))
    clear = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader")
    l.new(leaf, mix.inputs["Fac"])
    l.new(clear.outputs["BSDF"], mix.inputs[1])
    l.new(p.outputs["BSDF"], mix.inputs[2])
    l.new(mix.outputs["Shader"], n["Material Output"].inputs["Surface"])
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "DITHERED"
    return m

"""The photographic finish, as a compositor graph (Blender 5 node-group compositor).

A clean render reads as CG partly because it is too perfect. A camera adds a soft bloom around bright
sources, a trace of colour fringing toward the corners, light fall-off at the edges and sensor grain.
All four are kept small: noticed only when they are missing.
"""

import bpy


def _menu(node, socket, *values):
    for v in values:  # menu item names have moved between versions
        try:
            node.inputs[socket].default_value = v
            return
        except (TypeError, KeyError):
            continue


def photographic_finish(scene, bloom=0.22, dispersion=0.012, vignette=0.35, grain=0.045):
    tree = bpy.data.node_groups.new("Photographic finish", "CompositorNodeTree")
    tree.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    n, l = tree.nodes, tree.links
    render = n.new("CompositorNodeRLayers")
    out = n.new("NodeGroupOutput")

    glare = n.new("CompositorNodeGlare")  # bloom on the LEDs and the sun's hot spots only
    _menu(glare, "Type", "Bloom", "BLOOM")
    _menu(glare, "Quality", "High", "HIGH")
    glare.inputs["Threshold"].default_value = 1.2
    glare.inputs["Strength"].default_value = bloom
    glare.inputs["Size"].default_value = 0.6

    lens = n.new("CompositorNodeLensdist")
    lens.inputs["Distortion"].default_value = 0.0
    lens.inputs["Dispersion"].default_value = dispersion
    lens.inputs["Fit"].default_value = True

    # Vignette: distance from the frame centre (aspect-correct, so it stays round) mapped to a gentle fall-off.
    coords = n.new("CompositorNodeImageCoordinates")
    dist = n.new("ShaderNodeVectorMath")
    dist.operation = "LENGTH"
    falloff = n.new("ShaderNodeMapRange")
    falloff.inputs["From Min"].default_value = 0.5  # "Uniform" runs -1..1 across the width, centred
    falloff.inputs["From Max"].default_value = 1.2
    falloff.inputs["To Min"].default_value = 1.0
    falloff.inputs["To Max"].default_value = 1.0 - vignette
    shade = n.new("ShaderNodeMix")
    shade.data_type = "RGBA"
    shade.blend_type = "MULTIPLY"
    shade.inputs[0].default_value = 1.0

    # Grain: per-pixel noise laid over the image, strongest in the mid-tones as film grain is.
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.9
    noise.inputs["Detail"].default_value = 0.0
    film = n.new("ShaderNodeMix")
    film.data_type = "RGBA"
    film.blend_type = "OVERLAY"
    film.inputs[0].default_value = grain

    l.new(render.outputs["Image"], glare.inputs["Image"])
    l.new(glare.outputs["Image"], lens.inputs["Image"])
    l.new(lens.outputs["Image"], coords.inputs["Image"])
    l.new(coords.outputs["Uniform"], dist.inputs[0])
    l.new(dist.outputs["Value"], falloff.inputs["Value"])
    l.new(lens.outputs["Image"], shade.inputs[6])
    l.new(falloff.outputs["Result"], shade.inputs[7])
    l.new(coords.outputs["Pixel"], noise.inputs["Vector"])
    l.new(shade.outputs[2], film.inputs[6])
    l.new(noise.outputs["Color"], film.inputs[7])
    l.new(film.outputs[2], out.inputs[0])
    scene.compositing_node_group = tree
    if hasattr(scene.render, "use_compositing"):
        scene.render.use_compositing = True
    return tree

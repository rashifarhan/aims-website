"""Shared command line and render settings for the Blender scripts in 3d/ (Cycles on Apple Silicon)."""

import sys

import bpy


def parse_args(opts, presets=None):
    """Read `-- --key value --flag` after Blender's own arguments into (opts, flags). A `--mood` or
    `--shot` naming one of `presets` applies that preset first; explicit flags still win."""
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    flags = set()
    for key in ("--mood", "--shot"):
        if presets and key in argv and argv.index(key) + 1 < len(argv) and argv[argv.index(key) + 1] in presets:
            opts.update(presets[argv[argv.index(key) + 1]])
    i = 0
    while i < len(argv):
        key = argv[i].lstrip("-")
        if i + 1 < len(argv) and not argv[i + 1].startswith("--"):
            opts[key] = argv[i + 1]
            i += 2
        else:
            flags.add(key)
            i += 1
    return opts, flags


def render_settings(opts):
    sc = bpy.context.scene
    x, y = (int(v) for v in opts["res"].lower().split("x"))
    sc.render.resolution_x, sc.render.resolution_y = x, y
    sc.render.film_transparent = False
    transforms = [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items]
    sc.view_settings.view_transform = "AgX" if "AgX" in transforms else "Filmic"
    sc.view_settings.exposure = float(opts["exposure"])
    for look in ("AgX - Medium High Contrast", "Medium High Contrast"):  # the name differs by version
        try:
            sc.view_settings.look = look
            break
        except TypeError:
            continue
    if opts["engine"] == "eevee":
        engines = [e.identifier for e in sc.render.bl_rna.properties["engine"].enum_items]
        sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
        ee = sc.eevee
        for attr, val in (("use_raytracing", True), ("use_shadows", True), ("taa_render_samples", 64)):
            if hasattr(ee, attr):
                setattr(ee, attr, val)
    else:
        sc.render.engine = "CYCLES"
        sc.cycles.samples = int(opts["samples"])
        sc.cycles.use_denoising = True
        sc.cycles.use_adaptive_sampling = True
        sc.cycles.adaptive_threshold = 0.02
        # No caustics and a clamp on indirect light: the usual archviz trade, fewer fireflies, much faster.
        sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
        sc.cycles.sample_clamp_indirect = float(opts.get("clamp", "10"))
        sc.cycles.diffuse_bounces, sc.cycles.glossy_bounces = 4, 4
        sc.cycles.transmission_bounces, sc.cycles.transparent_max_bounces = 8, 16
        try:  # Apple Silicon GPU through Metal; falls back to CPU anywhere else
            prefs = bpy.context.preferences.addons["cycles"].preferences
            prefs.compute_device_type = "METAL"
            prefs.get_devices()
            for d in prefs.devices:
                d.use = True
            sc.cycles.device = "GPU"
        except (KeyError, TypeError, AttributeError):
            sc.cycles.device = "CPU"
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = opts["out"]

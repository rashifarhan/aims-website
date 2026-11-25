"""Read the sun out of an HDRI, so the sun lamp agrees with the photographed street.

An HDRI's sun is a few hundred pixels thousands of times brighter than the sky. Sampled as part of the
world it gives noisy, slightly soft shadows. The usual fix, done here: measure the sun (direction, colour
and irradiance), clip it out of the world light, and put a sun lamp in its place with exactly that light.
"""

import math

import numpy as np


def find_sun(image, min_peak=1000.0, share=0.2):
    """Return the sun as {u, v, elevation, rgb, irradiance, clip} or None for an overcast sky.

    u, v are the image coordinates of the sun's centre (v = 0.5 is the horizon). `rgb` is the sun's
    irradiance per channel in the HDRI's units (what a surface facing the sun receives), so a sun lamp of
    that strength and colour, under a world of strength 1, matches the photograph. `clip` is the radiance
    the world should be limited to so the sun is not counted twice.
    """
    w, h = image.size
    px = np.empty(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(px)
    rgb = px.reshape(h, w, 4)[:, :, :3]  # row 0 is the bottom of the image
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    peak = float(lum.max())
    if peak < min_peak:
        return None
    mask = lum > peak * share
    rows, cols = np.nonzero(mask)
    lat = (rows + 0.5) / h * math.pi - math.pi / 2  # -90 at the bottom row, +90 at the top
    d_omega = (2 * math.pi / w) * (math.pi / h) * np.cos(lat)
    sun_rgb = (rgb[rows, cols] * d_omega[:, None]).sum(axis=0)
    weight = lum[rows, cols] * d_omega
    u = float((cols + 0.5) @ weight / weight.sum()) / w
    v = float((rows + 0.5) @ weight / weight.sum()) / h
    clip = float(np.percentile(lum[~mask], 99.9))
    irradiance = float(sun_rgb @ np.array([0.2126, 0.7152, 0.0722]))
    return {"u": u, "v": v, "elevation": (v - 0.5) * 180, "rgb": tuple(float(c) for c in sun_rgb),
            "irradiance": irradiance, "clip": clip}


def sun_lamp_rotation(u, elevation, hdri_rotation_deg):
    """Euler rotation (degrees) of a Blender sun lamp that shines from the HDRI's sun.

    Blender maps a world direction of azimuth a (atan2(y, x)) to u = 0.5 - (a + R) / 360 once the HDRI is
    turned by R about Z (measured from renders of the look test). A lamp with Euler (90 - el, 0, z) sends
    its light toward azimuth z + 90, so it comes from azimuth z - 90.
    """
    from_azimuth = (0.5 - u) * 360 - hdri_rotation_deg
    return (90 - elevation, 0.0, from_azimuth + 90)

# Cleans a Vision subject lift for a dark stage: keeps one view when the photo shows two, removes the white the soft
# edge picked up from the studio background (colour decontamination against white), tightens the edge slightly.
# Usage: finish.py in.png out.png [left|right|all]
import sys
import numpy as np
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
keep = sys.argv[3] if len(sys.argv) > 3 else "all"
a = np.asarray(im).astype(float)
alpha = a[:, :, 3] / 255
if keep != "all":
    cols = alpha.max(0) > 0.08
    runs, start = [], None
    for x, on in enumerate(list(cols) + [False]):
        if on and start is None: start = x
        if not on and start is not None:
            runs.append((start, x)); start = None
    # Merge specks into their neighbour: the views are the two widest runs.
    runs = sorted(runs, key=lambda r: r[1] - r[0], reverse=True)[:2]
    runs.sort()
    x0, x1 = runs[0] if keep == "left" else runs[-1]
    mask = np.zeros_like(alpha); mask[:, x0:x1] = 1
    alpha = alpha * mask
# The outline band (within ~4 px of the background): near-white, grey pixels there are studio white the mask kept,
# so they fade out in proportion to how white they are. Product whites further in are untouched.
from scipy import ndimage
solid = alpha > 0.5
inner = ndimage.binary_erosion(solid, iterations=4)
band = solid & ~inner
rgb0 = a[:, :, :3]
light = rgb0.min(2)
grey = (rgb0.max(2) - rgb0.min(2)) < 18
fade = np.clip((light - 205) / 40, 0, 1) * grey * band
alpha = alpha * (1 - fade)
alpha = ndimage.grey_erosion(alpha, size=(2, 2))
# Tighten the soft edge, then recover the true colour of partly transparent pixels (they were mixed with white).
alpha2 = np.clip((alpha - 0.12) / 0.88, 0, 1)
rgb = a[:, :, :3]
safe = np.maximum(alpha, 1e-3)[:, :, None]
fg = (rgb - (1 - alpha[:, :, None]) * 255) / safe
fg = np.where(alpha[:, :, None] > 0.98, rgb, np.clip(fg, 0, 255))
out = np.dstack([fg, alpha2 * 255]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
img = img.crop(img.getbbox())
img.save(sys.argv[2], optimize=True)
print(sys.argv[2], img.size)

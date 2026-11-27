# Removes the plain white studio background from a product photo: flood fill from the borders through near-white
# pixels, then a soft edge. Usage: cutout.py in.webp out.png
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
im = Image.open(sys.argv[1]).convert("RGB")
a = np.asarray(im).astype(int)
white = (a.min(2) > 236) & (a.max(2) - a.min(2) < 14)
lab, _ = ndimage.label(white)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge))
alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert("RGBA"); out.putalpha(alpha)
box = out.getbbox(); out = out.crop(box)
out.save(sys.argv[2])
print(sys.argv[2], out.size)

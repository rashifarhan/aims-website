"""Make the web frame set for the journey page from numbered stills (run with the system python):

  python3 3d/frames_to_web.py --stills /tmp/journey-stills --step 2 --width 960 --out public/journey/frames

Still n (1, 2, 3 …) is film frame 1 + (n - 1) · step, the numbering src/lib/journey/frames.ts expects; each is
resized to --width and saved as WebP (quality 72: about 30-50 KB a frame at 960 px).
"""

import argparse
import os

from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("--stills", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--step", type=int, default=2)
ap.add_argument("--width", type=int, default=960)
ap.add_argument("--quality", type=int, default=72)
ap.add_argument("--numbered", action="store_true", help="stills are already named by film frame (0001.jpg …)")
a = ap.parse_args()

os.makedirs(a.out, exist_ok=True)
names = sorted(f for f in os.listdir(a.stills) if f.lower().endswith((".jpg", ".jpeg", ".png")))
total = 0
for n, name in enumerate(names, start=1):
    frame = int(os.path.splitext(name)[0]) if a.numbered else 1 + (n - 1) * a.step
    im = Image.open(os.path.join(a.stills, name)).convert("RGB")
    if im.width != a.width:
        im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)
    path = os.path.join(a.out, f"{frame:04d}.webp")
    im.save(path, "WEBP", quality=a.quality, method=5)
    total += os.path.getsize(path)
print(f"FRAMES_WRITTEN {len(names)} frames, {total / 1e6:.1f} MB, to {a.out}")

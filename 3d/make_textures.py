"""Screen pictures for the device models, drawn with Pillow (run with the system python, not Blender's):

    python3 3d/make_textures.py

Idle screens only: a clock and a welcome line, a face frame, and a time-attendance dashboard drawn as
shapes with no figures in it, so nothing on a screen reads as a real record or a real number.
"""

import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "textures")
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size, index=0):
    try:
        return ImageFont.truetype(FONT, size, index=index)
    except OSError:
        return ImageFont.load_default()


def gradient(w, h, top, bottom):
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    return im


def centred(d, w, y, text, f, fill):
    box = d.textbbox((0, 0), text, font=f)
    d.text(((w - (box[2] - box[0])) / 2 - box[0], y), text, font=f, fill=fill)


def proface_idle():
    """ProFace X standby, as on its product photo: the time, the date, a welcome line (dark theme)."""
    w, h = 540, 860
    im = gradient(w, h, (14, 26, 38), (6, 12, 20))
    d = ImageDraw.Draw(im)
    centred(d, w, 250, "09:41", font(150, 7), (240, 244, 248))
    centred(d, w, 430, "Wednesday", font(34), (150, 165, 180))
    centred(d, w, 520, "Welcome", font(40), (220, 228, 236))
    for x in (200, 320):  # the two soft keys along the bottom
        d.rounded_rectangle([x, 760, x + 24, 776], 3, outline=(120, 135, 150), width=2)
    im.save(os.path.join(OUT, "proface_idle.png"))


def speedface_idle():
    """SpeedFace V5L ready to verify: a face frame in the middle of a dark screen, the time at the top."""
    w, h = 360, 640
    im = gradient(w, h, (10, 20, 30), (4, 9, 15))
    d = ImageDraw.Draw(im)
    centred(d, w, 26, "09:41", font(30), (200, 210, 220))
    x0, y0, x1, y1, arm = 70, 180, 290, 440, 36
    for (cx, cy, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line([(cx, cy), (cx + dx * arm, cy)], fill=(120, 220, 150), width=5)
        d.line([(cx, cy), (cx, cy + dy * arm)], fill=(120, 220, 150), width=5)
    centred(d, w, 500, "Look at the camera", font(24), (170, 182, 194))
    im.save(os.path.join(OUT, "speedface_idle.png"))


def dashboard():
    """A time-attendance dashboard drawn as shapes: sidebar, header, four cards, a table whose newest row
    is highlighted. No text and no numbers."""
    w, h = 1600, 900
    im = Image.new("RGB", (w, h), (243, 245, 247))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 220, h], fill=(18, 32, 46))
    for k in range(7):
        d.rounded_rectangle([36, 120 + k * 64, 184, 140 + k * 64], 6, fill=(52, 70, 88) if k else (96, 190, 120))
    d.rectangle([220, 0, w, 72], fill=(255, 255, 255))
    d.rounded_rectangle([256, 26, 520, 46], 6, fill=(205, 212, 220))
    for k in range(4):
        x = 256 + k * 330
        d.rounded_rectangle([x, 108, x + 300, 238], 14, fill=(255, 255, 255))
        d.rounded_rectangle([x + 28, 140, x + 160, 156], 5, fill=(200, 208, 216))
        d.rounded_rectangle([x + 28, 180, x + 110, 210], 6, fill=(40, 60, 80))
    d.rounded_rectangle([256, 272, 1564, 864], 14, fill=(255, 255, 255))
    for r in range(9):
        y = 320 + r * 58
        if r == 0:  # the entry that just arrived
            d.rounded_rectangle([272, y - 14, 1548, y + 34], 8, fill=(222, 245, 228))
        d.ellipse([292, y - 4, 324, y + 28], fill=(150, 165, 180) if r else (96, 190, 120))
        for x0, x1 in ((350, 560), (640, 800), (880, 1040), (1120, 1250)):
            d.rounded_rectangle([x0, y + 4, x1, y + 20], 5, fill=(200, 208, 216) if r else (120, 170, 135))
        d.rounded_rectangle([1360, y, 1480, y + 24], 12, fill=(96, 190, 120) if r < 6 else (230, 170, 80))
    im.save(os.path.join(OUT, "dashboard.png"))


def attendance_app():
    """The attendance screen at the software stop, close enough to read: real interface words (menu, headings,
    column names, status labels) but no names, times or totals, which would read as somebody's records."""
    w, h = 1920, 1080
    ink, mute, line, green = (12, 18, 26), (78, 90, 104), (214, 219, 225), (36, 150, 80)
    im = Image.new("RGB", (w, h), (238, 241, 244))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 264, h], fill=(17, 30, 43))
    d.text((36, 34), "BioTime", font=font(34, 1), fill=(236, 240, 244))
    for k, label in enumerate(("Dashboard", "Personnel", "Device", "Attendance", "Reports", "System")):
        y = 140 + k * 62
        if label == "Attendance":
            d.rounded_rectangle([18, y - 14, 246, y + 38], 8, fill=(30, 52, 70))
            d.rectangle([18, y - 14, 23, y + 38], fill=green)
        d.rounded_rectangle([40, y + 2, 60, y + 22], 4, outline=(120, 140, 158), width=2)
        d.text((78, y), label, font=font(24), fill=(236, 240, 244) if label == "Attendance" else (150, 166, 182))
    d.rectangle([264, 0, w, 84], fill=(255, 255, 255))
    d.line([(264, 84), (w, 84)], fill=line, width=2)
    d.text((304, 24), "Attendance", font=font(32, 1), fill=ink)
    d.text((500, 32), "Today", font=font(24), fill=mute)
    d.rounded_rectangle([1560, 22, 1860, 62], 20, fill=(242, 244, 247))
    d.text((1588, 30), "Search", font=font(22), fill=mute)
    for k, label in enumerate(("Present", "Late", "Absent", "On leave")):
        x = 304 + k * 396
        d.rounded_rectangle([x, 120, x + 372, 270], 14, fill=(255, 255, 255))
        d.text((x + 28, 146), label, font=font(24), fill=mute)
        d.rounded_rectangle([x + 28, 196, x + 150, 236], 8, fill=(220, 226, 232))  # the figure, left blank
        d.rounded_rectangle([x + 300, 146, x + 344, 190], 22, fill=((214, 240, 222), (252, 236, 205), (250, 222, 222), (222, 232, 248))[k])
    d.rounded_rectangle([304, 300, 1876, 1040], 14, fill=(255, 255, 255))
    d.text((336, 326), "Live check-ins", font=font(26, 1), fill=ink)
    cols = (("Employee", 336), ("Department", 760), ("Device", 1080), ("Check-in", 1380), ("Status", 1640))
    for label, x in cols:
        d.text((x, 386), label, font=font(21), fill=mute)
    d.line([(320, 424), (1860, 424)], fill=line, width=2)
    for r in range(10):
        y = 444 + r * 58
        if r == 0:  # the entry that just arrived
            d.rounded_rectangle([320, y - 8, 1860, y + 46], 8, fill=(232, 247, 237))
        d.ellipse([336, y, 372, y + 36], fill=(206, 214, 222) if r else (150, 205, 170))
        d.rounded_rectangle([392, y + 11, 392 + 150 + (r * 37) % 90, y + 25], 6, fill=(214, 220, 227))
        d.rounded_rectangle([760, y + 11, 760 + 110 + (r * 53) % 70, y + 25], 6, fill=(226, 231, 236))
        d.text((1080, y + 6), "SpeedFace V5L" if r % 3 != 2 else "ProFace X", font=font(21), fill=(30, 40, 52))
        d.rounded_rectangle([1380, y + 11, 1470, y + 25], 6, fill=(226, 231, 236))
        late = r in (4, 7)
        d.rounded_rectangle([1640, y + 2, 1760, y + 34], 16, fill=(252, 236, 205) if late else (214, 240, 222))
        d.text((1660, y + 6), "Late" if late else "On time", font=font(19), fill=(160, 100, 20) if late else (30, 120, 66))
    im.save(os.path.join(OUT, "attendance_app.png"))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    proface_idle()
    speedface_idle()
    dashboard()
    attendance_app()
    print("textures written to", OUT)

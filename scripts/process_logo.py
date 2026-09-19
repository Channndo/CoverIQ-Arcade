#!/usr/bin/env python3
"""Process the Square1 logo: key out the black background (white-on-black ->
transparent white) with clean, fringe-free edges, then emit:
  - public/square1-logo.png  (full lockup, transparent)
  - public/square1-mark.png  (icon-only open-square '1' mark, transparent)
  - public/favicon.png       (64px mark)
  - public/apple-touch-icon.png (180px mark)
The key trick for a white-on-black source: set RGB to pure white everywhere and
derive ALPHA from a contrast-ramped luminance. Because color is white where any
ink exists, there is never a dark/black fringe on anti-aliased edges.
"""
import sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2].rstrip('/')

img = Image.open(SRC).convert('RGB')
w, h = img.size
lum = img.convert('L')

# Contrast ramp: lum <= T0 -> alpha 0 (background), lum >= T1 -> alpha 255 (ink),
# smooth linear ramp between for anti-aliased edges.
T0, T1 = 14, 72
lut = [0 if v <= T0 else (255 if v >= T1 else round((v - T0) * 255 / (T1 - T0))) for v in range(256)]
alpha = lum.point(lut)

white = Image.new('RGBA', (w, h), (255, 255, 255, 0))
white.putalpha(alpha)
rgba = white  # RGB already white, alpha applied


def content_bbox(im, pad=0):
    bbox = im.getbbox()  # bbox of non-zero alpha
    if not bbox:
        return None
    l, t, r, b = bbox
    l = max(0, l - pad); t = max(0, t - pad)
    r = min(im.width, r + pad); b = min(im.height, b + pad)
    return (l, t, r, b)


# --- Row-band detection to isolate the icon mark (top band) ---
px = alpha.load()
row_has = []
for y in range(h):
    s = 0
    for x in range(0, w, 3):  # subsample columns for speed
        s += px[x, y]
    row_has.append(s > 255)  # some ink in this row

bands = []
start = None
GAP = 12  # rows of emptiness that separate bands
empty = 0
for y in range(h):
    if row_has[y]:
        if start is None:
            start = y
        empty = 0
    else:
        if start is not None:
            empty += 1
            if empty >= GAP:
                bands.append((start, y - empty + 1))
                start = None
                empty = 0
if start is not None:
    bands.append((start, h - empty))

print('bands (y0,y1):', bands)

# Full lockup: crop to all content with small padding, keep transparent bg
full_box = content_bbox(rgba, pad=16)
full = rgba.crop(full_box)
full.save(f'{OUT}/square1-logo.png')
print('full lockup:', full.size, '->', f'{OUT}/square1-logo.png')

# Icon mark = first (topmost) band -> crop its horizontal extent too
my0, my1 = bands[0]
mark_region = rgba.crop((0, my0, w, my1))
mbox = mark_region.getbbox()
mark = mark_region.crop(mbox)
# Pad to a square canvas so the icon isn't distorted when sized in CSS
mw, mh = mark.size
side = max(mw, mh)
pad = round(side * 0.08)
canvas = Image.new('RGBA', (side + 2 * pad, side + 2 * pad), (255, 255, 255, 0))
canvas.paste(mark, ((canvas.width - mw) // 2, (canvas.height - mh) // 2), mark)
canvas.save(f'{OUT}/square1-mark.png')
print('mark:', mark.size, 'square canvas:', canvas.size, '->', f'{OUT}/square1-mark.png')

# Favicons from the mark
fav = canvas.resize((64, 64), Image.LANCZOS)
fav.save(f'{OUT}/favicon.png')
apple = canvas.resize((180, 180), Image.LANCZOS)
apple.save(f'{OUT}/apple-touch-icon.png')
print('favicons: favicon.png 64, apple-touch-icon.png 180')

# --- Sanity: verify no black fringe. Any pixel with alpha>0 must be white. ---
r, g, b, a = rgba.split()
import statistics
sample_nonwhite = 0
rp, gp, bp, ap = r.load(), g.load(), b.load(), a.load()
for y in range(0, h, 7):
    for x in range(0, w, 7):
        if ap[x, y] > 8 and (rp[x, y] < 250 or gp[x, y] < 250 or bp[x, y] < 250):
            sample_nonwhite += 1
print('non-white visible pixels sampled (should be 0):', sample_nonwhite)

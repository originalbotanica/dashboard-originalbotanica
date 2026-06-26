#!/usr/bin/env python3
"""
Trim the saint 7-day candle photos to the candle on its original WHITE studio
background (just removing the wide empty margins so the candle fills the frame).
The altar shows these in a simple white rounded frame.

Run:  python3 scripts/cutout_saints.py            # all
      python3 scripts/cutout_saints.py san-juan   # one slug
"""
import sys, os, io, urllib.request
import numpy as np
from PIL import Image

OB = "https://dlkhclkmyx18n.cloudfront.net/transforms/products/_productImage"

PHOTOS = {
    "candelaria": "7ds2060__44657.jpg",
    "san-antonio": "7ds2035__21361.jpg",
    "san-juan": "stjohn_7day__59430.jpg",
    "santiago": "santiagowhite_7day__03218.jpg",
    "regla": "yemaya-orisha-7-day-candle.jpg",
    "caridad": "7ds2065__84976.1414689245.1280.1280__30505.jpg",
    "mercedes": "mercedes_7day__10148.jpg",
    "san-miguel": "candle-saint-michael-red-7-day.jpg",
    "san-francisco": "stfrancis_7day__52566.jpg",
    "barbara": "7ds2050__63108.jpg",
    "lazaro": "lazurusyellow_7day__77207.jpg",
    "altagracia": "7ds2025__87830.jpg",
    "fatima": "fatima_7day__90934.jpg",
    "sacred-heart": "jesusred_7day__67475.jpg",
    "perpetua": "ladyhelp_7day__76559.jpg",
    "carmen": "carmen_7day__67532.jpg",
    "san-alejo": "7ds2020__19451.jpg",
    "santa-ana": "7ds2030__32727.jpg",
    "dolorosa": "dolorosa_7day__30493.jpg",
    "guardian-angel": "guardianangel_7day__37948.jpg",
    "guadalupe": "guadalupe_7day__48155.jpg",
    "santa-marta": "marthadom_7day__37176.jpg",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "saints")
THRESH = 244  # all channels this bright => empty white margin

def crop_to_candle(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    nonwhite = ~((rgb[:, :, 0] >= THRESH) & (rgb[:, :, 1] >= THRESH) & (rgb[:, :, 2] >= THRESH))
    ys, xs = np.where(nonwhite)
    if len(xs) == 0:
        return img.convert("RGB")
    w, h = img.size
    padx, pady = int(w * 0.06), int(h * 0.05)
    box = (
        max(int(xs.min()) - padx, 0),
        max(int(ys.min()) - pady, 0),
        min(int(xs.max()) + padx, w),
        min(int(ys.max()) + pady, h),
    )
    return img.convert("RGB").crop(box)

def run(slug, fname):
    data = urllib.request.urlopen(f"{OB}/{fname}", timeout=60).read()
    img = Image.open(io.BytesIO(data))
    res = crop_to_candle(img)
    os.makedirs(OUT_DIR, exist_ok=True)
    res.save(os.path.join(OUT_DIR, f"{slug}.png"))
    print(f"{slug:16s} {img.size} -> {res.size}")

if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    items = {only: PHOTOS[only]} if only else PHOTOS
    for slug, fname in items.items():
        try:
            run(slug, fname)
        except Exception as e:
            print(f"!! {slug}: {e}")

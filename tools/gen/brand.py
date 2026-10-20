"""App icon + splash mark for Aura Themes: a glowing violet halo on charcoal."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "assets", "brand")
os.makedirs(OUT, exist_ok=True)


def halo(size, bg=True):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) / size
    cx, cy = 0.5, 0.5
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    ang = np.arctan2(yy - cy, xx - cx)
    t = (np.sin(ang - 0.8) + 1) / 2
    c1, c2 = np.array([124, 77, 255], np.float32), np.array([255, 120, 200], np.float32)
    ringcol = c1 * (1 - t[..., None]) + c2 * t[..., None]
    ring = np.exp(-((d - 0.27) / 0.022) ** 2)
    glow = np.exp(-((d - 0.27) / 0.09) ** 2) * 0.45
    core = np.exp(-(d / 0.16) ** 2) * 0.35
    a = np.clip(ring + glow + core, 0, 1)
    col = ringcol * np.clip(ring + glow, 0, 1)[..., None] + np.array([180, 150, 255]) * core[..., None]
    if bg:
        base = np.array([14, 12, 20], np.float32) * (1 - yy[..., None] * 0.5) + np.array([8, 8, 10]) * yy[..., None] * 0.5
        img = np.clip(base + col, 0, 255)
        return Image.fromarray(img.astype(np.uint8), "RGB")
    rgba = np.dstack([np.clip(col / np.maximum(a, 1e-3)[..., None], 0, 255), a * 255])
    return Image.fromarray(rgba.astype(np.uint8), "RGBA")


halo(1024).save(os.path.join(OUT, "icon.png"))
halo(512, bg=False).save(os.path.join(OUT, "splash.png"))
print("brand assets written")

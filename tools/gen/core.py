"""Core rendering helpers for Aura Themes' procedural wallpapers.

Everything here is original, generated artwork: no external images are used.
Canvas is 1179x2556 (iPhone 14/15/16 Pro native resolution, 19.5:9).
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1179, 2556
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
U = XX / W
V = YY / H
ASPECT = H / W


def hexc(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


def solid(color):
    return np.ones((H, W, 3), np.float32) * hexc(color)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def ramp(t, colors, positions=None):
    """Map scalar field t (0..1) through a list of hex colors."""
    cols = np.stack([hexc(c) for c in colors])
    if positions is None:
        positions = np.linspace(0, 1, len(colors))
    t = np.clip(t, 0, 1)
    out = np.empty(t.shape + (3,), np.float32)
    for ch in range(3):
        out[..., ch] = np.interp(t, positions, cols[:, ch])
    return out


def vgrad(colors, positions=None, t=None):
    return ramp(V if t is None else t, colors, positions)


# ---------- value noise ----------
class Noise:
    def __init__(self, rng, n=256):
        self.n = n
        self.g = rng.random((n, n)).astype(np.float32)

    def value(self, x, y):
        n = self.n
        xi = np.floor(x)
        yi = np.floor(y)
        xf = x - xi
        yf = y - yi
        xi = xi.astype(np.int64) % n
        yi = yi.astype(np.int64) % n
        x1 = (xi + 1) % n
        y1 = (yi + 1) % n
        u = xf * xf * (3 - 2 * xf)
        v = yf * yf * (3 - 2 * yf)
        g = self.g
        a = g[yi, xi]
        b = g[yi, x1]
        c = g[y1, xi]
        d = g[y1, x1]
        return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v

    def fbm(self, x, y, octaves=5, lac=2.0, gain=0.5):
        total = np.zeros_like(x)
        amp = 1.0
        norm = 0.0
        f = 1.0
        for i in range(octaves):
            total += amp * self.value(x * f + i * 17.3, y * f + i * 9.1)
            norm += amp
            amp *= gain
            f *= lac
        return total / norm

    def warped(self, scale=2.0, strength=3.5, octaves=5):
        x = U * scale
        y = V * scale * ASPECT
        qx = self.fbm(x, y, 4)
        qy = self.fbm(x + 5.2, y + 1.3, 4)
        rx = self.fbm(x + strength * qx + 1.7, y + strength * qy + 9.2, 4)
        ry = self.fbm(x + strength * qx + 8.3, y + strength * qy + 2.8, 4)
        f = self.fbm(x + strength * rx, y + strength * ry, octaves)
        return normalize(f), normalize(qx), normalize(rx)


def normalize(a):
    lo, hi = np.percentile(a, 0.5), np.percentile(a, 99.5)
    return np.clip((a - lo) / (hi - lo + 1e-6), 0, 1)


def noise1d(rng, xs, freq, octaves=5, ridged=False):
    n = 512
    g = rng.random(n).astype(np.float32)
    total = np.zeros_like(xs)
    amp, norm, f = 1.0, 0.0, freq
    for _ in range(octaves):
        x = xs * f
        xi = np.floor(x).astype(np.int64)
        xf = x - xi
        u = xf * xf * (3 - 2 * xf)
        v = g[xi % n] + (g[(xi + 1) % n] - g[xi % n]) * u
        if ridged:
            v = 1 - np.abs(2 * v - 1)
        total += amp * v
        norm += amp
        amp *= 0.5
        f *= 2.0
    return total / norm


# ---------- compositing ----------
def over(img, color, alpha):
    c = hexc(color) if isinstance(color, str) else color
    a = alpha[..., None]
    return img * (1 - a) + c * a


def add(img, color, amount):
    c = hexc(color) if isinstance(color, str) else color
    return img + c * amount[..., None]


def screen(img, color, amount):
    c = hexc(color) if isinstance(color, str) else color
    return 1 - (1 - img) * (1 - c * amount[..., None])


def glow(cx, cy, r, power=2.0):
    d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
    return np.exp(-(d / r) ** power)


def disc(cx, cy, r, soft=1.5):
    d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
    return np.clip((r - d) / soft + 0.5, 0, 1)


def vignette(img, strength=0.35):
    d = np.sqrt(((U - 0.5) * 1.0) ** 2 + ((V - 0.5) * 0.9) ** 2)
    return img * (1 - strength * smoothstep(0.3, 0.85, d))[..., None]


def mask_draw(fn, ss=2):
    """Draw antialiased vector shapes: fn(draw, s) where s is the supersample scale."""
    m = Image.new("L", (W * ss, H * ss), 0)
    fn(ImageDraw.Draw(m), ss)
    m = m.resize((W, H), Image.LANCZOS)
    return np.asarray(m, dtype=np.float32) / 255


def blur(a, radius):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), "L")
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255


def rgba_layer(draw_fn, blur_radius=0):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    if blur_radius:
        layer = layer.filter(ImageFilter.GaussianBlur(blur_radius))
    arr = np.asarray(layer, dtype=np.float32) / 255
    return arr[..., :3], arr[..., 3]


def apply_layer(img, layer, mode="over"):
    rgb, a = layer
    if mode == "add":
        return img + rgb * a[..., None]
    return img * (1 - a[..., None]) + rgb * a[..., None]


def finish(img, rng, grain=0.012):
    img = np.clip(img, 0, 1)
    if grain:
        img = img + rng.normal(0, grain, img.shape[:2]).astype(np.float32)[..., None]
    img = np.clip(img, 0, 1)
    return Image.fromarray((img * 255 + 0.5).astype(np.uint8), "RGB")

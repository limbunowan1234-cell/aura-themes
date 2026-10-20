"""Wallpaper styles. Each style takes (rng, **params) and returns a float HxWx3 image."""
import math
import numpy as np
from PIL import ImageDraw
from core import (W, H, XX, YY, U, V, ASPECT, hexc, solid, smoothstep, ramp, vgrad, Noise,
                  normalize, noise1d, over, add, screen, glow, disc, vignette, mask_draw, blur,
                  rgba_layer, apply_layer)


# ---------------------------------------------------------------- gradients
def mesh(rng, colors, base=None, blobs=7, warp=0.22, sheen=0.0):
    nz = Noise(rng)
    x, y = U * 1.6, V * 1.6 * ASPECT
    wx = (nz.fbm(x, y, 3) - 0.5) * warp * W * 2
    wy = (nz.fbm(x + 7.1, y + 3.3, 3) - 0.5) * warp * H
    X2, Y2 = XX + wx, YY + wy
    basec = hexc(base or colors[0])
    acc = np.ones((H, W, 3), np.float32) * basec * 0.02
    wsum = np.full((H, W), 0.02, np.float32)
    for i in range(blobs):
        c = hexc(colors[i % len(colors)])
        cx = rng.uniform(0.0, 1.0) * W
        cy = (i + rng.uniform(0.2, 0.8)) / blobs * H
        r = rng.uniform(0.16, 0.26) * H
        d2 = ((X2 - cx) ** 2 + (Y2 - cy) ** 2) / (r * r)
        w = 1.0 / (d2 + 0.08) ** 1.6
        acc += w[..., None] * c
        wsum += w
    img = acc / wsum[..., None]
    if sheen:
        band = np.exp(-((U * 0.8 - V + 0.5) / 0.18) ** 2)
        img = screen(img, "#ffffff", band * sheen)
    return img


def liquid(rng, colors, scale=1.6, strength=3.2, bands=0.0, gloss=0.25):
    nz = Noise(rng)
    f, q, r = nz.warped(scale, strength)
    t = f
    if bands:
        t = 0.5 + 0.5 * np.sin(f * math.pi * 2 * bands + q * 3)
    img = ramp(t, colors)
    if gloss:
        hl = smoothstep(0.78, 0.98, r) * gloss
        img = screen(img, "#ffffff", hl)
    return img


# ---------------------------------------------------------------- amoled
def amoled(rng, kind, color, color2=None):
    img = solid("#000000")
    c = hexc(color)
    c2 = hexc(color2 or color)
    cx, cy = W * 0.5, H * 0.56
    if kind == "orb":
        core = glow(cx, cy, W * 0.24, 2.0)
        rim = np.exp(-((np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2) - W * 0.3) / 6) ** 2)
        img = add(img, c, core * 0.55)
        img = add(img, c2, rim * 0.9 + glow(cx, cy, W * 0.36, 1.2) * 0.12)
    elif kind == "ring":
        d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
        ring = np.exp(-((d - W * 0.32) / 3.5) ** 2)
        halo = np.exp(-((d - W * 0.32) / 40) ** 2)
        img = add(img, c, ring * 1.0 + halo * 0.35)
        img = add(img, c2, glow(cx, cy, W * 0.6, 1.5) * 0.05)
    elif kind == "line":
        d = np.abs(XX - cx)
        fade = smoothstep(0.08, 0.35, V) * smoothstep(0.98, 0.7, V)
        img = add(img, c, (np.exp(-(d / 2.2) ** 2) + np.exp(-(d / 38) ** 2) * 0.3) * fade)
    elif kind == "wave":
        yc = H * 0.58 + np.sin(U * math.pi * 2 * 1.2 + 0.6) * H * 0.06
        d = np.abs(YY - yc)
        img = add(img, c, np.exp(-(d / 3) ** 2) + np.exp(-(d / 50) ** 2) * 0.35)
        yc2 = H * 0.62 + np.sin(U * math.pi * 2 * 1.2 + 1.6) * H * 0.05
        d2 = np.abs(YY - yc2)
        img = add(img, c2, (np.exp(-(d2 / 2.5) ** 2) + np.exp(-(d2 / 40) ** 2) * 0.3) * 0.7)
    elif kind == "eclipse":
        d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
        R = W * 0.26
        corona = np.where(d > R, np.exp(-((d - R) / (W * 0.05)) ** 1.2), 0)
        nz = Noise(rng)
        ang = np.arctan2(YY - cy, XX - cx)
        streak = 0.6 + 0.4 * nz.fbm(ang * 6 + 10, d * 0.002, 3)
        img = add(img, c, corona * streak * 1.1)
        img = add(img, "#ffffff", np.exp(-((d - R) / 2.5) ** 2) * 0.8 * (d > R - 3))
    elif kind == "aurora_line":
        nz = Noise(rng)
        for k in range(3):
            yc = H * (0.45 + 0.08 * k) + (nz.fbm(U * 2 + k * 3, np.full_like(U, k * 1.7), 4) - 0.5) * H * 0.25
            d = np.abs(YY - yc)
            col = c if k % 2 == 0 else c2
            img = add(img, col, (np.exp(-(d / 2.0) ** 2) + np.exp(-(d / 30) ** 2) * 0.25) * (0.9 - 0.2 * k))
    elif kind == "dust":
        n = 700
        def draw(d):
            for _ in range(n):
                x = rng.normal(W * 0.5, W * 0.28)
                y = rng.normal(H * 0.55, H * 0.18)
                r = rng.choice([1, 1, 1.5, 2, 3])
                a = int(rng.uniform(80, 255))
                col = tuple(int(v * 255) for v in (c if rng.random() < 0.6 else c2))
                d.ellipse([x - r, y - r, x + r, y + r], fill=col + (a,))
        img = apply_layer(img, rgba_layer(draw, 0.6), "add")
        img = add(img, c, glow(cx, cy, W * 0.5, 1.4) * 0.08)
    return img


# ---------------------------------------------------------------- space
def stars(img, rng, count=1400, tint="#cfd8ff", bright=1.0, region=None):
    t = tuple(int(v * 255) for v in hexc(tint))
    def draw(d):
        for _ in range(count):
            x = rng.uniform(0, W)
            y = rng.uniform(0, H * (region or 1.0))
            r = rng.choice([0.6, 0.8, 1.0, 1.2, 1.6, 2.2], p=[.3, .25, .2, .13, .08, .04])
            a = int(min(255, rng.uniform(60, 255) * bright))
            d.ellipse([x - r, y - r, x + r, y + r], fill=t + (a,))
    return apply_layer(img, rgba_layer(draw, 0.4), "add")


def space(rng, bg, neb1, neb2, planet=None, planet_light="#ffd9a0"):
    nz = Noise(rng)
    img = vgrad([bg, "#000000"], [0, 1]) * 0.6 + solid(bg) * 0.4
    f, q, r = nz.warped(1.3, 2.6)
    m1 = smoothstep(0.45, 0.95, f) ** 1.5
    m2 = smoothstep(0.5, 1.0, r) ** 2
    band = np.exp(-((V - 0.45 - (U - 0.5) * 0.5) / 0.28) ** 2)
    img = screen(img, neb1, m1 * band * 0.9)
    img = screen(img, neb2, m2 * band * 0.7)
    img = stars(img, rng, 1600)
    if planet:
        cx, cy, R = W * planet[0], H * planet[1], W * planet[2]
        dx, dy = (XX - cx) / R, (YY - cy) / R
        d2 = dx * dx + dy * dy
        inside = np.clip((1 - np.sqrt(d2)) * R / 1.5 + 0.5, 0, 1)
        nzz = np.sqrt(np.clip(1 - d2, 0, 1))
        L = np.array([-0.55, -0.45, 0.7]); L /= np.linalg.norm(L)
        lam = np.clip(dx * L[0] + dy * L[1] + nzz * L[2], 0, 1)
        surf = nz.fbm(dx * 3 + 2, dy * 8, 4)
        base = ramp(surf, [planet[3], planet[4], planet[3]])
        lit = base * (0.05 + 0.95 * lam[..., None] ** 1.2)
        img = img * (1 - inside[..., None]) + lit * inside[..., None]
        rim = np.exp(-((np.sqrt(d2) - 1) * R / 10) ** 2) * np.clip(-(dx * L[0] + dy * L[1]) * 0 + lam * 1.5 + 0.2, 0, 1)
        img = add(img, planet_light, rim * 0.35)
    return vignette(img, 0.25)


# ---------------------------------------------------------------- landscapes
def ridge_layers(img, rng, horizon, count, far, near, amp, freq, ridged=True, mist="#ffffff",
                 mist_amt=0.25, spacing=0.06):
    xs = np.arange(W, dtype=np.float32) / W
    for i in range(count):
        t = i / max(1, count - 1)
        base = H * (horizon + spacing * i)
        prof = noise1d(rng, xs + rng.uniform(0, 50), freq * (1 + 0.4 * t), 6, ridged)
        ry = base - (prof - 0.35) * H * amp * (1.0 - 0.35 * t)
        cover = np.clip((YY - ry[None, :]) / 1.2 + 0.5, 0, 1)
        col = hexc(far) * (1 - t) + hexc(near) * t
        layer = np.ones((H, W, 3), np.float32) * col
        haze = np.exp(-(YY - ry[None, :]).clip(0) / (H * 0.05)) * mist_amt * (1 - t * 0.7)
        layer = screen(layer, mist, haze)
        img = img * (1 - cover[..., None]) + layer * cover[..., None]
    return img


def mountains(rng, sky, sun=None, far="#8fa3c7", near="#1a2238", layers=5, night=False,
              mist="#ffffff", ridged=True, amp=0.16, horizon=0.5, freq=3.0):
    img = vgrad(sky[0], sky[1])
    if night:
        img = stars(img, rng, 900, region=0.55)
    if sun:
        sx, sy, sr, scol = W * sun[0], H * sun[1], W * sun[2], sun[3]
        img = screen(img, scol, glow(sx, sy, sr * 4, 1.3) * 0.55)
        img = over(img, scol, disc(sx, sy, sr) * 0.95)
    img = ridge_layers(img, rng, horizon, layers, far, near, amp, freq, ridged, mist)
    return img


def ocean(rng, sky, sea, sun, horizon=0.56, moon=False):
    nz = Noise(rng)
    img = vgrad(sky[0], sky[1])
    if moon:
        img = stars(img, rng, 700, region=horizon)
    sx, sy, sr, scol = W * 0.5, H * sun[0], W * sun[1], sun[2]
    hz = H * horizon
    img = screen(img, scol, glow(sx, sy, sr * 4.5, 1.3) * 0.5 * (YY < hz))
    img = over(img, scol, disc(sx, sy, sr) * (YY < hz))
    t = np.clip((YY - hz) / (H - hz), 0, 1)
    seaimg = ramp(t, sea)
    streak = nz.fbm(U * 3, V * 60, 4)
    depth = 1 + t * 6
    col = np.exp(-((XX - sx) / (sr * 0.9 * depth)) ** 2)
    refl = smoothstep(0.5, 0.68, streak) * col
    seaimg = screen(seaimg, scol, refl * 0.85)
    waves = smoothstep(0.62, 0.75, nz.fbm(U * 6, V * 90 * (1 - t * 0.6), 3)) * 0.12 * (0.3 + t)
    seaimg = screen(seaimg, "#ffffff", waves)
    below = np.clip((YY - hz) / 1.2 + 0.5, 0, 1)
    img = img * (1 - below[..., None]) + seaimg * below[..., None]
    return img


def aurora(rng, bg, c1, c2, hills="#05080f"):
    nz = Noise(rng)
    img = vgrad([bg, "#02030a"], [0, 1])
    img = stars(img, rng, 1100, region=0.8)
    for k, col in enumerate([c1, c2, c1]):
        xc = W * (0.3 + 0.2 * k) + (nz.fbm(V * 2.5 + k * 4, np.full_like(V, k * 2.0), 4) - 0.5) * W * 1.1
        d = (XX - xc) / (W * (0.10 + 0.04 * k))
        curtain = np.exp(-d * d)
        rays = 0.55 + 0.45 * nz.fbm(XX / W * 40 + k * 5, V * 1.5, 3)
        vfade = smoothstep(0.05, 0.3, V) * smoothstep(0.85, 0.45, V)
        img = screen(img, col, curtain * rays * vfade * (0.85 - 0.15 * k))
    img = ridge_layers(img, rng, 0.78, 2, "#0b1220", hills, 0.06, 2.0, False, mist="#7fffd4", mist_amt=0.06)
    return img


def topo(rng, bg, line, lines=26, warp=1.2, accent=None):
    nz = Noise(rng)
    x, y = U * 1.4, V * 1.4 * ASPECT
    qx = nz.fbm(x, y, 3)
    qy = nz.fbm(x + 4.3, y + 2.1, 3)
    f = normalize(nz.fbm(x + warp * qx, y + warp * qy, 5))
    g = f * lines
    fr = np.abs(g - np.round(g))
    gy, gx = np.gradient(g)
    fw = np.sqrt(gx * gx + gy * gy) + 1e-4
    m = np.clip(1 - fr / (fw * 1.3), 0, 1)
    major = (np.round(g) % 5 == 0)
    img = solid(bg)
    img = over(img, line, m * np.where(major, 0.95, 0.55))
    if accent:
        img = screen(img, accent, smoothstep(0.8, 1.0, f) * 0.25)
    return img


# ---------------------------------------------------------------- retro
def synthwave(rng, sky, sun_top, sun_bot, grid, horizon=0.62, mtn="#1b0b3a"):
    img = vgrad(sky, [0, 0.45, horizon])
    img = stars(img, rng, 300, region=0.4, bright=0.7)
    cx, cy, R = W * 0.5, H * 0.46, W * 0.33
    d = disc(cx, cy, R)
    rel = (YY - (cy - R)) / (2 * R)
    suncol = ramp(rel, [sun_top, sun_bot])
    cut_zone = rel > 0.5
    k = (rel - 0.5) * 2
    stripe = np.sin((YY - cy) / R * 32) > (0.85 - k * 1.2)
    cutm = np.where(cut_zone & stripe, 0, 1)
    img = screen(img, sun_bot, glow(cx, cy, R * 1.6, 1.4) * 0.45)
    a = d * cutm * (YY < H * horizon)
    img = img * (1 - a[..., None]) + suncol * a[..., None]
    xs = np.arange(W, dtype=np.float32) / W
    prof = noise1d(rng, xs + 3, 4, 5, True)
    ry = H * horizon - prof * H * 0.07 * (0.4 + np.abs(xs - 0.5) * 1.6)
    cov = np.clip((YY - ry[None, :]) / 1.2 + 0.5, 0, 1)
    img = img * (1 - cov[..., None]) + hexc(mtn) * cov[..., None]
    edge = np.exp(-((YY - ry[None, :]) / 3) ** 2)
    img = add(img, grid, edge * 0.5 * (YY > ry[None, :] - 3))
    hz = H * horizon
    floor = YY > hz
    t = np.clip((YY - hz) / (H - hz), 1e-3, 1)
    z = 1 / t
    fx = (XX - W * 0.5) / W * 2 * z * 1.2
    fz = z * 1.0
    lines = np.zeros_like(XX)
    for g in (fx, fz):
        fr = np.abs(g - np.round(g))
        gy, gx = np.gradient(g)
        fw = np.sqrt(gx * gx + gy * gy) + 1e-4
        lines = np.maximum(lines, np.clip(1 - fr / (fw * 1.5), 0, 1))
    fade = smoothstep(0, 0.25, t)
    flo = vgrad(["#120326", "#05010d"], [0, 1], t)
    flo = add(flo, grid, lines * (0.25 + 0.75 * fade))
    flo = add(flo, grid, np.exp(-((YY - hz) / 18) ** 2) * 0.5)
    img = np.where(floor[..., None], flo, img)
    return img


def seventies(rng, bg, colors, origin=(0.0, 1.0), band=0.085):
    ox, oy = W * origin[0], H * origin[1]
    d = np.sqrt((XX - ox) ** 2 + (YY - oy) ** 2) / H
    img = solid(bg)
    n = len(colors)
    for i, c in enumerate(colors):
        r0 = 0.35 + i * band
        r1 = r0 + band * 0.86
        m = np.clip((d - r0) * H / 1.2 + 0.5, 0, 1) * np.clip((r1 - d) * H / 1.2 + 0.5, 0, 1)
        img = over(img, c, m)
    return img


def sunburst(rng, c1, c2, rays=24, center=(0.5, 0.62), sun="#fff1c1"):
    cx, cy = W * center[0], H * center[1]
    ang = np.arctan2(YY - cy, XX - cx)
    s = np.sin(ang * rays / 2)
    gy, gx = np.gradient(ang * rays / 2)
    fw = np.abs(np.cos(ang * rays / 2)) * np.sqrt(np.clip(gx * gx + gy * gy, 0, 1)) + 1e-3
    m = np.clip(s / (fw * 1.5) + 0.5, 0, 1)
    img = solid(c1) * (1 - m[..., None]) + hexc(c2) * m[..., None]
    img = over(img, sun, disc(cx, cy, W * 0.16))
    img = vignette(img, 0.3)
    return img


def checker(rng, a, b, cols=6, wobble=0.35):
    cx = U * cols + wobble * np.sin(V * 9 + 0.5)
    cy = V * cols * ASPECT + wobble * np.sin(U * 7 + 1.2)
    s = np.sin(math.pi * cx) * np.sin(math.pi * cy)
    gy, gx = np.gradient(s)
    fw = np.sqrt(gx * gx + gy * gy) + 1e-4
    m = np.clip(s / (fw * 1.2) + 0.5, 0, 1)
    return solid(a) * (1 - m[..., None]) + hexc(b) * m[..., None]


# ---------------------------------------------------------------- minimal & architecture
def minimal(rng, bg, kind, fg, fg2=None, line=None):
    img = solid(bg)
    img = screen(img, "#ffffff", glow(W * 0.5, H * 0.3, W * 1.1, 1.5) * 0.06)
    fg2 = fg2 or fg
    if kind == "arch":
        def f(d, s):
            x0, x1, top, bot = W * 0.25 * s, W * 0.75 * s, H * 0.42 * s, H * 0.86 * s
            r = (x1 - x0) / 2
            d.rectangle([x0, top, x1, bot], fill=255)
            d.ellipse([x0, top - r, x1, top + r], fill=255)
        m = mask_draw(f)
        sh = blur(m, 40)
        img = img * (1 - 0.18 * np.roll(np.roll(sh, 30, 0), 18, 1)[..., None])
        img = over(img, fg, m)
    elif kind == "sun":
        hz = H * 0.66
        img = over(img, fg, disc(W * 0.5, hz, W * 0.24) * (YY < hz))
        img = over(img, fg2, (YY >= hz).astype(np.float32))
    elif kind == "circles":
        img = over(img, fg, disc(W * 0.42, H * 0.55, W * 0.22) * 0.95)
        img = over(img, fg2, disc(W * 0.6, H * 0.62, W * 0.17) * 0.85)
    elif kind == "line":
        img = over(img, fg, np.clip(1.6 - np.abs(XX - W * 0.5), 0, 1) * (V > 0.4) * (V < 0.88))
        img = over(img, fg, disc(W * 0.5, H * 0.4, 9))
    elif kind == "moon":
        m = disc(W * 0.5, H * 0.52, W * 0.2) * (1 - disc(W * 0.58, H * 0.49, W * 0.18))
        img = screen(img, fg, glow(W * 0.5, H * 0.52, W * 0.35) * 0.15)
        img = over(img, fg, m)
    elif kind == "dunes":
        xs = U
        y1 = H * (0.6 + 0.06 * np.sin(xs * 3.0 + 0.3))
        y2 = H * (0.74 + 0.05 * np.sin(xs * 2.3 + 2.0))
        img = over(img, fg, np.clip((YY - y1) / 1.2 + 0.5, 0, 1))
        img = over(img, fg2, np.clip((YY - y2) / 1.2 + 0.5, 0, 1))
    elif kind == "pebbles":
        for (x, y, rx, ry, c) in [(0.4, 0.56, 0.2, 0.13, fg), (0.62, 0.66, 0.15, 0.1, fg2), (0.45, 0.73, 0.1, 0.07, fg)]:
            d = ((XX - W * x) / (W * rx)) ** 2 + ((YY - H * y) / (W * ry)) ** 2
            m = np.clip((1 - d) * W * min(rx, ry) / 2.5 + 0.5, 0, 1)
            sh = np.clip((1 - (((XX - W * x - 10) / (W * rx)) ** 2 + ((YY - H * y - 22) / (W * ry)) ** 2)) * 6, 0, 1)
            img = img * (1 - 0.12 * blur(sh, 18)[..., None])
            img = over(img, c, m)
    elif kind == "split":
        y = H * 0.5 + (U - 0.5) * H * 0.12
        img = over(img, fg, np.clip((YY - y) / 1.2 + 0.5, 0, 1))
        img = over(img, fg2, disc(W * 0.5, H * 0.5, W * 0.08))
    return img


def architecture(rng, kind, wall, light, shadow, accent=None):
    img = solid(wall)
    if kind == "arcade":
        n = 3
        for i in range(n):
            def f(d, s, i=i):
                cw = W / n
                x0, x1 = (i * cw + cw * 0.18) * s, ((i + 1) * cw - cw * 0.18) * s
                r = (x1 - x0) / 2
                top, bot = H * 0.42 * s, H * 0.78 * s
                d.rectangle([x0, top, x1, bot], fill=255)
                d.ellipse([x0, top - r, x1, top + r], fill=255)
            m = mask_draw(f)
            inner = vgrad([light, shadow], [0.3, 0.8])
            img = img * (1 - m[..., None]) + inner * m[..., None]
        img = over(img, shadow, (YY > H * 0.78).astype(np.float32) * 0.55)
        img = over(img, light, np.clip(1 - np.abs(YY - H * 0.78) / 1.5, 0, 1) * 0.6)
    elif kind == "stairs":
        steps = 9
        for i in range(steps):
            x0 = W * (i / steps)
            y0 = H * (0.88 - i * 0.055)
            tread = ((XX >= x0) & (YY >= y0)).astype(np.float32)
            img = over(img, shadow if i % 2 else light, tread * 0.9)
            img = over(img, accent or light, ((XX >= x0) & (np.abs(YY - y0) < 2)).astype(np.float32))
    elif kind == "columns":
        n = 5
        cw = W / n
        fx = (XX % cw) / cw
        col = (fx > 0.2) & (fx < 0.8)
        shade = np.cos((fx - 0.5) / 0.3 * math.pi / 2).clip(0, 1)
        base = solid(shadow) * (1 - shade[..., None]) + hexc(light) * shade[..., None]
        mcol = (col & (V > 0.18) & (V < 0.9)).astype(np.float32)
        img = img * (1 - mcol[..., None]) + base * mcol[..., None]
        img = over(img, light, ((V > 0.15) & (V < 0.18)).astype(np.float32))
        img = over(img, light, ((V > 0.9) & (V < 0.93)).astype(np.float32))
        img = screen(img, accent or "#ffffff", glow(W * 0.85, H * 0.05, W, 1.5) * 0.2)
    elif kind == "doorway":
        def f(d, s):
            x0, x1 = W * 0.36 * s, W * 0.64 * s
            r = (x1 - x0) / 2
            top, bot = H * 0.5 * s, H * 0.8 * s
            d.rectangle([x0, top, x1, bot], fill=255)
            d.ellipse([x0, top - r, x1, top + r], fill=255)
        m = mask_draw(f)
        img = vgrad([wall, shadow], [0.2, 1])
        inner = vgrad([accent or light, light], [0.35, 0.8])
        img = img * (1 - m[..., None]) + inner * m[..., None]
        beam = np.clip(1 - np.abs((XX - W * 0.5) - (YY - H * 0.8) * 0.6) / (W * 0.14 + (YY - H * 0.8).clip(0) * 0.35), 0, 1)
        img = screen(img, light, beam * (YY > H * 0.8) * 0.45)
    elif kind == "blocks":
        rects = [(0.0, 0.3, 0.6, 1.0, light), (0.45, 0.48, 1.0, 1.0, shadow), (0.2, 0.62, 0.8, 1.0, accent or light),
                 (0.55, 0.2, 0.85, 0.55, shadow)]
        for (x0, y0, x1, y1, c) in rects:
            m = ((U >= x0) & (U <= x1) & (V >= y0) & (V <= y1)).astype(np.float32)
            sh = ((U >= x0 + 0.02) & (U <= x1 + 0.02) & (V >= y0 + 0.012) & (V <= y1 + 0.012)).astype(np.float32)
            img = img * (1 - 0.25 * blur(sh, 12)[..., None])
            img = over(img, c, m)
    return img


# ---------------------------------------------------------------- luxury
def marble(rng, base, vein, vein2=None, scale=1.4, sharp=14, gloss=0.07):
    nz = Noise(rng)
    f, q, r = nz.warped(scale, 2.4)
    t = np.sin((U * 1.5 + V * 2.2 * ASPECT * 0.4) * math.pi * 2 + f * 9)
    v = (1 - np.abs(t)) ** sharp
    t2 = np.sin((U * 2.5 - V * 1.3) * math.pi * 2 + r * 12)
    v2 = (1 - np.abs(t2)) ** (sharp * 2)
    img = ramp(q, [base, base]) * (0.92 + 0.12 * f[..., None])
    img = over(img, vein, np.clip(v * 1.2, 0, 1))
    img = over(img, vein2 or vein, np.clip(v2 * 0.7, 0, 1))
    img = screen(img, "#ffffff", np.exp(-((U * 0.7 - V + 0.35) / 0.3) ** 2) * gloss)
    return img


def gold_lines(rng, bg, gold, n=7):
    img = vgrad([bg, "#000000"], [0, 1]) * 0.7 + solid(bg) * 0.3
    for i in range(n):
        off = (i - n / 2) * 0.045
        d = np.abs((U - 0.5) * 1.0 - (V - 0.55) * 0.55 - off) * W
        img = add(img, gold, np.exp(-(d / 1.4) ** 2) * (0.9 - abs(i - n / 2) * 0.08))
    img = add(img, gold, np.exp(-(np.abs((U - 0.5) - (V - 0.55) * 0.55) * W / 140) ** 2) * 0.08)
    img = gold_shimmer(img, gold)
    return img


def gold_shimmer(img, gold):
    return screen(img, gold, glow(W * 0.5, H * 0.55, W * 0.9, 1.5) * 0.06)


# ---------------------------------------------------------------- bokeh / seasonal / cute
def bokeh(img, rng, colors, n=40, rmin=20, rmax=90, amin=40, amax=120, blur_r=6, region=(0, 1)):
    def draw(d):
        for _ in range(n):
            x = rng.uniform(-0.05, 1.05) * W
            y = rng.uniform(region[0], region[1]) * H
            r = rng.uniform(rmin, rmax)
            c = tuple(int(v * 255) for v in hexc(rng.choice(colors)))
            d.ellipse([x - r, y - r, x + r, y + r], fill=c + (int(rng.uniform(amin, amax)),))
    return apply_layer(img, rgba_layer(draw, blur_r), "add")


def festive(rng, bg, colors):
    img = vgrad([bg, "#05020a"], [0, 1])
    img = bokeh(img, rng, colors, 55, 30, 110, 30, 90, 14)
    img = bokeh(img, rng, colors, 70, 8, 26, 80, 200, 2, (0.15, 1.0))
    return img


def snowfall(rng, sky):
    img = vgrad(sky)
    img = bokeh(img, rng, ["#ffffff"], 90, 10, 26, 30, 90, 9)
    img = bokeh(img, rng, ["#ffffff"], 500, 2, 6, 110, 230, 1)
    img = ridge_layers(img, rng, 0.82, 2, "#d9e4f2", "#f4f8ff", 0.05, 1.5, False, mist="#ffffff", mist_amt=0.1, spacing=0.05)
    return img


def blossom(rng, sky, petals):
    img = vgrad(sky)
    img = bokeh(img, rng, petals, 40, 40, 120, 30, 80, 16)
    def draw(d):
        for _ in range(140):
            x, y = rng.uniform(0, W), rng.uniform(0, H)
            r = rng.uniform(8, 22)
            c = tuple(int(v * 255) for v in hexc(rng.choice(petals)))
            a = rng.uniform(0, math.pi)
            pts = [(x + math.cos(a + t) * r * (1.0 if k % 2 == 0 else 0.55), y + math.sin(a + t) * r * (1.0 if k % 2 == 0 else 0.55))
                   for k, t in enumerate(np.linspace(0, 2 * math.pi, 9)[:-1])]
            d.polygon(pts, fill=c + (int(rng.uniform(150, 240)),))
    img = apply_layer(img, rgba_layer(draw, 1.2))
    return img


def rain(rng, sky, mist="#a9b8c9"):
    img = vgrad(sky)
    img = ridge_layers(img, rng, 0.62, 4, "#7f8fa3", "#1f2a36", 0.12, 2.5, False, mist=mist, mist_amt=0.35, spacing=0.07)
    def draw(d):
        for _ in range(900):
            x, y = rng.uniform(-100, W), rng.uniform(0, H)
            L = rng.uniform(30, 90)
            d.line([x, y, x + L * 0.18, y + L], fill=(220, 230, 245, int(rng.uniform(25, 90))), width=2)
    img = apply_layer(img, rgba_layer(draw, 0.6), "add")
    return img


def harvest_moon(rng, sky, moon, hills):
    img = vgrad(sky)
    img = stars(img, rng, 500, region=0.6, bright=0.8)
    cx, cy, R = W * 0.6, H * 0.42, W * 0.2
    img = screen(img, moon, glow(cx, cy, R * 3, 1.3) * 0.45)
    nz = Noise(rng)
    surf = nz.fbm((XX - cx) / R * 2, (YY - cy) / R * 2, 4)
    mc = ramp(surf, [moon, "#ffd08a", moon])
    m = disc(cx, cy, R)
    img = img * (1 - m[..., None]) + mc * m[..., None]
    img = ridge_layers(img, rng, 0.66, 3, hills[0], hills[1], 0.1, 2.2, False, mist="#ffb36b", mist_amt=0.12)
    return img


def sparkle_pts(cx, cy, r):
    pts = []
    for k in range(8):
        a = k * math.pi / 4
        rr = r if k % 2 == 0 else r * 0.28
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    return pts


def heart_pts(cx, cy, s):
    pts = []
    for t in np.linspace(0, 2 * math.pi, 60):
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s, cy - y * s))
    return pts


def cute(rng, colors, kind, accent="#ffffff"):
    img = mesh(rng, colors, blobs=6, warp=0.25)
    if kind == "sparkles":
        def draw(d):
            for _ in range(38):
                x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(18, 60)
                d.polygon(sparkle_pts(x, y, r), fill=(255, 255, 255, int(rng.uniform(140, 235))))
        img = apply_layer(img, rgba_layer(draw, 0.6))
        img = bokeh(img, rng, ["#ffffff"], 120, 2, 5, 120, 220, 0.5)
    elif kind == "hearts":
        def draw(d):
            for _ in range(26):
                x, y, s = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(1.8, 4.5)
                c = tuple(int(v * 255) for v in hexc(accent))
                d.polygon(heart_pts(x, y, s), fill=c + (int(rng.uniform(110, 220)),))
        img = apply_layer(img, rgba_layer(draw, 0.8))
    elif kind == "clouds":
        def draw(d):
            for row in range(7):
                cy = H * (0.12 + row * 0.13) + rng.uniform(-40, 40)
                cx = rng.uniform(0.1, 0.9) * W
                for _ in range(9):
                    r = rng.uniform(55, 120)
                    x = cx + rng.uniform(-170, 170)
                    y = cy + rng.uniform(-30, 25)
                    d.ellipse([x - r, y - r * 0.8, x + r, y + r * 0.8], fill=(255, 255, 255, 235))
        img = apply_layer(img, rgba_layer(draw, 3))
    elif kind == "bubbles":
        def draw(d):
            for _ in range(28):
                x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(30, 120)
                d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 255, 255, 200), width=4)
                d.ellipse([x - r * 0.55, y - r * 0.6, x - r * 0.25, y - r * 0.3], fill=(255, 255, 255, 180))
        img = apply_layer(img, rgba_layer(draw, 0.8))
    return img


def rolling_hills(rng, sky, greens, sun="#fff4d6"):
    img = vgrad(*sky)
    img = screen(img, sun, glow(W * 0.7, H * 0.3, W * 0.8, 1.4) * 0.35)
    img = ridge_layers(img, rng, 0.42, 6, greens[0], greens[1], 0.07, 1.6, False, mist="#ffffff", mist_amt=0.45, spacing=0.07)
    # tea-row texture on the nearest slopes
    rows = 0.5 + 0.5 * np.sin((YY + np.sin(U * 6) * 40) / 9)
    near = smoothstep(0.7, 0.95, V)
    img = img * (1 - 0.12 * rows[..., None] * near[..., None])
    return img

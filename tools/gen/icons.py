"""Render original icon packs for each theme.

Glyphs come from Ionicons (MIT licence, bundled with @expo/vector-icons).
No third-party app logos or trademarks are used: icons are generic functions
(Phone, Mail, Camera...) that the user can assign to any app.

Every theme gets four variants of every slot:
  signature  the theme's own look (themes.json "icon")
  light      soft tinted-white tile, deep accent glyph
  dark       near-black tile, glowing accent glyph
  tinted     single-hue tile like iOS tinted icons

Outputs assets/icons/<theme>/<variant>/<slot>.jpg (256x256: Home Screen icons
display at 180px) and src/data/icons.generated.ts
"""
import colorsys
import json
import os
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VI = os.path.join(ROOT, "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons")
FONT = os.path.join(VI, "Fonts/Ionicons.ttf")
GLYPHS = json.load(open(os.path.join(VI, "glyphmaps/Ionicons.json")))
THEMES = json.load(open(os.path.join(ROOT, "src/data/themes.json")))
S = 256

GROUPS = [
    ("essentials", "Essentials"), ("social", "Social"), ("media", "Media"), ("productivity", "Productivity"),
    ("lifestyle", "Lifestyle"), ("travel", "Travel & money"), ("utilities", "Utilities"),
]

# (slot id, label, Ionicons glyph, group)
SLOTS = [
    ("phone", "Phone", "call", "essentials"), ("messages", "Messages", "chatbubble", "essentials"),
    ("camera", "Camera", "camera", "essentials"), ("photos", "Photos", "images", "essentials"),
    ("music", "Music", "musical-notes", "essentials"), ("settings", "Settings", "settings", "essentials"),
    ("calendar", "Calendar", "calendar", "essentials"), ("mail", "Mail", "mail", "essentials"),
    ("maps", "Maps", "map", "essentials"), ("browser", "Browser", "compass", "essentials"),
    ("clock", "Clock", "time", "essentials"), ("notes", "Notes", "document-text", "essentials"),
    ("weather", "Weather", "cloud", "essentials"), ("video", "Video", "videocam", "essentials"),
    ("wallet", "Wallet", "wallet", "essentials"), ("games", "Games", "game-controller", "essentials"),

    ("contacts", "Contacts", "people", "social"), ("chat", "Chat", "chatbubbles", "social"),
    ("social", "Social", "globe", "social"), ("messenger", "Messenger", "paper-plane", "social"),
    ("profile", "Profile", "person-circle", "social"), ("mentions", "Mentions", "at", "social"),

    ("podcasts", "Podcasts", "mic", "media"), ("radio", "Radio", "radio", "media"),
    ("audio", "Audio", "headset", "media"), ("streaming", "Streaming", "play-circle", "media"),
    ("movies", "Movies", "film", "media"), ("tv", "TV", "tv", "media"),
    ("books", "Books", "book", "media"), ("news", "News", "newspaper", "media"),
    ("albums", "Albums", "albums", "media"), ("voice-memos", "Voice Memos", "recording", "media"),

    ("reminders", "Reminders", "checkbox", "productivity"), ("files", "Files", "folder", "productivity"),
    ("docs", "Docs", "reader", "productivity"), ("sheets", "Sheets", "grid", "productivity"),
    ("slides", "Slides", "easel", "productivity"), ("todo", "To-Do", "list", "productivity"),
    ("journal", "Journal", "journal", "productivity"), ("write", "Write", "create", "productivity"),
    ("work", "Work", "briefcase", "productivity"), ("learn", "Learn", "school", "productivity"),
    ("library", "Library", "library", "productivity"), ("code", "Code", "code-slash", "productivity"),
    ("scanner", "Scanner", "scan", "productivity"),

    ("health", "Health", "heart", "lifestyle"), ("fitness", "Fitness", "fitness", "lifestyle"),
    ("workout", "Workout", "barbell", "lifestyle"), ("hydrate", "Hydrate", "water", "lifestyle"),
    ("sleep", "Sleep", "moon", "lifestyle"), ("mindful", "Mindful", "leaf", "lifestyle"),
    ("food", "Food", "restaurant", "lifestyle"), ("coffee", "Coffee", "cafe", "lifestyle"),
    ("shopping", "Shopping", "cart", "lifestyle"), ("store", "Store", "bag-handle", "lifestyle"),
    ("deliveries", "Deliveries", "cube", "lifestyle"), ("pets", "Pets", "paw", "lifestyle"),
    ("gifts", "Gifts", "gift", "lifestyle"), ("sports", "Sports", "basketball", "lifestyle"),

    ("travel", "Travel", "airplane", "travel"), ("rides", "Rides", "car", "travel"),
    ("transit", "Transit", "bus", "travel"), ("trains", "Trains", "train", "travel"),
    ("hotels", "Hotels", "bed", "travel"), ("bank", "Bank", "card", "travel"),
    ("finance", "Finance", "cash", "travel"), ("stocks", "Stocks", "trending-up", "travel"),

    ("calculator", "Calculator", "calculator", "utilities"), ("translate", "Translate", "language", "utilities"),
    ("find", "Find", "locate", "utilities"), ("home", "Home", "home", "utilities"),
    ("lights", "Lights", "bulb", "utilities"), ("alarm", "Alarm", "alarm", "utilities"),
    ("timer", "Timer", "stopwatch", "utilities"), ("flashlight", "Flashlight", "flashlight", "utilities"),
    ("passwords", "Passwords", "key", "utilities"), ("security", "Security", "shield-checkmark", "utilities"),
    ("qr", "QR Code", "qr-code", "utilities"), ("cloud", "Cloud", "cloud-download", "utilities"),
]

VARIANTS = [
    ("signature", "Signature"), ("light", "Light"), ("dark", "Dark"), ("tinted", "Tinted"),
]


def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(int(round(x * (1 - t) + y * t)) for x, y in zip(a, b))


def with_lightness(rgb, l, s_max=None):
    h, _, s = colorsys.rgb_to_hls(*(c / 255 for c in rgb))
    if s_max is not None:
        s = min(s, s_max)
    return tuple(int(round(c * 255)) for c in colorsys.hls_to_rgb(h, l, s))


def gradient(c0, c1):
    """Diagonal tile gradient with a soft top highlight."""
    a, b = np.array(c0, np.float32), np.array(c1, np.float32)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    t = np.clip((xx * 0.35 + yy) / (S * 1.35), 0, 1)[..., None]
    hl = np.exp(-((yy / S) / 0.45) ** 2)[..., None] * 18
    return np.clip(a * (1 - t) + b * t + hl, 0, 255)


def glyph_mask(glyph_name, outline):
    name = glyph_name + ("-outline" if outline and (glyph_name + "-outline") in GLYPHS else "")
    ch = chr(GLYPHS[name])
    font = ImageFont.truetype(FONT, int(S * 0.5))
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    box = d.textbbox((0, 0), ch, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((S - w) / 2 - box[0], (S - h) / 2 - box[1]), ch, font=font, fill=255)
    return mask


def vertical_fill(top, bottom):
    t = np.linspace(0, 1, S, dtype=np.float32)[:, None, None]
    return np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t


def composite(bg, fill, mask, glow=None):
    """bg/fill: float arrays SxSx3. glow: (rgb, strength) halo behind the glyph."""
    out = bg
    if glow:
        rgb, strength = glow
        halo = np.asarray(mask.filter(ImageFilter.GaussianBlur(S * 0.05)), np.float32)[..., None] / 255 * strength
        out = out * (1 - halo) + np.array(rgb, np.float32) * halo
    m = np.asarray(mask, np.float32)[..., None] / 255
    out = out * (1 - m) + fill * m
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")


def render_icon(theme, glyph_name, variant):
    st = theme["icon"]
    accent = hx(theme["accent"])
    if variant == "signature":
        bg = gradient(hx(st["bg"][0]), hx(st["bg"][1]))
        g = hx(st["glyph"])
        return composite(bg, vertical_fill(g, g), glyph_mask(glyph_name, st.get("outline")))
    if variant == "light":
        bg = gradient(mix((255, 255, 255), accent, 0.05), mix((246, 244, 241), accent, 0.16))
        deep = with_lightness(accent, 0.34)
        return composite(bg, vertical_fill(with_lightness(accent, 0.46), deep), glyph_mask(glyph_name, True))
    if variant == "dark":
        base = hx(theme["palette"][0])
        bg = gradient(mix((26, 26, 30), base, 0.25), mix((6, 6, 8), base, 0.12))
        glow = with_lightness(accent, 0.62)
        return composite(bg, vertical_fill(with_lightness(accent, 0.78), glow), glyph_mask(glyph_name, False), (accent, 0.55))
    if variant == "tinted":
        bg = gradient(with_lightness(accent, 0.16, 0.55), with_lightness(accent, 0.06, 0.55))
        return composite(bg, vertical_fill(with_lightness(accent, 0.9, 0.7), with_lightness(accent, 0.66, 0.7)),
                         glyph_mask(glyph_name, False))
    raise ValueError(variant)


def main():
    count = 0
    for th in THEMES:
        out = os.path.join(ROOT, "assets", "icons", th["id"])
        if os.path.isdir(out):
            shutil.rmtree(out)
        for variant, _ in VARIANTS:
            os.makedirs(os.path.join(out, variant))
            for slot, _, glyph, _ in SLOTS:
                render_icon(th, glyph, variant).save(os.path.join(out, variant, slot + ".jpg"), quality=92, subsampling=0, optimize=True)
                count += 1
    slots = [{"id": s, "label": l, "group": g} for s, l, _, g in SLOTS]
    lines = ["// AUTO-GENERATED by tools/gen/icons.py — do not edit by hand.",
             "// Glyphs: Ionicons (MIT). Artwork composed for Aura Themes.",
             "export const ICON_GROUPS = " + json.dumps([{"id": i, "label": l} for i, l in GROUPS], indent=2) + " as const;",
             "",
             "export const ICON_VARIANTS = " + json.dumps([{"id": i, "label": l} for i, l in VARIANTS], indent=2) + " as const;",
             "",
             "export type IconVariant = (typeof ICON_VARIANTS)[number]['id'];",
             "",
             "export const ICON_SLOTS: { id: string; label: string; group: string }[] = " + json.dumps(slots, indent=2) + ";",
             "",
             "export const ICON_IMAGES: Record<string, Record<IconVariant, Record<string, number>>> = {"]
    for th in THEMES:
        lines.append(f"  '{th['id']}': {{")
        for variant, _ in VARIANTS:
            lines.append(f"    {variant}: {{")
            for slot, _, _, _ in SLOTS:
                lines.append(f"      '{slot}': require('../../assets/icons/{th['id']}/{variant}/{slot}.jpg'),")
            lines.append("    },")
        lines.append("  },")
    lines += ["};", ""]
    with open(os.path.join(ROOT, "src/data/icons.generated.ts"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))
    print("slots:", len(SLOTS), "icons:", count)


if __name__ == "__main__":
    main()

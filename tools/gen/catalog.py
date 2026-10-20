"""Catalog spec: every wallpaper Aura ships. (id, title, category, tags, style, params)."""
import styles as S

SPECS = []


def wp(title, category, tags, fn, **params):
    slug = title.lower().replace("'", "").replace(" ", "-")
    SPECS.append(dict(id=slug, title=title, category=category, tags=tags, fn=fn, params=params))


# GRADIENT
wp("Velvet Dusk", "gradient", ["violet", "pink", "warm"], S.mesh, colors=["#1a1033", "#5b2a86", "#e0559b", "#ff9e7a"])
wp("Lagoon", "gradient", ["teal", "green", "cool"], S.mesh, colors=["#03203a", "#0a6c74", "#29c7ac", "#c7f9cc"])
wp("Peach Haze", "gradient", ["peach", "soft", "light"], S.mesh, colors=["#ffd6c0", "#ffb4a2", "#e5989b", "#fbe3d4"])
wp("Ultraviolet", "gradient", ["violet", "neon", "purple"], S.mesh, colors=["#0b0420", "#3a0ca3", "#7209b7", "#f72585"])
wp("Citrus Morning", "gradient", ["yellow", "orange", "bright"], S.mesh, colors=["#fff3b0", "#ffca3a", "#ff924c", "#ff595e"])
wp("Glacier", "gradient", ["blue", "ice", "cool"], S.mesh, colors=["#e0fbfc", "#98c1d9", "#3d5a80", "#c2dfe3"])
wp("Rosewater", "gradient", ["pink", "rose", "light"], S.mesh, colors=["#fff0f3", "#ffccd5", "#ff8fa3", "#ffe5ec"])
wp("Emerald Silk", "gradient", ["green", "emerald", "dark"], S.mesh, colors=["#04130f", "#0b3d2e", "#1b7f5f", "#7fe0b0"], sheen=0.08)
wp("Sundown", "gradient", ["orange", "red", "sunset"], S.mesh, colors=["#2b0f2e", "#8c1c4f", "#f25c54", "#f7b267"])
wp("Iris", "gradient", ["lavender", "purple", "light"], S.mesh, colors=["#f1e9ff", "#c8b6ff", "#9381ff", "#e2d9ff"])

# ABSTRACT (domain-warped liquid)
wp("Molten Glass", "abstract", ["liquid", "violet", "blue"], S.liquid, colors=["#0d0221", "#2a1b5c", "#6a4cff", "#b9a8ff", "#f0eaff"])
wp("Coral Flow", "abstract", ["liquid", "coral", "warm"], S.liquid, colors=["#2d0b16", "#a4243b", "#ff6f59", "#ffd8be"])
wp("Mint Current", "abstract", ["liquid", "mint", "green"], S.liquid, colors=["#062925", "#0b6e4f", "#36c9a3", "#d4fff1"], strength=4.0)
wp("Oil Slick", "abstract", ["iridescent", "rainbow", "dark"], S.liquid, colors=["#05040a", "#24135f", "#0e7c86", "#e0a100", "#c2185b", "#05040a"], bands=1.5)
wp("Chromatic", "abstract", ["chrome", "silver", "metal"], S.liquid, colors=["#101215", "#5b6470", "#e6ebf0", "#7d8794", "#16191d"], bands=2.0, gloss=0.4)
wp("Tangerine Dream", "abstract", ["orange", "liquid", "bright"], S.liquid, colors=["#ffe8cc", "#ffb347", "#ff7b00", "#9c2c00"], scale=1.2)
wp("Blueprint Swirl", "abstract", ["blue", "liquid", "cool"], S.liquid, colors=["#000814", "#001d3d", "#003566", "#4cc9f0", "#e0f7ff"], strength=4.5)
wp("Aura Bloom", "abstract", ["pink", "violet", "brand"], S.liquid, colors=["#120a1f", "#4a1f6f", "#b04bd8", "#ff9ad5", "#fff0f8"], bands=0.8)

# AMOLED
wp("Violet Orb", "amoled", ["black", "violet", "glow"], S.amoled, kind="orb", color="#7c4dff", color2="#b388ff")
wp("Cyan Halo", "amoled", ["black", "cyan", "ring"], S.amoled, kind="ring", color="#18ffff", color2="#00b8d4")
wp("Crimson Thread", "amoled", ["black", "red", "line"], S.amoled, kind="line", color="#ff1744")
wp("Neon Wave", "amoled", ["black", "pink", "wave"], S.amoled, kind="wave", color="#ff4081", color2="#40c4ff")
wp("Solar Eclipse", "amoled", ["black", "gold", "eclipse"], S.amoled, kind="eclipse", color="#ffb74d")
wp("Northern Thread", "amoled", ["black", "green", "aurora"], S.amoled, kind="aurora_line", color="#69f0ae", color2="#40c4ff")
wp("Stardust", "amoled", ["black", "particles", "violet"], S.amoled, kind="dust", color="#b388ff", color2="#80d8ff")
wp("Gold Halo", "amoled", ["black", "gold", "ring"], S.amoled, kind="ring", color="#ffd54f", color2="#ff8f00")
wp("Emerald Orb", "amoled", ["black", "green", "glow"], S.amoled, kind="orb", color="#00e676", color2="#b9f6ca")
wp("Ice Line", "amoled", ["black", "blue", "line"], S.amoled, kind="line", color="#82b1ff")

# SPACE
wp("Violet Nebula", "space", ["nebula", "stars", "violet"], S.space, bg="#05030f", neb1="#7b2ff7", neb2="#f107a3")
wp("Teal Nebula", "space", ["nebula", "stars", "teal"], S.space, bg="#020a10", neb1="#00b4d8", neb2="#90e0ef")
wp("Ember Planet", "space", ["planet", "orange", "stars"], S.space, bg="#05030a", neb1="#ff6d00", neb2="#7b2ff7",
   planet=(0.62, 0.68, 0.34, "#e76f51", "#f4a261"))
wp("Blue Giant", "space", ["planet", "blue", "stars"], S.space, bg="#02040c", neb1="#3a86ff", neb2="#8338ec",
   planet=(0.35, 0.74, 0.42, "#1d3557", "#a8dadc"), planet_light="#cde7ff")
wp("Rose Galaxy", "space", ["nebula", "pink", "stars"], S.space, bg="#0a0310", neb1="#ff4d6d", neb2="#ffb3c1")
wp("Deep Field", "space", ["stars", "dark", "nebula"], S.space, bg="#000000", neb1="#3d348b", neb2="#7678ed")
wp("Jade Moon", "space", ["planet", "green", "stars"], S.space, bg="#020806", neb1="#2d6a4f", neb2="#95d5b2",
   planet=(0.6, 0.6, 0.26, "#2d6a4f", "#b7e4c7"), planet_light="#d8f3dc")
wp("Cosmic Dust", "space", ["nebula", "gold", "stars"], S.space, bg="#070502", neb1="#e09f3e", neb2="#9e2a2b")

# MOUNTAINS
wp("Himalayan Dawn", "mountains", ["sunrise", "peaks", "pink"], S.mountains,
   sky=(["#2b2d6e", "#c06c84", "#f8b195"], [0, 0.4, 0.62]), sun=(0.68, 0.5, 0.06, "#ffe5b4"), far="#c48aa0", near="#2a1e3f")
wp("Blue Hour Peaks", "mountains", ["blue", "dusk", "peaks"], S.mountains,
   sky=(["#0b132b", "#1c2541", "#5bc0be"], [0, 0.4, 0.62]), far="#6f8fb3", near="#0b1324")
wp("Moonlit Range", "mountains", ["night", "moon", "stars"], S.mountains,
   sky=(["#020617", "#0f172a", "#334155"], [0, 0.4, 0.62]), sun=(0.3, 0.2, 0.05, "#f1f5f9"), far="#475569", near="#020617", night=True)
wp("Alpine Morning", "mountains", ["blue", "fresh", "light"], S.mountains,
   sky=(["#a7d8ff", "#dff3ff", "#ffffff"], [0, 0.4, 0.6]), far="#9fb8d1", near="#2f4858", mist="#ffffff")
wp("Misty Monochrome", "mountains", ["mono", "mist", "grey"], S.mountains,
   sky=(["#e5e5e5", "#f5f5f5", "#ffffff"], [0, 0.4, 0.6]), far="#c4c4c4", near="#262626", layers=6)
wp("Golden Ridge", "mountains", ["golden", "sunset", "warm"], S.mountains,
   sky=(["#3d1c02", "#e36414", "#fbb02d"], [0, 0.35, 0.6]), sun=(0.5, 0.52, 0.08, "#fff3c4"), far="#d17a22", near="#2b0f00")
wp("Lilac Peaks", "mountains", ["pastel", "lilac", "soft"], S.mountains,
   sky=(["#cdb4db", "#ffc8dd", "#ffe5ec"], [0, 0.4, 0.62]), far="#b8a1d9", near="#5a4a78")
wp("Tea Hills", "nature", ["green", "hills", "darjeeling"], S.rolling_hills,
   sky=(["#cfe8ef", "#f6f7e8"], [0, 0.5]), greens=["#a3c9a8", "#1f4d2b"])

# OCEAN
wp("Sunset Sea", "ocean", ["sunset", "sea", "orange"], S.ocean,
   sky=(["#1d1a39", "#a33f5c", "#ff9e64"], [0, 0.35, 0.56]), sea=["#ff9e64", "#4a2545", "#0f0d1f"], sun=(0.5, 0.07, "#ffe0a6"))
wp("Moon Tide", "ocean", ["night", "moon", "sea"], S.ocean,
   sky=(["#020617", "#0b1d3a", "#1e3a5f"], [0, 0.4, 0.56]), sea=["#1e3a5f", "#06101f", "#01040a"], sun=(0.32, 0.05, "#e2e8f0"), moon=True)
wp("Tropic Noon", "ocean", ["bright", "turquoise", "summer"], S.ocean,
   sky=(["#48cae4", "#ade8f4", "#e8fbff"], [0, 0.4, 0.56]), sea=["#00b4d8", "#0077b6", "#023e8a"], sun=(0.2, 0.05, "#ffffff"))
wp("Pastel Shore", "ocean", ["pastel", "pink", "soft"], S.ocean,
   sky=(["#ffc6d9", "#ffe5ec", "#fff1e6"], [0, 0.35, 0.56]), sea=["#ffd6e0", "#c3b1e1", "#8e7dbe"], sun=(0.46, 0.06, "#fffaf0"))
wp("Storm Front", "ocean", ["grey", "moody", "sea"], S.ocean,
   sky=(["#1f2933", "#52606d", "#9aa5b1"], [0, 0.35, 0.56]), sea=["#7b8794", "#323f4b", "#121a21"], sun=(0.45, 0.06, "#cbd2d9"))
wp("Twilight Bay", "ocean", ["violet", "dusk", "sea"], S.ocean,
   sky=(["#10002b", "#3c096c", "#c77dff"], [0, 0.38, 0.56]), sea=["#9d4edd", "#240046", "#10002b"], sun=(0.5, 0.06, "#f6e7ff"))
wp("Golden Horizon", "ocean", ["gold", "sea", "warm"], S.ocean,
   sky=(["#3a2e12", "#c9a227", "#f4e3a1"], [0, 0.38, 0.56]), sea=["#f4d35e", "#7a5c12", "#1c1505"], sun=(0.5, 0.075, "#fffbe6"))

# NATURE
wp("Aurora Borealis", "nature", ["aurora", "green", "night"], S.aurora, bg="#020c16", c1="#00f5a0", c2="#00d9f5")
wp("Violet Aurora", "nature", ["aurora", "violet", "night"], S.aurora, bg="#0a0418", c1="#b388ff", c2="#ff80ab")
wp("Polar Lights", "nature", ["aurora", "teal", "night"], S.aurora, bg="#01080d", c1="#64ffda", c2="#7c4dff")
wp("Forest Contours", "nature", ["topographic", "green", "lines"], S.topo, bg="#0f2419", line="#8fd6a3")
wp("Desert Contours", "nature", ["topographic", "sand", "lines"], S.topo, bg="#e9d8bd", line="#9c6b3c", lines=30)
wp("Glacier Contours", "nature", ["topographic", "blue", "lines"], S.topo, bg="#eaf4fb", line="#5b8db8", lines=22)

# RETRO
wp("Outrun", "retro", ["synthwave", "80s", "neon"], S.synthwave,
   sky=["#0d0221", "#2b0b5e", "#ff3864"], sun_top="#fff35c", sun_bot="#ff2a6d", grid="#ff2a6d")
wp("Miami Grid", "retro", ["synthwave", "cyan", "80s"], S.synthwave,
   sky=["#05012b", "#1a0b5e", "#f72585"], sun_top="#ffe066", sun_bot="#f72585", grid="#05d9e8")
wp("Vapor Sunset", "retro", ["vaporwave", "pastel", "80s"], S.synthwave,
   sky=["#2d1b4e", "#7b4b94", "#ffb5e8"], sun_top="#fff6a8", sun_bot="#ff71ce", grid="#b967ff", mtn="#2d1b4e")
wp("Seventies Arc", "retro", ["70s", "stripes", "warm"], S.seventies, bg="#f4e9d8", colors=["#d35400", "#e67e22", "#f1c40f", "#8e5e3c"])
wp("Groovy Mint", "retro", ["70s", "stripes", "mint"], S.seventies, bg="#fdf6e3", colors=["#2a9d8f", "#8ab17d", "#e9c46a", "#e76f51"], origin=(1.0, 1.0))
wp("Sunburst", "retro", ["rays", "orange", "bold"], S.sunburst, c1="#e85d04", c2="#f48c06")
wp("Cherry Sunburst", "retro", ["rays", "red", "bold"], S.sunburst, c1="#9d0208", c2="#d00000", sun="#ffba08")

# MINIMAL
wp("Clay Arch", "minimal", ["arch", "beige", "light"], S.minimal, bg="#efe6dc", kind="arch", fg="#c97b5a")
wp("Sage Sun", "minimal", ["sun", "green", "light"], S.minimal, bg="#e8ebe1", kind="sun", fg="#d9a441", fg2="#8a9a7b")
wp("Two Circles", "minimal", ["circles", "blue", "light"], S.minimal, bg="#f1efe9", kind="circles", fg="#3a5a7a", fg2="#e9a178")
wp("Single Line", "minimal", ["line", "dark", "mono"], S.minimal, bg="#0e0e10", kind="line", fg="#f3f1ea")
wp("Crescent", "minimal", ["moon", "dark", "navy"], S.minimal, bg="#0b1426", kind="moon", fg="#f4e7c5")
wp("Sand Dunes", "minimal", ["dunes", "warm", "light"], S.minimal, bg="#f6e7d2", kind="dunes", fg="#e2b98f", fg2="#c98f63")
wp("Pebbles", "minimal", ["stones", "grey", "calm"], S.minimal, bg="#e7e4df", kind="pebbles", fg="#b8b2a7", fg2="#8d877d")
wp("Horizon Split", "minimal", ["split", "dark", "red"], S.minimal, bg="#14110f", kind="split", fg="#2a2420", fg2="#e85d4a")
wp("Terracotta Arch", "minimal", ["arch", "terracotta", "warm"], S.minimal, bg="#2a1a14", kind="arch", fg="#d27d56")

# ARCHITECTURE
wp("Arcade", "architecture", ["arches", "warm", "geometry"], S.architecture, kind="arcade", wall="#e8c9a9", light="#fff3e3", shadow="#b5774a")
wp("Ascent", "architecture", ["stairs", "geometry", "blue"], S.architecture, kind="stairs", wall="#dbe7f2", light="#f5f9fc", shadow="#a9c1d9", accent="#ffffff")
wp("Colonnade", "architecture", ["columns", "marble", "classic"], S.architecture, kind="columns", wall="#d9d4cc", light="#f7f3ec", shadow="#8f877c")
wp("Golden Door", "architecture", ["doorway", "light", "warm"], S.architecture, kind="doorway", wall="#2b2420", light="#ffe4b5", shadow="#120e0c", accent="#ffb347")
wp("Brutal Blocks", "architecture", ["concrete", "grey", "geometry"], S.architecture, kind="blocks", wall="#cfccc6", light="#e9e7e2", shadow="#8a867f", accent="#b0aca5")

# LUXURY
wp("Nero Marquina", "luxury", ["marble", "black", "gold"], S.marble, base="#0d0d0f", vein="#d4af37", vein2="#f5f5f5")
wp("Calacatta", "luxury", ["marble", "white", "gold"], S.marble, base="#f4f1ec", vein="#8a8178", vein2="#c9a227", sharp=10)
wp("Emerald Marble", "luxury", ["marble", "green", "gold"], S.marble, base="#073b2e", vein="#d4af37", vein2="#a3e4c9")
wp("Gilded Lines", "luxury", ["gold", "black", "lines"], S.gold_lines, bg="#0a0a0a", gold="#d4af37")
wp("Rose Gold Lines", "luxury", ["rose gold", "dark", "lines"], S.gold_lines, bg="#1a0f12", gold="#e8b4a0")
wp("Champagne Silk", "luxury", ["champagne", "gold", "light"], S.mesh, colors=["#f7e7ce", "#e6c99a", "#fff8ec", "#d8b47a"], sheen=0.18)
wp("Velvet Noir", "luxury", ["black", "velvet", "burgundy"], S.mesh, colors=["#050505", "#2a0a14", "#4a0d1f", "#0a0a0a"], sheen=0.06)

# SEASONAL
wp("First Snow", "seasonal", ["winter", "snow", "blue"], S.snowfall, sky=["#9fb7d4", "#d6e4f2", "#eef5fb"])
wp("Festival of Lights", "seasonal", ["diwali", "lights", "gold"], S.festive, bg="#1a0b02", colors=["#ffb703", "#fb8500", "#ffd166", "#ff5d8f"])
wp("Holiday Lights", "seasonal", ["christmas", "lights", "red"], S.festive, bg="#06140c", colors=["#e63946", "#ffd166", "#2a9d8f", "#f1faee"])
wp("Cherry Blossom", "seasonal", ["spring", "pink", "petals"], S.blossom, sky=["#fde2e4", "#fff1f2", "#ffe5ec"], petals=["#ffafcc", "#ffc8dd", "#ff8fab"])
wp("Monsoon", "seasonal", ["rain", "hills", "moody"], S.rain, sky=["#4b5a6a", "#8796a5", "#b6c2cf"])
wp("Harvest Moon", "seasonal", ["autumn", "moon", "orange"], S.harvest_moon, sky=["#120b1f", "#3b1f3a", "#8a3b2e"], moon="#ffe3a3", hills=["#3a1f2a", "#0d0709"])
wp("Autumn Glow", "seasonal", ["autumn", "bokeh", "warm"], S.festive, bg="#2a0f05", colors=["#d00000", "#e85d04", "#faa307", "#9d0208"])
wp("Summer Haze", "seasonal", ["summer", "warm", "gradient"], S.mesh, colors=["#ffbe0b", "#fb5607", "#ff006e", "#ffd6a5"])

# CUTE / PASTEL
wp("Sugar Sparkle", "cute", ["pastel", "sparkles", "pink"], S.cute, colors=["#ffd6ff", "#e7c6ff", "#c8b6ff", "#ffc8dd"], kind="sparkles")
wp("Cloud Nine", "cute", ["clouds", "blue", "pastel"], S.cute, colors=["#a2d2ff", "#bde0fe", "#cdb4db", "#d7ecff"], kind="clouds")
wp("Heartbeat", "cute", ["hearts", "pink", "love"], S.cute, colors=["#ffc2d1", "#ffb3c6", "#ffe5ec", "#ff8fab"], kind="hearts", accent="#ff4d6d")
wp("Bubble Pop", "cute", ["bubbles", "mint", "pastel"], S.cute, colors=["#b8f2e6", "#aed9e0", "#ffd6e0", "#c3f0ca"], kind="bubbles")
wp("Lemon Sparkle", "cute", ["yellow", "sparkles", "pastel"], S.cute, colors=["#fff3b0", "#ffe1a8", "#e2f0cb", "#fdf0d5"], kind="sparkles")
wp("Wavy Checker", "cute", ["checker", "lilac", "y2k"], S.checker, a="#e9d8ff", b="#c9a7ff")
wp("Mint Checker", "cute", ["checker", "mint", "y2k"], S.checker, a="#e0fff4", b="#9ff0d1", cols=5)

# DARK
wp("Obsidian", "dark", ["black", "grey", "subtle"], S.mesh, colors=["#050506", "#141418", "#1f1f26", "#0a0a0c"], sheen=0.05)
wp("Midnight Ink", "dark", ["navy", "liquid", "deep"], S.liquid, colors=["#01030a", "#071330", "#0f2a5c", "#2f5aa8"], gloss=0.12)
wp("Graphite Contours", "dark", ["topographic", "grey", "lines"], S.topo, bg="#0f1012", line="#4a4d55", lines=30)
wp("Plum Shadow", "dark", ["plum", "violet", "deep"], S.mesh, colors=["#07030c", "#1c0b2b", "#3d1259", "#0e0614"])
wp("Abyss", "dark", ["blue", "deep", "glow"], S.amoled, kind="orb", color="#0d47a1", color2="#1e88e5")
wp("Smoke", "dark", ["grey", "liquid", "smoke"], S.liquid, colors=["#060607", "#16171a", "#3a3c42", "#9a9da5"], strength=4.2, gloss=0.0)

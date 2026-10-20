import fs from 'fs';
import path from 'path';
import { WALLPAPER_META } from '../src/data/wallpapers.generated';
import { ICON_SLOTS } from '../src/data/icons.generated';
import { CATEGORIES, getWallpaper, search, THEMES, WALLPAPERS } from '../src/data/catalog';
import { resolveCollection } from '../src/data/collections';

const root = path.resolve(__dirname, '..');

describe('catalog integrity', () => {
  it('ships ~100 wallpapers with unique ids', () => {
    expect(WALLPAPERS.length).toBeGreaterThanOrEqual(100);
    const ids = WALLPAPERS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every wallpaper has a full-res and thumbnail file on disk (no broken images)', () => {
    for (const m of WALLPAPER_META) {
      expect(fs.existsSync(path.join(root, 'assets/wallpapers/full', `${m.id}.jpg`))).toBe(true);
      expect(fs.existsSync(path.join(root, 'assets/wallpapers/thumb', `${m.id}.jpg`))).toBe(true);
    }
  });

  it('every wallpaper is iPhone-shaped and has licence + colour metadata', () => {
    for (const w of WALLPAPERS) {
      expect(w.width).toBe(1179);
      expect(w.height).toBe(2556);
      expect(w.license).toMatch(/Original artwork/);
      expect(w.dominantColor).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('every category has wallpapers and every wallpaper has a known category', () => {
    const known = new Set(CATEGORIES.map((c) => c.id));
    for (const c of CATEGORIES) expect(WALLPAPERS.some((w) => w.category === c.id)).toBe(true);
    for (const w of WALLPAPERS) expect(known.has(w.category as any)).toBe(true);
  });

  it('every theme points at real wallpapers and has a full icon pack', () => {
    for (const t of THEMES) {
      expect(getWallpaper(t.homeWallpaper)).toBeDefined();
      expect(getWallpaper(t.lockWallpaper)).toBeDefined();
      for (const s of ICON_SLOTS) {
        expect(fs.existsSync(path.join(root, 'assets/icons', t.id, `${s.id}.png`))).toBe(true);
      }
    }
  });

  it('collections used by See All resolve', () => {
    for (const key of ['trending', 'recent', 'editors', 'darkmode', 'lock', 'pastel', ...CATEGORIES.map((c) => `cat:${c.id}`)]) {
      const c = resolveCollection(key);
      expect(c).toBeDefined();
      expect(c!.items().length).toBeGreaterThan(0);
    }
  });
});

describe('search', () => {
  it('finds wallpapers by title, tag, category and colour', () => {
    expect(search('aurora').wallpapers.map((w) => w.id)).toContain('aurora-borealis');
    expect(search('marble').wallpapers.length).toBeGreaterThanOrEqual(3);
    expect(search('retro').wallpapers.every((w) => w.category === 'retro' || w.tags.includes('retro'))).toBe(true);
    expect(search('gold').wallpapers.length).toBeGreaterThan(0);
  });
  it('finds themes by name and mood', () => {
    expect(search('tea').themes.map((t) => t.id)).toContain('tea-garden');
    expect(search('neon').themes.length).toBeGreaterThan(0);
  });
  it('returns nothing for nonsense', () => {
    const r = search('zzzqqq');
    expect(r.wallpapers).toHaveLength(0);
    expect(r.themes).toHaveLength(0);
  });
});

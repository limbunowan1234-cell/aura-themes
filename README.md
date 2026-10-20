# Aura Themes

A premium iPhone customisation app by **Darjeeling Web Studio**: 106 original wallpapers, 13 complete theme collections with matching icon packs, search, favourites, and an honest one-tap Apply built on Apple's Shortcuts app.

Built with Expo SDK 58, React Native 0.88, TypeScript and Expo Router.

## What's in the app

| Area | What works |
|---|---|
| Discover | Greeting, theme of the day, Trending / Recent / Editor's picks, 9 category rails, See all |
| Wallpapers | 14 categories, Dark / Light / Minimal / Lock-screen-ready filters, Popular / Newest / A–Z sort, incremental loading |
| Preview | Full-screen, Clean / Lock / Home overlays to check the crop, Save to Photos, Share, Favourite, related designs |
| Apply | Copies the image and runs the user's **Aura Apply** shortcut (Get Clipboard → Set Wallpaper Photo). Guided one-time setup in-app |
| Themes | 13 sets: home + lock wallpaper, palette (tap to copy hex), illustrative previews, 16-icon pack, save all icons |
| Icons | Original icons (Ionicons glyphs, MIT), no brand logos. Guide for the Shortcuts "Add to Home Screen" method |
| Widgets | Design previews only, clearly labelled. Native WidgetKit widgets are deferred |
| Favourites | Wallpapers, themes, recently viewed. Stored on device, no account |
| Profile | Name, save history, Apply status, guides, reduce motion, privacy, terms, licences, support, reset |

### Deliberately not claimed
- iOS does not let apps change the wallpaper or replace system icons. Aura saves images and hands off to Shortcuts; it never says something was applied unless the Shortcut reports back.
- No in-app purchases yet. The Pro screen says "coming soon" with no buy button.
- No anime or car artwork: those can't be generated originally at quality, so they were left out rather than sourced from unclear licences.

## Install on your iPhone for free (Sideloadly)

1. Push to `main` (or run the workflow manually: **Actions → iOS unsigned IPA → Run workflow**).
2. When it finishes, download the **AuraThemes-unsigned-ipa** artifact and unzip it to get `AuraThemes-unsigned.ipa`.
3. Open Sideloadly on your PC, plug in your iPhone, drag in the `.ipa`, enter your Apple ID, press **Start**.
4. On the iPhone: **Settings → General → VPN & Device Management →** trust your Apple ID. On iOS 16+, also turn on **Settings → Privacy & Security → Developer Mode** and restart.
5. Free Apple ID apps expire after **7 days**. Re-run Sideloadly with the same `.ipa` to refresh. Favourites survive a refresh.

## Develop

```bash
npm install
npm run typecheck
npm test                 # 30 tests: catalogue integrity, every screen renders, favourites persist, search
npx expo start --web     # quick UI preview in a browser (Save/Apply are iOS-only)
```

### Regenerate artwork (Python 3 + Pillow + NumPy)
```bash
npm run gen:wallpapers   # renders assets/wallpapers + src/data/wallpapers.generated.ts
npm run gen:icons        # renders assets/icons from src/data/themes.json
npm run gen:brand        # app icon + splash
```
Add a wallpaper by adding one line to `tools/gen/catalog.py`. Add a theme by adding an entry to `src/data/themes.json`.

### Rename the app
Change `name` in `app.json` and `appName` in `src/config/brand.ts`.

## Project layout
```
src/app/            screens (Expo Router)
src/components/     UI kit, wallpaper cards/grid, phone previews, toast
src/data/           catalogue, themes.json, collections, generated asset maps
src/lib/actions.ts  Save to Photos, Share, Apply via Shortcuts
src/store/          favourites/history/settings with AsyncStorage
src/theme/tokens.ts colours, type, spacing, radii
tools/gen/          procedural wallpaper, icon and brand generators
```

## Later (needs a paid Apple Developer account)
App Store submission, TestFlight, In-App Purchase subscriptions, and a native WidgetKit extension.

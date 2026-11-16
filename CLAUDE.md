# Aura Themes — handoff notes for Claude Code

Owner: Adhar Limbu, Darjeeling Web Studio. Keep replies concise; give complete copy-paste-ready files, not diffs. Ask before changing prices or logos.

## Constraints (decided)
- **No paid Apple Developer account.** Install route = unsigned `.ipa` from GitHub Actions → **Sideloadly** with a free Apple ID (apps expire after 7 days; re-sign to refresh).
- No App Store submission, TestFlight, In-App Purchase or WidgetKit until a paid account exists.
- iOS cannot apply wallpapers/icons from an app. "Apply" = copy image to clipboard + run the user's **"Aura Apply"** Shortcut (Get Clipboard → Set Wallpaper Photo), returning via `aura://applied`. Never claim something was applied unless the Shortcut reports back.
- All artwork must be original or properly licensed. No brand logos in icon packs.

## Stack
Expo SDK 58, React Native 0.88, TypeScript, Expo Router (`src/app`). Install packages with `EXPO_OFFLINE=1 npx expo install <pkg>` if the Expo API is unreachable. Expo APIs changed recently: read `node_modules/*/build/*.d.ts` before using one (e.g. `expo-media-library` uses `requestPermissionsAsync(true)` + `MediaLibrary.Asset.create(uri)`; `expo-file-system` uses `new File(...)`, `Paths`; navigation types come from `expo-router` / `expo-router/tabs`, not `@react-navigation/*`).

## Status
Done and verified: 106 procedural wallpapers + catalogue, 13 themes with 79-icon packs in 4 styles (Signature / Light / Dark / Tinted, 256px JPEG, 7 groups), Theme screen redesigned as an install kit with per-theme progress, Discover / Wallpapers / Themes / Favourites / Profile tabs, preview with Save / Share / Apply, search + filters, onboarding, guides, legal pages, Pro "coming soon" (no purchase). `npx tsc --noEmit` passes; `npx jest` = 31/31 passing (testTimeout 60s: screen tests load the 4,108-icon map); web export compiles.

NOT verified yet:
1. GitHub repo is live (limbunowan1234-cell/aura-themes, public). The iOS build succeeded on 2026-10-20 (pre-icon-kit); artifacts expire after 14 days.
2. Nothing tested on a real iPhone (Save to Photos permission flow, Shortcut Apply round-trip, `aura://applied` deep link, Set Wallpaper Photo wording in iOS 26).

## Next steps
1. Push the icon-kit commit and rebuild the IPA (`gh workflow run ios-unsigned-ipa.yml`; pushes to main didn't auto-trigger the first time).
2. Adhar installs via Sideloadly and reports device issues → fix.
3. Polish weak wallpapers (Ascent stairs, Stardust, Desert/Glacier Contours).
4. Later: native widgets, Pro collections, App Store prep (needs paid account).

## Commands
```
npm install
npm run typecheck
npm test
npx expo start --web
npm run gen:wallpapers | gen:icons | gen:brand   # Python 3 + Pillow + NumPy
```
Tests live in `__tests__/`; screen tests that navigate are split into separate files because expo-router's test harness leaks state between renders in one file. Wrap `fireEvent` calls in `await act(async () => ...)`.

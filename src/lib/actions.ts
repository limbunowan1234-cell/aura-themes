/**
 * Real device actions: save to Photos, share, and Apply via the user's Shortcut.
 * Nothing here pretends to change iOS settings directly — iOS does not allow that.
 */
import { Asset } from 'expo-asset';
import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { BRAND } from '../config/brand';

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: 'denied' | 'unavailable' | 'error'; message: string; canAskAgain?: boolean };

/** Resolve a bundled image to a local file named nicely for Photos/sharing. */
async function localFile(module: number, fileName: string): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  const src = asset.localUri ?? asset.uri;
  if (Platform.OS === 'web') return src;
  const dest = new File(Paths.cache, fileName);
  try {
    if (dest.exists) dest.delete();
    await new File(src).copy(dest);
    return dest.uri;
  } catch {
    return src;
  }
}

function webDownload(uri: string, fileName: string) {
  const a = (globalThis as any).document?.createElement('a');
  if (!a) return;
  a.href = uri;
  a.download = fileName;
  a.click();
}

export async function ensurePhotosPermission(): Promise<ActionResult> {
  try {
    const current = await MediaLibrary.getPermissionsAsync(true);
    if (current.granted) return { ok: true };
    if (!current.canAskAgain) {
      return {
        ok: false,
        reason: 'denied',
        canAskAgain: false,
        message: 'Photos access is turned off for Aura. Open Settings → Aura → Photos and choose "Add Photos Only".',
      };
    }
    const req = await MediaLibrary.requestPermissionsAsync(true);
    if (req.granted) return { ok: true };
    return {
      ok: false,
      reason: 'denied',
      canAskAgain: req.canAskAgain,
      message: 'Aura needs permission to add images to Photos. Nothing else in your library is read.',
    };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: e?.message ?? 'Could not check Photos permission.' };
  }
}

export async function saveImageToPhotos(module: number, fileName: string): Promise<ActionResult> {
  try {
    const uri = await localFile(module, fileName);
    if (Platform.OS === 'web') {
      webDownload(uri, fileName);
      return { ok: true };
    }
    const perm = await ensurePhotosPermission();
    if (!perm.ok) return perm;
    await MediaLibrary.Asset.create(uri);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: e?.message ?? 'Saving failed. Please try again.' };
  }
}

export async function saveManyToPhotos(items: { module: number; fileName: string }[]): Promise<ActionResult & { count?: number }> {
  if (Platform.OS !== 'web') {
    const perm = await ensurePhotosPermission();
    if (!perm.ok) return perm;
  }
  let count = 0;
  for (const it of items) {
    const r = await saveImageToPhotos(it.module, it.fileName);
    if (!r.ok) return { ...r, count };
    count++;
  }
  return { ok: true, count };
}

export async function shareImage(module: number, fileName: string): Promise<ActionResult> {
  try {
    const uri = await localFile(module, fileName);
    if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) {
      if (Platform.OS === 'web') {
        webDownload(uri, fileName);
        return { ok: true };
      }
      return { ok: false, reason: 'unavailable', message: 'Sharing is not available on this device.' };
    }
    await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', UTI: 'public.jpeg', dialogTitle: fileName });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: e?.message ?? 'Sharing failed.' };
  }
}

/** URL that runs the user's Apply shortcut and comes back to Aura afterwards. */
export function applyShortcutUrl() {
  const name = encodeURIComponent(BRAND.applyShortcutName);
  const back = encodeURIComponent(`${BRAND.urlScheme}://applied`);
  const err = encodeURIComponent(`${BRAND.urlScheme}://applied?error=1`);
  return `shortcuts://x-callback-url/run-shortcut?name=${name}&x-success=${back}&x-error=${err}&x-cancel=${err}`;
}

/**
 * Copies the wallpaper to the clipboard, then runs the "Aura Apply" shortcut,
 * whose single job is: Get Clipboard → Set Wallpaper.
 */
export async function applyViaShortcut(module: number, fileName: string): Promise<ActionResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, reason: 'unavailable', message: 'One-tap Apply works on iPhone with the Shortcuts app.' };
  }
  try {
    const uri = await localFile(module, fileName);
    const base64 = await new File(uri).base64();
    await Clipboard.setImageAsync(base64);
    const can = await Linking.canOpenURL('shortcuts://');
    if (!can) {
      return {
        ok: false,
        reason: 'unavailable',
        message: 'The Shortcuts app is missing. Reinstall it from the App Store, then try again.',
      };
    }
    await Linking.openURL(applyShortcutUrl());
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: 'error', message: e?.message ?? 'Could not start the Apply shortcut.' };
  }
}

export function openShortcutsApp() {
  return Linking.openURL('shortcuts://create-shortcut').catch(() => Linking.openURL('shortcuts://'));
}

export function openAppSettings() {
  return Linking.openSettings();
}

export function fileNameFor(title: string, suffix = 'jpg') {
  return `Aura-${title.replace(/[^a-z0-9]+/gi, '-')}.${suffix}`;
}

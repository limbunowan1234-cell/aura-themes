/**
 * Deep links coming back from the Shortcuts app (aura://applied) open a small
 * modal on top of whatever screen the user was on, instead of resetting navigation.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes('applied')) {
      return path.includes('error') ? '/applied?error=1' : '/applied';
    }
    return path;
  } catch {
    return '/';
  }
}

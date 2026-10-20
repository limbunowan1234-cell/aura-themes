import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

const APP = './src/app';

async function seed(state: object) {
  await AsyncStorage.setItem('aura.state.v1', JSON.stringify(state));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('screens render real content', () => {
  beforeEach(() => seed({ onboarded: true }));

  const cases: [string, RegExp][] = [
    ['/', /Theme of the day/],
    ['/wallpapers', /designs · sized for iPhone/],
    ['/themes', /Complete looks/],
    ['/favorites', /No favourites yet/],
    ['/profile', /everything stays on this device/],
    ['/wallpaper/violet-orb', /Violet Orb/],
    ['/theme/midnight-luxury', /Midnight Luxury/],
    ['/collection/cat:minimal', /Minimal/],
    ['/collection/saved', /Nothing saved yet/],
    ['/search', /Popular searches/],
    ['/apply-setup', /One-tap Apply/],
    ['/guide/icons', /Custom app icons/],
    ['/guide/widgets', /not installable widgets yet/],
    ['/guide/lockscreen', /Lock-screen tips/],
    ['/legal/privacy', /does not collect personal data/],
    ['/premium', /No purchase is available yet/],
    ['/applied', /Shortcut finished/],
    ['/does-not-exist', /Lost in the clouds/],
  ];

  it.each(cases)('%s', async (url, text) => {
    await renderRouter(APP, { initialUrl: url });
    expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
  });
});

describe('favourites', () => {
  it('persist to storage and show up in Favourites after a restart', async () => {
    await seed({ onboarded: true });
    await renderRouter(APP, { initialUrl: '/wallpaper/outrun' });
    const favBtn = await screen.findByLabelText('Add to favourites');
    await act(async () => {
      fireEvent.press(favBtn);
    });
    expect(await screen.findByLabelText('Remove from favourites')).toBeTruthy();
    await act(async () => {});
    const saved = JSON.parse((await AsyncStorage.getItem('aura.state.v1')) ?? '{}');
    expect(saved.favWallpapers).toContain('outrun');

    screen.unmount();
    await renderRouter(APP, { initialUrl: '/favorites' });
    expect(await screen.findByLabelText(/Outrun, retro wallpaper/)).toBeTruthy();
  });
});


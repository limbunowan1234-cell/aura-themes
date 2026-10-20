import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

const APP = './src/app';

async function seed(state: object) {
  await AsyncStorage.setItem('aura.state.v1', JSON.stringify(state));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('search screen', () => {
  it('returns catalogue results as you type', async () => {
    await seed({ onboarded: true });
    await renderRouter(APP, { initialUrl: '/search' });
    const input = await screen.findByLabelText('Search wallpapers and themes');
    await act(async () => {
      fireEvent.changeText(input, 'aurora');
    });
    expect(await screen.findByLabelText(/Aurora Borealis, nature wallpaper/)).toBeTruthy();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('Search wallpapers and themes'), 'zzzqqq');
    });
    expect(await screen.findByText(/No results/)).toBeTruthy();
  });
});

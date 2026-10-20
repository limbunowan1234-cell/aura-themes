import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

const APP = './src/app';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('first run', () => {
  it('shows onboarding, then lands on Discover', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    expect(await screen.findByText(/Make your iPhone/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Skip'));
    expect(await screen.findByText(/Theme of the day/)).toBeTruthy();
    const saved = JSON.parse((await AsyncStorage.getItem('aura.state.v1')) ?? '{}');
    expect(saved.onboarded).toBe(true);
  });
});


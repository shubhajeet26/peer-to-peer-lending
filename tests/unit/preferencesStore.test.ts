import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferencesStore } from '../../src/stores/usePreferencesStore';

describe('usePreferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.getState().resetPreferences();
  });

  it('should initialize with default preference values', () => {
    const state = usePreferencesStore.getState();
    expect(state.displayCurrency).toBe('XLM');
    expect(state.defaultAnalyticsTimeRange).toBe('30d');
    expect(state.notificationsEnabled).toBe(true);
  });

  it('should update display currency preference', () => {
    usePreferencesStore.getState().setDisplayCurrency('USDC');
    expect(usePreferencesStore.getState().displayCurrency).toBe('USDC');
  });

  it('should reset preferences to default', () => {
    usePreferencesStore.getState().setDisplayCurrency('USDC');
    usePreferencesStore.getState().setDefaultAnalyticsTimeRange('90d');

    usePreferencesStore.getState().resetPreferences();
    expect(usePreferencesStore.getState().displayCurrency).toBe('XLM');
    expect(usePreferencesStore.getState().defaultAnalyticsTimeRange).toBe('30d');
  });
});

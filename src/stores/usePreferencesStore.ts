import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeRangeOption } from '../types/analytics';

export interface UserPreferencesState {
  displayCurrency: 'XLM' | 'USDC';
  defaultAnalyticsTimeRange: TimeRangeOption;
  notificationsEnabled: boolean;
  activitySoundEnabled: boolean;
  autoRefreshEvents: boolean;
  compactView: boolean;

  // Actions
  setDisplayCurrency: (currency: 'XLM' | 'USDC') => void;
  setDefaultAnalyticsTimeRange: (range: TimeRangeOption) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setActivitySoundEnabled: (enabled: boolean) => void;
  setAutoRefreshEvents: (enabled: boolean) => void;
  setCompactView: (compact: boolean) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES = {
  displayCurrency: 'XLM' as const,
  defaultAnalyticsTimeRange: '30d' as const,
  notificationsEnabled: true,
  activitySoundEnabled: false,
  autoRefreshEvents: true,
  compactView: false,
};

export const usePreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),
      setDefaultAnalyticsTimeRange: (defaultAnalyticsTimeRange) => set({ defaultAnalyticsTimeRange }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setActivitySoundEnabled: (activitySoundEnabled) => set({ activitySoundEnabled }),
      setAutoRefreshEvents: (autoRefreshEvents) => set({ autoRefreshEvents }),
      setCompactView: (compactView) => set({ compactView }),
      resetPreferences: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: 'stellarlend-user-preferences',
    }
  )
);

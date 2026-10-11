import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      serverUrl: '',
      setServerUrl: (serverUrl) => set({ serverUrl: serverUrl.trim().replace(/\/+$/, '') }),
    }),
    {
      name: 'guitarloop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

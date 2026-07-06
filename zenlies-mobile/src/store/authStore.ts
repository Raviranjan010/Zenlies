import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'zenlies-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: (state) => {
        // Will be called when rehydration starts.
        // Returns a function called when rehydration completes.
        return (rehydratedState, error) => {
          if (error) {
            console.error('Failed to rehydrate auth store:', error);
          } else if (rehydratedState) {
            rehydratedState.setHydrated(true);
          }
        };
      },
    }
  )
);

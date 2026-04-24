import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserModel } from "types/user";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserModel | null;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserModel | null) => void;
  setSessionExpired: (isExpired: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isSessionExpired: false,
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isSessionExpired: false,
        }),
      setUser: (user) => set({ user }),
      setSessionExpired: (isExpired) => set({ isSessionExpired: isExpired }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isSessionExpired: false,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

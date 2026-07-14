import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserModel } from "types/user";

interface AuthState {
  user: UserModel | null;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  setUser: (user: UserModel | null) => void;
  setSessionExpired: (isExpired: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isSessionExpired: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isSessionExpired: false }),
      setSessionExpired: (isExpired) => set({ isSessionExpired: isExpired }),
      logout: () =>
        set({
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

import { create } from "zustand";
import type { UserDTO } from "@velocity/shared";

interface AuthState {
  user?: UserDTO;
  setSession: (user: UserDTO, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  setSession: (user, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: undefined });
  }
}));

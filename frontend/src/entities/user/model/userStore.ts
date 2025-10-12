import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '../index';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

type UserStore = UserState & UserActions;

/**
 * User 엔티티 상태 관리 스토어
 * - 현재 로그인한 사용자 정보
 * - 세션 상태 관리
 */
export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      user: null,
      loading: false,
      error: null,

      // Basic setters
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 사용자 로그아웃
      clearUser: () =>
        set({
          user: null,
          error: null,
        }),
    }),
    {
      name: 'user-store',
    }
  )
);


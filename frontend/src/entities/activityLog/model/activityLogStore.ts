import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ActivityLog } from '../index';

interface ActivityLogState {
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

interface ActivityLogActions {
  setActivityLogs: (logs: ActivityLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addActivityLog: (log: ActivityLog) => void;
}

type ActivityLogStore = ActivityLogState & ActivityLogActions;

/**
 * ActivityLog 엔티티 상태 관리 스토어
 * - 활동 로그 목록 관리
 * - 로그 추가
 */
export const useActivityLogStore = create<ActivityLogStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      activityLogs: [],
      loading: false,
      error: null,

      // Basic setters
      setActivityLogs: (activityLogs) => set({ activityLogs }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 로그 추가
      addActivityLog: (log) =>
        set((state) => ({
          activityLogs: [log, ...state.activityLogs],
        })),
    }),
    {
      name: 'activity-log-store',
    }
  )
);


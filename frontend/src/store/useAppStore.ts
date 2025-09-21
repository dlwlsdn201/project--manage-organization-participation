import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Event, User, ActivityLog, Member } from '@/entities';
import { initialDataApi, eventApi } from '@/shared/api';
import { useOrganizationStore } from '@/features/organization/lib';
import { useMemberStore } from '@/features/organization/lib/member-store';

interface AppState {
  // 상태
  user: User | null;
  events: Event[];
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;

  // 임시: 하위 호환성을 위한 members (실제로는 useMemberStore 사용 권장)
  members: Member[];

  // 액션
  setUser: (user: User | null) => void;
  setEvents: (events: Event[]) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Event 관련 액션
  createEvent: (
    event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;

  // 초기 데이터 로드
  loadInitialData: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // 초기 상태
      user: null,
      events: [],
      activityLogs: [],
      loading: false,
      error: null,
      members: [], // 임시: 하위 호환성

      // Basic setters
      setUser: (user) => set({ user }),
      setEvents: (events) => set({ events }),
      setActivityLogs: (activityLogs) => set({ activityLogs }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Event 관련 액션
      createEvent: async (eventData) => {
        try {
          const newEvent = await eventApi.create(eventData);
          set((state) => ({
            events: [...state.events, newEvent],
          }));
          return newEvent;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 생성 실패';
          set({ error: message });
          throw error;
        }
      },

      updateEvent: async (id, eventData) => {
        try {
          const updatedEvent = await eventApi.update(id, eventData);
          set((state) => ({
            events: state.events.map((event) =>
              event._id === updatedEvent._id ? updatedEvent : event
            ),
          }));
          return updatedEvent;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 수정 실패';
          set({ error: message });
          throw error;
        }
      },

      deleteEvent: async (id) => {
        try {
          await eventApi.delete(id);
          set((state) => ({
            events: state.events.filter((event) => event._id !== id),
          }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 삭제 실패';
          set({ error: message });
          throw error;
        }
      },

      // 초기 데이터 로드
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null });

          const data = await initialDataApi.loadAll();

          // 각 feature store에 데이터 설정
          useOrganizationStore.getState().setOrganizations(data.organizations);
          useMemberStore.getState().setMembers(data.members);

          set({
            events: data.events,
            activityLogs: data.activityLogs,
            members: data.members, // 임시: 하위 호환성
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '데이터 로딩에 실패했습니다';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'app-store',
    }
  )
);

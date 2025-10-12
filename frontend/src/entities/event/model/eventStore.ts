import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Event } from '../index';
import { eventApi } from '@/shared/api';

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

interface EventActions {
  setEvents: (events: Event[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createEvent: (
    event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
}

type EventStore = EventState & EventActions;

/**
 * Event 엔티티 상태 관리 스토어
 * - 모임 목록 관리
 * - 모임 CRUD 작업
 */
export const useEventStore = create<EventStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      events: [],
      loading: false,
      error: null,

      // Basic setters
      setEvents: (events) => set({ events }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Event 생성
      createEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
          const newEvent = await eventApi.create(eventData);
          set((state) => ({
            events: [...state.events, newEvent],
            loading: false,
          }));
          return newEvent;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 생성 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      // Event 수정
      updateEvent: async (id, eventData) => {
        set({ loading: true, error: null });
        try {
          const updatedEvent = await eventApi.update(id, eventData);
          set((state) => ({
            events: state.events.map((event) =>
              event._id === updatedEvent._id ? updatedEvent : event
            ),
            loading: false,
          }));
          return updatedEvent;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 수정 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      // Event 삭제
      deleteEvent: async (id) => {
        set({ loading: true, error: null });
        try {
          await eventApi.delete(id);
          set((state) => ({
            events: state.events.filter((event) => event._id !== id),
            loading: false,
          }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '이벤트 삭제 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'event-store',
    }
  )
);


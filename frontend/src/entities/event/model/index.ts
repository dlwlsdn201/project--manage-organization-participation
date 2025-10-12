// Event entity model - 상태 관리와 타입 정의
import { Event } from '../index';

// Export Event Store
export { useEventStore } from './eventStore';

/**
 * Event 관련 상태 관리
 */
export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
}

/**
 * Event 관련 액션 타입들
 */
export interface EventActions {
  setEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  createEvent: (
    event: Omit<
      Event,
      '_id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'attendees'
    >
  ) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Event Store 타입
 */
export type EventStore = EventState & EventActions;

/**
 * Event 관련 이벤트 타입들
 */
export type EventEvent =
  | { type: 'EVENT_CREATED'; payload: Event }
  | { type: 'EVENT_UPDATED'; payload: Event }
  | { type: 'EVENT_DELETED'; payload: string }
  | { type: 'EVENT_SELECTED'; payload: Event }
  | { type: 'EVENT_DESELECTED' }
  | { type: 'EVENTS_LOADED'; payload: Event[] }
  | { type: 'EVENT_ERROR'; payload: string };

/**
 * Event 필터링 옵션 타입
 */
export interface EventFilterOptions {
  organizationId?: string;
  status?: Event['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

/**
 * Event 정렬 옵션 타입
 */
export interface EventSortOptions {
  field: keyof Event;
  direction: 'asc' | 'desc';
}

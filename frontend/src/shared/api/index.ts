// Shared API layer - 공통 API 함수들
import { Organization, Member, Event, ActivityLog } from '../../entities';
import { apiClient } from '../lib/api-client';

// 초기 데이터 로드 API
export const initialDataApi = {
  async loadAll(): Promise<{
    organizations: Organization[];
    members: Member[];
    events: Event[];
    activityLogs: ActivityLog[];
  }> {
    try {
      const [organizations, members, events, activityLogs] = await Promise.all([
        apiClient.get<Organization[]>('/organizations'),
        apiClient.get<Member[]>('/members?sortBy=name&sortOrder=asc'),
        apiClient.get<Event[]>('/events'),
        apiClient.get<ActivityLog[]>('/logs'),
      ]);

      return {
        organizations: organizations || [],
        members: members || [],
        events: events || [],
        activityLogs: activityLogs || [],
      };
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      return {
        organizations: [],
        members: [],
        events: [],
        activityLogs: [],
      };
    }
  },
};

// 조직 API
export const organizationApi = {
  async getAll(): Promise<Organization[]> {
    return apiClient.get<Organization[]>('/organizations');
  },

  async getById(id: string): Promise<Organization | null> {
    return apiClient.get<Organization | null>(`/organizations/${id}`);
  },

  async create(
    organization: Omit<Organization, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Organization> {
    return apiClient.post<Organization>('/organizations', organization);
  },

  async update(
    id: string,
    organization: Partial<Organization>
  ): Promise<Organization> {
    return apiClient.put<Organization>(`/organizations/${id}`, organization);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/organizations/${id}`);
  },
};

// 이벤트 API
export const eventApi = {
  async getAll(): Promise<Event[]> {
    return apiClient.get<Event[]>('/events');
  },

  async getByOrganization(organizationId: string): Promise<Event[]> {
    return apiClient.get<Event[]>(`/events?organizationId=${organizationId}`);
  },

  async create(
    event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Event> {
    return apiClient.post<Event>('/events', event);
  },

  async update(id: string, event: Partial<Event>): Promise<Event> {
    return apiClient.put<Event>(`/events/${id}`, event);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  },
};

// 멤버 API
export const memberApi = {
  async getAll(): Promise<Member[]> {
    return apiClient.get<Member[]>('/members?sortBy=name&sortOrder=asc');
  },

  async getById(id: string): Promise<Member | null> {
    return apiClient.get<Member | null>(`/members/${id}`);
  },

  async create(
    member: Omit<Member, '_id' | 'joinedAt' | 'updatedAt'>
  ): Promise<Member> {
    return apiClient.post<Member>('/members', member);
  },

  async update(id: string, member: Partial<Member>): Promise<Member> {
    return apiClient.put<Member>(`/members/${id}`, member);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/members/${id}`);
  },
};

// 활동 로그 API
export const activityLogApi = {
  async getAll(): Promise<ActivityLog[]> {
    return apiClient.get<ActivityLog[]>('/logs');
  },

  async create(
    log: Omit<ActivityLog, 'id' | 'timestamp'>
  ): Promise<ActivityLog> {
    return apiClient.post<ActivityLog>('/logs', log);
  },
};

// 분석 API
export const analyticsApi = {
  async getAttendanceStats(organizationId: string): Promise<unknown> {
    return apiClient.get<unknown>(`/analytics/attendance/${organizationId}`);
  },

  async getEventStats(organizationId: string): Promise<unknown> {
    return apiClient.get<unknown>(`/analytics/events/${organizationId}`);
  },
};

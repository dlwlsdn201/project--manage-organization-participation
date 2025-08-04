// Shared API layer - 공통 API 함수들
import { Organization, Member, Event, ActivityLog } from '../../entities';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 초기 데이터 로드 API
export const initialDataApi = {
  async loadAll(): Promise<{
    organizations: Organization[];
    members: Member[];
    events: Event[];
    activityLogs: ActivityLog[];
  }> {
    try {
      const [orgsRes, membersRes, eventsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/members`),
        fetch(`${API_BASE_URL}/events`),
        fetch(`${API_BASE_URL}/logs`),
      ]);

      const organizations = await orgsRes.json();
      const members = await membersRes.json();
      const events = await eventsRes.json();
      const activityLogs = await logsRes.json();

      return {
        organizations: organizations.data || [],
        members: members.data || [],
        events: events.data || [],
        activityLogs: activityLogs.data || [],
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
    const response = await fetch(`${API_BASE_URL}/organizations`);
    const data = await response.json();
    return data.data || [];
  },

  async getById(id: string): Promise<Organization | null> {
    const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
    const data = await response.json();
    return data.data || null;
  },

  async create(
    organization: Omit<Organization, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(organization),
    });
    const data = await response.json();
    return data.data;
  },

  async update(
    id: string,
    organization: Partial<Organization>
  ): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(organization),
    });
    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};

// 이벤트 API
export const eventApi = {
  async getAll(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events`);
    const data = await response.json();
    return data.data || [];
  },

  async getByOrganization(organizationId: string): Promise<Event[]> {
    const response = await fetch(
      `${API_BASE_URL}/events?organizationId=${organizationId}`
    );
    const data = await response.json();
    return data.data || [];
  },

  async create(
    event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const data = await response.json();
    return data.data;
  },

  async update(id: string, event: Partial<Event>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// 멤버 API
export const memberApi = {
  async getAll(): Promise<Member[]> {
    const response = await fetch(`${API_BASE_URL}/members`);
    const data = await response.json();
    return data.data || [];
  },

  async getById(id: string): Promise<Member | null> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`);
    const data = await response.json();
    return data.data || null;
  },

  async create(
    member: Omit<Member, '_id' | 'joinedAt' | 'updatedAt'>
  ): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const data = await response.json();
    return data.data;
  },

  async update(id: string, member: Partial<Member>): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const data = await response.json();
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
  },
};

// 활동 로그 API
export const activityLogApi = {
  async getAll(): Promise<ActivityLog[]> {
    const response = await fetch(`${API_BASE_URL}/logs`);
    const data = await response.json();
    return data.data || [];
  },

  async create(
    log: Omit<ActivityLog, 'id' | 'timestamp'>
  ): Promise<ActivityLog> {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    const data = await response.json();
    return data.data;
  },
};

// 분석 API
export const analyticsApi = {
  async getAttendanceStats(organizationId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/analytics/attendance/${organizationId}`
    );
    const data = await response.json();
    return data.data || [];
  },

  async getEventStats(organizationId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/analytics/events/${organizationId}`
    );
    const data = await response.json();
    return data.data || [];
  },
};

import {
  Organization,
  Member,
  Event,
  ActivityLog,
  ApiResponse,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API 응답 타입
interface ApiResponseWrapper<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 공통 API 호출 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponseWrapper<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || data.message || 'API 호출 실패');
    }

    return data.data as T;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}

// 페이지네이션 응답을 위한 타입
interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}

// 조직 관련 API
export const organizationApi = {
  // 모든 조직 조회
  getAll: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiCall<Organization[]>(`/organizations?${searchParams.toString()}`);
  },

  // 특정 조직 조회
  getById: (id: string) => apiCall<Organization>(`/organizations/${id}`),

  // 조직 생성
  create: (organization: Partial<Organization>) =>
    apiCall<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(organization),
    }),

  // 조직 수정
  update: (id: string, organization: Partial<Organization>) =>
    apiCall<Organization>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organization),
    }),

  // 조직 삭제
  delete: (id: string) =>
    apiCall<void>(`/organizations/${id}`, {
      method: 'DELETE',
    }),

  // 구성원 수 업데이트
  updateMemberCount: (id: string, count: number) =>
    apiCall<Organization>(`/organizations/${id}/member-count`, {
      method: 'PATCH',
      body: JSON.stringify({ currentMembers: count }),
    }),
};

// 구성원 관련 API
export const memberApi = {
  // 모든 구성원 조회
  getAll: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    organizationId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiCall<Member[]>(`/members?${searchParams.toString()}`);
  },

  // 특정 구성원 조회
  getById: (id: string) => apiCall<Member>(`/members/${id}`),

  // 조직별 구성원 조회
  getByOrganization: (organizationId: string) =>
    apiCall<Member[]>(`/members/organization/${organizationId}`),

  // 구성원 생성
  create: (member: Partial<Member>) =>
    apiCall<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    }),

  // 구성원 수정
  update: (id: string, member: Partial<Member>) =>
    apiCall<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    }),

  // 구성원 삭제
  delete: (id: string) =>
    apiCall<void>(`/members/${id}`, {
      method: 'DELETE',
    }),

  // 구성원 상태 변경
  updateStatus: (id: string, status: 'active' | 'inactive') =>
    apiCall<Member>(`/members/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 이벤트 관련 API
export const eventApi = {
  // 모든 이벤트 조회 (필터링 지원)
  getAll: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    organizationId?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiCall<Event[]>(`/events?${searchParams.toString()}`);
  },

  // 특정 이벤트 조회
  getById: (id: string) => apiCall<Event>(`/events/${id}`),

  // 조직별 이벤트 조회
  getByOrganization: (
    organizationId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return apiCall<Event[]>(
      `/events/organization/${organizationId}?${searchParams.toString()}`
    );
  },

  // 이벤트 생성
  create: (event: Partial<Event>) =>
    apiCall<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  // 이벤트 수정
  update: (id: string, event: Partial<Event>) =>
    apiCall<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    }),

  // 이벤트 삭제
  delete: (id: string) =>
    apiCall<void>(`/events/${id}`, {
      method: 'DELETE',
    }),

  // 참여자 추가/제거
  updateAttendance: (id: string, memberId: string, action: 'add' | 'remove') =>
    apiCall<Event>(`/events/${id}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ memberId, action }),
    }),

  // 이벤트 상태 변경
  updateStatus: (id: string, status: Event['status']) =>
    apiCall<Event>(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 활동 로그 관련 API
export const activityLogApi = {
  getAll: () => apiCall<ActivityLog[]>('/logs'),
  getByOrganization: (organizationId: string) =>
    apiCall<ActivityLog[]>(`/logs/organization/${organizationId}`),
  create: (log: Partial<ActivityLog>) =>
    apiCall<ActivityLog>('/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }),
};

// 분석 API
export const analyticsApi = {
  // 조직별 참여 분석
  getOrganizationAnalytics: (
    organizationId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return apiCall<any>(
      `/analytics/organization/${organizationId}?${searchParams.toString()}`
    );
  },

  // 멤버별 상세 분석
  getMemberAnalytics: (
    organizationId: string,
    memberId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return apiCall<any>(
      `/analytics/member/${organizationId}/${memberId}?${searchParams.toString()}`
    );
  },

  // 전체 시스템 분석
  getSystemAnalytics: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    return apiCall<any>(`/analytics/system?${searchParams.toString()}`);
  },
};

// 초기 데이터 로딩 API
export const initialDataApi = {
  // 모든 초기 데이터를 한 번에 로드
  loadAll: async (): Promise<{
    organizations: Organization[];
    members: Member[];
    activityLogs: ActivityLog[];
    events: Event[];
  }> => {
    const [
      organizationsResponse,
      membersResponse,
      activityLogsResponse,
      eventsResponse,
    ] = await Promise.all([
      organizationApi.getAll(),
      memberApi.getAll(),
      activityLogApi.getAll(),
      eventApi.getAll(),
    ]);

    return {
      organizations: organizationsResponse || [],
      members: membersResponse || [],
      activityLogs: activityLogsResponse || [],
      events: eventsResponse || [],
    };
  },
};

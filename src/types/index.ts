// 사용자 타입
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

// 조직 타입
export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location?: string;
  type:
    | 'club'
    | 'study'
    | 'sports'
    | 'volunteer'
    | 'business'
    | 'social'
    | 'other';
  maxMembers?: number;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  isActive: boolean;
  settings: OrganizationSettings;
}

// 조직 설정 타입
export interface OrganizationSettings {
  isPublic: boolean;
  allowSelfJoin: boolean;
  requireApproval: boolean;
  maxMembers?: number;
  allowPublicJoin: boolean;
  minAttendanceRate: number;
}

// 참여자 타입
export interface Participant {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'inactive' | 'pending' | 'banned';
  joinedAt: Date;
  lastActiveAt: Date;
  permissions: string[];
  updatedAt?: Date;
}

// 이벤트 타입 (오프라인 모임)
export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[]; // 참여자 ID 목록
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 참여 기록 타입
export interface AttendanceRecord {
  id: string;
  userId: string;
  eventId: string;
  organizationId: string;
  attendedAt: Date;
  status: 'attended' | 'absent' | 'late';
}

// 참여 통계 타입
export interface AttendanceStats {
  userId: string;
  organizationId: string;
  totalEvents: number;
  attendedEvents: number;
  attendanceRate: number;
  lastAttendance?: Date;
  warningCount: number;
  isAtRisk: boolean; // 최소 참여 횟수 미달 여부
}

// 조직 규칙 타입
export interface OrganizationRules {
  organizationId: string;
  minAttendancePerMonth: number;
  warningThreshold: number; // 경고 임계값
  autoRemoveAfterWarnings: number; // 자동 제거 경고 횟수
}

// 이벤트 참여 타입
export interface EventParticipation {
  id: string;
  eventId: string;
  participantId: string;
  status: 'registered' | 'attended' | 'cancelled' | 'no_show';
  registeredAt: Date;
  notes?: string;
}

// 활동 로그 타입
export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 필터 타입
export interface OrganizationFilters {
  search?: string;
  isActive?: boolean;
  hasEvents?: boolean;
  memberCountRange?: {
    min: number;
    max: number;
  };
}

export interface ParticipantFilters {
  search?: string;
  role?: Participant['role'];
  status?: Participant['status'];
  organizationId?: string;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
  preset?: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';
}

export interface EventFilters {
  search?: string;
  organizationId?: string;
  status?: Event['status'];
  dateRange?: DateRangeFilter;
}

// 폼 데이터 타입
export interface CreateOrganizationData {
  name: string;
  description: string;
  logo?: File;
  settings: OrganizationSettings;
}

export interface UpdateOrganizationData
  extends Partial<CreateOrganizationData> {
  id: string;
}

export interface CreateEventData {
  organizationId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxParticipants?: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

import { Document } from 'mongoose';

// 기본 Document 인터페이스
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 타입
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
}

// 조직 설정 타입
export interface IOrganizationSettings {
  participationRule: string; // '제한없음' | '1' | '2' | ... | '10'
}

// 조직 타입
export interface IOrganization extends BaseDocument {
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
  currentMembers: number;
  settings: IOrganizationSettings;
  createdBy: string;
}

// 조직 구성원 타입
export interface IMember extends BaseDocument {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  district: string;
  organizationId: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
}

// 이벤트 타입
export interface IEvent extends BaseDocument {
  organizationId: string;
  title: string;
  description?: string;
  date: Date;
  location: string;
  hostId: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[];
  createdBy: string;
}

// 참여 기록 타입
export interface IAttendanceRecord extends BaseDocument {
  userId: string;
  eventId: string;
  organizationId: string;
  attendedAt: Date;
  status: 'attended' | 'absent' | 'late';
}

// 활동 로그 타입
export interface IActivityLog extends BaseDocument {
  organizationId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// API 응답 타입
export interface ApiResponse<T = any> {
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

// 페이지네이션 타입
export interface PaginationQuery {
  page?: string;
  limit?: string;
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

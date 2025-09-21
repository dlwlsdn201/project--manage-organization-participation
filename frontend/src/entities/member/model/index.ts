// Member entity model - 상태 관리와 타입 정의만 담당
import { Member, InitialMember } from '../index';

/**
 * Member 관련 상태 관리
 */
export interface MemberState {
  members: Member[];
  selectedMember: Member | null;
  loading: boolean;
  error: string | null;
}

/**
 * Member 관련 액션 타입들
 */
export interface MemberActions {
  setMembers: (members: Member[]) => void;
  setSelectedMember: (member: Member | null) => void;
  addMember: (
    member: InitialMember & { organizationId: string }
  ) => Promise<Member>;
  updateMember: (id: string, member: Partial<Member>) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Member Store 타입
 */
export type MemberStore = MemberState & MemberActions;

/**
 * Member 관련 이벤트 타입들
 */
export type MemberEvent =
  | { type: 'MEMBER_ADDED'; payload: Member }
  | { type: 'MEMBER_UPDATED'; payload: Member }
  | { type: 'MEMBER_DELETED'; payload: string }
  | { type: 'MEMBER_SELECTED'; payload: Member }
  | { type: 'MEMBER_DESELECTED' }
  | { type: 'MEMBERS_LOADED'; payload: Member[] }
  | { type: 'MEMBER_ERROR'; payload: string };

/**
 * Member 필터링 옵션 타입
 */
export interface MemberFilterOptions {
  organizationId?: string;
  status?: Member['status'];
  gender?: Member['gender'];
  district?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

/**
 * Member 정렬 옵션 타입
 */
export interface MemberSortOptions {
  field: keyof Member;
  direction: 'asc' | 'desc';
}

/**
 * Member 통계 타입
 */
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  genderStats: Array<{
    gender: Member['gender'];
    label: string;
    count: number;
  }>;
  districtStats: Array<{
    district: string;
    count: number;
  }>;
  ageStats: Array<{
    min: number;
    max: number;
    label: string;
    count: number;
  }>;
}

// Organization entity model - 상태 관리와 타입 정의만 담당
import { Organization } from '../index';

/**
 * Organization 관련 상태 관리
 */
export interface OrganizationState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

/**
 * Organization 관련 액션 타입들
 */
export interface OrganizationActions {
  setOrganizations: (organizations: Organization[]) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
  createOrganization: (
    organization: Omit<
      Organization,
      '_id' | 'createdAt' | 'updatedAt' | 'currentMembers'
    >
  ) => Promise<Organization>;
  updateOrganization: (
    id: string,
    organization: Partial<Organization>
  ) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Organization Store 타입
 */
export type OrganizationStore = OrganizationState & OrganizationActions;

/**
 * Organization 관련 이벤트 타입들
 */
export type OrganizationEvent =
  | { type: 'ORGANIZATION_CREATED'; payload: Organization }
  | { type: 'ORGANIZATION_UPDATED'; payload: Organization }
  | { type: 'ORGANIZATION_DELETED'; payload: string }
  | { type: 'ORGANIZATION_SELECTED'; payload: Organization }
  | { type: 'ORGANIZATION_DESELECTED' }
  | { type: 'ORGANIZATIONS_LOADED'; payload: Organization[] }
  | { type: 'ORGANIZATION_ERROR'; payload: string };

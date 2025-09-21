// Organization feature model - 상태 관리와 타입 정의만 담당
import { Organization } from '@/entities/organization';

/**
 * Organization feature 상태
 */
export interface OrganizationFeatureState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

/**
 * Organization feature 액션
 */
export interface OrganizationFeatureActions {
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
 * Organization feature store 타입
 */
export type OrganizationFeatureStore = OrganizationFeatureState &
  OrganizationFeatureActions;

/**
 * Organization form 상태 타입
 */
export interface OrganizationFormState {
  isVisible: boolean;
  editingOrganization: Organization | null;
  formData: Partial<Organization>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

/**
 * Organization form 액션 타입
 */
export interface OrganizationFormActions {
  showForm: (organization?: Organization) => void;
  hideForm: () => void;
  setFormData: (data: Partial<Organization>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}

/**
 * Organization form store 타입
 */
export type OrganizationFormStore = OrganizationFormState &
  OrganizationFormActions;

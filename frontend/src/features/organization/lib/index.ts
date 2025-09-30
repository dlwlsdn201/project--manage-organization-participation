// Organization feature business logic
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { organizationApi } from '@/shared/api';
import { validateOrganization } from '@/entities/organization/lib';
import { OrganizationFeatureStore } from '../model';

/**
 * Organization feature store
 */
export const useOrganizationStore = create<OrganizationFeatureStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      organizations: [],
      selectedOrganization: null,
      loading: false,
      error: null,

      // Basic setters
      setOrganizations: (organizations) => set({ organizations }),
      setSelectedOrganization: (organization) =>
        set({ selectedOrganization: organization }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 조직 생성
      createOrganization: async (organizationData) => {
        console.log('createOrganization 호출됨:', organizationData);
        const { errors, isValid } = validateOrganization(organizationData);
        if (!isValid) {
          console.error('유효성 검사 실패:', errors);
          set({ error: '유효성 검사 실패: ' + errors.join(', ') });
          throw new Error('Validation failed');
        }
        set({ loading: true, error: null });
        try {
          console.log('API 호출 시작:', {
            ...organizationData,
            currentMembers: 0,
          });
          const newOrg = await organizationApi.create({
            ...organizationData,
            currentMembers: 0,
          });
          console.log('API 응답 성공:', newOrg);
          set((state) => ({
            organizations: [...state.organizations, newOrg],
            loading: false,
          }));
          return newOrg;
        } catch (error: unknown) {
          console.error('API 호출 실패:', error);
          const message =
            error instanceof Error ? error.message : '조직 생성 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      // 조직 업데이트
      updateOrganization: async (id, organizationData) => {
        set({ loading: true, error: null });
        try {
          const updatedOrg = await organizationApi.update(id, organizationData);
          set((state) => ({
            organizations: state.organizations.map((org) =>
              org._id === updatedOrg._id ? updatedOrg : org
            ),
            selectedOrganization:
              state.selectedOrganization?._id === updatedOrg._id
                ? updatedOrg
                : state.selectedOrganization,
            loading: false,
          }));
          return updatedOrg;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '조직 수정 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      // 조직 삭제
      deleteOrganization: async (id) => {
        set({ loading: true, error: null });
        try {
          await organizationApi.delete(id);
          set((state) => ({
            organizations: state.organizations.filter((org) => org._id !== id),
            selectedOrganization:
              state.selectedOrganization?._id === id
                ? null
                : state.selectedOrganization,
            loading: false,
          }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '조직 삭제 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'organization-store',
    }
  )
);

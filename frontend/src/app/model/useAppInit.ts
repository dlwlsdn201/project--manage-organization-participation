import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { initialDataApi, memberApi } from '@/shared/api';
import { useOrganizationStore } from '@/features/organization/lib';
import { useMemberStore } from '@/features/organization/lib/member-store';
import { useEventStore } from '@/entities/event/model/eventStore';
import { useActivityLogStore } from '@/entities/activityLog/model/activityLogStore';
import { Member } from '@/entities';

interface AppInitState {
  loading: boolean;
  error: string | null;
}

interface AppInitActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadInitialData: () => Promise<void>;
  
  // Member 관련 액션 (하위 호환성 - 여러 스토어와 연동)
  addMember: (
    member: Omit<Member, '_id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Member>;
  updateMember: (member: Member) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
}

type AppInitStore = AppInitState & AppInitActions;

/**
 * 앱 전체 초기화 및 조정 로직
 * - 여러 엔티티 스토어의 초기 데이터 로드
 * - 엔티티 간 동기화
 */
export const useAppInit = create<AppInitStore>()(
  devtools(
    (set) => ({
      // 초기 상태
      loading: false,
      error: null,

      // Basic setters
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 초기 데이터 로드
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null });

          const data = await initialDataApi.loadAll();

          // 각 엔티티 스토어에 데이터 설정
          useOrganizationStore.getState().setOrganizations(data.organizations);
          useMemberStore.getState().setMembers(data.members);
          useEventStore.getState().setEvents(data.events);
          useActivityLogStore.getState().setActivityLogs(data.activityLogs);

          set({ loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '데이터 로딩에 실패했습니다';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // Member 관련 액션 (하위 호환성 - useMemberStore와 동기화)
      addMember: async (memberData) => {
        try {
          const newMember = await memberApi.create(memberData);
          // useMemberStore에 동기화
          useMemberStore.getState().setMembers([
            ...useMemberStore.getState().members,
            newMember,
          ]);
          return newMember;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '멤버 추가 실패';
          set({ error: message });
          throw error;
        }
      },

      updateMember: async (memberData) => {
        try {
          const updatedMember = await memberApi.update(
            memberData._id,
            memberData
          );
          // useMemberStore에 동기화
          const currentMembers = useMemberStore.getState().members;
          useMemberStore.getState().setMembers(
            currentMembers.map((member) =>
              member._id === updatedMember._id ? updatedMember : member
            )
          );
          return updatedMember;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '멤버 수정 실패';
          set({ error: message });
          throw error;
        }
      },

      deleteMember: async (id) => {
        try {
          await memberApi.delete(id);
          // useMemberStore에 동기화
          const currentMembers = useMemberStore.getState().members;
          useMemberStore.getState().setMembers(
            currentMembers.filter((member) => member._id !== id)
          );
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '멤버 삭제 실패';
          set({ error: message });
          throw error;
        }
      },
    }),
    {
      name: 'app-init-store',
    }
  )
);


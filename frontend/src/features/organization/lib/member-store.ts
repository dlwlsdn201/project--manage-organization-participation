// Member feature business logic
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Member, InitialMember } from '@/entities/member';
import { memberApi } from '@/shared/api';
import { validateInitialMember } from '@/entities/member/lib';

interface MemberState {
  members: Member[];
  loading: boolean;
  error: string | null;

  setMembers: (members: Member[]) => void;
  addMember: (
    member: InitialMember & { organizationId: string }
  ) => Promise<Member>;
  updateMember: (id: string, member: Partial<Member>) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<MemberState>()(
  devtools(
    (set) => ({
      members: [],
      loading: false,
      error: null,

      setMembers: (members) => set({ members }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      addMember: async (memberData) => {
        const errors = validateInitialMember(memberData);
        if (errors.length > 0) {
          set({ error: '유효성 검사 실패: ' + errors.join(', ') });
          throw new Error('Validation failed');
        }
        set({ loading: true, error: null });
        try {
          const newMember = await memberApi.create({
            ...memberData,
            status: 'active',
          });
          set((state) => ({
            members: [...state.members, newMember],
            loading: false,
          }));
          return newMember;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '구성원 추가 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      updateMember: async (id, memberData) => {
        set({ loading: true, error: null });
        try {
          const updatedMember = await memberApi.update(id, memberData);
          set((state) => ({
            members: state.members.map((m) =>
              m._id === updatedMember._id ? updatedMember : m
            ),
            loading: false,
          }));
          return updatedMember;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '구성원 수정 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },

      deleteMember: async (id) => {
        set({ loading: true, error: null });
        try {
          await memberApi.delete(id);
          set((state) => ({
            members: state.members.filter((m) => m._id !== id),
            loading: false,
          }));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '구성원 삭제 실패';
          set({ error: message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'member-store',
    }
  )
);

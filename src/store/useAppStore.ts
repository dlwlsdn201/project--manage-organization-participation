import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Organization,
  Participant,
  Event,
  User,
  Member,
  ActivityLog,
  AttendanceRecord,
  AttendanceStats,
  OrganizationRules,
} from '../types';
import {
  organizationApi,
  memberApi,
  activityLogApi,
  eventApi,
  analyticsApi,
} from '../services/api';

interface AppState {
  // 상태
  user: User | null;
  users: User[];
  organizations: Organization[];
  participants: Participant[];
  members: Member[];
  events: Event[];
  activityLogs: ActivityLog[];
  attendanceRecords: AttendanceRecord[];
  attendanceStats: AttendanceStats[];
  organizationRules: OrganizationRules[];
  selectedOrganization: Organization | null;
  loading: boolean;
  error: string | null;

  // 액션
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;

  // 조직 관련
  setOrganizations: (organizations: Organization[]) => void;
  addOrganization: (organization: Organization) => Promise<Organization>;
  updateOrganization: (organization: Organization) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  selectOrganization: (organization: Organization | null) => void;

  // 참여자 관련
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;

  // 구성원 관련
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => Promise<Member>;
  updateMember: (member: Member) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;

  // 이벤트 관련
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;

  // 활동 로그 관련
  setActivityLogs: (logs: ActivityLog[]) => void;
  addActivityLog: (log: ActivityLog) => Promise<ActivityLog>;

  // 기타
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      user: null,
      users: [],
      organizations: [],
      participants: [],
      members: [],
      events: [],
      activityLogs: [],
      attendanceRecords: [],
      attendanceStats: [],
      organizationRules: [],
      selectedOrganization: null,
      loading: false,
      error: null,

      // 사용자 액션
      setUser: (user) => set({ user }),
      setUsers: (users) => set({ users }),

      // 조직 액션
      setOrganizations: (organizations) => set({ organizations }),
      addOrganization: async (organization) => {
        try {
          const newOrg = await organizationApi.create(organization);
          set((state) => ({
            organizations: [...state.organizations, newOrg],
          }));
          return newOrg;
        } catch (error) {
          console.error('조직 생성 실패:', error);
          throw error;
        }
      },
      updateOrganization: async (organization) => {
        try {
          const updatedOrg = await organizationApi.update(
            organization._id,
            organization
          );
          set((state) => ({
            organizations: state.organizations.map((org) =>
              org._id === updatedOrg._id ? updatedOrg : org
            ),
            selectedOrganization:
              state.selectedOrganization?._id === updatedOrg._id
                ? updatedOrg
                : state.selectedOrganization,
          }));
          return updatedOrg;
        } catch (error) {
          console.error('조직 수정 실패:', error);
          throw error;
        }
      },
      deleteOrganization: async (id) => {
        try {
          await organizationApi.delete(id);
          set((state) => ({
            organizations: state.organizations.filter((org) => org._id !== id),
            selectedOrganization:
              state.selectedOrganization?._id === id
                ? null
                : state.selectedOrganization,
          }));
        } catch (error) {
          console.error('조직 삭제 실패:', error);
          throw error;
        }
      },
      selectOrganization: (organization) =>
        set({ selectedOrganization: organization }),

      // 참여자 액션
      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) =>
        set((state) => ({
          participants: [...state.participants, participant],
        })),
      updateParticipant: (participant) =>
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === participant.id ? participant : p
          ),
        })),
      deleteParticipant: (id) =>
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        })),

      // 구성원 액션
      setMembers: (members) => set({ members }),
      addMember: async (member) => {
        try {
          const newMember = await memberApi.create(member);
          set((state) => ({
            members: [...state.members, newMember],
          }));
          return newMember;
        } catch (error) {
          console.error('구성원 생성 실패:', error);
          throw error;
        }
      },
      updateMember: async (member) => {
        try {
          const updatedMember = await memberApi.update(member._id, member);
          set((state) => ({
            members: state.members.map((m) =>
              m._id === updatedMember._id ? updatedMember : m
            ),
          }));
          return updatedMember;
        } catch (error) {
          console.error('구성원 수정 실패:', error);
          throw error;
        }
      },
      deleteMember: async (id) => {
        try {
          await memberApi.delete(id);
          set((state) => ({
            members: state.members.filter((m) => m._id !== id),
          }));
        } catch (error) {
          console.error('구성원 삭제 실패:', error);
          throw error;
        }
      },

      // 이벤트 액션
      setEvents: (events) => set({ events }),
      addEvent: async (event: Partial<Event>) => {
        try {
          const newEvent = await eventApi.create(event);
          set((state) => ({
            events: [...state.events, newEvent],
          }));
          return newEvent;
        } catch (error) {
          console.error('이벤트 생성 실패:', error);
          throw error;
        }
      },
      updateEvent: async (event) => {
        try {
          const updatedEvent = await eventApi.update(event._id, event);
          set((state) => ({
            events: state.events.map((e) =>
              e._id === updatedEvent._id ? updatedEvent : e
            ),
          }));
          return updatedEvent;
        } catch (error) {
          console.error('이벤트 수정 실패:', error);
          throw error;
        }
      },
      deleteEvent: async (id) => {
        try {
          await eventApi.delete(id);
          set((state) => ({
            events: state.events.filter((e) => e._id !== id),
          }));
        } catch (error) {
          console.error('이벤트 삭제 실패:', error);
          throw error;
        }
      },

      // 활동 로그 액션
      setActivityLogs: (activityLogs) => set({ activityLogs }),
      addActivityLog: async (log) => {
        try {
          const newLog = await activityLogApi.create(log);
          set((state) => ({
            activityLogs: [newLog, ...state.activityLogs],
          }));
          return newLog;
        } catch (error) {
          console.error('활동 로그 생성 실패:', error);
          throw error;
        }
      },

      // 기타 액션
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'app-store',
    }
  )
);

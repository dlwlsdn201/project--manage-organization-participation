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
  addOrganization: (organization: Organization) => void;
  updateOrganization: (organization: Organization) => void;
  deleteOrganization: (id: string) => void;
  selectOrganization: (organization: Organization | null) => void;

  // 참여자 관련
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;

  // 구성원 관련
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;

  // 이벤트 관련
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;

  // 활동 로그 관련
  setActivityLogs: (logs: ActivityLog[]) => void;
  addActivityLog: (log: ActivityLog) => void;

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
      addOrganization: (organization) =>
        set((state) => ({
          organizations: [...state.organizations, organization],
        })),
      updateOrganization: (organization) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === organization.id ? organization : org
          ),
          selectedOrganization:
            state.selectedOrganization?.id === organization.id
              ? organization
              : state.selectedOrganization,
        })),
      deleteOrganization: (id) =>
        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
          selectedOrganization:
            state.selectedOrganization?.id === id
              ? null
              : state.selectedOrganization,
        })),
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
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),
      updateMember: (member) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === member.id ? member : m)),
        })),
      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      // 이벤트 액션
      setEvents: (events) => set({ events }),
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),
      updateEvent: (event) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === event.id ? event : e)),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      // 활동 로그 액션
      setActivityLogs: (activityLogs) => set({ activityLogs }),
      addActivityLog: (log) =>
        set((state) => ({
          activityLogs: [log, ...state.activityLogs],
        })),

      // 기타 액션
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'app-store',
    }
  )
);

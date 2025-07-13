import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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

// 애플리케이션 상태 타입
interface AppState {
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
}

// 액션 타입
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'UPDATE_ORGANIZATION'; payload: Organization }
  | { type: 'DELETE_ORGANIZATION'; payload: string }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_ACTIVITY_LOGS'; payload: ActivityLog[] }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog }
  | { type: 'SELECT_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// 초기 상태
const initialState: AppState = {
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
};

// 리듀서 함수
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'SET_ORGANIZATIONS':
      return { ...state, organizations: action.payload };

    case 'ADD_ORGANIZATION':
      return {
        ...state,
        organizations: [...state.organizations, action.payload],
      };

    case 'UPDATE_ORGANIZATION':
      return {
        ...state,
        organizations: state.organizations.map((org) =>
          org.id === action.payload.id ? action.payload : org
        ),
        selectedOrganization:
          state.selectedOrganization?.id === action.payload.id
            ? action.payload
            : state.selectedOrganization,
      };

    case 'DELETE_ORGANIZATION':
      return {
        ...state,
        organizations: state.organizations.filter(
          (org) => org.id !== action.payload
        ),
        selectedOrganization:
          state.selectedOrganization?.id === action.payload
            ? null
            : state.selectedOrganization,
      };

    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };

    case 'ADD_PARTICIPANT':
      return {
        ...state,
        participants: [...state.participants, action.payload],
      };

    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map((participant) =>
          participant.id === action.payload.id ? action.payload : participant
        ),
      };

    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(
          (participant) => participant.id !== action.payload
        ),
      };

    case 'SET_MEMBERS':
      return { ...state, members: action.payload };

    case 'ADD_MEMBER':
      return {
        ...state,
        members: [...state.members, action.payload],
      };

    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((member) =>
          member.id === action.payload.id ? action.payload : member
        ),
      };

    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter((member) => member.id !== action.payload),
      };

    case 'SET_EVENTS':
      return { ...state, events: action.payload };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };

    case 'SET_ACTIVITY_LOGS':
      return { ...state, activityLogs: action.payload };

    case 'ADD_ACTIVITY_LOG':
      return {
        ...state,
        activityLogs: [action.payload, ...state.activityLogs],
      };

    case 'SELECT_ORGANIZATION':
      return { ...state, selectedOrganization: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// Context 타입
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 편의 함수들
  setUser: (user: User | null) => void;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (organization: Organization) => void;
  deleteOrganization: (id: string) => void;
  selectOrganization: (organization: Organization | null) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  deleteParticipant: (id: string) => void;
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addActivityLog: (log: ActivityLog) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Context 생성
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 컴포넌트
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 편의 함수들
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const addOrganization = (organization: Organization) => {
    dispatch({ type: 'ADD_ORGANIZATION', payload: organization });
  };

  const updateOrganization = (organization: Organization) => {
    dispatch({ type: 'UPDATE_ORGANIZATION', payload: organization });
  };

  const deleteOrganization = (id: string) => {
    dispatch({ type: 'DELETE_ORGANIZATION', payload: id });
  };

  const selectOrganization = (organization: Organization | null) => {
    dispatch({ type: 'SELECT_ORGANIZATION', payload: organization });
  };

  const addParticipant = (participant: Participant) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: participant });
  };

  const updateParticipant = (participant: Participant) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: participant });
  };

  const deleteParticipant = (id: string) => {
    dispatch({ type: 'DELETE_PARTICIPANT', payload: id });
  };

  const addMember = (member: Member) => {
    dispatch({ type: 'ADD_MEMBER', payload: member });
  };

  const updateMember = (member: Member) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member });
  };

  const deleteMember = (id: string) => {
    dispatch({ type: 'DELETE_MEMBER', payload: id });
  };

  const addEvent = (event: Event) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  };

  const updateEvent = (event: Event) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  };

  const deleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  };

  const addActivityLog = (log: ActivityLog) => {
    dispatch({ type: 'ADD_ACTIVITY_LOG', payload: log });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setUser,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    selectOrganization,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addMember,
    updateMember,
    deleteMember,
    addEvent,
    updateEvent,
    deleteEvent,
    addActivityLog,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

import { Organization, Participant, Event, User, ActivityLog } from '../types';

// 샘플 사용자 데이터
export const mockUsers: User[] = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    role: 'member',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@example.com',
    role: 'member',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    name: '정수연',
    email: 'jung@example.com',
    role: 'member',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    name: '최동욱',
    email: 'choi@example.com',
    role: 'member',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

// 샘플 조직 데이터
export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: '프론트엔드 개발 모임',
    description:
      'React, Vue, Angular 등 프론트엔드 기술을 함께 공부하고 공유하는 모임입니다. 매주 스터디와 프로젝트를 진행하며 실력을 향상시켜 나가고 있습니다.',
    logo: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    memberCount: 15,
    isActive: true,
    settings: {
      isPublic: true,
      allowSelfJoin: true,
      requireApproval: false,
      maxMembers: 50,
    },
  },
  {
    id: '2',
    name: 'AI/ML 연구회',
    description:
      '인공지능과 머신러닝 기술을 연구하고 실습하는 모임입니다. 논문 리뷰, 프로젝트 진행, 세미나 등을 통해 최신 AI 기술을 학습합니다.',
    logo: undefined,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    memberCount: 8,
    isActive: true,
    settings: {
      isPublic: true,
      allowSelfJoin: false,
      requireApproval: true,
      maxMembers: 20,
    },
  },
  {
    id: '3',
    name: '창업 동아리',
    description:
      '혁신적인 아이디어로 창업을 준비하는 사람들의 모임입니다. 비즈니스 모델 개발, 투자 유치, 네트워킹 등을 함께 진행합니다.',
    logo: undefined,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    memberCount: 12,
    isActive: true,
    settings: {
      isPublic: false,
      allowSelfJoin: false,
      requireApproval: true,
      maxMembers: 15,
    },
  },
  {
    id: '4',
    name: '독서 클럽',
    description:
      '매월 한 권의 책을 선정하여 함께 읽고 토론하는 모임입니다. 다양한 분야의 책을 통해 지식과 견해를 넓혀갑니다.',
    logo: undefined,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    memberCount: 6,
    isActive: false,
    settings: {
      isPublic: true,
      allowSelfJoin: true,
      requireApproval: false,
      maxMembers: undefined,
    },
  },
];

// 샘플 참여자 데이터
export const mockParticipants: Participant[] = [
  {
    id: '1',
    userId: '1',
    organizationId: '1',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-01'),
    lastActiveAt: new Date('2024-12-15'),
    permissions: ['read', 'write', 'admin'],
  },
  {
    id: '2',
    userId: '2',
    organizationId: '1',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-01-05'),
    lastActiveAt: new Date('2024-12-14'),
    permissions: ['read', 'write'],
  },
  {
    id: '3',
    userId: '3',
    organizationId: '1',
    role: 'member',
    status: 'active',
    joinedAt: new Date('2024-01-10'),
    lastActiveAt: new Date('2024-12-13'),
    permissions: ['read'],
  },
  {
    id: '4',
    userId: '4',
    organizationId: '2',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActiveAt: new Date('2024-12-15'),
    permissions: ['read', 'write', 'admin'],
  },
  {
    id: '5',
    userId: '5',
    organizationId: '2',
    role: 'member',
    status: 'pending',
    joinedAt: new Date('2024-12-10'),
    lastActiveAt: new Date('2024-12-10'),
    permissions: [],
  },
  {
    id: '6',
    userId: '1',
    organizationId: '3',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-02-01'),
    lastActiveAt: new Date('2024-12-12'),
    permissions: ['read', 'write'],
  },
];

// 샘플 이벤트 데이터
export const mockEvents: Event[] = [
  {
    id: '1',
    organizationId: '1',
    title: 'React 18 새로운 기능 스터디',
    description:
      'React 18에서 새롭게 추가된 기능들을 함께 살펴보고 실습해보는 시간입니다.',
    startDate: new Date('2024-12-20T19:00:00'),
    endDate: new Date('2024-12-20T21:00:00'),
    location: '강남역 스터디룸',
    maxParticipants: 10,
    currentParticipants: 7,
    status: 'published',
    attendees: ['1', '2', '3'],
    createdBy: '1',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    organizationId: '1',
    title: '프론트엔드 프로젝트 발표회',
    description: '각자 진행한 프로젝트를 발표하고 피드백을 나누는 시간입니다.',
    startDate: new Date('2024-12-25T14:00:00'),
    endDate: new Date('2024-12-25T17:00:00'),
    location: '온라인 (Zoom)',
    maxParticipants: 20,
    currentParticipants: 12,
    status: 'published',
    attendees: ['1', '2', '3'],
    createdBy: '2',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '3',
    organizationId: '2',
    title: 'GPT-4 논문 리뷰',
    description: 'GPT-4 관련 최신 논문을 함께 읽고 토론하는 세미나입니다.',
    startDate: new Date('2024-12-22T15:00:00'),
    endDate: new Date('2024-12-22T17:00:00'),
    location: '대학교 세미나실',
    maxParticipants: 15,
    currentParticipants: 5,
    status: 'published',
    attendees: ['4', '5'],
    createdBy: '4',
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-03'),
  },
];

// 샘플 활동 로그 데이터
export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    organizationId: '1',
    userId: '1',
    action: 'organization_created',
    details: '프론트엔드 개발 모임을 생성했습니다.',
    timestamp: new Date('2024-01-01T10:00:00'),
    metadata: { organizationName: '프론트엔드 개발 모임' },
  },
  {
    id: '2',
    organizationId: '1',
    userId: '2',
    action: 'member_joined',
    details: '이영희님이 조직에 가입했습니다.',
    timestamp: new Date('2024-01-05T14:30:00'),
    metadata: { memberName: '이영희' },
  },
  {
    id: '3',
    organizationId: '1',
    userId: '1',
    action: 'event_created',
    details: 'React 18 새로운 기능 스터디 이벤트를 생성했습니다.',
    timestamp: new Date('2024-12-01T09:00:00'),
    metadata: { eventTitle: 'React 18 새로운 기능 스터디' },
  },
  {
    id: '4',
    organizationId: '2',
    userId: '4',
    action: 'organization_created',
    details: 'AI/ML 연구회를 생성했습니다.',
    timestamp: new Date('2024-01-15T11:00:00'),
    metadata: { organizationName: 'AI/ML 연구회' },
  },
  {
    id: '5',
    organizationId: '1',
    userId: '3',
    action: 'member_joined',
    details: '박민수님이 조직에 가입했습니다.',
    timestamp: new Date('2024-01-10T16:45:00'),
    metadata: { memberName: '박민수' },
  },
];

// ID 생성 유틸리티
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// 현재 사용자 (임시)
export const currentUser: User = mockUsers[0];

// 초기 데이터 로드 함수
export function loadInitialData() {
  return {
    organizations: mockOrganizations,
    participants: mockParticipants,
    events: mockEvents,
    activityLogs: mockActivityLogs,
    users: mockUsers,
    user: currentUser,
  };
}

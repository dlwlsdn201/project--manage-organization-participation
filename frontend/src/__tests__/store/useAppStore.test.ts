import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setUser(null);
      result.current.setOrganizations([]);
      result.current.setMembers([]);
      result.current.setEvents([]);
      result.current.setActivityLogs([]);
      result.current.setLoading(false);
      result.current.selectOrganization(null);
    });
  });

  test('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.user).toBeNull();
    expect(result.current.organizations).toEqual([]);
    expect(result.current.members).toEqual([]);
    expect(result.current.events).toEqual([]);
    expect(result.current.activityLogs).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.selectedOrganization).toBeNull();
  });

  test('사용자 정보를 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockUser = {
      id: 'user1',
      name: '테스트 사용자',
      email: 'test@example.com',
      role: 'admin' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  test('조직 목록을 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockOrganizations = [
      {
        _id: 'org1',
        name: '테스트 조직 1',
        description: '첫 번째 테스트 조직',
        type: 'club' as const,
        currentMembers: 10,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'org2',
        name: '테스트 조직 2',
        description: '두 번째 테스트 조직',
        type: 'study' as const,
        currentMembers: 5,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    act(() => {
      result.current.setOrganizations(mockOrganizations);
    });

    expect(result.current.organizations).toEqual(mockOrganizations);
  });

  test('멤버 목록을 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockMembers = [
      {
        _id: 'member1',
        name: '테스트 멤버 1',
        gender: 'male' as const,
        birthYear: 1990,
        district: '강남구',
        organizationId: 'org1',
        status: 'active' as const,
        joinedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    act(() => {
      result.current.setMembers(mockMembers);
    });

    expect(result.current.members).toEqual(mockMembers);
  });

  test('이벤트 목록을 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockEvents = [
      {
        _id: 'event1',
        title: '테스트 모임 1',
        description: '첫 번째 테스트 모임',
        date: new Date('2024-01-15'),
        location: '서울시 강남구',
        organizationId: 'org1',
        hostId: 'member1',
        currentParticipants: 5,
        status: 'published' as const,
        attendees: [],
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    act(() => {
      result.current.setEvents(mockEvents);
    });

    expect(result.current.events).toEqual(mockEvents);
  });

  test('활동 로그를 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockActivityLogs = [
      {
        id: 'log1',
        userId: 'user1',
        organizationId: 'org1',
        action: '참가',
        details: '모임에 참가했습니다',
        timestamp: new Date(),
      },
    ];

    act(() => {
      result.current.setActivityLogs(mockActivityLogs);
    });

    expect(result.current.activityLogs).toEqual(mockActivityLogs);
  });

  test('로딩 상태를 설정할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });

  test('조직을 선택할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockOrganization = {
      _id: 'org1',
      name: '테스트 조직',
      description: '테스트 조직입니다',
      type: 'club' as const,
      currentMembers: 10,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.selectOrganization(mockOrganization);
    });

    expect(result.current.selectedOrganization).toEqual(mockOrganization);
  });

  test('조직 선택을 해제할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockOrganization = {
      _id: 'org1',
      name: '테스트 조직',
      description: '테스트 조직입니다',
      type: 'club' as const,
      currentMembers: 10,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 먼저 조직을 선택
    act(() => {
      result.current.selectOrganization(mockOrganization);
    });

    expect(result.current.selectedOrganization).toEqual(mockOrganization);

    // 조직 선택 해제
    act(() => {
      result.current.selectOrganization(null);
    });

    expect(result.current.selectedOrganization).toBeNull();
  });

  test('조직별 이벤트를 필터링할 수 있어야 한다', () => {
    const { result } = renderHook(() => useAppStore());
    const mockEvents = [
      {
        _id: 'event1',
        title: '조직1 모임',
        organizationId: 'org1',
        date: new Date(),
        location: '서울',
        hostId: 'member1',
        currentParticipants: 5,
        status: 'published' as const,
        attendees: [],
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'event2',
        title: '조직2 모임',
        organizationId: 'org2',
        date: new Date(),
        location: '부산',
        hostId: 'member2',
        currentParticipants: 3,
        status: 'published' as const,
        attendees: [],
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    act(() => {
      result.current.setEvents(mockEvents);
    });

    // 조직1의 이벤트만 필터링
    const org1Events = result.current.events.filter(
      (event) => event.organizationId === 'org1'
    );

    expect(org1Events).toHaveLength(1);
    expect(org1Events[0].title).toBe('조직1 모임');
  });
});

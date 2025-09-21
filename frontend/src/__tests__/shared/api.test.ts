import {
  organizationApi,
  eventApi,
  memberApi,
  activityLogApi,
  analyticsApi,
} from '../../shared/api';
import { Organization, Event, Member, ActivityLog } from '../../entities';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API 함수들', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('organizationApi', () => {
    const mockOrganization: Organization = {
      _id: 'org1',
      name: '테스트 조직',
      description: '테스트 조직입니다',
      type: 'club',
      currentMembers: 10,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('getAll()이 조직 목록을 반환해야 한다', async () => {
      const mockResponse = { data: [mockOrganization] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await organizationApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/organizations'
      );
      expect(result).toEqual([mockOrganization]);
    });

    test('getById()이 특정 조직을 반환해야 한다', async () => {
      const mockResponse = { data: mockOrganization };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await organizationApi.getById('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/organizations/org1'
      );
      expect(result).toEqual(mockOrganization);
    });

    test('create()이 새 조직을 생성해야 한다', async () => {
      const newOrganization = {
        name: '새 조직',
        description: '새로 생성된 조직',
        type: 'club' as const,
        currentMembers: 0,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
      };

      const mockResponse = { data: { ...newOrganization, _id: 'new-org' } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await organizationApi.create(newOrganization);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/organizations',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrganization),
        }
      );
      expect(result._id).toBe('new-org');
    });

    test('update()이 조직을 업데이트해야 한다', async () => {
      const updateData = { name: '업데이트된 조직명' };
      const mockResponse = { data: { ...mockOrganization, ...updateData } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await organizationApi.update('org1', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/organizations/org1',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );
      expect(result.name).toBe('업데이트된 조직명');
    });

    test('delete()이 조직을 삭제해야 한다', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      } as Response);

      await organizationApi.delete('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/organizations/org1',
        {
          method: 'DELETE',
        }
      );
    });
  });

  describe('eventApi', () => {
    const mockEvent: Event = {
      _id: 'event1',
      title: '테스트 모임',
      description: '테스트 모임입니다',
      date: new Date('2024-01-15'),
      location: '서울시 강남구',
      organizationId: 'org1',
      hostId: 'member1',
      currentParticipants: 5,
      status: 'published',
      attendees: [],
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('getAll()이 이벤트 목록을 반환해야 한다', async () => {
      const mockResponse = { data: [mockEvent] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await eventApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events'
      );
      expect(result).toEqual([mockEvent]);
    });

    test('getByOrganization()이 조직별 이벤트를 반환해야 한다', async () => {
      const mockResponse = { data: [mockEvent] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await eventApi.getByOrganization('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events?organizationId=org1'
      );
      expect(result).toEqual([mockEvent]);
    });

    test('create()이 새 이벤트를 생성해야 한다', async () => {
      const newEvent = {
        title: '새 모임',
        description: '새로 생성된 모임',
        date: new Date('2024-01-20'),
        location: '서울시 서초구',
        organizationId: 'org1',
        hostId: 'member1',
        currentParticipants: 0,
        status: 'published' as const,
        attendees: [],
        createdBy: 'user1',
      };

      const mockResponse = { data: { ...newEvent, _id: 'new-event' } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await eventApi.create(newEvent);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/events',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
        }
      );
      expect(result._id).toBe('new-event');
    });
  });

  describe('memberApi', () => {
    const mockMember: Member = {
      _id: 'member1',
      name: '테스트 멤버',
      gender: 'male',
      birthYear: 1990,
      district: '강남구',
      organizationId: 'org1',
      status: 'active',
      joinedAt: new Date(),
      updatedAt: new Date(),
    };

    test('getAll()이 멤버 목록을 반환해야 한다', async () => {
      const mockResponse = { data: [mockMember] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await memberApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/members'
      );
      expect(result).toEqual([mockMember]);
    });

    test('create()이 새 멤버를 생성해야 한다', async () => {
      const newMember = {
        name: '새 멤버',
        gender: 'female' as const,
        birthYear: 1995,
        district: '서초구',
        organizationId: 'org1',
        status: 'active' as const,
      };

      const mockResponse = { data: { ...newMember, _id: 'new-member' } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await memberApi.create(newMember);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/members',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember),
        }
      );
      expect(result._id).toBe('new-member');
    });
  });

  describe('activityLogApi', () => {
    const mockActivityLog: ActivityLog = {
      id: 'log1',
      userId: 'user1',
      organizationId: 'org1',
      action: '참가',
      details: '모임에 참가했습니다',
      timestamp: new Date(),
    };

    test('getAll()이 활동 로그 목록을 반환해야 한다', async () => {
      const mockResponse = { data: [mockActivityLog] };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await activityLogApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/logs');
      expect(result).toEqual([mockActivityLog]);
    });

    test('create()이 새 활동 로그를 생성해야 한다', async () => {
      const newLog = {
        userId: 'user1',
        organizationId: 'org1',
        action: '생성',
        details: '새 조직을 생성했습니다',
      };

      const mockResponse = { data: { ...newLog, id: 'new-log' } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await activityLogApi.create(newLog);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      expect(result.id).toBe('new-log');
    });
  });

  describe('analyticsApi', () => {
    test('getAttendanceStats()이 출석 통계를 반환해야 한다', async () => {
      const mockStats = { totalEvents: 10, totalAttendance: 50 };
      const mockResponse = { data: mockStats };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await analyticsApi.getAttendanceStats('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/analytics/attendance/org1'
      );
      expect(result).toEqual(mockStats);
    });

    test('getEventStats()이 이벤트 통계를 반환해야 한다', async () => {
      const mockStats = { totalEvents: 5, averageParticipants: 8 };
      const mockResponse = { data: mockStats };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response);

      const result = await analyticsApi.getEventStats('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/analytics/events/org1'
      );
      expect(result).toEqual(mockStats);
    });
  });
});

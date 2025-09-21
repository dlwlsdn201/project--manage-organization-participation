import { Organization, Event, Member, ActivityLog, User } from '../../entities';

describe('엔티티 타입 검증', () => {
  describe('Organization 엔티티', () => {
    test('올바른 Organization 객체가 생성되어야 한다', () => {
      const organization: Organization = {
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

      expect(organization._id).toBe('org1');
      expect(organization.name).toBe('테스트 조직');
      expect(organization.type).toBe('club');
      expect(organization.currentMembers).toBe(10);
      expect(organization.settings.participationRule).toBe('제한없음');
      expect(organization.createdAt).toBeInstanceOf(Date);
      expect(organization.updatedAt).toBeInstanceOf(Date);
    });

    test('Organization 타입이 올바른 값들만 허용해야 한다', () => {
      const validTypes: Organization['type'][] = [
        'club',
        'study',
        'culture',
        'sports',
        'volunteer',
        'business',
        'social',
        'other',
      ];

      validTypes.forEach((type) => {
        const organization: Organization = {
          _id: 'org1',
          name: '테스트 조직',
          description: '테스트 조직입니다',
          type,
          currentMembers: 0,
          settings: { participationRule: '제한없음' },
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(organization.type).toBe(type);
      });
    });
  });

  describe('Event 엔티티', () => {
    test('올바른 Event 객체가 생성되어야 한다', () => {
      const event: Event = {
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

      expect(event._id).toBe('event1');
      expect(event.title).toBe('테스트 모임');
      expect(event.date).toBeInstanceOf(Date);
      expect(event.status).toBe('published');
      expect(event.attendees).toEqual([]);
      expect(event.currentParticipants).toBe(5);
    });

    test('Event status가 올바른 값들만 허용해야 한다', () => {
      const validStatuses: Event['status'][] = [
        'draft',
        'published',
        'cancelled',
        'completed',
      ];

      validStatuses.forEach((status) => {
        const event: Event = {
          _id: 'event1',
          title: '테스트 모임',
          description: '테스트 모임입니다',
          date: new Date(),
          location: '서울시 강남구',
          organizationId: 'org1',
          hostId: 'member1',
          currentParticipants: 0,
          status,
          attendees: [],
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(event.status).toBe(status);
      });
    });
  });

  describe('Member 엔티티', () => {
    test('올바른 Member 객체가 생성되어야 한다', () => {
      const member: Member = {
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

      expect(member._id).toBe('member1');
      expect(member.name).toBe('테스트 멤버');
      expect(member.gender).toBe('male');
      expect(member.birthYear).toBe(1990);
      expect(member.district).toBe('강남구');
      expect(member.status).toBe('active');
      expect(member.joinedAt).toBeInstanceOf(Date);
    });

    test('Member gender가 올바른 값들만 허용해야 한다', () => {
      const validGenders: Member['gender'][] = ['male', 'female', 'other'];

      validGenders.forEach((gender) => {
        const member: Member = {
          _id: 'member1',
          name: '테스트 멤버',
          gender,
          birthYear: 1990,
          district: '강남구',
          organizationId: 'org1',
          status: 'active',
          joinedAt: new Date(),
          updatedAt: new Date(),
        };

        expect(member.gender).toBe(gender);
      });
    });

    test('Member status가 올바른 값들만 허용해야 한다', () => {
      const validStatuses: Member['status'][] = [
        'active',
        'inactive',
        'pending',
      ];

      validStatuses.forEach((status) => {
        const member: Member = {
          _id: 'member1',
          name: '테스트 멤버',
          gender: 'male',
          birthYear: 1990,
          district: '강남구',
          organizationId: 'org1',
          status,
          joinedAt: new Date(),
          updatedAt: new Date(),
        };

        expect(member.status).toBe(status);
      });
    });
  });

  describe('ActivityLog 엔티티', () => {
    test('올바른 ActivityLog 객체가 생성되어야 한다', () => {
      const activityLog: ActivityLog = {
        id: 'log1',
        userId: 'user1',
        organizationId: 'org1',
        action: '참가',
        details: '모임에 참가했습니다',
        timestamp: new Date(),
      };

      expect(activityLog.id).toBe('log1');
      expect(activityLog.userId).toBe('user1');
      expect(activityLog.organizationId).toBe('org1');
      expect(activityLog.action).toBe('참가');
      expect(activityLog.details).toBe('모임에 참가했습니다');
      expect(activityLog.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('User 엔티티', () => {
    test('올바른 User 객체가 생성되어야 한다', () => {
      const user: User = {
        id: 'user1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('user1');
      expect(user.name).toBe('테스트 사용자');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('admin');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('User role이 올바른 값들만 허용해야 한다', () => {
      const validRoles: User['role'][] = ['admin', 'user', 'moderator'];

      validRoles.forEach((role) => {
        const user: User = {
          id: 'user1',
          name: '테스트 사용자',
          email: 'test@example.com',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(user.role).toBe(role);
      });
    });
  });
});

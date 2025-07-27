import { connectDatabase } from '../config/database.js';
import { Organization, Member, Event, ActivityLog } from '../models/index.js';

const seedData = async () => {
  try {
    console.log('🌱 시드 데이터 생성 시작...');

    // 기존 데이터 삭제
    await Promise.all([
      Organization.deleteMany({}),
      Member.deleteMany({}),
      Event.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log('🗑️  기존 데이터 삭제 완료');

    // 조직 데이터 생성
    const organizations = await Organization.insertMany([
      {
        name: '독서모임 북클럽',
        description: '매주 모여서 책을 읽고 토론하는 독서모임입니다.',
        location: '서울 강남구',
        type: 'study',
        maxMembers: 20,
        currentMembers: 0,
        settings: {
          participationRule: '2', // 월 2회 이상
        },
        createdBy: 'user_1',
      },
      {
        name: '등산동호회',
        description: '주말마다 산을 오르며 건강을 챙기는 등산동호회입니다.',
        location: '서울 전역',
        type: 'sports',
        maxMembers: 30,
        currentMembers: 0,
        settings: {
          participationRule: '1', // 월 1회 이상
        },
        createdBy: 'user_1',
      },
      {
        name: '프로그래밍 스터디',
        description: 'JavaScript와 React를 함께 공부하는 스터디 그룹입니다.',
        location: '온라인',
        type: 'study',
        maxMembers: 15,
        currentMembers: 0,
        settings: {
          participationRule: '3', // 월 3회 이상
        },
        createdBy: 'user_2',
      },
      {
        name: '요리모임',
        description: '다양한 요리를 함께 만들어 먹는 요리모임입니다.',
        location: '서울 마포구',
        type: 'social',
        maxMembers: 10,
        currentMembers: 0,
        settings: {
          participationRule: '제한없음',
        },
        createdBy: 'user_3',
      },
    ]);

    console.log(`✅ 조직 ${organizations.length}개 생성 완료`);

    // 구성원 데이터 생성
    const members = [];
    const memberNames = [
      '김민수',
      '이영희',
      '박준호',
      '최서연',
      '정동욱',
      '강미영',
      '윤성진',
      '임수정',
      '조현우',
      '송지은',
      '배정민',
      '한다은',
      '오태진',
      '전혜진',
      '신민호',
    ];
    const districts = [
      '강남구',
      '서초구',
      '송파구',
      '강동구',
      '마포구',
      '용산구',
      '종로구',
      '중구',
      '성동구',
      '광진구',
    ];

    let memberIndex = 0;
    for (const org of organizations) {
      const memberCount = Math.floor(Math.random() * 8) + 3; // 3-10명

      for (let i = 0; i < memberCount; i++) {
        members.push({
          name: memberNames[memberIndex % memberNames.length],
          gender: Math.random() > 0.5 ? 'male' : 'female',
          birthYear: 1985 + Math.floor(Math.random() * 20), // 1985-2004
          district: districts[Math.floor(Math.random() * districts.length)],
          organizationId: (org as any)._id.toString(),
          status: 'active',
          joinedAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ), // 지난 1년 내
        });
        memberIndex++;
      }
    }

    const insertedMembers = await Member.insertMany(members);
    console.log(`✅ 구성원 ${insertedMembers.length}명 생성 완료`);

    // 조직별 구성원 수 업데이트
    for (const org of organizations) {
      const memberCount = insertedMembers.filter(
        (member) => member.organizationId === (org as any)._id.toString()
      ).length;

      await Organization.findByIdAndUpdate((org as any)._id, {
        currentMembers: memberCount,
      });
    }

    // 이벤트 데이터 생성
    const events = [];
    const eventTitles = [
      '정기 모임',
      '워크샵',
      '세미나',
      '네트워킹',
      '프로젝트 발표',
      '토론회',
      '실습 세션',
      '특강',
      '팀 빌딩',
      '야외 활동',
    ];
    const locations = [
      '강남역 스타벅스',
      '홍대 카페',
      '코워킹 스페이스',
      '온라인 (Zoom)',
      '북한강 둘레길',
      '도심 공원',
      '회의실',
      '문화센터',
      '도서관',
      '캠퍼스',
    ];

    for (const org of organizations) {
      const orgMembers = insertedMembers.filter(
        (member) => member.organizationId === (org as any)._id.toString()
      );

      const eventCount = Math.floor(Math.random() * 15) + 5; // 5-19개 이벤트

      for (let i = 0; i < eventCount; i++) {
        const eventDate = new Date(
          Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
        ); // 지난 6개월
        const attendeeCount =
          Math.floor(Math.random() * orgMembers.length * 0.8) + 1;
        const shuffledMembers = [...orgMembers].sort(() => 0.5 - Math.random());
        const attendees = shuffledMembers
          .slice(0, attendeeCount)
          .map((m) => (m as any)._id.toString());

        events.push({
          organizationId: (org as any)._id.toString(),
          title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
          description: '정기적으로 진행되는 모임입니다.',
          date: eventDate,
          location: locations[Math.floor(Math.random() * locations.length)],
          hostId: (orgMembers[0] as any)._id.toString(), // 첫 번째 멤버가 주최자
          maxParticipants: orgMembers.length,
          currentParticipants: attendees.length,
          status: 'completed',
          attendees,
          createdBy: 'user_seed',
        });
      }
    }

    const insertedEvents = await Event.insertMany(events);
    console.log(`✅ 이벤트 ${insertedEvents.length}개 생성 완료`);

    // 활동 로그 생성
    const logs = [];
    for (const org of organizations) {
      logs.push({
        organizationId: (org as any)._id.toString(),
        userId: 'user_seed',
        action: 'organization_created',
        details: `조직 "${org.name}"이 생성되었습니다.`,
        timestamp: (org as any).createdAt,
      });
    }

    for (const member of insertedMembers) {
      logs.push({
        organizationId: member.organizationId,
        userId: 'user_seed',
        action: 'member_added',
        details: `구성원 "${member.name}"이 추가되었습니다.`,
        timestamp: member.joinedAt,
      });
    }

    await ActivityLog.insertMany(logs);
    console.log(`✅ 활동 로그 ${logs.length}개 생성 완료`);

    console.log('🎉 시드 데이터 생성 완료!');
    console.log('\n📊 생성된 데이터:');
    console.log(`- 조직: ${organizations.length}개`);
    console.log(`- 구성원: ${insertedMembers.length}명`);
    console.log(`- 이벤트: ${insertedEvents.length}개`);
    console.log(`- 활동 로그: ${logs.length}개`);
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error);
  }
};

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDatabase()
    .then(seedData)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ 오류:', error);
      process.exit(1);
    });
}

import { Request, Response } from 'express';
import { Event, Member, Organization } from '../models/index.js';
import { ApiResponse } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import dayjs from 'dayjs';

// 조직별 참여 분석 데이터 조회
export const getOrganizationAnalytics = asyncHandler(
  async (
    req: Request<
      { organizationId: string },
      ApiResponse,
      {},
      { startDate?: string; endDate?: string }
    >,
    res: Response<ApiResponse>
  ) => {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    // 날짜 필터 구성
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 조직 정보 조회
    const organization = await Organization.findById(organizationId).lean();
    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    // 이벤트 데이터 조회
    const events = await Event.find({
      organizationId,
      ...dateFilter,
    }).lean();

    // 구성원 데이터 조회
    const members = await Member.find({
      organizationId,
      status: 'active',
    }).lean();

    // 참여 통계 계산
    const memberStats = members.map((member) => {
      const attendedEvents = events.filter((event) =>
        event.attendees.includes(member._id.toString())
      );
      const totalEvents = events.length;
      const attendanceRate =
        totalEvents > 0 ? (attendedEvents.length / totalEvents) * 100 : 0;

      // 조직 설정에서 최소 참여 규칙 가져오기
      const participationRule =
        organization.settings?.participationRule || '제한없음';
      const minAttendancePerMonth =
        participationRule === '제한없음' ? 0 : parseInt(participationRule, 10);

      // 기간 계산
      const monthsInRange =
        startDate && endDate
          ? Math.max(1, dayjs(endDate).diff(dayjs(startDate), 'month') + 1)
          : 1;

      const requiredAttendance = minAttendancePerMonth * monthsInRange;
      const isAtRisk =
        minAttendancePerMonth > 0 && attendedEvents.length < requiredAttendance;

      return {
        member: {
          _id: member._id,
          name: member.name,
          gender: member.gender,
          birthYear: member.birthYear,
          district: member.district,
          joinedAt: member.joinedAt,
        },
        attendedEvents: attendedEvents.length,
        totalEvents,
        attendanceRate,
        requiredAttendance,
        isAtRisk,
        deficit: Math.max(0, requiredAttendance - attendedEvents.length),
      };
    });

    // 전체 통계
    const overallStats = {
      totalMembers: members.length,
      totalEvents: events.length,
      averageAttendanceRate:
        memberStats.length > 0
          ? memberStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) /
            memberStats.length
          : 0,
      riskMemberCount: memberStats.filter((stat) => stat.isAtRisk).length,
      activeMembers: memberStats.filter((stat) => stat.attendedEvents > 0)
        .length,
      participationRule: organization.settings?.participationRule || '제한없음',
    };

    // 월별 참여 통계
    const monthlyStats = events.reduce(
      (acc, event) => {
        const month = dayjs(event.date).format('YYYY-MM');
        if (!acc[month]) {
          acc[month] = {
            month,
            totalEvents: 0,
            totalAttendees: 0,
            averageAttendance: 0,
          };
        }
        acc[month].totalEvents += 1;
        acc[month].totalAttendees += event.attendees.length;
        acc[month].averageAttendance =
          acc[month].totalAttendees / acc[month].totalEvents;
        return acc;
      },
      {} as Record<string, any>
    );

    // 이벤트별 참여 통계
    const eventStats = events.map((event) => ({
      _id: event._id,
      title: event.title,
      date: event.date,
      location: event.location,
      totalAttendees: event.attendees.length,
      maxParticipants: event.maxParticipants,
      attendanceRate: event.maxParticipants
        ? (event.attendees.length / event.maxParticipants) * 100
        : 0,
      status: event.status,
    }));

    res.json({
      success: true,
      data: {
        organization: {
          _id: organization._id,
          name: organization.name,
          type: organization.type,
          settings: organization.settings,
        },
        overallStats,
        memberStats,
        monthlyStats: Object.values(monthlyStats),
        eventStats,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  }
);

// 멤버별 상세 참여 분석
export const getMemberAnalytics = asyncHandler(
  async (
    req: Request<
      { organizationId: string; memberId: string },
      ApiResponse,
      {},
      { startDate?: string; endDate?: string }
    >,
    res: Response<ApiResponse>
  ) => {
    const { organizationId, memberId } = req.params;
    const { startDate, endDate } = req.query;

    // 날짜 필터 구성
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 멤버 정보 조회
    const member = await Member.findOne({
      _id: memberId,
      organizationId,
      status: 'active',
    }).lean();

    if (!member) {
      throw new AppError('구성원을 찾을 수 없습니다.', 404);
    }

    // 이벤트 데이터 조회
    const events = await Event.find({
      organizationId,
      ...dateFilter,
    }).lean();

    // 참여한 이벤트와 참여하지 않은 이벤트 분리
    const attendedEvents = events.filter((event) =>
      event.attendees.includes(member._id.toString())
    );
    const missedEvents = events.filter(
      (event) => !event.attendees.includes(member._id.toString())
    );

    // 참여 패턴 분석
    const attendancePattern = attendedEvents.reduce(
      (acc, event) => {
        const month = dayjs(event.date).format('YYYY-MM');
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 연속 참여/불참 분석
    const sortedEvents = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let currentStreak = 0;
    let maxStreak = 0;
    let currentMissStreak = 0;
    let maxMissStreak = 0;

    sortedEvents.forEach((event) => {
      const attended = event.attendees.includes(member._id.toString());
      if (attended) {
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
        currentMissStreak = 0;
      } else {
        currentMissStreak += 1;
        maxMissStreak = Math.max(maxMissStreak, currentMissStreak);
        currentStreak = 0;
      }
    });

    const totalEvents = events.length;
    const attendanceRate =
      totalEvents > 0 ? (attendedEvents.length / totalEvents) * 100 : 0;

    res.json({
      success: true,
      data: {
        member: {
          _id: member._id,
          name: member.name,
          gender: member.gender,
          birthYear: member.birthYear,
          district: member.district,
          joinedAt: member.joinedAt,
        },
        stats: {
          totalEvents,
          attendedEvents: attendedEvents.length,
          missedEvents: missedEvents.length,
          attendanceRate,
          currentStreak,
          maxStreak,
          currentMissStreak,
          maxMissStreak,
        },
        attendancePattern: Object.entries(attendancePattern).map(
          ([month, count]) => ({
            month,
            count,
          })
        ),
        recentEvents: {
          attended: attendedEvents.slice(-5).map((event) => ({
            _id: event._id,
            title: event.title,
            date: event.date,
            location: event.location,
          })),
          missed: missedEvents.slice(-5).map((event) => ({
            _id: event._id,
            title: event.title,
            date: event.date,
            location: event.location,
          })),
        },
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  }
);

// 전체 시스템 분석 (모든 조직)
export const getSystemAnalytics = asyncHandler(
  async (
    req: Request<{}, ApiResponse, {}, { startDate?: string; endDate?: string }>,
    res: Response<ApiResponse>
  ) => {
    const { startDate, endDate } = req.query;

    // 날짜 필터 구성
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 전체 데이터 조회
    const [organizations, members, events] = await Promise.all([
      Organization.find({}).lean(),
      Member.find({ status: 'active' }).lean(),
      Event.find(dateFilter).lean(),
    ]);

    // 조직별 통계
    const organizationStats = organizations.map((org) => {
      const orgMembers = members.filter(
        (m) => m.organizationId === org._id.toString()
      );
      const orgEvents = events.filter(
        (e) => e.organizationId === org._id.toString()
      );

      const totalAttendance = orgEvents.reduce(
        (sum, event) => sum + event.attendees.length,
        0
      );
      const averageAttendance =
        orgEvents.length > 0 ? totalAttendance / orgEvents.length : 0;

      return {
        _id: org._id,
        name: org.name,
        type: org.type,
        memberCount: orgMembers.length,
        eventCount: orgEvents.length,
        totalAttendance,
        averageAttendance,
        participationRule: org.settings?.participationRule || '제한없음',
      };
    });

    // 전체 통계
    const totalStats = {
      totalOrganizations: organizations.length,
      totalMembers: members.length,
      totalEvents: events.length,
      totalAttendance: events.reduce(
        (sum, event) => sum + event.attendees.length,
        0
      ),
      averageAttendancePerEvent:
        events.length > 0
          ? events.reduce((sum, event) => sum + event.attendees.length, 0) /
            events.length
          : 0,
    };

    // 월별 전체 통계
    const monthlyStats = events.reduce(
      (acc, event) => {
        const month = dayjs(event.date).format('YYYY-MM');
        if (!acc[month]) {
          acc[month] = {
            month,
            totalEvents: 0,
            totalAttendance: 0,
            uniqueParticipants: new Set(),
          };
        }
        acc[month].totalEvents += 1;
        acc[month].totalAttendance += event.attendees.length;
        event.attendees.forEach((attendee) =>
          acc[month].uniqueParticipants.add(attendee)
        );
        return acc;
      },
      {} as Record<string, any>
    );

    // 월별 통계 정리
    const monthlyStatsArray = Object.entries(monthlyStats).map(
      ([month, stats]) => ({
        month,
        totalEvents: stats.totalEvents,
        totalAttendance: stats.totalAttendance,
        uniqueParticipants: stats.uniqueParticipants.size,
        averageAttendance:
          stats.totalEvents > 0 ? stats.totalAttendance / stats.totalEvents : 0,
      })
    );

    res.json({
      success: true,
      data: {
        totalStats,
        organizationStats,
        monthlyStats: monthlyStatsArray,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  }
);

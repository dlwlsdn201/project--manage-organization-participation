import { useState, useMemo } from 'react';
import { useEventStore } from '@/entities/event/model';
import { useOrganizationStore } from '@/features/organization/lib';
import { useMemberStore } from '@/features/organization/lib/member-store';
import { Member } from '@/entities';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface AttendanceStats {
  totalEvents: number;
  totalMembers: number;
  averageAttendance: number;
  totalAttendance: number;
  attendanceRate: number;
}

interface MemberAttendanceStat {
  member: Member;
  attendedEvents: number;
  totalEvents: number;
  attendanceRate: number;
  status: '위험' | '양호' | '우수' | '정상';
  requiredEvents: number;
  deficit: number;
}

/**
 * 참여 분석 위젯의 비즈니스 로직
 * - 날짜 필터링
 * - 참여율 계산
 * - 멤버/모임 통계 생성
 */
export const useAttendanceTracker = (organizationId: string) => {
  const { events } = useEventStore();
  const { organizations } = useOrganizationStore();
  const { members } = useMemberStore();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // 조직 정보
  const organization = useMemo(() => {
    return organizations.find((org) => org._id === organizationId);
  }, [organizations, organizationId]);

  // 해당 조직의 이벤트들
  const organizationEvents = useMemo(() => {
    return events.filter((event) => event.organizationId === organizationId);
  }, [events, organizationId]);

  // 해당 조직의 멤버들
  const organizationMembers = useMemo(() => {
    return members.filter((member) => member.organizationId === organizationId);
  }, [members, organizationId]);

  // 날짜 범위로 필터링된 이벤트들
  const filteredEvents = useMemo(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      return organizationEvents;
    }

    return organizationEvents.filter((event) => {
      const eventDate = new Date(event.date);
      const startDate = dateRange.startDate
        ? new Date(dateRange.startDate)
        : null;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;

      return true;
    });
  }, [organizationEvents, dateRange]);

  // 전체 참여 통계
  const attendanceStats = useMemo((): AttendanceStats => {
    const totalEvents = filteredEvents.length;
    const totalMembers = organizationMembers.length;

    if (totalEvents === 0) {
      return {
        totalEvents: 0,
        totalMembers,
        averageAttendance: 0,
        totalAttendance: 0,
        attendanceRate: 0,
      };
    }

    const totalAttendance = filteredEvents.reduce(
      (sum, event) => sum + event.currentParticipants,
      0
    );
    const averageAttendance = totalAttendance / totalEvents;
    const attendanceRate =
      totalMembers > 0
        ? (totalAttendance / (totalEvents * totalMembers)) * 100
        : 0;

    return {
      totalEvents,
      totalMembers,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
      totalAttendance,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
    };
  }, [filteredEvents, organizationMembers]);

  // 멤버별 참여 통계
  const memberAttendanceStats = useMemo((): MemberAttendanceStat[] => {
    // 참여 규칙 확인
    const participationRule =
      organization?.settings?.participationRule || '제한없음';
    const requiredEventsPerMonth =
      participationRule === '제한없음' ? 0 : parseInt(participationRule, 10);

    // 날짜 범위의 개월 수 계산
    const monthsInRange =
      dateRange.startDate && dateRange.endDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(dateRange.endDate).getTime() -
                new Date(dateRange.startDate).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            )
          )
        : 1;

    const requiredTotalEvents = requiredEventsPerMonth * monthsInRange;

    return organizationMembers
      .map((member) => {
        const memberEvents = filteredEvents.filter((event) =>
          event.attendees.some((attendee) => attendee.memberId === member._id)
        );

        const attendanceRate =
          filteredEvents.length > 0
            ? (memberEvents.length / filteredEvents.length) * 100
            : 0;

        // 상태 판단: 모임의 최소 월 참여 횟수 대비 실제 멤버 참여 횟수
        let status: '위험' | '양호' | '우수' | '정상';
        if (requiredEventsPerMonth > 0) {
          if (memberEvents.length < requiredTotalEvents) {
            status = '위험';
          } else if (memberEvents.length === requiredTotalEvents) {
            status = '양호';
          } else {
            status = '우수';
          }
        } else {
          // 참여 규칙이 '제한없음'인 경우
          status = '정상';
        }

        return {
          member,
          attendedEvents: memberEvents.length,
          totalEvents: filteredEvents.length,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
          status,
          requiredEvents: requiredTotalEvents,
          deficit: Math.max(0, requiredTotalEvents - memberEvents.length),
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate); // 높은 참여율부터 정렬
  }, [organizationMembers, filteredEvents, organization, dateRange]);

  return {
    dateRange,
    setDateRange,
    organization,
    organizationMembers,
    filteredEvents,
    attendanceStats,
    memberAttendanceStats,
  };
};

export type { AttendanceStats, MemberAttendanceStat, DateRange };

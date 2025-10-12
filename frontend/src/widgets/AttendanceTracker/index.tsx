import { useState, useMemo } from 'react';
import { useEventStore } from '@/entities/event/model';
import { useOrganizationStore } from '../../features/organization/lib';
import { useMemberStore } from '../../features/organization/lib/member-store';
import { DateRangeFilter } from '../../features/DateRangeFilter';
import { Calendar, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface AttendanceTrackerProps {
  organizationId: string;
}

export function AttendanceTracker({ organizationId }: AttendanceTrackerProps) {
  const { events } = useEventStore();
  const { organizations } = useOrganizationStore();
  const { members } = useMemberStore();
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const organization = useMemo(() => {
    return organizations.find((org) => org._id === organizationId);
  }, [organizations, organizationId]);

  const organizationEvents = useMemo(() => {
    return events.filter((event) => event.organizationId === organizationId);
  }, [events, organizationId]);

  const organizationMembers = useMemo(() => {
    return members.filter((member) => member.organizationId === organizationId);
  }, [members, organizationId]);

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

  const attendanceStats = useMemo(() => {
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

  const memberAttendanceStats = useMemo(() => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">참여 분석</h2>
        <DateRangeFilter
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={setDateRange}
        />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 모임 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceStats.totalEvents}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 멤버 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceStats.totalMembers}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 참여율</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceStats.attendanceRate}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 참여 횟수</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceStats.totalAttendance}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 멤버별 참여 현황 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            멤버별 참여 현황
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 mobile:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  멤버명
                </th>
                <th className="px-6 mobile:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  참여한 모임
                </th>
                <th className="px-6 mobile:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  참여율
                </th>
                <th className="px-6 mobile:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberAttendanceStats.map(
                ({
                  member,
                  attendedEvents,
                  totalEvents,
                  attendanceRate,
                  status,
                }) => (
                  <tr key={member._id}>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendedEvents} / {totalEvents}
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center mobile:w-[6rem]">
                        <div className="text-sm text-gray-900">
                          {attendanceRate}%
                        </div>
                        <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              attendanceRate >= 80
                                ? 'bg-green-500'
                                : attendanceRate >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(attendanceRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap">
                      {status === '위험' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          위험
                        </span>
                      )}
                      {status === '양호' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          양호
                        </span>
                      )}
                      {status === '우수' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          우수
                        </span>
                      )}
                      {status === '정상' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          정상
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모임별 참여 현황 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            모임별 참여 현황
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 mobile:px-4 py-3 mobile:py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  모임명
                </th>
                <th className="px-6 mobile:px-4 py-3 mobile:py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 mobile:px-4 py-3 mobile:py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  참여자 수
                </th>
                <th className="px-6 mobile:px-4 py-3 mobile:py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  참여율
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const participationRate =
                  organizationMembers.length > 0
                    ? (event.currentParticipants / organizationMembers.length) *
                      100
                    : 0;

                return (
                  <tr key={event._id}>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.currentParticipants} / {organizationMembers.length}
                    </td>
                    <td className="px-6 mobile:px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {Math.round(participationRate * 10) / 10}%
                        </div>
                        <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              participationRate >= 80
                                ? 'bg-green-500'
                                : participationRate >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(participationRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

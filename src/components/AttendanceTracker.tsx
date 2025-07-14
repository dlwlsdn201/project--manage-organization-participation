import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DateRangeFilter } from './DateRangeFilter';
import dayjs from 'dayjs';

interface AttendanceTrackerProps {
  organizationId: string;
}

export function AttendanceTracker({ organizationId }: AttendanceTrackerProps) {
  const { members, events, organizations } = useAppStore();
  const [dateRange, setDateRange] = useState<{
    startDate?: Date;
    endDate?: Date;
    preset?: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';
  }>({ preset: 'thisMonth' });

  // 현재 조직 정보
  const currentOrganization = organizations.find(
    (org) => org.id === organizationId
  );

  // 현재 조직의 데이터 필터링
  const organizationMembers = members.filter(
    (m) => m.organizationId === organizationId
  );
  const organizationEvents = events.filter(
    (e) => e.organizationId === organizationId
  );

  // 날짜 범위에 따른 이벤트 필터링
  const filteredEvents = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return organizationEvents;
    }

    return organizationEvents.filter((event) => {
      const eventDate = dayjs(event.date);
      return (
        eventDate.isAfter(dayjs(dateRange.startDate).subtract(1, 'day')) &&
        eventDate.isBefore(dayjs(dateRange.endDate).add(1, 'day'))
      );
    });
  }, [organizationEvents, dateRange]);

  // 멤버별 참여 통계 계산
  const memberStats = useMemo(() => {
    return organizationMembers.map((member) => {
      const attendedEvents = filteredEvents.filter((event) =>
        event.attendees.includes(member.id)
      );
      const totalEvents = filteredEvents.length;
      const attendanceRate =
        totalEvents > 0 ? (attendedEvents.length / totalEvents) * 100 : 0;

      // 조직 설정에서 최소 참여 규칙 가져오기
      const participationRule =
        currentOrganization?.settings?.participationRule || '제한없음';
      const minAttendancePerMonth =
        participationRule === '제한없음' ? 0 : parseInt(participationRule, 10);

      const monthsInRange =
        dateRange.startDate && dateRange.endDate
          ? Math.max(
              1,
              dayjs(dateRange.endDate).diff(
                dayjs(dateRange.startDate),
                'month'
              ) + 1
            )
          : 1;
      const requiredAttendance = minAttendancePerMonth * monthsInRange;
      const isAtRisk =
        minAttendancePerMonth > 0 && attendedEvents.length < requiredAttendance;

      return {
        member,
        attendedEvents: attendedEvents.length,
        totalEvents,
        attendanceRate,
        requiredAttendance,
        isAtRisk,
        deficit: Math.max(0, requiredAttendance - attendedEvents.length),
      };
    });
  }, [organizationMembers, filteredEvents, dateRange, currentOrganization]);

  // 위험 멤버 수
  const riskMemberCount = memberStats.filter((stat) => stat.isAtRisk).length;

  // 전체 통계
  const overallStats = {
    totalMembers: organizationMembers.length,
    totalEvents: filteredEvents.length,
    averageAttendanceRate:
      memberStats.length > 0
        ? memberStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) /
          memberStats.length
        : 0,
    riskMemberCount,
    activeMembers: memberStats.filter((stat) => stat.attendedEvents > 0).length,
  };

  // 참여 규칙 표시용 텍스트
  const getParticipationRuleText = () => {
    const participationRule =
      currentOrganization?.settings?.participationRule || '제한없음';
    if (participationRule === '제한없음') {
      return '제한없음';
    }
    return `월 ${participationRule}회 이상`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">참여 분석</h2>
          <p className="text-sm text-slate-600 mt-1">
            참여 규칙: {getParticipationRuleText()}
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* 전체 통계 요약 */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              전체 구성원
            </h3>
            <span className="text-2xl font-bold text-slate-900">
              {overallStats.totalMembers}
            </span>
            <span className="text-sm text-slate-500 ml-1">명</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              총 모임 수
            </h3>
            <span className="text-2xl font-bold text-slate-900">
              {overallStats.totalEvents}
            </span>
            <span className="text-sm text-slate-500 ml-1">회</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              평균 참여율
            </h3>
            <span className="text-2xl font-bold text-slate-900">
              {overallStats.averageAttendanceRate.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500 ml-1">%</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-red-600 mb-1">
              저조한 구성원
            </h3>
            <span className="text-2xl font-bold text-red-700">
              {overallStats.riskMemberCount}
            </span>
            <span className="text-sm text-red-500 ml-1">명</span>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              활성 구성원
            </h3>
            <span className="text-2xl font-bold text-green-700">
              {overallStats.activeMembers}
            </span>
            <span className="text-sm text-slate-500 ml-1">명</span>
          </div>
        </div>
      </div>

      {/* 구성원별 상세 분석 */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          구성원별 참여 현황
        </h3>

        {memberStats.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-400 text-6xl mb-4">👥</div>
            <p className="text-slate-600 text-lg mb-2">구성원이 없습니다</p>
            <p className="text-slate-500 text-sm">
              조직에 구성원을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    성별
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    나이
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    거주지
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    참여 횟수
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    참여율
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    권장 참여
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {memberStats
                  .sort((a, b) => b.attendanceRate - a.attendanceRate)
                  .map(
                    ({
                      member,
                      attendedEvents,
                      totalEvents,
                      attendanceRate,
                      requiredAttendance,
                      isAtRisk,
                      deficit,
                    }) => (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-50 transition-colors duration-150 ${
                          isAtRisk ? 'bg-red-50 border-l-4 border-red-400' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {member.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {member.gender === 'male' ? '남성' : '여성'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date().getFullYear() - member.birthYear + 1}세
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {member.district}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          <span className="font-medium">{attendedEvents}</span>
                          <span className="text-slate-500">/{totalEvents}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  attendanceRate >= 80
                                    ? 'bg-green-500'
                                    : attendanceRate >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.min(attendanceRate, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                attendanceRate >= 80
                                  ? 'text-green-700'
                                  : attendanceRate >= 50
                                    ? 'text-yellow-700'
                                    : 'text-red-700'
                              }`}
                            >
                              {attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span>{requiredAttendance}회</span>
                            {deficit > 0 && (
                              <span className="text-xs text-red-600">
                                ({deficit}회 부족)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isAtRisk ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              📉 저조
                            </span>
                          ) : attendanceRate >= 80 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✨ 우수
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ✅ 양호
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 참여 저조 구성원 요약 */}
      {riskMemberCount > 0 && (
        <div className="p-6 bg-orange-50 border-t border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
            📊 참여 저조 구성원 요약
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {riskMemberCount}명
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberStats
              .filter((stat) => stat.isAtRisk)
              .map(
                ({
                  member,
                  attendedEvents,
                  requiredAttendance,
                  deficit,
                  attendanceRate,
                }) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-slate-900">
                        {member.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {member.gender === 'male' ? '남성' : '여성'},{' '}
                        {new Date().getFullYear() - member.birthYear + 1}세
                      </p>
                      <p className="text-sm text-slate-600">
                        거주지: {member.district}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">참여율</span>
                        <span className="font-medium text-red-700">
                          {attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">참여 횟수</span>
                        <span className="font-medium">
                          {attendedEvents}회 / {requiredAttendance}회
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">부족분</span>
                        <span className="font-medium text-red-700">
                          {deficit}회
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}
    </div>
  );
}

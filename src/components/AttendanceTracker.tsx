import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DateRangeFilter } from './DateRangeFilter';
import { Member, Event } from '../types';
import dayjs from 'dayjs';

interface AttendanceTrackerProps {
  organizationId: string;
}

export function AttendanceTracker({ organizationId }: AttendanceTrackerProps) {
  const { members, events } = useAppStore();
  const [dateRange, setDateRange] = useState<{
    startDate?: Date;
    endDate?: Date;
    preset?: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';
  }>({ preset: 'thisMonth' });

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

      // 최소 참여 규칙 (월 2회 기본)
      const minAttendancePerMonth = 2;
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
      const isAtRisk = attendedEvents.length < requiredAttendance;

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
  }, [organizationMembers, filteredEvents, dateRange]);

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

  const handleWarning = (memberId: string) => {
    // 경고 처리 로직
    console.log(`Warning sent to member: ${memberId}`);
  };

  const handleRemove = (memberId: string) => {
    // 강퇴 처리 로직
    if (window.confirm('정말로 이 구성원을 강퇴하시겠습니까?')) {
      console.log(`Member removed: ${memberId}`);
    }
  };

  return (
    <div className="attendance-tracker">
      <div className="attendance-header">
        <h2>참여 분석</h2>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* 전체 통계 요약 */}
      <div className="stats-summary">
        <div className="stat-card">
          <h3>전체 구성원</h3>
          <span className="stat-value">{overallStats.totalMembers}명</span>
        </div>
        <div className="stat-card">
          <h3>총 모임 수</h3>
          <span className="stat-value">{overallStats.totalEvents}회</span>
        </div>
        <div className="stat-card">
          <h3>평균 참여율</h3>
          <span className="stat-value">
            {overallStats.averageAttendanceRate.toFixed(1)}%
          </span>
        </div>
        <div className="stat-card danger">
          <h3>위험 구성원</h3>
          <span className="stat-value">{overallStats.riskMemberCount}명</span>
        </div>
        <div className="stat-card">
          <h3>활성 구성원</h3>
          <span className="stat-value">{overallStats.activeMembers}명</span>
        </div>
      </div>

      {/* 구성원별 상세 분석 */}
      <div className="member-analysis">
        <h3>구성원별 참여 현황</h3>

        {memberStats.length === 0 ? (
          <div className="empty-state">
            <p>구성원이 없습니다.</p>
          </div>
        ) : (
          <div className="member-stats-table">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>성별</th>
                  <th>나이</th>
                  <th>거주지</th>
                  <th>참여 횟수</th>
                  <th>참여율</th>
                  <th>필요 참여</th>
                  <th>부족분</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
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
                      <tr key={member.id} className={isAtRisk ? 'at-risk' : ''}>
                        <td className="member-name">{member.name}</td>
                        <td>{member.gender === 'male' ? '남성' : '여성'}</td>
                        <td>
                          {new Date().getFullYear() - member.birthYear + 1}세
                        </td>
                        <td>{member.district}</td>
                        <td>
                          {attendedEvents}/{totalEvents}
                        </td>
                        <td
                          className={`attendance-rate ${attendanceRate < 50 ? 'low' : attendanceRate < 80 ? 'medium' : 'high'}`}
                        >
                          {attendanceRate.toFixed(1)}%
                        </td>
                        <td>{requiredAttendance}회</td>
                        <td className={deficit > 0 ? 'deficit' : 'satisfied'}>
                          {deficit > 0 ? `${deficit}회 부족` : '충족'}
                        </td>
                        <td>
                          {isAtRisk ? (
                            <span className="status-badge danger">위험</span>
                          ) : (
                            <span className="status-badge safe">안전</span>
                          )}
                        </td>
                        <td>
                          <div className="member-actions">
                            {isAtRisk && (
                              <>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleWarning(member.id)}
                                >
                                  경고
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemove(member.id)}
                                >
                                  강퇴
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 위험 구성원 별도 표시 */}
      {riskMemberCount > 0 && (
        <div className="risk-members-section">
          <h3>⚠️ 주의 필요 구성원 ({riskMemberCount}명)</h3>
          <div className="risk-members-list">
            {memberStats
              .filter((stat) => stat.isAtRisk)
              .map(
                ({ member, attendedEvents, requiredAttendance, deficit }) => (
                  <div key={member.id} className="risk-member-card">
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>
                        {member.gender === 'male' ? '남성' : '여성'},{' '}
                        {new Date().getFullYear() - member.birthYear + 1}세
                      </p>
                      <p>거주지: {member.district}</p>
                    </div>
                    <div className="risk-details">
                      <p className="attendance-info">
                        참여: {attendedEvents}회 / 필요: {requiredAttendance}회
                      </p>
                      <p className="deficit-info">{deficit}회 부족</p>
                    </div>
                    <div className="risk-actions">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleWarning(member.id)}
                      >
                        경고 발송
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemove(member.id)}
                      >
                        강퇴 처리
                      </button>
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

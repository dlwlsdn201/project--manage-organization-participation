import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangeFilter } from './DateRangeFilter';
import {
  DateRangeFilter as DateRangeFilterType,
  AttendanceStats,
  OrganizationRules,
} from '../types';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

interface AttendanceTrackerProps {
  organizationId: string;
}

export function AttendanceTracker({ organizationId }: AttendanceTrackerProps) {
  const { state } = useApp();
  const [dateFilter, setDateFilter] = useState<DateRangeFilterType>({
    preset: 'thisMonth',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const organization = state.organizations.find(
    (org) => org.id === organizationId
  );
  const organizationRules = state.organizationRules.find(
    (rule) => rule.organizationId === organizationId
  );

  // 기본 규칙 설정
  const defaultRules: OrganizationRules = {
    organizationId,
    minAttendancePerMonth: 2,
    warningThreshold: 1,
    autoRemoveAfterWarnings: 3,
  };

  const rules = organizationRules || defaultRules;

  // 참여자 및 이벤트 데이터
  const participants = state.participants.filter(
    (p) => p.organizationId === organizationId
  );
  const events = state.events.filter(
    (e) => e.organizationId === organizationId
  );

  // 날짜 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    if (!dateFilter.startDate || !dateFilter.endDate) return events;

    return events.filter((event) => {
      return isWithinInterval(event.startDate, {
        start: dateFilter.startDate!,
        end: dateFilter.endDate!,
      });
    });
  }, [events, dateFilter]);

  // 참여 통계 계산
  const attendanceStats = useMemo(() => {
    return participants.map((participant) => {
      const user = state.users.find((u) => u.id === participant.userId);
      const participantEvents = filteredEvents.filter((event) =>
        event.attendees.includes(participant.userId)
      );

      const totalEvents = filteredEvents.length;
      const attendedEvents = participantEvents.length;
      const attendanceRate =
        totalEvents > 0 ? (attendedEvents / totalEvents) * 100 : 0;

      const lastAttendance =
        participantEvents.length > 0
          ? participantEvents.sort(
              (a, b) => b.startDate.getTime() - a.startDate.getTime()
            )[0].startDate
          : undefined;

      const isAtRisk = attendedEvents < rules.minAttendancePerMonth;

      return {
        participant,
        user,
        totalEvents,
        attendedEvents,
        attendanceRate,
        lastAttendance,
        isAtRisk,
        warningCount: 0, // 실제로는 데이터베이스에서 가져와야 함
      };
    });
  }, [participants, filteredEvents, rules.minAttendancePerMonth, state.users]);

  // 통계 요약
  const summary = useMemo(() => {
    const totalMembers = attendanceStats.length;
    const activeMembers = attendanceStats.filter(
      (stat) => stat.attendedEvents > 0
    ).length;
    const atRiskMembers = attendanceStats.filter(
      (stat) => stat.isAtRisk
    ).length;
    const averageAttendance =
      attendanceStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) /
        totalMembers || 0;

    return {
      totalMembers,
      activeMembers,
      atRiskMembers,
      averageAttendance,
    };
  }, [attendanceStats]);

  const handleWarnMember = (participantId: string) => {
    setSelectedMember(participantId);
    setShowWarningDialog(true);
  };

  const handleRemoveMember = (participantId: string) => {
    if (confirm('정말로 이 멤버를 조직에서 제거하시겠습니까?')) {
      // 실제로는 API 호출을 통해 멤버 제거
      console.log('멤버 제거:', participantId);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    if (rate >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 60) return <TrendingUp size={16} className="text-green-500" />;
    return <TrendingDown size={16} className="text-red-500" />;
  };

  if (!organization) {
    return <div>조직을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="attendance-tracker">
      <div className="attendance-header">
        <h2>{organization.name} - 참여 현황</h2>
        <div className="attendance-filters">
          <DateRangeFilter
            value={dateFilter}
            onChange={setDateFilter}
            className="date-filter"
          />
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="attendance-summary">
        <div className="stat-card">
          <div className="stat-icon">
            <Users className="icon-blue" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{summary.totalMembers}</div>
            <div className="stat-label">전체 멤버</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="icon-green" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{summary.activeMembers}</div>
            <div className="stat-label">활성 멤버</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle className="icon-red" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{summary.atRiskMembers}</div>
            <div className="stat-label">위험 멤버</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Award className="icon-blue" />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {summary.averageAttendance.toFixed(1)}%
            </div>
            <div className="stat-label">평균 참여율</div>
          </div>
        </div>
      </div>

      {/* 조직 규칙 */}
      <div className="organization-rules">
        <h3>조직 규칙</h3>
        <div className="rules-grid">
          <div className="rule-item">
            <span className="rule-label">월 최소 참여 횟수:</span>
            <span className="rule-value">{rules.minAttendancePerMonth}회</span>
          </div>
          <div className="rule-item">
            <span className="rule-label">경고 기준:</span>
            <span className="rule-value">{rules.warningThreshold}회 미만</span>
          </div>
          <div className="rule-item">
            <span className="rule-label">자동 제거 기준:</span>
            <span className="rule-value">
              경고 {rules.autoRemoveAfterWarnings}회
            </span>
          </div>
        </div>
      </div>

      {/* 멤버 참여 현황 */}
      <div className="attendance-list">
        <h3>멤버별 참여 현황</h3>
        <div className="attendance-table">
          <div className="table-header">
            <div className="col-member">멤버</div>
            <div className="col-attendance">참여 현황</div>
            <div className="col-rate">참여율</div>
            <div className="col-last">마지막 참여</div>
            <div className="col-actions">관리</div>
          </div>

          {attendanceStats.map((stat) => (
            <div
              key={stat.participant.id}
              className={`table-row ${stat.isAtRisk ? 'at-risk' : ''}`}
            >
              <div className="col-member">
                <div className="member-info">
                  <div className="member-name">
                    {stat.user?.name || '알 수 없음'}
                  </div>
                  <div className="member-role">{stat.participant.role}</div>
                  {stat.isAtRisk && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>

              <div className="col-attendance">
                <div className="attendance-fraction">
                  {stat.attendedEvents} / {stat.totalEvents}
                </div>
                <div className="attendance-events">
                  {stat.totalEvents > 0
                    ? `${stat.totalEvents}개 이벤트 중`
                    : '이벤트 없음'}
                </div>
              </div>

              <div className="col-rate">
                <div className="attendance-rate">
                  {getAttendanceIcon(stat.attendanceRate)}
                  <span className={getAttendanceColor(stat.attendanceRate)}>
                    {stat.attendanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="col-last">
                {stat.lastAttendance ? (
                  <div className="last-attendance">
                    <Calendar size={14} />
                    {format(stat.lastAttendance, 'MM/dd')}
                  </div>
                ) : (
                  <span className="no-attendance">참여 없음</span>
                )}
              </div>

              <div className="col-actions">
                {stat.isAtRisk && (
                  <div className="action-buttons">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleWarnMember(stat.participant.id)}
                    >
                      경고
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveMember(stat.participant.id)}
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 경고 다이얼로그 */}
      {showWarningDialog && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>멤버 경고</h3>
              <button
                className="modal-close"
                onClick={() => setShowWarningDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>선택한 멤버에게 참여 부족에 대한 경고를 보내시겠습니까?</p>
              <p className="warning-text">
                이 작업은 멤버의 경고 횟수를 증가시키며,
                {rules.autoRemoveAfterWarnings}회 경고 시 자동으로 조직에서
                제거됩니다.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowWarningDialog(false)}
              >
                취소
              </button>
              <button
                className="btn btn-warning"
                onClick={() => {
                  // 실제로는 API 호출을 통해 경고 처리
                  console.log('경고 처리:', selectedMember);
                  setShowWarningDialog(false);
                  setSelectedMember(null);
                }}
              >
                경고 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

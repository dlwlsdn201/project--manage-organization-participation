import { DateRangeFilter } from '@/features/date-range-filter';
import { useAttendanceTracker } from './model/useAttendanceTracker';
import { AttendanceStatsCards } from './ui/AttendanceStatsCards';
import { MemberAttendanceTable } from './ui/MemberAttendanceTable';
import { EventAttendanceTable } from './ui/EventAttendanceTable';

interface AttendanceTrackerProps {
  organizationId: string;
}

/**
 * 참여 분석 위젯
 * - 전체 참여 통계
 * - 멤버별 참여 현황
 * - 모임별 참여 현황
 */
export function AttendanceTracker({ organizationId }: AttendanceTrackerProps) {
  const {
    dateRange,
    setDateRange,
    organizationMembers,
    filteredEvents,
    attendanceStats,
    memberAttendanceStats,
  } = useAttendanceTracker(organizationId);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">참여 분석</h2>
        <DateRangeFilter
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={setDateRange}
        />
      </div>

      {/* 통계 카드 */}
      <AttendanceStatsCards stats={attendanceStats} />

      {/* 멤버별 참여 현황 */}
      <MemberAttendanceTable stats={memberAttendanceStats} />

      {/* 모임별 참여 현황 */}
      <EventAttendanceTable
        events={filteredEvents}
        organizationMembers={organizationMembers}
      />
    </div>
  );
}

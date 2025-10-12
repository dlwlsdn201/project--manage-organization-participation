import { Calendar, Users, TrendingUp } from 'lucide-react';
import { AttendanceStats } from '@/widgets/attendance-tracker/model/useAttendanceTracker';

interface AttendanceStatsCardsProps {
  stats: AttendanceStats;
}

/**
 * 참여 분석 통계 카드 컴포넌트
 * - 총 모임 수
 * - 총 멤버 수
 * - 평균 참여율
 * - 총 참여 횟수
 */
export const AttendanceStatsCards = ({ stats }: AttendanceStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 총 모임 수 */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">총 모임 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalEvents}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      {/* 총 멤버 수 */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">총 멤버 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalMembers}
            </p>
          </div>
          <Users className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* 평균 참여율 */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">평균 참여율</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.attendanceRate}%
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      {/* 총 참여 횟수 */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">총 참여 횟수</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalAttendance}
            </p>
          </div>
          <Users className="h-8 w-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

import { AlertTriangle } from 'lucide-react';
import { MemberAttendanceStat } from '@/widgets/attendance-tracker/model/useAttendanceTracker';

interface MemberAttendanceTableProps {
  stats: MemberAttendanceStat[];
}

/**
 * 멤버별 참여 현황 테이블
 * - 멤버명, 참여한 모임, 참여율, 상태 표시
 */
export const MemberAttendanceTable = ({
  stats,
}: MemberAttendanceTableProps) => {
  return (
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
            {stats.map(
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
  );
};

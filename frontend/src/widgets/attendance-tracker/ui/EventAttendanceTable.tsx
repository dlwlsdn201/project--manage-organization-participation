import { Event, Member } from '@/entities';

interface EventAttendanceTableProps {
  events: Event[];
  organizationMembers: Member[];
}

/**
 * 모임별 참여 현황 테이블
 * - 모임명, 날짜, 참여자 수, 참여율 표시
 */
export const EventAttendanceTable = ({
  events,
  organizationMembers,
}: EventAttendanceTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">모임별 참여 현황</h3>
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
            {events.map((event) => {
              const participationRate =
                organizationMembers.length > 0
                  ? (event.currentParticipants / organizationMembers.length) * 100
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
  );
};


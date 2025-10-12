import { Event } from '@/entities';
import { Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import { Popconfirm } from 'antd';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onManageParticipants: (event: Event) => void;
}

/**
 * 이벤트 카드 컴포넌트
 * - 이벤트 정보 표시
 * - 편집/삭제 버튼
 * - 참가자 관리 버튼
 */
export const EventCard = ({
  event,
  onEdit,
  onDelete,
  onManageParticipants,
}: EventCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="모임 편집"
          >
            <Edit size={16} />
          </button>
          <Popconfirm
            title="정말로 이 모임을 삭제하시겠습니까?"
            onConfirm={() => onDelete(event)}
            okText="삭제"
            cancelText="취소"
          >
            <button
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="모임 삭제"
            >
              <Trash2 size={16} />
            </button>
          </Popconfirm>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

      {/* 이벤트 정보 */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} />
          <span>{event.currentParticipants}명 참여</span>
        </div>
      </div>

      {/* 참가자 관리 버튼 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onManageParticipants(event)}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          참가자 관리
        </button>
      </div>
    </div>
  );
};


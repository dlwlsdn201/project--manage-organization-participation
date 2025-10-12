import { Plus } from 'lucide-react';
import { Badge } from 'antd';
import { DefaultButton } from '@/shared/ui/Button';

interface EventManagerHeaderProps {
  totalEvents: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEvent: () => void;
}

/**
 * 이벤트 관리 헤더 컴포넌트
 * - 제목과 이벤트 개수 표시
 * - 검색바
 * - 새 모임 추가 버튼
 */
export const EventManagerHeader = ({
  totalEvents,
  searchTerm,
  onSearchChange,
  onAddEvent,
}: EventManagerHeaderProps) => {
  return (
    <>
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">모임 목록</h2>
          <div className="px-3 py-1 text-sm font-medium flex items-center gap-1">
            <span>총</span>
            <Badge
              count={totalEvents}
              style={{ backgroundColor: '#667eea' }}
              dot={false}
            />
            개
          </div>
        </div>
        <DefaultButton onClick={onAddEvent} icon={<Plus size={16} />} type="primary">
          새 모임 추가
        </DefaultButton>
      </div>

      {/* 검색바 */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="모임명으로 검색..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </>
  );
};


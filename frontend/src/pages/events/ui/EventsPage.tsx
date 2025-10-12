import { EventManager } from '@/widgets/EventManager';

interface EventsPageProps {
  organizationId: string | null;
}

/**
 * 모임 관리 페이지
 * - 모임 생성/수정/삭제
 * - 참가자 관리
 * - 모임 상세 정보 조회
 */
export const EventsPage = ({ organizationId }: EventsPageProps) => {
  if (!organizationId) {
    return (
      <div className="empty-state">
        <p>모임을 관리하려면 먼저 조직을 선택해주세요.</p>
      </div>
    );
  }

  return <EventManager organizationId={organizationId} />;
};


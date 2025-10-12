import { AttendanceTracker } from '@/widgets/attendance-tracker';

interface AnalyticsPageProps {
  organizationId: string | null;
}

/**
 * 참여 분석 페이지
 * - 멤버별 참여율 조회
 * - 모임별 참여 현황
 * - 실시간 통계 대시보드
 */
export const AnalyticsPage = ({ organizationId }: AnalyticsPageProps) => {
  if (!organizationId) {
    return (
      <div className="empty-state">
        <p>분석을 보려면 먼저 조직을 선택해주세요.</p>
      </div>
    );
  }

  return <AttendanceTracker organizationId={organizationId} />;
};


/**
 * 홈/대시보드 페이지
 * - 앱의 초기 진입 페이지
 * - 현재는 조직 목록 페이지로 리다이렉트
 */
export const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          소모임 활동 관리 시스템
        </h1>
        <p className="text-gray-600">
          조직을 선택하여 모임을 관리하고 참여 현황을 분석하세요.
        </p>
      </div>
    </div>
  );
};


// 사용자 관련 유틸리티 함수들

/**
 * 현재 사용자 ID를 가져옵니다.
 * 실제 환경에서는 JWT 토큰이나 세션에서 가져와야 합니다.
 */
export const getCurrentUserId = (): string => {
  // 임시로 로컬 스토리지에서 사용자 ID를 가져오거나 생성
  let userId = localStorage.getItem('current_user_id');

  if (!userId) {
    // 사용자 ID가 없으면 새로 생성
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('current_user_id', userId);
  }

  return userId;
};

/**
 * 현재 사용자 정보를 가져옵니다.
 */
export const getCurrentUser = () => {
  const userId = getCurrentUserId();

  return {
    id: userId,
    name: '관리자',
    email: 'admin@example.com',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

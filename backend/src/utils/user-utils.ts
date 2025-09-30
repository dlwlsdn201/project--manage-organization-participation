// 백엔드 사용자 관련 유틸리티 함수들

/**
 * 현재 사용자 ID를 가져옵니다.
 * 실제 환경에서는 JWT 토큰에서 가져와야 합니다.
 */
export const getCurrentUserId = (): string => {
  // 임시로 환경변수에서 가져오거나 기본값 사용
  return (
    process.env.CURRENT_USER_ID ||
    `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
};

/**
 * 요청에서 사용자 ID를 추출합니다.
 * 실제 환경에서는 JWT 토큰을 파싱하여 사용자 ID를 가져와야 합니다.
 */
export const extractUserIdFromRequest = (req: any): string => {
  // 임시로 헤더에서 사용자 ID를 가져오거나 기본값 사용
  return req.headers['x-user-id'] || getCurrentUserId();
};

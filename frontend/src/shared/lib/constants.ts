// 공통 상수 정의

// 조직 유형
export const ORGANIZATION_TYPES = [
  { value: 'club', label: '동아리' },
  { value: 'study', label: '스터디' },
  { value: 'culture', label: '문화' },
  { value: 'sports', label: '스포츠' },
  { value: 'volunteer', label: '봉사' },
  { value: 'business', label: '비즈니스' },
  { value: 'social', label: '소셜' },
  { value: 'other', label: '기타' },
] as const;

// 참여 규칙
export const PARTICIPATION_RULES = [
  { value: '제한없음', label: '제한없음' },
  { value: '사전신청', label: '사전신청 필요' },
  { value: '승인제', label: '승인제' },
  { value: '회원만', label: '회원만 참여' },
] as const;

// 이벤트 상태
export const EVENT_STATUSES = [
  { value: 'draft', label: '초안', color: 'gray' },
  { value: 'published', label: '발행', color: 'blue' },
  { value: 'cancelled', label: '취소', color: 'red' },
  { value: 'completed', label: '완료', color: 'green' },
] as const;

// 멤버 상태
export const MEMBER_STATUSES = [
  { value: 'active', label: '활성', color: 'green' },
  { value: 'inactive', label: '비활성', color: 'gray' },
  { value: 'pending', label: '대기', color: 'yellow' },
] as const;

// 성별 옵션
export const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
] as const;

// 사용자 역할
export const USER_ROLES = [
  { value: 'admin', label: '관리자', level: 3 },
  { value: 'user', label: '사용자', level: 2 },
  { value: 'moderator', label: '운영자', level: 1 },
] as const;

// 서울시 구/군 목록
export const SEOUL_DISTRICTS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
] as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// API 관련
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SELECTED_ORGANIZATION: 'selected_organization',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// 날짜 형식
export const DATE_FORMATS = {
  DISPLAY: 'yyyy년 MM월 dd일',
  DISPLAY_WITH_TIME: 'yyyy년 MM월 dd일 HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  MONTH_YEAR: 'yyyy년 MM월',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다',
  UNAUTHORIZED: '로그인이 필요합니다',
  FORBIDDEN: '접근 권한이 없습니다',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다',
  VALIDATION_ERROR: '입력 데이터를 확인해주세요',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  SAVED: '저장되었습니다',
  DELETED: '삭제되었습니다',
  CREATED: '생성되었습니다',
  UPDATED: '수정되었습니다',
  LOGIN_SUCCESS: '로그인되었습니다',
  LOGOUT_SUCCESS: '로그아웃되었습니다',
} as const;

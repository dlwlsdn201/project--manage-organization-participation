// Event entity business logic
import { Event } from '../index';
import { EVENT_STATUSES } from '@/shared/lib/constants';
import {
  formatDate,
  isFutureDate,
  isPastDate,
  getRelativeDateText,
} from '@/shared/lib/date-utils';
import { required, minLength, maxLength } from '@/shared/lib/validation';

/**
 * 이벤트 유효성 검사
 */
export const validateEvent = (
  event: Omit<
    Event,
    '_id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'attendees'
  >
) => {
  const errors: string[] = [];

  // 제목 검증
  const titleRules = [
    required('모임명은 필수입니다.'),
    minLength(2, '모임명은 2자 이상이어야 합니다.'),
  ];
  for (const rule of titleRules) {
    const result = rule.validate(event.title);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 설명 검증
  if (event.description) {
    const descResult = maxLength(
      500,
      '설명은 500자 이하로 입력해주세요.'
    ).validate(event.description);
    if (!descResult.isValid && descResult.message) {
      errors.push(descResult.message);
    }
  }

  // 날짜 검증
  const dateResult = required('날짜는 필수입니다.').validate(event.date);
  if (!dateResult.isValid && dateResult.message) {
    errors.push(dateResult.message);
  }

  // 장소 검증
  const locationRules = [
    required('장소는 필수입니다.'),
    minLength(2, '장소는 2자 이상이어야 합니다.'),
  ];
  for (const rule of locationRules) {
    const result = rule.validate(event.location);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 조직 ID 검증
  const orgIdResult = required('조직 ID는 필수입니다.').validate(
    event.organizationId
  );
  if (!orgIdResult.isValid && orgIdResult.message) {
    errors.push(orgIdResult.message);
  }

  // 호스트 ID 검증
  const hostIdResult = required('호스트 ID는 필수입니다.').validate(
    event.hostId
  );
  if (!hostIdResult.isValid && hostIdResult.message) {
    errors.push(hostIdResult.message);
  }

  // 상태 검증
  const statusResult = required('상태는 필수입니다.').validate(event.status);
  if (!statusResult.isValid && statusResult.message) {
    errors.push(statusResult.message);
  }

  if (event.status && !EVENT_STATUSES.some((s) => s.value === event.status)) {
    errors.push('유효하지 않은 모임 상태입니다.');
  }

  return { errors, isValid: errors.length === 0 };
};

/**
 * 이벤트 상태 라벨 가져오기
 */
export const getEventStatusLabel = (status: Event['status']): string => {
  const statusOption = EVENT_STATUSES.find((s) => s.value === status);
  return statusOption ? statusOption.label : '알 수 없음';
};

/**
 * 이벤트 상태 색상 가져오기
 */
export const getEventStatusColor = (status: Event['status']): string => {
  const statusOption = EVENT_STATUSES.find((s) => s.value === status);
  return statusOption?.color || 'gray';
};

/**
 * 이벤트 날짜 표시 형식
 */
export const getEventDateDisplay = (date: Date | string) => {
  return formatDate(date, 'yyyy년 M월 d일 (EEE)');
};

/**
 * 이벤트 시간 표시 형식
 */
export const getEventTimeDisplay = (date: Date | string) => {
  return formatDate(date, 'HH:mm');
};

/**
 * 이벤트가 예정된 이벤트인지 확인
 */
export const isEventUpcoming = (event: Event) => {
  return isFutureDate(event.date);
};

/**
 * 이벤트가 지난 이벤트인지 확인
 */
export const isEventPast = (event: Event) => {
  return isPastDate(event.date);
};

/**
 * 이벤트 상대적 날짜 텍스트
 */
export const getEventRelativeDate = (event: Event) => {
  return getRelativeDateText(event.date);
};

/**
 * 확정된 참가자 수 계산
 */
export const getConfirmedParticipantsCount = (event: Event) => {
  return event.attendees.filter((attendee) => attendee.status === 'confirmed')
    .length;
};

/**
 * 대기 중인 참가자 수 계산
 */
export const getPendingParticipantsCount = (event: Event) => {
  return event.attendees.filter((attendee) => attendee.status === 'pending')
    .length;
};

/**
 * 이벤트 참가자 목록 필터링
 */
export const filterEventAttendees = (
  event: Event,
  filter: 'all' | 'confirmed' | 'pending' = 'all'
) => {
  if (!event.attendees) return [];

  switch (filter) {
    case 'confirmed':
      return event.attendees.filter(
        (attendee) => attendee.status === 'confirmed'
      );
    case 'pending':
      return event.attendees.filter(
        (attendee) => attendee.status === 'pending'
      );
    default:
      return event.attendees;
  }
};

/**
 * 이벤트 통계 계산
 */
export const calculateEventStats = (events: Event[]) => {
  const total = events.length;
  const published = events.filter((e) => e.status === 'published').length;
  const completed = events.filter((e) => e.status === 'completed').length;
  const cancelled = events.filter((e) => e.status === 'cancelled').length;
  const draft = events.filter((e) => e.status === 'draft').length;

  const totalParticipants = events.reduce(
    (sum, event) => sum + event.currentParticipants,
    0
  );
  const averageParticipants =
    total > 0 ? Math.round(totalParticipants / total) : 0;

  return {
    total,
    published,
    completed,
    cancelled,
    draft,
    totalParticipants,
    averageParticipants,
  };
};

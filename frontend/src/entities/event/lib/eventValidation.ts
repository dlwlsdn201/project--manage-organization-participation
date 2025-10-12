import { Event } from '../index';
import { EVENT_STATUSES } from '@/shared/lib/constants';
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


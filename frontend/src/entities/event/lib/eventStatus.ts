import { Event } from '../index';
import { EVENT_STATUSES } from '@/shared/lib/constants';

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


import { Event } from '../index';
import {
  formatDate,
  isFutureDate,
  isPastDate,
  getRelativeDateText,
} from '@/shared/lib/date-utils';

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


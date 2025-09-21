// 날짜 관련 유틸리티 함수들
import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export const dateFormats = {
  display: 'yyyy년 MM월 dd일',
  displayWithTime: 'yyyy년 MM월 dd일 HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: 'yyyy-MM-dd HH:mm:ss',
  monthYear: 'yyyy년 MM월',
} as const;

/**
 * 날짜를 지정된 형식으로 포맷팅
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = dateFormats.display
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '유효하지 않은 날짜';
    }

    return format(dateObj, formatStr, { locale: ko });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '날짜 오류';
  }
};

/**
 * 날짜가 유효한지 확인
 */
export const isValidDate = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    if (!isValid(d1) || !isValid(d2)) {
      return false;
    }

    return formatDate(d1, 'yyyy-MM-dd') === formatDate(d2, 'yyyy-MM-dd');
  } catch {
    return false;
  }
};

/**
 * 날짜가 오늘 이후인지 확인
 */
export const isFutureDate = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return false;
    }

    return isAfter(dateObj, startOfDay(new Date()));
  } catch {
    return false;
  }
};

/**
 * 날짜가 오늘 이전인지 확인
 */
export const isPastDate = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return false;
    }

    return isBefore(dateObj, startOfDay(new Date()));
  } catch {
    return false;
  }
};

/**
 * 날짜 범위 생성 (시작일 ~ 종료일)
 */
export const createDateRange = (
  startDate: Date | string,
  endDate: Date | string
) => {
  try {
    const start =
      typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    if (!isValid(start) || !isValid(end)) {
      return null;
    }

    return {
      start: startOfDay(start),
      end: endOfDay(end),
    };
  } catch {
    return null;
  }
};

/**
 * 상대적 날짜 텍스트 생성 (예: "3일 전", "1주일 후")
 */
export const getRelativeDateText = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '유효하지 않은 날짜';
    }

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return '오늘';
    } else if (diffInDays === 1) {
      return '내일';
    } else if (diffInDays === -1) {
      return '어제';
    } else if (diffInDays > 0) {
      return `${diffInDays}일 후`;
    } else {
      return `${Math.abs(diffInDays)}일 전`;
    }
  } catch {
    return '날짜 오류';
  }
};

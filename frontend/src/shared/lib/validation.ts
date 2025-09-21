// 유효성 검사 유틸리티 함수들

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationRule<T = unknown> {
  validate: (value: T) => ValidationResult;
  message: string;
}

/**
 * 필수 필드 검증
 */
export const required = (
  message: string = '필수 입력 항목입니다'
): ValidationRule => ({
  validate: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    message: !value ? message : undefined,
  }),
  message,
});

/**
 * 이메일 형식 검증
 */
export const email = (
  message: string = '올바른 이메일 형식이 아닙니다'
): ValidationRule => ({
  validate: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const stringValue = String(value || '');
    return {
      isValid: !stringValue || emailRegex.test(stringValue),
      message:
        stringValue && !emailRegex.test(stringValue) ? message : undefined,
    };
  },
  message,
});

/**
 * 최소 길이 검증
 */
export const minLength = (min: number, message?: string): ValidationRule => ({
  validate: (value) => {
    const length = typeof value === 'string' ? value.length : 0;
    return {
      isValid: length >= min,
      message:
        length < min ? message || `최소 ${min}자 이상 입력해주세요` : undefined,
    };
  },
  message: message || `최소 ${min}자 이상`,
});

/**
 * 최대 길이 검증
 */
export const maxLength = (max: number, message?: string): ValidationRule => ({
  validate: (value) => {
    const length = typeof value === 'string' ? value.length : 0;
    return {
      isValid: length <= max,
      message:
        length > max
          ? message || `최대 ${max}자까지 입력 가능합니다`
          : undefined,
    };
  },
  message: message || `최대 ${max}자까지`,
});

/**
 * 숫자 범위 검증
 */
export const range = (
  min: number,
  max: number,
  message?: string
): ValidationRule => ({
  validate: (value) => {
    const num = typeof value === 'number' ? value : parseInt(String(value), 10);
    return {
      isValid: !isNaN(num) && num >= min && num <= max,
      message:
        isNaN(num) || num < min || num > max
          ? message || `${min} 이상 ${max} 이하의 숫자를 입력해주세요`
          : undefined,
    };
  },
  message: message || `${min} 이상 ${max} 이하`,
});

/**
 * 정규식 패턴 검증
 */
export const pattern = (regex: RegExp, message: string): ValidationRule => ({
  validate: (value) => {
    const stringValue = String(value || '');
    return {
      isValid: !stringValue || regex.test(stringValue),
      message: stringValue && !regex.test(stringValue) ? message : undefined,
    };
  },
  message,
});

/**
 * 전화번호 형식 검증
 */
export const phoneNumber = (
  message: string = '올바른 전화번호 형식이 아닙니다'
): ValidationRule => ({
  validate: (value) => {
    const phoneRegex = /^[0-9-+\s()]+$/;
    const stringValue = String(value || '');
    return {
      isValid: !stringValue || phoneRegex.test(stringValue),
      message:
        stringValue && !phoneRegex.test(stringValue) ? message : undefined,
    };
  },
  message,
});

/**
 * 한국어 이름 검증
 */
export const koreanName = (
  message: string = '한글 이름만 입력 가능합니다'
): ValidationRule => ({
  validate: (value) => {
    const koreanRegex = /^[가-힣\s]+$/;
    const stringValue = String(value || '');
    return {
      isValid: !stringValue || koreanRegex.test(stringValue),
      message:
        stringValue && !koreanRegex.test(stringValue) ? message : undefined,
    };
  },
  message,
});

/**
 * 여러 검증 규칙을 조합하여 검증
 */
export const validate = <T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  for (const rule of rules) {
    const result = rule.validate(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * 폼 전체 데이터 검증
 */
export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, ValidationRule[]>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const field in rules) {
    if (Object.prototype.hasOwnProperty.call(rules, field)) {
      const fieldRules = rules[field];
      const result = validate(data[field], fieldRules);
      if (!result.isValid) {
        errors[field as keyof T] = result.message;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};

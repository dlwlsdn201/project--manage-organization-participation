// Member entity business logic
import { Member, InitialMember } from '../index';
import {
  MEMBER_STATUSES,
  GENDER_OPTIONS,
  SEOUL_DISTRICTS,
} from '@/shared/lib/constants';
import { required, range, koreanName } from '@/shared/lib/validation';

/**
 * 멤버 유효성 검사
 */
export const validateMember = (member: Member) => {
  const errors: string[] = [];

  // 이름 검증
  const nameRules = [required('이름은 필수입니다'), koreanName()];
  for (const rule of nameRules) {
    const result = rule.validate(member.name);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 성별 검증
  if (member.gender && !GENDER_OPTIONS.some((g) => g.value === member.gender)) {
    errors.push('유효하지 않은 성별입니다');
  }

  // 출생년도 검증
  const birthYearRules = [
    required('출생년도는 필수입니다'),
    range(1900, new Date().getFullYear(), '올바른 출생년도를 입력해주세요'),
  ];
  for (const rule of birthYearRules) {
    const result = rule.validate(member.birthYear);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 지역 검증
  if (
    member.district &&
    !SEOUL_DISTRICTS.some((district) => district === member.district)
  ) {
    errors.push('유효하지 않은 거주 지역입니다');
  }

  // 상태 검증
  if (
    member.status &&
    !MEMBER_STATUSES.some((s) => s.value === member.status)
  ) {
    errors.push('유효하지 않은 멤버 상태입니다');
  }

  return { errors, isValid: errors.length === 0 };
};

/**
 * 초기 멤버 데이터 유효성 검사
 */
export const validateInitialMember = (
  member: Partial<InitialMember>
): string[] => {
  const errors: string[] = [];

  // 이름 검증
  const nameRules = [required('이름은 필수입니다'), koreanName()];
  for (const rule of nameRules) {
    const result = rule.validate(member.name);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 성별 검증
  if (
    !member.gender ||
    !GENDER_OPTIONS.some((g) => g.value === member.gender)
  ) {
    errors.push('성별을 선택해주세요');
  }

  // 출생년도 검증
  const birthYearRules = [
    required('출생년도는 필수입니다'),
    range(1900, new Date().getFullYear(), '올바른 출생년도를 입력해주세요'),
  ];
  for (const rule of birthYearRules) {
    const result = rule.validate(member.birthYear);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 지역 검증
  if (
    !member.district ||
    !SEOUL_DISTRICTS.some((district) => district === member.district)
  ) {
    errors.push('거주 지역을 선택해주세요');
  }

  return errors;
};

/**
 * 멤버 상태 라벨 가져오기
 */
export const getMemberStatusLabel = (status: Member['status']): string => {
  const statusOption = MEMBER_STATUSES.find((s) => s.value === status);
  return statusOption ? statusOption.label : '알 수 없음';
};

/**
 * 멤버 상태 색상 가져오기
 */
export const getMemberStatusColor = (status: Member['status']): string => {
  const statusOption = MEMBER_STATUSES.find((s) => s.value === status);
  return statusOption?.color || 'gray';
};

/**
 * 성별 라벨 가져오기
 */
export const getGenderLabel = (gender: Member['gender']): string => {
  const genderOption = GENDER_OPTIONS.find((g) => g.value === gender);
  return genderOption ? genderOption.label : '알 수 없음';
};

/**
 * 나이 계산
 */
export const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear;
};

/**
 * 멤버 통계 계산
 */
export const calculateMemberStats = (members: Member[]) => {
  const total = members.length;
  const active = members.filter((m) => m.status === 'active').length;
  const inactive = members.filter((m) => m.status === 'inactive').length;
  const pending = members.filter((m) => m.status === 'pending').length;

  // 성별 통계
  const genderStats = GENDER_OPTIONS.map((gender) => ({
    gender: gender.value,
    label: gender.label,
    count: members.filter((m) => m.gender === gender.value).length,
  }));

  // 지역 통계 (상위 5개)
  const districtStats = SEOUL_DISTRICTS.map((district) => ({
    district,
    count: members.filter((m) => m.district === district).length,
  }))
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 연령대 통계
  const ageGroups = [
    { min: 0, max: 19, label: '10대' },
    { min: 20, max: 29, label: '20대' },
    { min: 30, max: 39, label: '30대' },
    { min: 40, max: 49, label: '40대' },
    { min: 50, max: 59, label: '50대' },
    { min: 60, max: 99, label: '60대 이상' },
  ];

  const ageStats = ageGroups.map((ageGroup) => ({
    ...ageGroup,
    count: members.filter((member) => {
      const age = calculateAge(member.birthYear);
      return age >= ageGroup.min && age <= ageGroup.max;
    }).length,
  }));

  return {
    total,
    active,
    inactive,
    pending,
    genderStats,
    districtStats,
    ageStats,
  };
};

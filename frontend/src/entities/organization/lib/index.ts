// Organization entity business logic
import { Organization } from '../index';
import {
  ORGANIZATION_TYPES,
  PARTICIPATION_RULES,
} from '../../../shared/lib/constants';
import {
  required,
  minLength,
  maxLength,
  range,
} from '../../../shared/lib/validation';

/**
 * 조직 유효성 검사
 */
export const validateOrganization = (
  organization: Omit<
    Organization,
    '_id' | 'createdAt' | 'updatedAt' | 'currentMembers'
  >
) => {
  const errors: string[] = [];

  // 이름 검증
  const nameRules = [
    required('조직명은 필수입니다.'),
    minLength(2, '조직명은 2자 이상이어야 합니다.'),
  ];
  for (const rule of nameRules) {
    const result = rule.validate(organization.name);
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  }

  // 설명 검증
  if (organization.description) {
    const descResult = maxLength(
      500,
      '설명은 500자 이하로 입력해주세요.'
    ).validate(organization.description);
    if (!descResult.isValid && descResult.message) {
      errors.push(descResult.message);
    }
  }

  // 타입 검증
  const typeResult = required('조직 유형은 필수입니다.').validate(
    organization.type
  );
  if (!typeResult.isValid && typeResult.message) {
    errors.push(typeResult.message);
  }

  // 최대 인원 검증
  if (organization.maxMembers !== undefined) {
    const maxMembersResult = range(
      1,
      1000,
      '최대 인원은 1에서 1000 사이여야 합니다.'
    ).validate(organization.maxMembers);
    if (!maxMembersResult.isValid && maxMembersResult.message) {
      errors.push(maxMembersResult.message);
    }
  }

  if (organization.type) {
    let validType = false;
    for (const t of ORGANIZATION_TYPES) {
      if (t.value === organization.type) {
        validType = true;
        break;
      }
    }
    if (!validType) {
      errors.push('유효하지 않은 조직 유형입니다.');
    }
  }

  if (organization.settings?.participationRule) {
    let validRule = false;
    for (const r of PARTICIPATION_RULES) {
      if (r.value === organization.settings.participationRule) {
        validRule = true;
        break;
      }
    }
    if (!validRule) {
      errors.push('유효하지 않은 참여 규칙입니다.');
    }
  }

  return { errors, isValid: errors.length === 0 };
};

/**
 * 조직 타입 라벨 가져오기
 */
export const getOrganizationTypeLabel = (
  type: Organization['type']
): string => {
  for (const t of ORGANIZATION_TYPES) {
    if (t.value === type) {
      return t.label;
    }
  }
  return '알 수 없음';
};

/**
 * 참여 규칙 라벨 가져오기
 */
export const getParticipationRuleLabel = (
  rule: Organization['settings']['participationRule']
): string => {
  for (const r of PARTICIPATION_RULES) {
    if (r.value === rule) {
      return r.label;
    }
  }
  return '알 수 없음';
};

/**
 * 초기 조직 데이터 생성
 */
export const createInitialOrganization = (
  createdBy: string
): Omit<Organization, '_id' | 'createdAt' | 'updatedAt' | 'currentMembers'> => {
  return {
    name: '',
    description: '',
    type: 'club',
    maxMembers: 100,
    settings: {
      participationRule: '제한없음',
    },
    createdBy: createdBy,
  };
};

/**
 * 조직 상태 계산
 */
export const calculateOrganizationStatus = (organization: Organization) => {
  const isActive = organization.currentMembers > 0;
  const isFull = organization.maxMembers
    ? organization.currentMembers >= organization.maxMembers
    : false;

  return {
    isActive,
    isFull,
    canAcceptMembers: !isFull,
    memberRatio: organization.maxMembers
      ? (organization.currentMembers / organization.maxMembers) * 100
      : 0,
  };
};

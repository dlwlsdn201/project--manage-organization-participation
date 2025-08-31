import { Member } from '@/entities';
import { InitialMember } from '@/entities/member/index';

/**
 * 구성원 데이터의 유효성을 검증하는 함수
 * @param members - 검증할 구성원 데이터 배열
 * @returns 모든 구성원 데이터가 유효하면 true, 하나라도 유효하지 않으면 false
 */
export const validateMembersData = (members: InitialMember[]): boolean => {
  if (!Array.isArray(members) || members.length === 0) {
    return false;
  }

  return members.every(validateMemberData);
};

/**
 * 개별 구성원 데이터의 유효성을 검증하는 함수
 * @param member - 검증할 구성원 데이터
 * @returns 구성원 데이터가 유효하면 true, 유효하지 않으면 false
 */
export const validateMemberData = (member: InitialMember): boolean => {
  if (!member) {
    return false;
  }

  const hasName = Boolean(member.name && member.name.trim() !== '');
  const hasGender = Boolean(
    member.gender && ['male', 'female'].includes(member.gender)
  );
  const hasDistrict = Boolean(member.district && member.district.trim() !== '');
  const hasBirthYear = Boolean(
    member.birthYear &&
      typeof member.birthYear === 'number' &&
      member.birthYear >= 1900 &&
      member.birthYear <= new Date().getFullYear()
  );

  return hasName && hasGender && hasDistrict && hasBirthYear;
};

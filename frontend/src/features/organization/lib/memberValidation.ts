import { Member } from '@/entities';
import { InitialMember } from '@/entities/member';

/**
 * 멤버 데이터 필수 필드 검증
 */
export const validateMemberFields = (member: Partial<Member>): boolean => {
  return !!(member.name && member.district && member.birthYear);
};

/**
 * 새 멤버 데이터 유효성 검증
 */
export const validateNewMembers = (members: InitialMember[]): boolean => {
  if (members.length === 0) return true;
  
  return members.every((member) => {
    // 모든 필드가 비어있으면 유효한 것으로 간주 (입력 전 상태)
    if (!member.name && !member.district && !member.birthYear) {
      return true;
    }
    // 하나라도 입력되었다면 모든 필수 필드가 있어야 함
    return !!(member.name && member.district && member.birthYear);
  });
};

/**
 * 편집된 멤버 데이터 유효성 검증
 */
export const validateEditedMembers = (
  editedMembers: Map<string, Partial<Member>>,
  organizationMembers: Member[]
): boolean => {
  for (const [memberId, changes] of editedMembers.entries()) {
    const existingMember = organizationMembers.find((m) => m._id === memberId);
    if (!existingMember) continue;

    const updatedMember = { ...existingMember, ...changes };
    if (!validateMemberFields(updatedMember)) {
      return false;
    }
  }
  return true;
};


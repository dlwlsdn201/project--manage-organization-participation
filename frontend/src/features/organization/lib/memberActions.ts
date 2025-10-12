import { message } from 'antd';
import { Member, Organization } from '@/entities';
import { InitialMember } from '@/entities/member';
import { validateMemberFields } from '@/features/organization/lib/memberValidation';

/**
 * 새 멤버 추가 처리
 */
export const handleAddNewMember = async (
  memberData: InitialMember,
  organization: Organization,
  addMember: (member: Omit<Member, '_id'>) => Promise<Member>
): Promise<boolean> => {
  if (!memberData.name || !memberData.district || !memberData.birthYear) {
    message.error('이름, 출생년도, 지역은 필수 입력 항목입니다.');
    return false;
  }

  try {
    await addMember({
      name: memberData.name,
      gender: memberData.gender!,
      birthYear: memberData.birthYear,
      district: memberData.district,
      organizationId: organization._id,
      status: 'active',
      joinedAt: new Date(),
      updatedAt: new Date(),
    });
    message.success('구성원이 추가되었습니다.');
    return true;
  } catch {
    message.error('구성원 추가 중 오류가 발생했습니다.');
    return false;
  }
};

/**
 * 기존 멤버 수정 처리
 */
export const handleUpdateExistingMember = async (
  memberId: string,
  changes: Partial<Member>,
  organizationMembers: Member[],
  updateMember: (member: Member) => Promise<Member>
): Promise<boolean> => {
  if (!changes || Object.keys(changes).length === 0) {
    message.info('변경사항이 없습니다.');
    return false;
  }

  const existingMember = organizationMembers.find((m) => m._id === memberId);
  if (!existingMember) {
    message.error('구성원을 찾을 수 없습니다.');
    return false;
  }

  const updatedMember = { ...existingMember, ...changes };
  if (!validateMemberFields(updatedMember)) {
    message.error('이름, 출생년도, 지역은 필수 입력 항목입니다.');
    return false;
  }

  try {
    await updateMember(updatedMember);
    message.success('구성원 정보가 수정되었습니다.');
    return true;
  } catch {
    message.error('구성원 수정 중 오류가 발생했습니다.');
    return false;
  }
};

/**
 * 모든 멤버 저장 처리 (일괄 저장)
 */
export const handleSaveAllMembers = async (
  newMembers: InitialMember[],
  editedMembers: Map<string, Partial<Member>>,
  organizationMembers: Member[],
  organization: Organization,
  addMember: (member: Omit<Member, '_id'>) => Promise<Member>,
  updateMember: (member: Member) => Promise<Member>
): Promise<{ success: boolean; addedCount: number; updatedCount: number }> => {
  let addedCount = 0;
  let updatedCount = 0;

  try {
    // 1. 새로운 구성원들 처리
    const validNewMembers = newMembers.filter(
      (member) => member.name && member.district && member.birthYear
    );

    const addPromises = validNewMembers.map((memberData) =>
      addMember({
        name: memberData.name!,
        gender: memberData.gender!,
        birthYear: memberData.birthYear!,
        district: memberData.district!,
        organizationId: organization._id,
        status: 'active',
        joinedAt: new Date(),
        updatedAt: new Date(),
      })
    );
    await Promise.all(addPromises);
    addedCount = validNewMembers.length;

    // 2. 기존 구성원들의 변경사항 처리
    const updatePromises = [];
    for (const [memberId, changes] of editedMembers.entries()) {
      const existingMember = organizationMembers.find(
        (m) => m._id === memberId
      );
      if (existingMember && Object.keys(changes).length > 0) {
        const updatedMember = { ...existingMember, ...changes };
        if (validateMemberFields(updatedMember)) {
          updatePromises.push(updateMember(updatedMember));
        }
      }
    }
    await Promise.all(updatePromises);
    updatedCount = updatePromises.length;

    // 성공 메시지
    const messages = [];
    if (addedCount > 0) messages.push(`${addedCount}명 추가`);
    if (updatedCount > 0) messages.push(`${updatedCount}명 수정`);

    if (messages.length > 0) {
      message.success(`구성원 정보가 저장되었습니다. (${messages.join(', ')})`);
    } else {
      message.info('저장할 변경사항이 없습니다.');
    }

    return { success: true, addedCount, updatedCount };
  } catch (error) {
    console.error('구성원 저장 오류:', error);
    message.error('구성원 저장 중 오류가 발생했습니다.');
    return { success: false, addedCount, updatedCount };
  }
};

/**
 * 멤버 삭제 처리
 */
export const handleDeleteMemberAction = async (
  memberId: string,
  deleteMember: (memberId: string) => Promise<void>
): Promise<boolean> => {
  try {
    await deleteMember(memberId);
    message.success('구성원이 삭제되었습니다.');
    return true;
  } catch {
    message.error('구성원 삭제 중 오류가 발생했습니다.');
    return false;
  }
};

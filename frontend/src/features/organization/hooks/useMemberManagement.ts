import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAppStore } from '@/store/useAppStore';
import { Organization, Member } from '@/entities';
import { InitialMember } from '@/entities/member/index';
import { validateMembersData } from '@/features/organization/util/validate';
import { sortMembers } from '@/features/organization/util/sort';
import { defaultMemberValues } from '@/features/organization/config/formConfig';

interface UseMemberManagementProps {
  organization?: Organization | null;
}

export const useMemberManagement = ({
  organization,
}: UseMemberManagementProps) => {
  const { members, addMember, deleteMember } = useAppStore();
  const [memberLoading, setMemberLoading] = useState(false);
  const [newMembers, setNewMembers] = useState<InitialMember[]>([]);
  const [editing, setEditing] = useState(false);

  const organizationMembers = organization
    ? members.filter((m) => m.organizationId === organization._id)
    : [];

  // 기존 구성원 + 새로 추가할 구성원들을 합친 데이터
  const allMembers = sortMembers([
    ...newMembers.map((member, index) => ({
      ...member,
      _id: `new-${index}`, // 임시 ID
      organizationId: organization?._id || '',
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...organizationMembers,
  ]);

  // 새 멤버 행 추가
  const handleAddNewRow = () => {
    const newMember: InitialMember = {
      name: '',
      ...defaultMemberValues,
      district: '',
    };
    setNewMembers((prev) => [...prev, newMember]);
  };

  // 개별 행 저장
  const handleSaveInlineRow = async (key: string) => {
    if (!organization) return;

    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      const memberData = newMembers[index];

      if (!memberData.name || !memberData.district || !memberData.birthYear) {
        message.error('이름, 출생년도, 지역은 필수 입력 항목입니다.');
        return;
      }

      try {
        await addMember({
          name: memberData.name!,
          gender: memberData.gender!,
          birthYear: memberData.birthYear!,
          district: memberData.district!,
          organizationId: organization._id,
        });

        // 새 구성원 목록에서 제거
        setNewMembers((prev) => prev.filter((_, i) => i !== index));
        message.success('구성원이 추가되었습니다.');
      } catch (error) {
        message.error('구성원 추가 중 오류가 발생했습니다.');
      }
    } else {
      // 기존 구성원 수정 로직은 추후 구현
    }
  };

  // 인라인 편집 취소
  const handleCancelInlineEdit = (key: string) => {
    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      setNewMembers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 인라인 편집 필드 변경
  const handleInlineFieldChange = (
    key: string,
    field: keyof Member,
    value: any
  ) => {
    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      setNewMembers((prev) =>
        prev.map((member, i) =>
          i === index ? { ...member, [field]: value } : member
        )
      );
    }
  };

  // 모든 새 멤버 저장
  const handleSaveAllNewMembers = async () => {
    if (!organization || newMembers.length === 0) return;

    // 현재 편집 중인 행이 있는지 확인
    if (!checkValidMemberInputData()) {
      message.warning(
        '편집 중인 행이 있습니다. 먼저 개별 저장하거나 취소해주세요.'
      );
      return;
    }

    setMemberLoading(true);
    try {
      const validMembers = newMembers.filter(
        (member) => member.name && member.district && member.birthYear
      );

      if (validMembers.length === 0) {
        message.error('저장할 유효한 구성원이 없습니다.');
        setMemberLoading(false);
        return;
      }

      if (validMembers.length !== newMembers.length) {
        const incompleteCount = newMembers.length - validMembers.length;
        message.error(
          `${incompleteCount}개 행의 정보가 불완전합니다. 이름, 출생년도, 지역은 필수 항목입니다.`
        );
        setMemberLoading(false);
        return;
      }

      for (const memberData of validMembers) {
        await addMember({
          name: memberData.name!,
          gender: memberData.gender!,
          birthYear: memberData.birthYear!,
          district: memberData.district!,
          organizationId: organization._id,
        });
      }

      setNewMembers([]);
      message.success(`${validMembers.length}명의 구성원이 추가되었습니다.`);
    } catch (error) {
      message.error('구성원 추가 중 오류가 발생했습니다.');
    } finally {
      setMemberLoading(false);
    }
  };

  // 멤버 삭제
  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember(memberId);
      message.success('구성원이 삭제되었습니다.');
    } catch (error) {
      message.error('구성원 삭제 중 오류가 발생했습니다.');
    }
  };

  // 멤버 입력 데이터 검증
  const checkValidMemberInputData = () => {
    if (validateMembersData(newMembers)) {
      setEditing(false);
      return true;
    } else {
      setEditing(true);
      return false;
    }
  };

  // newMembers 상태에 따른 editing 상태 관리
  useEffect(() => {
    if (newMembers.length === 0) {
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [newMembers]);

  return {
    // 상태
    memberLoading,
    newMembers,
    editing,
    organizationMembers,
    allMembers,

    // 액션들
    handleAddNewRow,
    handleSaveInlineRow,
    handleCancelInlineEdit,
    handleInlineFieldChange,
    handleSaveAllNewMembers,
    handleDeleteMember,
    checkValidMemberInputData,
  };
};

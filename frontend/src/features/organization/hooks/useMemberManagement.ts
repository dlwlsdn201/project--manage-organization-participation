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
  const { members, addMember, updateMember, deleteMember } = useAppStore();
  const [memberLoading, setMemberLoading] = useState(false);
  const [newMembers, setNewMembers] = useState<InitialMember[]>([]);
  const [editedMembers, setEditedMembers] = useState<
    Map<string, Partial<Member>>
  >(new Map());
  const [editing, setEditing] = useState(false);

  const organizationMembers = organization
    ? members.filter((m) => m?.organizationId === organization._id)
    : [];

  // 기존 구성원 + 새로 추가할 구성원들을 합친 데이터
  const allMembers = sortMembers([
    ...newMembers.map((member, index) => ({
      ...member,
      _id: `new-${index}`, // 임시 ID
      organizationId: organization?._id || '',
      status: 'active' as const,
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

  const handleEditRow = (memberId: string) => {
    // 기존 구성원을 편집 모드로 변경
    if (!editedMembers.has(memberId)) {
      setEditedMembers((prev) => {
        const newMap = new Map(prev);
        newMap.set(memberId, {}); // 빈 변경사항으로 시작
        return newMap;
      });
    }
    setEditing(true);
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
          status: 'active',
          joinedAt: new Date(),
        });

        // 새 구성원 목록에서 제거
        setNewMembers((prev) => prev.filter((_, i) => i !== index));
        message.success('구성원이 추가되었습니다.');
      } catch {
        message.error('구성원 추가 중 오류가 발생했습니다.');
      }
    } else {
      // 기존 구성원 수정 처리
      const changes = editedMembers.get(key);
      if (!changes || Object.keys(changes).length === 0) {
        message.info('변경사항이 없습니다.');
        return;
      }

      const existingMember = organizationMembers.find((m) => m._id === key);
      if (!existingMember) {
        message.error('구성원을 찾을 수 없습니다.');
        return;
      }

      const updatedMember = { ...existingMember, ...changes };
      if (
        !updatedMember.name ||
        !updatedMember.district ||
        !updatedMember.birthYear
      ) {
        message.error('이름, 출생년도, 지역은 필수 입력 항목입니다.');
        return;
      }

      try {
        await updateMember(updatedMember);

        // 편집된 멤버 목록에서 제거
        setEditedMembers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });

        message.success('구성원 정보가 수정되었습니다.');
      } catch {
        message.error('구성원 수정 중 오류가 발생했습니다.');
      }
    }
  };

  // 인라인 편집 취소
  const handleCancelInlineEdit = (key: string) => {
    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      setNewMembers((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 기존 구성원의 편집 변경사항 취소
      setEditedMembers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  };

  // 인라인 편집 필드 변경
  const handleInlineFieldChange = (
    key: string,
    field: keyof Member,
    value: unknown
  ) => {
    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      setNewMembers((prev) =>
        prev.map((member, i) =>
          i === index ? { ...member, [field]: value } : member
        )
      );
    } else {
      // 기존 구성원의 변경사항 추적
      setEditedMembers((prev) => {
        const newMap = new Map(prev);
        const existingChanges = newMap.get(key) || {};
        newMap.set(key, { ...existingChanges, [field]: value });
        return newMap;
      });
    }
  };

  // 모든 멤버 저장
  const handleSaveAll = async () => {
    if (!organization) return;

    // 현재 편집 중인 행이 있는지 확인
    if (!checkValidMemberInputData()) {
      message.warning(
        '편집 중인 행이 있습니다. 먼저 개별 저장하거나 취소해주세요.'
      );
      return;
    }

    setMemberLoading(true);
    try {
      let addedCount = 0;
      let updatedCount = 0;

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
          // 필수 필드 검증
          const updatedMember = { ...existingMember, ...changes };
          if (
            updatedMember.name &&
            updatedMember.district &&
            updatedMember.birthYear
          ) {
            updatePromises.push(updateMember(updatedMember));
          }
        }
      }
      await Promise.all(updatePromises);
      updatedCount = updatePromises.length;

      // 상태 초기화 (새 멤버만 초기화, 편집 모드는 유지)
      setNewMembers([]);
      setEditedMembers(new Map());
      // 편집 모드는 유지하여 연속으로 멤버 추가 가능

      // 성공 메시지
      const messages = [];
      if (addedCount > 0) messages.push(`${addedCount}명 추가`);
      if (updatedCount > 0) messages.push(`${updatedCount}명 수정`);

      if (messages.length > 0) {
        message.success(
          `구성원 정보가 저장되었습니다. (${messages.join(', ')})`
        );
      } else {
        message.info('저장할 변경사항이 없습니다.');
      }
    } catch (error) {
      console.error('구성원 저장 오류:', error);
      message.error('구성원 저장 중 오류가 발생했습니다.');
    } finally {
      setMemberLoading(false);
    }
  };

  // 멤버 삭제
  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember(memberId);
      message.success('구성원이 삭제되었습니다.');
    } catch {
      message.error('구성원 삭제 중 오류가 발생했습니다.');
    }
  };

  // 편집 모드 종료
  const handleCancelEditing = () => {
    setEditing(false);
    setNewMembers([]);
    setEditedMembers(new Map());
    message.info('편집이 취소되었습니다.');
  };

  // 멤버 입력 데이터 검증
  const checkValidMemberInputData = () => {
    // 새로운 멤버들의 유효성 검증
    const newMembersValid = validateMembersData(newMembers);

    // 편집 중인 기존 멤버들이 있는지 확인
    const hasEditedMembers = editedMembers.size > 0;

    if (newMembersValid && !hasEditedMembers) {
      setEditing(false);
      return true;
    } else {
      setEditing(true);
      return false;
    }
  };

  // newMembers와 editedMembers 상태에 따른 editing 상태 관리
  useEffect(() => {
    if (newMembers.length === 0 && editedMembers.size === 0) {
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [newMembers, editedMembers]);

  return {
    // 상태
    memberLoading,
    newMembers,
    editing,
    organizationMembers,
    allMembers,
    editedMembers,

    // 액션들
    handleAddNewRow,
    handleEditRow,
    handleSaveInlineRow,
    handleCancelInlineEdit,
    handleInlineFieldChange,
    handleSaveAll,
    handleDeleteMember,
    handleCancelEditing,
    checkValidMemberInputData,
  };
};

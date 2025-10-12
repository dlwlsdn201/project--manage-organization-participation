import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAppInit } from '@/app/model/useAppInit';
import { useMemberStore } from '@/features/organization/lib/member-store';
import { Organization, Member } from '@/entities';
import { InitialMember } from '@/entities/member/index';
import { validateMembersData } from '@/features/organization/util/validate';
import { defaultMemberValues } from '@/features/organization/config/formConfig';
import {
  handleAddNewMember,
  handleUpdateExistingMember,
  handleSaveAllMembers,
  handleDeleteMemberAction,
} from '@/features/organization/lib/memberActions';

interface UseMemberManagementProps {
  organization?: Organization | null;
}

/**
 * 멤버 관리 Hook
 * - 멤버 추가/수정/삭제
 * - 인라인 편집 기능
 * - 일괄 저장 기능
 */
export const useMemberManagement = ({
  organization,
}: UseMemberManagementProps) => {
  const { members } = useMemberStore();
  const { addMember, updateMember, deleteMember } = useAppInit();
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
  const allMembers = [
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
  ];

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

      const success = await handleAddNewMember(
        memberData,
        organization,
        addMember
      );
      if (success) {
        setNewMembers((prev) => prev.filter((_, i) => i !== index));
      }
    } else {
      const changes = editedMembers.get(key);
      if (!changes) return;

      const success = await handleUpdateExistingMember(
        key,
        changes,
        organizationMembers,
        updateMember
      );
      if (success) {
        setEditedMembers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
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
    const result = await handleSaveAllMembers(
      newMembers,
      editedMembers,
      organizationMembers,
      organization,
      addMember,
      updateMember
    );

    if (result.success) {
      setNewMembers([]);
      setEditedMembers(new Map());
    }
    setMemberLoading(false);
  };

  // 멤버 삭제
  const handleDeleteMember = async (memberId: string) => {
    await handleDeleteMemberAction(memberId, deleteMember);
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

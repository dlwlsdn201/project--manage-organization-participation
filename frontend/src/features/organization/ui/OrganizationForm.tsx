import { Tabs } from 'antd';
import { Organization } from '@/entities';
import { useOrganizationForm } from '../hooks/useOrganizationForm';
import { useMemberManagement } from '../hooks/useMemberManagement';
import { OrganizationBasicForm } from './OrganizationBasicForm';
import { MemberTable } from './MemberTable';
import { createTabItems } from '../config/tabConfig';

export interface OrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const OrganizationForm = ({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) => {
  // 조직 폼 로직
  const { form, loading, handleSubmit } = useOrganizationForm({
    organization,
    onSuccess,
  });

  // 멤버 관리 로직
  const {
    memberLoading,
    newMembers,
    editing,
    organizationMembers,
    allMembers,
    editedMembers,
    handleAddNewRow,
    handleEditRow,
    handleSaveInlineRow,
    handleCancelInlineEdit,
    handleInlineFieldChange,
    handleSaveAll,
    handleDeleteMember,
    handleCancelEditing,
  } = useMemberManagement({ organization });

  // 기본 정보 폼 컴포넌트
  const basicFormComponent = (
    <OrganizationBasicForm
      form={form}
      loading={loading}
      isEdit={!!organization}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );

  // 멤버 관리 컴포넌트 (조직이 있을 때만)
  const memberManagementComponent = organization ? (
    <MemberTable
      allMembers={allMembers}
      organizationMembersCount={organizationMembers.length}
      newMembersCount={newMembers.length}
      editing={editing}
      memberLoading={memberLoading}
      editedMembers={editedMembers}
      onAddNewRow={handleAddNewRow}
      onEditRow={handleEditRow}
      onSaveAll={handleSaveAll}
      onFieldChange={handleInlineFieldChange}
      onSaveRow={handleSaveInlineRow}
      onCancelEdit={handleCancelInlineEdit}
      onDeleteMember={handleDeleteMember}
      onCancelEditing={handleCancelEditing}
    />
  ) : undefined;

  // 탭 아이템 생성
  const tabItems = createTabItems(
    basicFormComponent,
    memberManagementComponent,
    allMembers.length
  );

  return (
    <>
      <Tabs items={tabItems} />
    </>
  );
};

import { Table, Space } from 'antd';
import { Plus } from 'lucide-react';
import { Member } from '@/entities';
import { createMemberColumns } from '@/features/organization/config/tableColumns';
import { DefaultButton } from '@/shared/ui/Button';

interface MemberTableProps {
  allMembers: Member[];
  organizationMembersCount: number;
  newMembersCount: number;
  editing: boolean;
  memberLoading: boolean;
  editedMembers: Map<string, Partial<Member>>;
  onAddNewRow: () => void;
  onEditRow: (memberId: string) => void;
  onSaveAll: () => void;
  onFieldChange: (key: string, field: keyof Member, value: unknown) => void;
  onSaveRow: (key: string) => void;
  onCancelEdit: (key: string) => void;
  onDeleteMember: (memberId: string) => void;
  onCancelEditing: () => void;
}

export const MemberTable = ({
  allMembers,
  organizationMembersCount,
  newMembersCount,
  editing,
  memberLoading,
  editedMembers,
  onAddNewRow,
  onEditRow,
  onSaveAll,
  onFieldChange,
  onSaveRow,
  onCancelEdit,
  onDeleteMember,
  onCancelEditing,
}: MemberTableProps) => {
  const memberColumns = createMemberColumns({
    editing,
    editedMembers,
    onFieldChange,
    onSaveRow,
    onEditRow,
    onCancelEdit,
    onDeleteMember,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-row mobile:flex-col justify-between items-start mobile:items-start gap-2 ">
        <h3 className="text-base mobile:text-lg font-semibold shrink-0">
          구성원 목록
          <span className="text-xs mobile:text-sm text-gray-500 ml-2 block mobile:inline">
            ({organizationMembersCount}명 등록됨
            {newMembersCount > 0 && `, ${newMembersCount}명 추가 예정`})
          </span>
        </h3>
        <Space className="w-full flex-row justify-end">
          {!editing ? (
            <DefaultButton
              icon={<Plus size={16} />}
              type="primary"
              onClick={onAddNewRow}
              className="w-full mobile:w-auto"
            >
              신규 추가
            </DefaultButton>
          ) : (
            <>
              <DefaultButton icon={<Plus size={16} />} onClick={onAddNewRow}>
                추가
              </DefaultButton>
              <DefaultButton
                type="primary"
                loading={memberLoading}
                onClick={onSaveAll}
                disabled={newMembersCount === 0}
              >
                모두 저장
              </DefaultButton>
              <DefaultButton onClick={onCancelEditing}>취소</DefaultButton>
            </>
          )}
        </Space>
      </div>

      {newMembersCount > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs mobile:text-sm text-blue-700 mb-2">
            💡 <strong>인라인 편집 모드</strong>
          </div>
          <div className="text-xs text-blue-600">
            • 테이블에서 직접 정보를 입력하세요
            <br />
            • 각 행의 "저장" 버튼으로 개별 저장하거나
            <br />
            • 편집을 완료한 후 "모두 저장" 버튼으로 한번에 저장할 수 있습니다
            <br />• ⚠️ 편집 중인 행이 있으면 "모두 저장"이 제한됩니다
            <br />• 📝 <strong>필수 입력:</strong> 이름, 출생년도, 지역
          </div>
        </div>
      )}

      <Table
        dataSource={allMembers}
        columns={memberColumns}
        rowKey="_id"
        pagination={false}
        size="small"
        scroll={{ x: 'max-content', y: 400 }}
        rowClassName={(record) =>
          record._id.startsWith('new-') ? 'bg-green-50' : ''
        }
      />
    </div>
  );
};

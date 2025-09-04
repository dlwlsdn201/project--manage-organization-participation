import { Button, Input, Select, Space, Popconfirm } from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import { Member } from '@/entities';

const { Option } = Select;

interface TableColumnConfig {
  editing: boolean;
  editedMembers: Map<string, Partial<Member>>;
  onFieldChange: (key: string, field: keyof Member, value: any) => void;
  onSaveRow: (key: string) => void;
  onEditRow: (key: string) => void;
  onCancelEdit: (key: string) => void;
  onDeleteMember: (memberId: string) => void;
}

export const createMemberColumns = ({
  editing,
  editedMembers,
  onFieldChange,
  onSaveRow,
  onEditRow,
  onCancelEdit,
  onDeleteMember,
}: TableColumnConfig) => [
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    render: (_: unknown, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      const isBeingEdited = isNewMember || editedMembers.has(record._id);

      if (editing && isBeingEdited) {
        return (
          <Input
            placeholder="이름을 입력하세요"
            defaultValue={record.name}
            onChange={(e) => onFieldChange(record._id, 'name', e.target.value)}
            size="small"
          />
        );
      }
      return record.name || (isNewMember ? '이름을 입력하세요' : record.name);
    },
  },
  {
    title: '성별',
    dataIndex: 'gender',
    key: 'gender',
    render: (_: unknown, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      const isBeingEdited = isNewMember || editedMembers.has(record._id);

      if (editing && isBeingEdited) {
        return (
          <Select
            defaultValue={record.gender || 'male'}
            onChange={(value) => onFieldChange(record._id, 'gender', value)}
            size="small"
            style={{ width: '100%' }}
          >
            <Option value="male">남성</Option>
            <Option value="female">여성</Option>
          </Select>
        );
      }
      return record.gender === 'male' ? '남성' : '여성';
    },
  },
  {
    title: '출생년도',
    dataIndex: 'birthYear',
    key: 'birthYear',
    render: (_: unknown, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      const isBeingEdited = isNewMember || editedMembers.has(record._id);

      if (editing && isBeingEdited) {
        return (
          <Input
            type="number"
            placeholder="YYYY"
            defaultValue={record.birthYear}
            min={1950}
            max={new Date().getFullYear()}
            onChange={(e) =>
              onFieldChange(
                record._id,
                'birthYear',
                parseInt(e.target.value) || ''
              )
            }
            size="small"
            style={{ width: '80px' }}
          />
        );
      }
      return record.birthYear || (isNewMember ? 'YYYY' : record.birthYear);
    },
  },
  {
    title: '지역',
    dataIndex: 'district',
    key: 'district',
    render: (_: unknown, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      const isBeingEdited = isNewMember || editedMembers.has(record._id);

      if (editing && isBeingEdited) {
        return (
          <Input
            placeholder="지역을 입력하세요"
            defaultValue={record.district}
            onChange={(e) =>
              onFieldChange(record._id, 'district', e.target.value)
            }
            size="small"
          />
        );
      }
      return (
        record.district || (isNewMember ? '지역을 입력하세요' : record.district)
      );
    },
  },
  {
    title: '나이',
    key: 'age',
    sorter: (a: Member, b: Member) =>
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    render: (_: unknown, record: Member) => {
      if (record.birthYear) {
        const age = new Date().getFullYear() - record.birthYear + 1;
        return `${age}세`;
      }
      return '-';
    },
  },
  {
    title: '가입일',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    sorter: (a: Member, b: Member) =>
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    render: (date: Date, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      if (isNewMember) return '오늘';
      return new Date(date).toLocaleDateString();
    },
  },
  {
    title: '작업',
    key: 'actions',
    render: (_: unknown, record: Member) => {
      const isNewMember = record._id.startsWith('new-');
      const isBeingEdited = isNewMember || editedMembers.has(record._id);

      if (editing && isBeingEdited) {
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() => onSaveRow(record._id)}
            >
              저장
            </Button>
            <Button size="small" onClick={() => onCancelEdit(record._id)}>
              취소
            </Button>
          </Space>
        );
      }

      return (
        <Space>
          {!isNewMember && (
            <>
              <Button
                size="small"
                type="default"
                icon={<Edit size={14} />}
                onClick={() => onEditRow(record._id)}
              />
              <Popconfirm
                title="구성원을 삭제하시겠습니까?"
                onConfirm={() => onDeleteMember(record._id)}
                okText="삭제"
                cancelText="취소"
              >
                <Button size="small" danger icon={<Trash2 size={14} />} />
              </Popconfirm>
            </>
          )}
        </Space>
      );
    },
  },
];

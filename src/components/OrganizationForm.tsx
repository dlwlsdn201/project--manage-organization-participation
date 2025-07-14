import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Organization, Member } from '../types';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Typography,
  Card,
  Space,
  Table,
  Popconfirm,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

interface EditableMember extends Member {
  isEditing?: boolean;
  isNew?: boolean;
}

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const {
    members: storeMembers,
    addMember,
    updateMember,
    deleteMember,
  } = useAppStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [dataSource, setDataSource] = useState<EditableMember[]>([]);

  // 현재 조직의 구성원 목록
  const currentMembers = organization
    ? storeMembers.filter((m) => m.organizationId === organization.id)
    : [];

  useEffect(() => {
    if (organization) {
      form.setFieldsValue({
        name: organization.name,
        description: organization.description,
        location: organization.location,
        type: organization.type,
        settings: {
          participationRule:
            organization.settings?.participationRule || '제한없음',
        },
      });
    } else {
      form.setFieldsValue({
        settings: {
          participationRule: '제한없음',
        },
      });
    }
  }, [organization, form]);

  useEffect(() => {
    if (organization) {
      // 가입일 기준 내림차순 정렬
      const sortedMembers = [...currentMembers].sort(
        (a, b) => dayjs(b.joinedAt).valueOf() - dayjs(a.joinedAt).valueOf()
      );
      setDataSource(sortedMembers);
    } else {
      setDataSource([]);
    }
    // Modal이 열릴 때마다 편집 상태 초기화
    setEditingKey('');
  }, [organization, currentMembers]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const orgData: Partial<Organization> = {
        ...values,
        settings: {
          participationRule: values.settings?.participationRule || '제한없음',
        },
      };

      await onSubmit(orgData);
      message.success(
        organization ? '조직이 수정되었습니다.' : '조직이 생성되었습니다.'
      );
    } catch (error) {
      console.error('Organization submission error:', error);
      message.error('조직 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDataSource([]);
    setEditingKey(''); // editingKey 초기화 추가
    onCancel();
  };

  const isEditing = (record: EditableMember) => record.id === editingKey;

  const edit = (record: EditableMember) => {
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
    // 새로운 행이면 제거
    setDataSource((prev) =>
      prev.filter((item) => !item.isNew || item.id !== editingKey)
    );
  };

  const save = async (id: string) => {
    try {
      const row = dataSource.find((item) => item.id === id);
      if (!row) return;

      const { isEditing, isNew, ...memberData } = row;

      if (
        !memberData.name ||
        !memberData.gender ||
        !memberData.birthYear ||
        !memberData.district
      ) {
        message.error('모든 필수 필드를 입력해주세요.');
        return;
      }

      if (isNew) {
        const newMember: Member = {
          ...memberData,
          organizationId: organization?.id || 'temp',
          status: 'active',
          joinedAt: memberData.joinedAt || new Date(),
          updatedAt: new Date(),
        };

        if (organization) {
          addMember(newMember);
        }

        setDataSource((prev) =>
          prev.map((item) => (item.id === id ? { ...newMember } : item))
        );
      } else {
        const updatedMember: Member = {
          ...memberData,
          updatedAt: new Date(),
        };

        if (organization) {
          updateMember(updatedMember);
        }

        setDataSource((prev) =>
          prev.map((item) => (item.id === id ? updatedMember : item))
        );
      }

      setEditingKey('');
      message.success(
        isNew ? '구성원이 추가되었습니다.' : '구성원이 수정되었습니다.'
      );
    } catch (error) {
      console.error('Save error:', error);
      message.error('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = (id: string) => {
    if (organization) {
      deleteMember(id);
    }
    setDataSource((prev) => prev.filter((item) => item.id !== id));
    message.success('구성원이 삭제되었습니다.');
  };

  const handleAdd = () => {
    const newMember: EditableMember = {
      id: `new_${Date.now()}`,
      name: '',
      gender: 'male',
      birthYear: new Date().getFullYear() - 25,
      district: '',
      organizationId: organization?.id || 'temp',
      status: 'active',
      joinedAt: new Date(),
      updatedAt: new Date(),
      isEditing: true,
      isNew: true,
    };

    setDataSource((prev) => [newMember, ...prev]);
    setEditingKey(newMember.id);
  };

  const handleCellChange = (id: string, field: string, value: any) => {
    setDataSource((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }: any) => {
    let inputNode;

    switch (dataIndex) {
      case 'joinedAt':
        inputNode = (
          <DatePicker
            value={record?.[dataIndex] ? dayjs(record[dataIndex]) : dayjs()}
            onChange={(date) =>
              handleCellChange(record?.id, dataIndex, date?.toDate())
            }
            format="YYYY.MM.DD"
            style={{ width: '100%' }}
          />
        );
        break;
      case 'gender':
        inputNode = (
          <Select
            value={record?.[dataIndex]}
            onChange={(value) => handleCellChange(record?.id, dataIndex, value)}
            style={{ width: '100%' }}
          >
            <Option value="male">남성</Option>
            <Option value="female">여성</Option>
          </Select>
        );
        break;
      case 'birthYear':
        inputNode = (
          <InputNumber
            min={1950}
            max={new Date().getFullYear()}
            value={record?.[dataIndex]}
            onChange={(value) => handleCellChange(record?.id, dataIndex, value)}
            style={{ width: '100%' }}
          />
        );
        break;
      default:
        inputNode = (
          <Input
            value={record?.[dataIndex]}
            onChange={(e) =>
              handleCellChange(record?.id, dataIndex, e.target.value)
            }
          />
        );
    }

    return <td {...restProps}>{editing ? inputNode : children}</td>;
  };

  const columns = [
    {
      title: '가입일',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 120,
      editable: true,
      render: (date: Date) => dayjs(date).format('YYYY.MM.DD'),
      sorter: (a: Member, b: Member) =>
        dayjs(b.joinedAt).valueOf() - dayjs(a.joinedAt).valueOf(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      editable: true,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '성별',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      editable: true,
      render: (gender: 'male' | 'female') => (
        <span>{gender === 'male' ? '남성' : '여성'}</span>
      ),
    },
    {
      title: '나이(년생)',
      dataIndex: 'birthYear',
      key: 'birthYear',
      width: 100,
      editable: true,
      render: (birthYear: number) => (
        <span>
          {birthYear}년생 ({new Date().getFullYear() - birthYear + 1}세)
        </span>
      ),
    },
    {
      title: '거주지',
      dataIndex: 'district',
      key: 'district',
      width: 120,
      editable: true,
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      render: (_: any, record: EditableMember) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              type="link"
              size="small"
              onClick={() => save(record.id)}
            />
            <Button
              icon={<CloseOutlined />}
              type="link"
              size="small"
              onClick={cancel}
            />
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            />
            <Popconfirm
              title="구성원을 삭제하시겠습니까?"
              onConfirm={() => handleDelete(record.id)}
              okText="삭제"
              cancelText="취소"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: EditableMember) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined />
          <span>{organization ? '조직 수정' : '새 조직 생성'}</span>
        </div>
      }
      open={true}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={true}
        style={{ marginTop: 24 }}
      >
        <Card title="기본 정보" style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="조직명"
            rules={[
              { required: true, message: '조직명을 입력해주세요.' },
              { min: 2, message: '조직명은 2자 이상이어야 합니다.' },
              { max: 50, message: '조직명은 50자 이하여야 합니다.' },
            ]}
          >
            <Input
              placeholder="예: 독서모임, 등산동호회, 스터디그룹"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="조직 설명"
            rules={[{ max: 500, message: '설명은 500자 이하여야 합니다.' }]}
          >
            <TextArea
              rows={3}
              placeholder="조직의 목적과 활동 내용을 간단히 설명해주세요."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="주요 활동 지역"
            rules={[{ max: 100, message: '지역명은 100자 이하여야 합니다.' }]}
          >
            <Input placeholder="예: 서울 강남구, 부산 해운대구" size="large" />
          </Form.Item>

          <Form.Item
            name="type"
            label="조직 유형"
            rules={[{ required: true, message: '조직 유형을 선택해주세요.' }]}
          >
            <Select
              placeholder="조직 유형 선택"
              size="large"
              onChange={console.log}
            >
              <Option value="club">동호회</Option>
              <Option value="study">스터디</Option>
              <Option value="culture">문화,취미</Option>
              <Option value="sports">스포츠</Option>
              <Option value="volunteer">봉사활동</Option>
              <Option value="business">비즈니스</Option>
              <Option value="social">사교모임</Option>
              <Option value="other">기타</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card
          title={
            <>
              <SettingOutlined /> 운영 설정
            </>
          }
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name={['settings', 'participationRule']}
            label="참여 규칙 (월 최소 참여 횟수)"
            rules={[{ required: true, message: '참여 규칙을 선택해주세요.' }]}
          >
            <Select placeholder="참여 규칙 선택" size="large">
              <Option value="제한없음">제한없음</Option>
              <Option value="1">월 1회 이상</Option>
              <Option value="2">월 2회 이상</Option>
              <Option value="3">월 3회 이상</Option>
              <Option value="4">월 4회 이상</Option>
              <Option value="5">월 5회 이상</Option>
              <Option value="6">월 6회 이상</Option>
              <Option value="7">월 7회 이상</Option>
              <Option value="8">월 8회 이상</Option>
              <Option value="9">월 9회 이상</Option>
              <Option value="10">월 10회 이상</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <UserOutlined /> 구성원 관리 ({dataSource.length}명)
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                size="small"
                disabled={editingKey !== ''}
              >
                구성원 추가
              </Button>
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={dataSource}
            columns={mergedColumns}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{ emptyText: '구성원이 없습니다.' }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button size="large" onClick={handleCancel}>
              취소
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {organization ? '수정' : '생성'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

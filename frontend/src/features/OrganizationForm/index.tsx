import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Organization, Member } from '../../entities';
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Table,
  Space,
  Popconfirm,
} from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { validateMembersData } from './util/validate';

const { TextArea } = Input;
const { Option } = Select;

interface OrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const OrganizationForm = ({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) => {
  const [form] = Form.useForm();
  const {
    createOrganization,
    updateOrganization,
    members,
    addMember,
    deleteMember,
  } = useAppStore();
  const [loading, setLoading] = useState(false);

  const [memberLoading, setMemberLoading] = useState(false);
  const [newMembers, setNewMembers] = useState<Partial<Member>[]>([]);
  // const [editingRowKeys, setEditingRowKeys] = useState<string[]>([]);
  const [completedAll, setCompletedAll] = useState(false);

  const isEditing = !!organization;
  const organizationMembers = organization
    ? members.filter((m) => m.organizationId === organization._id)
    : [];

  // 기존 구성원 + 새로 추가할 구성원들을 합친 데이터
  const allMembers = [
    ...newMembers.map((member, index) => ({
      ...member,
      _id: `new-${index}`, // 임시 ID
      organizationId: organization?._id || '',
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...organizationMembers,
  ];

  useEffect(() => {
    if (organization) {
      form.setFieldsValue({
        name: organization.name,
        description: organization.description,
        type: organization.type,
        location: organization.location,
        maxMembers: organization.maxMembers,
        settings: organization.settings,
      });
    }
  }, [organization, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEditing && organization) {
        await updateOrganization(organization._id, values);
        message.success('조직이 수정되었습니다.');
      } else {
        await createOrganization({
          ...values,
          currentMembers: 0,
          createdBy: 'current_user',
        });
        message.success('조직이 생성되었습니다.');
      }
      onSuccess();
    } catch (error) {
      message.error('조직 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인라인 편집 함수들
  const handleAddNewRow = () => {
    const newMember: Partial<Member> = {
      name: '',
      gender: 'male',
      birthYear: new Date().getFullYear() - 20, // 기본값: 20세
      district: '',
    };
    setNewMembers((prev) => [...prev, newMember]);
  };

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
          status: 'active', // 기본값으로 활성 상태
        });

        // 새 구성원 목록에서 제거
        setNewMembers((prev) => prev.filter((_, i) => i !== index));
        message.success('구성원이 추가되었습니다.');
      } catch (error) {
        message.error('구성원 추가 중 오류가 발생했습니다.');
      }
    } else {
      // 기존 구성원 수정 로직은 기존과 동일
    }
  };

  const handleCancelInlineEdit = (key: string) => {
    const isNewMember = key.startsWith('new-');
    if (isNewMember) {
      const index = parseInt(key.replace('new-', ''));
      setNewMembers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  /**
   * @description 인라인 편집 필드 변경 함수
   */
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

  const handleSaveAllNewMembers = async () => {
    if (!organization || newMembers.length === 0) return;

    // 현재 편집 중인 행이 있는지 확인
    if (!completedAll) {
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
          status: 'active', // 기본값으로 활성 상태
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

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember(memberId);
      message.success('구성원이 삭제되었습니다.');
    } catch (error) {
      message.error('구성원 삭제 중 오류가 발생했습니다.');
    }
  };

  const checkValidMemberInputData = () => {
    if (validateMembersData(newMembers)) {
      setCompletedAll(true);
    } else setCompletedAll(false);
  };

  useEffect(() => {
    checkValidMemberInputData();
  }, [newMembers]);

  const memberColumns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => {
        const isEditing = !completedAll;
        const isNewMember = record._id.startsWith('new-');

        if (isEditing) {
          return (
            <Input
              placeholder="이름을 입력하세요"
              defaultValue={record.name}
              onChange={(e) =>
                handleInlineFieldChange(record._id, 'name', e.target.value)
              }
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
      render: (_: any, record: any) => {
        const isEditing = !completedAll;

        if (isEditing) {
          return (
            <Select
              defaultValue={record.gender || 'male'}
              onChange={(value) =>
                handleInlineFieldChange(record._id, 'gender', value)
              }
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
      render: (_: any, record: any) => {
        const isEditing = !completedAll;
        const isNewMember = record._id.startsWith('new-');

        if (isEditing) {
          return (
            <Input
              type="number"
              placeholder="YYYY"
              defaultValue={record.birthYear}
              min={1950}
              max={new Date().getFullYear()}
              onChange={(e) =>
                handleInlineFieldChange(
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
      render: (_: any, record: any) => {
        const isEditing = !completedAll;
        const isNewMember = record._id.startsWith('new-');

        if (isEditing) {
          return (
            <Input
              placeholder="지역을 입력하세요"
              defaultValue={record.district}
              onChange={(e) =>
                handleInlineFieldChange(record._id, 'district', e.target.value)
              }
              size="small"
            />
          );
        }
        return (
          record.district ||
          (isNewMember ? '지역을 입력하세요' : record.district)
        );
      },
    },

    {
      title: '나이',
      key: 'age',
      render: (_: any, record: any) => {
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
      render: (date: Date, record: any) => {
        const isNewMember = record._id.startsWith('new-');
        if (isNewMember) return '오늘';
        return new Date(date).toLocaleDateString();
      },
    },
    {
      title: '작업',
      key: 'actions',
      render: (_: any, record: any) => {
        const isEditing = !completedAll;
        const isNewMember = record._id.startsWith('new-');

        if (isEditing) {
          return (
            <Space>
              <Button
                size="small"
                type="primary"
                onClick={() => handleSaveInlineRow(record._id)}
              >
                저장
              </Button>
              <Button
                size="small"
                onClick={() => handleCancelInlineEdit(record._id)}
              >
                취소
              </Button>
            </Space>
          );
        }

        return (
          <Space>
            {!isNewMember && (
              <Popconfirm
                title="구성원을 삭제하시겠습니까?"
                onConfirm={() => handleDeleteMember(record._id)}
                okText="삭제"
                cancelText="취소"
              >
                <Button size="small" danger icon={<Trash2 size={14} />} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: '기본 정보',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'club',
            settings: { participationRule: '제한없음' },
          }}
        >
          <Form.Item
            name="name"
            label="조직명"
            rules={[{ required: true, message: '조직명을 입력해주세요' }]}
          >
            <Input placeholder="조직명을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
            rules={[{ required: true, message: '조직 설명을 입력해주세요' }]}
          >
            <TextArea rows={3} placeholder="조직에 대한 설명을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="type"
            label="조직 유형"
            rules={[{ required: true, message: '조직 유형을 선택해주세요' }]}
          >
            <Select placeholder="조직 유형을 선택하세요">
              <Option value="club">동호회</Option>
              <Option value="study">스터디</Option>
              <Option value="culture">문화</Option>
              <Option value="sports">스포츠</Option>
              <Option value="volunteer">봉사</Option>
              <Option value="business">비즈니스</Option>
              <Option value="social">소셜</Option>
              <Option value="other">기타</Option>
            </Select>
          </Form.Item>

          <Form.Item name="location" label="위치">
            <Input placeholder="조직 활동 지역을 입력하세요" />
          </Form.Item>

          <Form.Item name="maxMembers" label="최대 멤버 수">
            <Input type="number" placeholder="최대 멤버 수를 입력하세요" />
          </Form.Item>

          <Form.Item
            name={['settings', 'participationRule']}
            label="참여 규칙"
            rules={[{ required: true, message: '참여 규칙을 설정해주세요' }]}
          >
            <Select placeholder="참여 규칙을 선택하세요">
              <Option value="제한없음">제한없음</Option>
              <Option value="1">월 1회</Option>
              <Option value="2">월 2회</Option>
              <Option value="3">월 3회</Option>
              <Option value="4">월 4회</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onCancel}>취소</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditing ? '수정' : '생성'}
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  // 수정 모드일 때만 구성원 관리 탭 추가
  if (isEditing && organization) {
    tabItems.push({
      key: 'members',
      label: `구성원 관리 (${allMembers.length})`,
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              구성원 목록
              <span className="text-sm text-gray-500 ml-2">
                ({organizationMembers.length}명 등록됨
                {newMembers.length > 0 && `, ${newMembers.length}명 추가 예정`})
              </span>
            </h3>
            <Space>
              <Button icon={<Plus size={16} />} onClick={handleAddNewRow}>
                신규 추가
              </Button>
              {newMembers.length > 0 && (
                <Button
                  type="primary"
                  loading={memberLoading}
                  disabled={!completedAll}
                  onClick={handleSaveAllNewMembers}
                >
                  모두 저장 ({newMembers.length}명)
                </Button>
              )}
            </Space>
          </div>

          {newMembers.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-700 mb-2">
                💡 <strong>인라인 편집 모드</strong>
              </div>
              <div className="text-xs text-blue-600">
                • 테이블에서 직접 정보를 입력하세요
                <br />
                • 각 행의 "저장" 버튼으로 개별 저장하거나
                <br />
                • 편집을 완료한 후 "모두 저장" 버튼으로 한번에 저장할 수
                있습니다
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
            scroll={{ y: 400 }}
            rowClassName={(record) =>
              record._id.startsWith('new-') ? 'bg-green-50' : ''
            }
          />
        </div>
      ),
    });
  }

  useEffect(() => {
    console.log(allMembers);
  }, []);

  return (
    <div>
      <Tabs items={tabItems} />
    </div>
  );
};

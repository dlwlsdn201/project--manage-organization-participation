import { useState, useEffect, useMemo, useCallback } from 'react';
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

interface EditableMember {
  id: string; // 임시 ID (편집용)
  _id?: string; // 실제 DB ID (기존 멤버의 경우)
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  district: string;
  organizationId: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
  updatedAt: Date;
  isEditing?: boolean;
  isNew?: boolean;
}

/* TODO - [구성원 관리 테이블에서 신규 구성원 정보 입력 기능 오류 수정해야함] */

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
  const [editingKeys, setEditingKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<EditableMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  // 현재 조직의 구성원 목록
  const currentMembers = useMemo(
    () =>
      organization
        ? storeMembers.filter((m) => m.organizationId === organization._id)
        : [],
    [organization, storeMembers]
  );

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

      // 기존 dataSource에서 임시 구성원들(isNew: true)을 보존
      setDataSource((prev) => {
        const tempMembers = prev.filter((member) => member.isNew);
        const convertedMembers: EditableMember[] = sortedMembers.map(
          (member) => ({
            ...member,
            id: member._id, // Member의 _id를 EditableMember의 id로 사용
          })
        );
        return [...tempMembers, ...convertedMembers];
      });
    } else {
      // 새 조직 생성 시에는 임시 구성원들만 보존
      setDataSource((prev) => prev.filter((member) => member.isNew));
    }
    // Modal이 열릴 때마다 편집 상태 초기화
    setEditingKeys([]);
  }, [organization, currentMembers]);

  const handleSubmit = async (values: any) => {
    // 임시 구성원 유효성 검사
    if (!validateAllTempMembers()) {
      message.error('모든 구성원 정보를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const orgData: Partial<Organization> = {
        ...values,
        settings: {
          participationRule: values.settings?.participationRule || '제한없음',
        },
      };

      // 구성원 정보도 함께 전달
      const tempMembers = dataSource.filter((member) => member.isNew);
      const submitData = {
        ...orgData,
        members: tempMembers.map(({ isEditing, isNew, ...member }) => member),
      };

      await onSubmit(submitData);
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
    setEditingKeys([]); // editingKeys 초기화 추가
    onCancel();
  };

  const isEditing = useCallback(
    (record: EditableMember) => editingKeys.includes(record.id),
    [editingKeys]
  );

  const edit = useCallback((record: EditableMember) => {
    setEditingKeys((prev) => [...prev, record.id]);
  }, []);

  const cancel = useCallback((id?: string) => {
    if (id) {
      setEditingKeys((prev) => prev.filter((key) => key !== id));
      // 새로운 행이면 제거
      setDataSource((prev) =>
        prev.filter((item) => !item.isNew || item.id !== id)
      );
      // 유효성 검사 에러 제거
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    } else {
      // 모든 편집 취소
      setEditingKeys([]);
      setDataSource((prev) => prev.filter((item) => !item.isNew));
      setValidationErrors({});
    }
  }, []);

  // 유효성 검사 함수
  const validateMember = (member: EditableMember): string[] => {
    const errors: string[] = [];
    if (!member.name?.trim()) errors.push('이름을 입력해주세요.');
    if (!member.gender) errors.push('성별을 선택해주세요.');
    if (
      !member.birthYear ||
      member.birthYear < 1950 ||
      member.birthYear > new Date().getFullYear()
    ) {
      errors.push('올바른 출생연도를 입력해주세요.');
    }
    if (!member.district?.trim()) errors.push('거주지를 입력해주세요.');
    return errors;
  };

  // 모든 임시 구성원 유효성 검사
  const validateAllTempMembers = (): boolean => {
    const tempMembers = dataSource.filter((member) => member.isNew);
    const newErrors: Record<string, string[]> = {};
    let hasErrors = false;

    tempMembers.forEach((member) => {
      const errors = validateMember(member);
      if (errors.length > 0) {
        newErrors[member.id] = errors;
        hasErrors = true;
      }
    });

    setValidationErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));
    return !hasErrors;
  };

  // 저장되지 않은 행이 있는지 확인
  const hasUnsavedRows = (): boolean => {
    return dataSource.some(
      (member) => member.isNew && editingKeys.includes(member.id)
    );
  };

  const save = useCallback(
    async (id: string) => {
      try {
        const row = dataSource.find((item) => item.id === id);
        if (!row) return;

        const { isEditing, isNew, ...memberData } = row;
        const errors = validateMember(row);

        if (errors.length > 0) {
          setValidationErrors((prev) => ({ ...prev, [id]: errors }));
          message.error('모든 필수 필드를 올바르게 입력해주세요.');
          return;
        }

        // 에러 제거
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });

        if (isNew) {
          // 새 구성원의 경우 store에 추가하지 않고 dataSource에서만 관리
          // 실제 저장은 조직 생성/수정 시에만 수행
          setDataSource((prev) =>
            prev.map((item) =>
              item.id === id ? { ...memberData, isNew: true } : item
            )
          );
        } else {
          // 기존 구성원 수정의 경우에만 store 업데이트
          const updatedMember: Member = {
            ...memberData,
            _id: memberData._id || '',
            updatedAt: new Date(),
          };

          if (organization) {
            updateMember(updatedMember);
          }

          setDataSource((prev) =>
            prev.map((item) =>
              item.id === id ? { ...updatedMember, id: item.id } : item
            )
          );
        }

        setEditingKeys((prev) => prev.filter((key) => key !== id));
        message.success(
          isNew ? '구성원이 추가되었습니다.' : '구성원이 수정되었습니다.'
        );
      } catch (error) {
        console.error('Save error:', error);
        message.error('저장 중 오류가 발생했습니다.');
      }
    },
    [dataSource, organization, addMember, updateMember]
  );

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
      organizationId: organization?._id || 'temp',
      status: 'active',
      joinedAt: new Date(),
      updatedAt: new Date(),
      isEditing: true,
      isNew: true,
    };

    setDataSource((prev) => [newMember, ...prev]);
    setEditingKeys((prev) => [...prev, newMember.id]);

    // 새 구성원 추가 시 해당 행의 유효성 검사 에러 제거
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[newMember.id];
      return newErrors;
    });
  };

  const handleCellChange = useCallback(
    (id: string, field: string, value: any) => {
      setDataSource((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        );

        // 편집 중이 아닐 때만 유효성 검사 실행
        if (!editingKeys.includes(id)) {
          const member = updated.find((m) => m.id === id);
          if (member) {
            const errors = validateMember(member);
            setValidationErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              if (errors.length > 0) {
                newErrors[id] = errors;
              } else {
                delete newErrors[id];
              }
              return newErrors;
            });
          }
        }

        return updated;
      });
    },
    [editingKeys]
  );

  const EditableCell = useCallback(
    ({ editing, dataIndex, title, record, children, ...restProps }: any) => {
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
              onChange={(value) =>
                handleCellChange(record?.id, dataIndex, value)
              }
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
              onChange={(value) =>
                handleCellChange(record?.id, dataIndex, value)
              }
              style={{ width: '100%' }}
            />
          );
          break;
        default:
          inputNode = (
            <Input
              value={record?.[dataIndex] || ''}
              onChange={(e) =>
                handleCellChange(record?.id, dataIndex, e.target.value)
              }
              autoFocus={
                record?.isNew && dataIndex === 'name' && !record?.[dataIndex]
              }
            />
          );
      }

      return <td {...restProps}>{editing ? inputNode : children}</td>;
    },
    [handleCellChange]
  );

  const columns = [
    {
      title: '가입일',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 120,
      editable: true,
      render: (date: Date) => dayjs(date).format('YYYY.MM.DD'),
      sorter: (a: EditableMember, b: EditableMember) =>
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
              onClick={() => cancel(record.id)}
            />
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKeys.length > 0}
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
                disabled={editingKeys.length > 0}
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
      destroyOnHidden
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
                disabled={false}
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

        {/* 유효성 검사 에러 메시지 */}
        {Object.keys(validationErrors).length > 0 && (
          <Card
            style={{
              marginBottom: 24,
              borderColor: '#ff4d4f',
              backgroundColor: '#fff2f0',
            }}
          >
            <div style={{ color: '#ff4d4f' }}>
              <Text strong style={{ color: '#ff4d4f' }}>
                구성원 정보 오류:
              </Text>
              {Object.entries(validationErrors).map(([memberId, errors]) => {
                const member = dataSource.find((m) => m.id === memberId);
                const memberName = member?.name || '새 구성원';
                return (
                  <div key={memberId} style={{ marginTop: 8 }}>
                    <Text strong>{memberName}:</Text>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {/* 비활성화 이유 안내 */}
            {(Object.keys(validationErrors).length > 0 || hasUnsavedRows()) && (
              <div
                style={{
                  color: '#ff4d4f',
                  fontSize: '12px',
                  marginRight: '12px',
                }}
              >
                {hasUnsavedRows() && (
                  <span>⚠️ 저장되지 않은 구성원 정보가 있습니다.</span>
                )}
                {Object.keys(validationErrors).length > 0 && (
                  <span>⚠️ 구성원 정보에 오류가 있습니다.</span>
                )}
              </div>
            )}
            <Button size="large" onClick={handleCancel}>
              취소
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              disabled={
                Object.keys(validationErrors).length > 0 || hasUnsavedRows()
              }
            >
              {organization ? '수정' : '생성'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

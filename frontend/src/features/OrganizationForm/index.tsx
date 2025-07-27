import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Organization } from '../../entities';
import { Button, Form, Input, Select, message } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface OrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrganizationForm({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const [form] = Form.useForm();
  const { createOrganization, updateOrganization } = useAppStore();
  const [loading, setLoading] = useState(false);

  const isEditing = !!organization;

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

  return (
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
  );
}

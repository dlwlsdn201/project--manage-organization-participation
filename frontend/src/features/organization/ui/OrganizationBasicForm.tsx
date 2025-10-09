import { Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import {
  organizationTypeOptions,
  participationRuleOptions,
} from '@/features/organization/config/formConfig';
import { DefaultButton } from '@/shared/ui/Button';

const { TextArea } = Input;
const { Option } = Select;

interface OrganizationBasicFormProps {
  form: FormInstance;
  loading: boolean;
  isEdit: boolean;
  onSubmit: (values: {
    name: string;
    description: string;
    type:
      | 'club'
      | 'study'
      | 'culture'
      | 'sports'
      | 'volunteer'
      | 'business'
      | 'social'
      | 'other';
    location?: string;
    maxMembers?: number;
    settings: {
      participationRule:
        | '제한없음'
        | '1'
        | '2'
        | '3'
        | '4'
        | '5'
        | '6'
        | '7'
        | '8'
        | '9'
        | '10';
    };
  }) => void;
  onCancel: () => void;
}

export const OrganizationBasicForm = ({
  form,
  loading,
  isEdit,
  onSubmit,
  onCancel,
}: OrganizationBasicFormProps) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
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
          {organizationTypeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
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
          {participationRuleOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <div className="flex flex-row mobile:flex-col justify-end gap-2 pt-4">
        <DefaultButton onClick={onCancel}>취소</DefaultButton>
        <DefaultButton type="primary" htmlType="submit" loading={loading}>
          {isEdit ? '수정' : '생성'}
        </DefaultButton>
      </div>
    </Form>
  );
};

import { useEffect } from 'react';
import { Form, message } from 'antd';
import { useOrganizationStore } from '@/features/organization/lib';
import { Organization } from '@/entities';
import { getCurrentUserId } from '@/shared/lib/user-utils';

interface UseOrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
}

export const useOrganizationForm = ({
  organization,
  onSuccess,
}: UseOrganizationFormProps) => {
  const [form] = Form.useForm();
  const { createOrganization, updateOrganization, loading } =
    useOrganizationStore();

  // 기존 조직 데이터로 폼 초기화
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

  // 폼 제출 처리
  const handleSubmit = async (values: {
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
  }) => {
    console.log('폼 제출 시작:', values);
    try {
      if (organization) {
        console.log('조직 수정 시도:', organization._id, values);
        await updateOrganization(organization._id, values);
        message.success('조직이 수정되었습니다.');
      } else {
        await createOrganization({
          ...values,
          createdBy: getCurrentUserId(),
        });
        message.success('조직이 생성되었습니다.');
      }
      onSuccess();
    } catch (error) {
      console.error('조직 저장 오류:', error);
      message.error('조직 저장 중 오류가 발생했습니다.');
    }
  };

  return {
    form,
    loading,
    handleSubmit,
  };
};

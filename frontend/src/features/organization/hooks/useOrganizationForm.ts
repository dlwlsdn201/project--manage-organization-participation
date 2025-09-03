import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useAppStore } from '@/store/useAppStore';
import { Organization } from '@/entities';

interface UseOrganizationFormProps {
  organization?: Organization | null;
  onSuccess: () => void;
}

export const useOrganizationForm = ({
  organization,
  onSuccess,
}: UseOrganizationFormProps) => {
  const [form] = Form.useForm();
  const { createOrganization, updateOrganization } = useAppStore();
  const [loading, setLoading] = useState(false);

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
  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      if (!!organization) {
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

  return {
    form,
    loading,
    handleSubmit,
  };
};

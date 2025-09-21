import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Event } from '@/entities';
import { Button, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import ko from 'antd/es/date-picker/locale/ko_KR';

const { TextArea } = Input;
const { Option } = Select;

interface EventFormProps {
  event?: Event | null;
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({
  event,
  organizationId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [form] = Form.useForm();
  const { createEvent, updateEvent, members } = useAppStore();
  const [loading, setLoading] = useState(false);

  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        date: dayjs(event.date),
        location: event.location,
        hostId: event.hostId,
        maxParticipants: event.maxParticipants,
      });
    }
  }, [event, form]);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    date: { toDate: () => Date };
    location: string;
    maxParticipants?: number;
  }) => {
    setLoading(true);
    try {
      const eventData = {
        ...values,
        date: values.date.toDate(),
        organizationId,
        hostId: 'current_user',
        currentParticipants: event?.currentParticipants || 0,
        status: 'published' as const,
        attendees: event?.attendees || [],
        createdBy: 'current_user',
      };

      if (isEditing && event) {
        await updateEvent(event._id, eventData);
        message.success('모임이 수정되었습니다.');
      } else {
        await createEvent({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          hostId: eventData.hostId,
          organizationId: eventData.organizationId,
          currentParticipants: eventData.currentParticipants,
          status: eventData.status,
          attendees: eventData.attendees,
          createdBy: eventData.createdBy,
          maxParticipants: eventData.maxParticipants,
        });
        message.success('모임이 생성되었습니다.');
      }
      onSuccess();
    } catch {
      message.error('모임 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const organizationMembers = members.filter(
    (member) => member.organizationId === organizationId
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        status: 'published',
      }}
    >
      <Form.Item
        name="title"
        label="모임명"
        rules={[{ required: true, message: '모임명을 입력해주세요' }]}
      >
        <Input placeholder="모임명을 입력하세요" />
      </Form.Item>

      <Form.Item name="description" label="설명">
        <TextArea rows={3} placeholder="모임에 대한 설명을 입력하세요" />
      </Form.Item>

      <Form.Item
        name="date"
        label="날짜"
        rules={[{ required: true, message: '모임 날짜를 선택해주세요' }]}
      >
        <DatePicker
          showTime={true}
          format="YYYY-MM-DD HH:mm"
          locale={ko}
          placeholder="모임 날짜를 선택하세요"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="location"
        label="장소"
        rules={[{ required: true, message: '모임 장소를 입력해주세요' }]}
      >
        <Input placeholder="모임 장소를 입력하세요" />
      </Form.Item>

      <Form.Item
        name="hostId"
        label="주최자"
        rules={[{ required: true, message: '주최자를 선택해주세요' }]}
      >
        <Select placeholder="주최자를 선택하세요">
          {organizationMembers.map((member) => (
            <Option key={member._id} value={member._id}>
              {member.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="maxParticipants" label="최대 참가자 수">
        <Input type="number" placeholder="최대 참가자 수를 입력하세요" />
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

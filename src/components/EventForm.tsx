import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Event, Member } from '../types';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;

interface EventFormProps {
  event?: Event;
  organizationId: string;
  onSubmit: (data: Partial<Event>) => void;
  onCancel: () => void;
}

export function EventForm({
  event,
  organizationId,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const { members } = useAppStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 현재 조직의 구성원 목록
  const organizationMembers = members.filter(
    (member) =>
      member.organizationId === organizationId && member.status === 'active'
  );

  useEffect(() => {
    if (event) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        date: dayjs(event.date),
        location: event.location,
        hostId: event.hostId,
        attendees: event.attendees,
        maxParticipants: event.maxParticipants,
      });
    } else {
      // 새 이벤트 생성 시 기본값 설정
      form.setFieldsValue({
        date: dayjs(),
        attendees: [],
      });
    }
  }, [event, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const eventData: Partial<Event> = {
        ...values,
        organizationId,
        date: values.date.toDate(),
        currentParticipants: values.attendees?.length || 0,
        status: 'published' as const,
      };

      await onSubmit(eventData);
      message.success(
        event ? '모임이 수정되었습니다.' : '모임이 생성되었습니다.'
      );
    } catch (error) {
      console.error('Event submission error:', error);
      message.error('모임 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!organizationId) {
    return (
      <Modal
        title="오류"
        open={true}
        onCancel={onCancel}
        footer={[
          <Button key="ok" type="primary" onClick={onCancel}>
            확인
          </Button>,
        ]}
      >
        조직을 먼저 선택해주세요.
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          <span>{event ? '모임 수정' : '새 모임 기록'}</span>
        </div>
      }
      open={true}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={true}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="title"
          label={
            <span>
              <CalendarOutlined style={{ marginRight: 8 }} />
              이벤트 제목
            </span>
          }
          rules={[
            { required: true, message: '이벤트 제목을 입력해주세요.' },
            { min: 2, message: '제목은 2자 이상이어야 합니다.' },
            { max: 100, message: '제목은 100자 이하여야 합니다.' },
          ]}
        >
          <Input
            placeholder="예: 정기 독서모임, 등산 모임, 스터디 세션"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="date"
          label={
            <span>
              <CalendarOutlined style={{ marginRight: 8 }} />
              날짜
            </span>
          }
          rules={[{ required: true, message: '모임 날짜를 선택해주세요.' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            format="YYYY년 MM월 DD일"
            placeholder="모임 날짜 선택"
          />
        </Form.Item>

        <Form.Item
          name="location"
          label={
            <span>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              장소
            </span>
          }
          rules={[
            { required: true, message: '모임 장소를 입력해주세요.' },
            { min: 2, message: '장소는 2자 이상이어야 합니다.' },
            { max: 200, message: '장소는 200자 이하여야 합니다.' },
          ]}
        >
          <Input
            placeholder="예: 강남역 스타벅스, 한강공원 잠실대교, 온라인 (Zoom)"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="hostId"
          label={
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              주최자
            </span>
          }
          rules={[{ required: true, message: '주최자를 선택해주세요.' }]}
        >
          <Select
            placeholder="주최자 선택"
            size="large"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={organizationMembers.map((member) => ({
              value: member.id,
              label: `${member.name} (${member.gender === 'male' ? '남' : '여'}, ${new Date().getFullYear() - member.birthYear + 1}세)`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="attendees"
          label={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              참여자 목록
            </span>
          }
          rules={[
            { required: true, message: '참여자를 선택해주세요.' },
            {
              type: 'array',
              min: 1,
              message: '최소 1명의 참여자를 선택해야 합니다.',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="참여자 선택 (여러 명 선택 가능)"
            size="large"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={organizationMembers.map((member) => ({
              value: member.id,
              label: `${member.name} (${member.gender === 'male' ? '남' : '여'}, ${new Date().getFullYear() - member.birthYear + 1}세, ${member.district})`,
            }))}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item name="description" label="모임 설명 (선택사항)">
          <TextArea
            rows={3}
            placeholder="모임에 대한 추가 설명이나 특이사항을 입력하세요."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item name="maxParticipants" label="최대 참여자 수 (선택사항)">
          <Input
            type="number"
            min={1}
            max={1000}
            placeholder="제한이 없으면 비워두세요"
            size="large"
          />
        </Form.Item>

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
              {event ? '수정' : '생성'}
            </Button>
          </div>
        </Form.Item>
      </Form>

      {organizationMembers.length === 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 6,
          }}
        >
          <Title level={5} style={{ margin: 0, color: '#d46b08' }}>
            구성원이 없습니다
          </Title>
          <p style={{ margin: '8px 0 0 0', color: '#ad6800' }}>
            모임을 생성하려면 먼저 조직에 구성원을 추가해주세요.
          </p>
        </div>
      )}
    </Modal>
  );
}

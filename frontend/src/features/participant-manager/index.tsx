import { useState, useEffect } from 'react';
import { useEventStore } from '@/entities/event/model';
import { useMemberStore } from '@/features/organization/lib/member-store';
import { Member } from '@/entities';
import { Table, Checkbox, message, Space } from 'antd';
import { UserPlus } from 'lucide-react';
import { DefaultButton } from '@/shared/ui/Button';

interface ParticipantManagerProps {
  eventId: string;
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParticipantManager = ({
  eventId,
  organizationId,
  onSuccess,
  onCancel,
}: ParticipantManagerProps) => {
  const { events, updateEvent } = useEventStore();
  const { members } = useMemberStore();
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const event = events.find((e) => e._id === eventId);
  const organizationMembers = members.filter(
    (member) => member.organizationId === organizationId
  );

  useEffect(() => {
    if (event) {
      setSelectedParticipants(
        event.attendees.map((attendee) => attendee.memberId)
      );
    }
  }, [event]);

  const handleParticipantToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipants((prev) => [...prev, memberId]);
    } else {
      setSelectedParticipants((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleSave = async () => {
    if (!event) return;

    setLoading(true);
    try {
      const attendees = selectedParticipants.map((memberId) => ({
        memberId,
        status: 'confirmed' as const,
        joinedAt: new Date(),
      }));

      await updateEvent(event._id, {
        attendees,
        currentParticipants: selectedParticipants.length,
      });
      message.success('참가자 목록이 업데이트되었습니다.');
      onSuccess();
    } catch {
      message.error('참가자 목록 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '참가',
      key: 'participate',
      width: 80,
      render: (_: unknown, record: Member) => (
        <Checkbox
          checked={selectedParticipants.includes(record._id)}
          onChange={(e) =>
            handleParticipantToggle(record._id, e.target.checked)
          }
        />
      ),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '성별',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (gender === 'male' ? '남성' : '여성'),
    },
    {
      title: '지역',
      dataIndex: 'district',
      key: 'district',
    },
  ];

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">모임 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4 mobile:gap-0">
        <div className="flex-1">
          <h3 className="text-base mobile:text-lg font-semibold">
            {event.title}
          </h3>
          <p className="text-xs mobile:text-sm text-gray-500">
            현재 참가자: {selectedParticipants.length}명
            {event.maxParticipants && ` / 최대 ${event.maxParticipants}명`}
          </p>
        </div>
        <Space className="w-full mobile:w-auto flex justify-end">
          <DefaultButton onClick={onCancel}>취소</DefaultButton>
          <DefaultButton
            type="primary"
            onClick={handleSave}
            loading={loading}
            icon={<UserPlus size={16} />}
          >
            저장
          </DefaultButton>
        </Space>
      </div>

      <Table
        dataSource={organizationMembers}
        columns={columns}
        rowKey="_id"
        pagination={false}
        size="small"
        scroll={{ x: 'max-content', y: 400 }}
      />
    </div>
  );
};

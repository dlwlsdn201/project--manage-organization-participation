import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
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
  const { events, members, updateEvent } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<
    Array<{
      memberId: string;
      status: 'confirmed' | 'pending' | 'declined';
      joinedAt: Date;
    }>
  >([]);

  const event = events.find((e) => e._id === eventId);
  const organizationMembers = members.filter(
    (member) => member.organizationId === organizationId
  );

  useEffect(() => {
    if (event) {
      setSelectedParticipants(event.attendees);
    }
  }, [event]);

  const handleParticipantToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipants((prev) => [
        ...prev,
        {
          memberId,
          status: 'confirmed' as const,
          joinedAt: new Date(),
        },
      ]);
    } else {
      setSelectedParticipants((prev) =>
        prev.filter((participant) => participant.memberId !== memberId)
      );
    }
  };

  const handleSave = async () => {
    if (!event) return;

    setLoading(true);
    try {
      console.log('참가자 데이터 전송:', {
        eventId: event._id,
        attendees: selectedParticipants,
        currentParticipants: selectedParticipants.length,
      });

      console.log('전송할 attendees 데이터:', selectedParticipants);
      console.log('전송할 attendees 타입:', typeof selectedParticipants);
      console.log(
        '전송할 attendees 배열 여부:',
        Array.isArray(selectedParticipants)
      );

      await updateEvent(event._id, {
        attendees: selectedParticipants,
        currentParticipants: selectedParticipants.length,
      });
      message.success('참가자 목록이 업데이트되었습니다.');
      onSuccess();
    } catch (error: unknown) {
      console.error('참가자 목록 업데이트 오류:', error);
      console.error('오류 상세 정보:', {
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
      });
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      message.error(
        `참가자 목록 업데이트 중 오류가 발생했습니다: ${errorMessage}`
      );
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
          checked={selectedParticipants.some((p) => p.memberId === record._id)}
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

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Member } from '@/entities';
import { Button, Table, Checkbox, message, Space } from 'antd';
import { UserPlus } from 'lucide-react';

interface ParticipantManagerProps {
  eventId: string;
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParticipantManager({
  eventId,
  organizationId,
  onSuccess,
  onCancel,
}: ParticipantManagerProps) {
  const { events, members, updateEvent } = useAppStore();
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
      setSelectedParticipants(event.attendees);
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
      await updateEvent(event._id, {
        attendees: selectedParticipants,
        currentParticipants: selectedParticipants.length,
      });
      message.success('참가자 목록이 업데이트되었습니다.');
      onSuccess();
    } catch (error) {
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
      render: (_: any, record: Member) => (
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
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status === 'active' ? '활성' : '비활성'}
        </span>
      ),
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-sm text-gray-500">
            현재 참가자: {selectedParticipants.length}명
            {event.maxParticipants && ` / 최대 ${event.maxParticipants}명`}
          </p>
        </div>
        <Space>
          <Button onClick={onCancel}>취소</Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            icon={<UserPlus size={16} />}
          >
            저장
          </Button>
        </Space>
      </div>

      <Table
        dataSource={organizationMembers}
        columns={columns}
        rowKey="_id"
        pagination={false}
        size="small"
        scroll={{ y: 400 }}
      />
    </div>
  );
}

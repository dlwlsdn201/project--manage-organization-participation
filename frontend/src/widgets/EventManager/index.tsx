import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Event } from '@/entities';
import { EventForm } from '@/features/EventForm';
import { ParticipantManager } from '@/features/ParticipantManager';
import { Edit, Trash2, Plus, Users, Calendar, MapPin } from 'lucide-react';
import { Modal, message, Popconfirm, Badge } from 'antd';

interface EventManagerProps {
  organizationId: string;
}

export function EventManager({ organizationId }: EventManagerProps) {
  const { events, loading, deleteEvent } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isParticipantModalVisible, setIsParticipantModalVisible] =
    useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const organizationEvents = useMemo(() => {
    return events.filter((event) => event.organizationId === organizationId);
  }, [events, organizationId]);

  const filteredEvents = organizationEvents.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalVisible(true);
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await deleteEvent(event._id);
      message.success('모임이 삭제되었습니다.');
    } catch (error) {
      message.error('모임 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleManageParticipants = (event: Event) => {
    setSelectedEvent(event);
    setIsParticipantModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    setEditingEvent(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingEvent(null);
  };

  const handleParticipantModalOk = () => {
    setIsParticipantModalVisible(false);
    setSelectedEvent(null);
  };

  const handleParticipantModalCancel = () => {
    setIsParticipantModalVisible(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">모임 목록</h2>
          <div className="px-3 py-1 bg-primary text-sm font-medium rounded-full flex items-center gap-1">
            <span>총</span>
            <Badge count={organizationEvents.length} color="blue" dot={false} />
            개
          </div>
        </div>
        <button
          onClick={handleAddEvent}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />새 모임 추가
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="모임명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">등록된 모임이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    title="모임 편집"
                  >
                    <Edit size={16} />
                  </button>
                  <Popconfirm
                    title="정말로 이 모임을 삭제하시겠습니까?"
                    onConfirm={() => handleDeleteEvent(event)}
                    okText="삭제"
                    cancelText="취소"
                  >
                    <button
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="모임 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Popconfirm>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{event.currentParticipants}명 참여</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleManageParticipants(event)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  참가자 관리
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingEvent ? '모임 정보 수정' : '모임 정보 입력'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <EventForm
          event={editingEvent}
          organizationId={organizationId}
          onSuccess={handleModalOk}
          onCancel={handleModalCancel}
        />
      </Modal>

      <Modal
        title="참가자 관리"
        open={isParticipantModalVisible}
        onOk={handleParticipantModalOk}
        onCancel={handleParticipantModalCancel}
        footer={null}
        width={800}
      >
        {selectedEvent && (
          <ParticipantManager
            eventId={selectedEvent._id}
            organizationId={organizationId}
            onSuccess={handleParticipantModalOk}
            onCancel={handleParticipantModalCancel}
          />
        )}
      </Modal>
    </div>
  );
}

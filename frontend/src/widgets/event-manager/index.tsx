import { useState, useMemo } from 'react';
import { useEventStore } from '@/entities/event/model';
import { Event } from '@/entities';
import { EventForm } from '@/features/event-form';
import { ParticipantManager } from '@/features/participant-manager';
import { Modal, message } from 'antd';
import { EmptyState } from '@/shared/ui/Empty';
import { LoadingSpinner } from '@/shared/ui/Spinner';
import { EventManagerHeader } from '@/widgets/event-manager/ui/EventManagerHeader';
import { EventCard } from '@/widgets/event-manager/ui/EventCard';

interface EventManagerProps {
  organizationId: string;
}

/**
 * 이벤트 관리 위젯
 * - 이벤트 목록 표시
 * - 이벤트 추가/수정/삭제
 * - 참가자 관리
 */
export function EventManager({ organizationId }: EventManagerProps) {
  const { events, loading, deleteEvent } = useEventStore();
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
    } catch {
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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <EventManagerHeader
        totalEvents={organizationEvents.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddEvent={handleAddEvent}
      />

      {/* 이벤트 목록 */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="등록된 모임이 없습니다"
          description="새로운 모임을 추가해보세요"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onManageParticipants={handleManageParticipants}
            />
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
        destroyOnHidden
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
        destroyOnHidden
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

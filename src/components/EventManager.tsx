import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EventForm } from './EventForm';
import { DateRangeFilter } from './DateRangeFilter';
import {
  DateRangeFilter as DateRangeFilterType,
  Event,
  Participant,
} from '../types';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Search,
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface EventManagerProps {
  organizationId: string;
}

export function EventManager({ organizationId }: EventManagerProps) {
  const {
    state,
    addEvent,
    updateEvent,
    deleteEvent,
    updateParticipant,
    addActivityLog,
  } = useApp();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateRangeFilterType>({
    preset: 'thisMonth',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  const organization = state.organizations.find(
    (org) => org.id === organizationId
  );
  const participants = state.participants.filter(
    (p) => p.organizationId === organizationId
  );
  const events = state.events.filter(
    (e) => e.organizationId === organizationId
  );

  // 날짜 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // 날짜 필터
    if (dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter((event) =>
        isWithinInterval(event.startDate, {
          start: dateFilter.startDate!,
          end: dateFilter.endDate!,
        })
      );
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.location &&
            event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
  }, [events, dateFilter, searchTerm]);

  // 참여자별 통계
  const participantStats = useMemo(() => {
    return participants.map((participant) => {
      const user = state.users.find((u) => u.id === participant.userId);
      const participantEvents = filteredEvents.filter((event) =>
        event.attendees.includes(participant.userId)
      );

      const totalEvents = filteredEvents.length;
      const attendedEvents = participantEvents.length;
      const attendanceRate =
        totalEvents > 0 ? (attendedEvents / totalEvents) * 100 : 0;

      return {
        participant,
        user,
        totalEvents,
        attendedEvents,
        attendanceRate,
        lastAttendance:
          participantEvents.length > 0
            ? participantEvents[0].startDate
            : undefined,
      };
    });
  }, [participants, filteredEvents, state.users]);

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSubmitEvent = async (eventData: Partial<Event>) => {
    try {
      if (editingEvent) {
        const updatedEvent: Event = {
          ...editingEvent,
          ...eventData,
          updatedAt: new Date(),
        };
        updateEvent(updatedEvent);

        addActivityLog({
          id: Math.random().toString(36).substr(2, 9),
          organizationId,
          userId: state.user?.id || '',
          action: 'event_updated',
          details: `${updatedEvent.title} 모임을 수정했습니다.`,
          timestamp: new Date(),
          metadata: { eventTitle: updatedEvent.title },
        });
      } else {
        const newEvent: Event = {
          id: Math.random().toString(36).substr(2, 9),
          ...eventData,
          createdBy: state.user?.id || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Event;

        addEvent(newEvent);

        addActivityLog({
          id: Math.random().toString(36).substr(2, 9),
          organizationId,
          userId: state.user?.id || '',
          action: 'event_created',
          details: `${newEvent.title} 모임을 생성했습니다.`,
          timestamp: new Date(),
          metadata: { eventTitle: newEvent.title },
        });
      }

      setShowEventForm(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Event submission error:', error);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (confirm(`정말로 "${event.title}" 모임을 삭제하시겠습니까?`)) {
      deleteEvent(event.id);

      addActivityLog({
        id: Math.random().toString(36).substr(2, 9),
        organizationId,
        userId: state.user?.id || '',
        action: 'event_deleted',
        details: `${event.title} 모임을 삭제했습니다.`,
        timestamp: new Date(),
        metadata: { eventTitle: event.title },
      });
    }
  };

  const handleParticipantStatusChange = (
    participant: Participant,
    newStatus: Participant['status']
  ) => {
    const updatedParticipant = { ...participant, status: newStatus };
    updateParticipant(updatedParticipant);

    const user = state.users.find((u) => u.id === participant.userId);
    addActivityLog({
      id: Math.random().toString(36).substr(2, 9),
      organizationId,
      userId: state.user?.id || '',
      action: 'participant_status_changed',
      details: `${user?.name || '알 수 없음'}님의 상태를 ${newStatus}로 변경했습니다.`,
      timestamp: new Date(),
      metadata: { participantName: user?.name, newStatus },
    });
  };

  if (!organization) {
    return <div>조직을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="event-manager">
      <div className="event-manager-header">
        <div className="header-info">
          <h2>{organization.name} - 모임 및 참여자 관리</h2>
          <p>오프라인 모임 기록과 참여자 현황을 한눈에 확인하세요</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateEvent}>
          <Plus size={20} />
          모임 기록 추가
        </button>
      </div>

      {/* 필터 섹션 */}
      <div className="event-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="모임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DateRangeFilter
          value={dateFilter}
          onChange={setDateFilter}
          className="date-filter"
        />
      </div>

      <div className="event-manager-content">
        {/* 모임 목록 */}
        <div className="events-section">
          <h3>모임 기록 ({filteredEvents.length}개)</h3>

          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} className="text-gray-400" />
              <p>등록된 모임이 없습니다.</p>
              <button className="btn btn-primary" onClick={handleCreateEvent}>
                첫 모임 기록하기
              </button>
            </div>
          ) : (
            <div className="event-list">
              {filteredEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-content">
                    <div className="event-header">
                      <h4>{event.title}</h4>
                      <div className="event-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="event-description">{event.description}</p>

                    <div className="event-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>
                          {format(event.startDate, 'yyyy.MM.dd HH:mm')}
                        </span>
                      </div>
                      {event.location && (
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <Users size={16} />
                        <span>{event.attendees.length}명 참여</span>
                      </div>
                    </div>

                    {/* 참여자 목록 */}
                    <div className="event-attendees">
                      <h5>참여자</h5>
                      <div className="attendee-list">
                        {event.attendees.map((userId) => {
                          const user = state.users.find((u) => u.id === userId);
                          const participant = participants.find(
                            (p) => p.userId === userId
                          );
                          return (
                            <div key={userId} className="attendee-item">
                              <span className="attendee-name">
                                {user?.name || '알 수 없음'}
                              </span>
                              <span
                                className={`role-badge ${participant?.role}`}
                              >
                                {participant?.role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 참여자 현황 */}
        <div className="participants-section">
          <h3>참여자 현황 ({participants.length}명)</h3>

          <div className="participant-stats-grid">
            {participantStats.map((stat) => (
              <div key={stat.participant.id} className="participant-stat-card">
                <div className="participant-info">
                  <div className="participant-name">
                    {stat.user?.name || '알 수 없음'}
                  </div>
                  <div className="participant-role">
                    {stat.participant.role}
                  </div>
                </div>

                <div className="participation-stats">
                  <div className="stat-item">
                    <span className="stat-label">참여율</span>
                    <span
                      className={`stat-value ${
                        stat.attendanceRate >= 80
                          ? 'high'
                          : stat.attendanceRate >= 60
                            ? 'medium'
                            : 'low'
                      }`}
                    >
                      {stat.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">참여 횟수</span>
                    <span className="stat-value">
                      {stat.attendedEvents} / {stat.totalEvents}
                    </span>
                  </div>
                </div>

                <div className="participant-actions">
                  {stat.participant.status === 'active' ? (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleParticipantStatusChange(
                          stat.participant,
                          'inactive'
                        )
                      }
                    >
                      <UserX size={16} />
                      비활성화
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        handleParticipantStatusChange(
                          stat.participant,
                          'active'
                        )
                      }
                    >
                      <UserCheck size={16} />
                      활성화
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 이벤트 폼 모달 */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleSubmitEvent}
          onCancel={() => setShowEventForm(false)}
          organizations={state.organizations}
        />
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Event, Member } from '../types';
import { EventForm } from './EventForm';
import { DateRangeFilter } from './DateRangeFilter';
import dayjs from 'dayjs';

interface EventManagerProps {
  organizationId: string;
}

export function EventManager({ organizationId }: EventManagerProps) {
  const { events, members, addEvent, updateEvent, deleteEvent } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{
    startDate?: Date;
    endDate?: Date;
    preset?: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';
  }>({ preset: 'thisMonth' });

  // 현재 조직의 이벤트와 멤버 필터링
  const organizationEvents = events.filter(
    (e) => e.organizationId === organizationId
  );
  const organizationMembers = members.filter(
    (m) => m.organizationId === organizationId
  );

  // 필터링된 이벤트 목록
  const filteredEvents = useMemo(() => {
    return organizationEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateRange.startDate && dateRange.endDate) {
        const eventDate = dayjs(event.date);
        matchesDate =
          eventDate.isAfter(dayjs(dateRange.startDate).subtract(1, 'day')) &&
          eventDate.isBefore(dayjs(dateRange.endDate).add(1, 'day'));
      }

      return matchesSearch && matchesDate;
    });
  }, [organizationEvents, searchTerm, dateRange]);

  // 멤버별 참여 통계
  const memberStats = useMemo(() => {
    return organizationMembers.map((member) => {
      const attendedEvents = organizationEvents.filter((event) =>
        event.attendees.includes(member.id)
      );
      const totalEvents = organizationEvents.length;
      const attendanceRate =
        totalEvents > 0 ? (attendedEvents.length / totalEvents) * 100 : 0;

      return {
        member,
        attendedEvents: attendedEvents.length,
        totalEvents,
        attendanceRate,
        isAtRisk: attendanceRate < 50, // 50% 미만시 위험
      };
    });
  }, [organizationMembers, organizationEvents]);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('정말로 이 모임을 삭제하시겠습니까?')) {
      deleteEvent(eventId);
    }
  };

  const handleFormSubmit = (data: Partial<Event>) => {
    if (editingEvent) {
      const updatedEvent: Event = {
        ...editingEvent,
        ...data,
        updatedAt: new Date(),
      };
      updateEvent(updatedEvent);
    } else {
      const newEvent: Event = {
        id: `event_${Date.now()}`,
        organizationId,
        title: data.title || '',
        description: data.description || '',
        date: data.date || new Date(),
        location: data.location || '',
        hostId: data.hostId || '',
        maxParticipants: data.maxParticipants,
        currentParticipants: data.attendees?.length || 0,
        status: 'published',
        attendees: data.attendees || [],
        createdBy: 'current_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addEvent(newEvent);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      draft: '임시저장',
      published: '공개',
      ongoing: '진행중',
      completed: '완료',
      cancelled: '취소',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      draft: '#gray',
      published: '#blue',
      ongoing: '#green',
      completed: '#purple',
      cancelled: '#red',
    };
    return colorMap[status] || '#gray';
  };

  return (
    <div className="event-manager">
      <div className="event-manager-header">
        <h2>모임 관리</h2>
        <button className="btn btn-primary" onClick={handleCreateEvent}>
          새 모임 생성
        </button>
      </div>

      <div className="event-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="모임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="event-manager-content">
        <div className="events-section">
          <h3>모임 목록 ({filteredEvents.length}개)</h3>

          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <p>검색 조건에 맞는 모임이 없습니다.</p>
              <button className="btn btn-primary" onClick={handleCreateEvent}>
                첫 모임 생성하기
              </button>
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span
                      className="event-status"
                      style={{ color: getStatusColor(event.status) }}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>

                  <div className="event-details">
                    <p className="event-date">
                      📅 {dayjs(event.date).format('YYYY년 MM월 DD일')}
                    </p>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-participants">
                      👥 {event.attendees.length}명 참여
                    </p>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                  </div>

                  <div className="event-attendees">
                    <h5>참여자 목록:</h5>
                    <div className="attendees-list">
                      {event.attendees.map((attendeeId) => {
                        const member = organizationMembers.find(
                          (m) => m.id === attendeeId
                        );
                        return member ? (
                          <span key={attendeeId} className="attendee-tag">
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="event-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleEditEvent(event)}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="members-section">
          <h3>구성원 현황 ({organizationMembers.length}명)</h3>

          <div className="members-stats">
            {memberStats.map(
              ({
                member,
                attendedEvents,
                totalEvents,
                attendanceRate,
                isAtRisk,
              }) => (
                <div
                  key={member.id}
                  className={`member-stat-card ${isAtRisk ? 'at-risk' : ''}`}
                >
                  <div className="member-header">
                    <h4>{member.name}</h4>
                    <div className="member-badges">
                      <span className="gender-badge">
                        {member.gender === 'male' ? '남' : '여'}
                      </span>
                      <span className="age-badge">
                        {new Date().getFullYear() - member.birthYear + 1}세
                      </span>
                      <span className="location-badge">{member.district}</span>
                    </div>
                  </div>
                  <div className="stat-summary">
                    <div className="participation-stats">
                      <span className="stat-item">
                        <strong>
                          {attendedEvents}/{totalEvents}
                        </strong>{' '}
                        참여
                      </span>
                      <span className="stat-item">
                        <strong>{attendanceRate.toFixed(1)}%</strong> 참여율
                      </span>
                    </div>
                    {isAtRisk && (
                      <div className="risk-warning">⚠️ 참여율 저조</div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <EventForm
          event={editingEvent || undefined}
          organizationId={organizationId}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

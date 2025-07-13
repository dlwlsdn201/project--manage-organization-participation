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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-900">모임 관리</h2>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          onClick={handleCreateEvent}
        >
          새 모임 생성
        </button>
      </div>

      <div className="flex gap-4 p-4 bg-slate-50 border-b border-slate-200 items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="모임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
        </div>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            모임 목록 ({filteredEvents.length}개)
          </h3>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-4">
                검색 조건에 맞는 모임이 없습니다.
              </p>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                onClick={handleCreateEvent}
              >
                첫 모임 생성하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-semibold text-slate-900">
                      {event.title}
                    </h4>
                    <span
                      className="px-2 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-600"
                      style={{ color: getStatusColor(event.status) }}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-medium text-slate-900">
                      📅 {dayjs(event.date).format('YYYY년 MM월 DD일')}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      📍 {event.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                      👥 {event.attendees.length}명 참여
                    </p>
                    {event.description && (
                      <p className="text-xs text-slate-600 leading-relaxed mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-slate-900 mb-1.5">
                      참여자 목록:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {event.attendees.map((attendeeId) => {
                        const member = organizationMembers.find(
                          (m) => m.id === attendeeId
                        );
                        return member ? (
                          <span
                            key={attendeeId}
                            className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-xl text-xs font-medium"
                          >
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-3 py-1.5 text-sm bg-transparent text-slate-600 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      onClick={() => handleEditEvent(event)}
                    >
                      수정
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-3">
            구성원 현황 ({organizationMembers.length}명)
          </h3>

          <div className="flex flex-col gap-2">
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
                  className={`bg-white border rounded-md p-3 transition-all duration-200 hover:shadow-md ${
                    isAtRisk
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 flex-shrink-0">
                      {member.name}
                    </h4>
                    <div className="flex gap-1 flex-wrap items-center">
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">
                        {member.gender === 'male' ? '남' : '여'}
                      </span>
                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-medium">
                        {new Date().getFullYear() - member.birthYear + 1}세
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-medium">
                        {member.district}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className="text-xs text-slate-600">
                        <strong className="text-slate-900 font-semibold">
                          {attendedEvents}/{totalEvents}
                        </strong>{' '}
                        참여
                      </span>
                      <span className="text-xs text-slate-600">
                        <strong className="text-slate-900 font-semibold">
                          {attendanceRate.toFixed(1)}%
                        </strong>{' '}
                        참여율
                      </span>
                    </div>
                    {isAtRisk && (
                      <div className="text-xs text-yellow-700 font-medium px-1.5 py-0.5 bg-yellow-200 rounded-sm inline-block flex-shrink-0">
                        ⚠️ 참여율 저조
                      </div>
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

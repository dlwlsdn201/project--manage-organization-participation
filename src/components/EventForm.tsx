import React, { useState, useEffect } from 'react';
import { Event, Organization, Participant } from '../types';
import { useApp } from '../context/AppContext';
import { DateRangeFilter } from './DateRangeFilter';
import { X, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  organizations: Organization[];
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  organizations,
}: EventFormProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    organizationId: event?.organizationId || '',
    startDate: event?.startDate ? format(event.startDate, 'yyyy-MM-dd') : '',
    startTime: event?.startDate ? format(event.startDate, 'HH:mm') : '',
    endDate: event?.endDate ? format(event.endDate, 'yyyy-MM-dd') : '',
    endTime: event?.endDate ? format(event.endDate, 'HH:mm') : '',
    location: event?.location || '',
    maxParticipants: event?.maxParticipants || 50,
    attendees: event?.attendees || [],
  });

  const [availableParticipants, setAvailableParticipants] = useState<
    Participant[]
  >([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    event?.attendees || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.organizationId) {
      const orgParticipants = state.participants.filter(
        (p) =>
          p.organizationId === formData.organizationId && p.status === 'active'
      );
      setAvailableParticipants(orgParticipants);
    } else {
      setAvailableParticipants([]);
    }
  }, [formData.organizationId, state.participants]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '이벤트 제목을 입력해주세요.';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = '조직을 선택해주세요.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작일을 선택해주세요.';
    }

    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료일을 선택해주세요.';
    }

    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요.';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startTime &&
      formData.endTime
    ) {
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        newErrors.endDate = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    if (selectedParticipants.length === 0) {
      newErrors.attendees = '최소 1명의 참여자를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    const eventData: Partial<Event> = {
      title: formData.title,
      description: formData.description,
      organizationId: formData.organizationId,
      startDate: startDateTime,
      endDate: endDateTime,
      location: formData.location,
      maxParticipants: formData.maxParticipants,
      attendees: selectedParticipants,
      currentParticipants: selectedParticipants.length,
      status: 'completed', // 오프라인 모임은 완료된 이벤트로 입력
    };

    onSubmit(eventData);
  };

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSelectAll = () => {
    setSelectedParticipants(availableParticipants.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedParticipants([]);
  };

  const getParticipantName = (participantId: string) => {
    const participant = state.participants.find((p) => p.id === participantId);
    return participant ? participant.name : '알 수 없음';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{event ? '모임 수정' : '오프라인 모임 기록'}</h2>
          <button className="modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>
              <Calendar size={16} />
              이벤트 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="예: 정기 모임, 워크샵, 네트워킹 등"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              <Users size={16} />
              조직 *
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) =>
                setFormData({ ...formData, organizationId: e.target.value })
              }
              className={errors.organizationId ? 'error' : ''}
            >
              <option value="">조직을 선택하세요</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <span className="error-message">{errors.organizationId}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>시작일 *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>

            <div className="form-group">
              <label>시작 시간 *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className={errors.startTime ? 'error' : ''}
              />
              {errors.startTime && (
                <span className="error-message">{errors.startTime}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>종료일 *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate}</span>
              )}
            </div>

            <div className="form-group">
              <label>종료 시간 *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className={errors.endTime ? 'error' : ''}
              />
              {errors.endTime && (
                <span className="error-message">{errors.endTime}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              <MapPin size={16} />
              장소
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="모임 장소를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label>설명</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="모임에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          {formData.organizationId && (
            <div className="form-section">
              <div className="participant-selection-header">
                <h3>참여자 선택 ({selectedParticipants.length}명)</h3>
                <div className="selection-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSelectAll}
                  >
                    전체 선택
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDeselectAll}
                  >
                    전체 해제
                  </button>
                </div>
              </div>

              <div className="participant-selection-list">
                {availableParticipants.map((participant) => (
                  <label key={participant.id} className="participant-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => handleParticipantToggle(participant.id)}
                    />
                    <div className="participant-info">
                      <span className="participant-name">
                        {state.users.find((u) => u.id === participant.userId)
                          ?.name || '알 수 없음'}
                      </span>
                      <span className="participant-role">
                        {participant.role}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {errors.attendees && (
                <span className="error-message">{errors.attendees}</span>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              {event ? '수정' : '기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

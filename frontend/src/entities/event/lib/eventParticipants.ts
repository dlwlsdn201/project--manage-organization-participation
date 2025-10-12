import { Event } from '../index';

/**
 * 확정된 참가자 수 계산
 */
export const getConfirmedParticipantsCount = (event: Event) => {
  return event.attendees.filter((attendee) => attendee.status === 'confirmed')
    .length;
};

/**
 * 대기 중인 참가자 수 계산
 */
export const getPendingParticipantsCount = (event: Event) => {
  return event.attendees.filter((attendee) => attendee.status === 'pending')
    .length;
};

/**
 * 이벤트 참가자 목록 필터링
 */
export const filterEventAttendees = (
  event: Event,
  filter: 'all' | 'confirmed' | 'pending' = 'all'
) => {
  if (!event.attendees) return [];

  switch (filter) {
    case 'confirmed':
      return event.attendees.filter(
        (attendee) => attendee.status === 'confirmed'
      );
    case 'pending':
      return event.attendees.filter(
        (attendee) => attendee.status === 'pending'
      );
    default:
      return event.attendees;
  }
};

/**
 * 이벤트 통계 계산
 */
export const calculateEventStats = (events: Event[]) => {
  const total = events.length;
  const published = events.filter((e) => e.status === 'published').length;
  const completed = events.filter((e) => e.status === 'completed').length;
  const cancelled = events.filter((e) => e.status === 'cancelled').length;
  const draft = events.filter((e) => e.status === 'draft').length;

  const totalParticipants = events.reduce(
    (sum, event) => sum + event.currentParticipants,
    0
  );
  const averageParticipants =
    total > 0 ? Math.round(totalParticipants / total) : 0;

  return {
    total,
    published,
    completed,
    cancelled,
    draft,
    totalParticipants,
    averageParticipants,
  };
};


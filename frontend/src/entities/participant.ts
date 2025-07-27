// Participant Entity
export interface Participant {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  eventId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: Date;
  attendedAt?: Date;
}

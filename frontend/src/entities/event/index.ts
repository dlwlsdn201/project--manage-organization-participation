// Event Entity
export interface Event {
  _id: string;
  organizationId: string;
  title: string;
  description?: string;
  date: Date;
  location: string;
  hostId: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

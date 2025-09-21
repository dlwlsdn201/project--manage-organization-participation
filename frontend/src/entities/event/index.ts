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
  attendees: Array<{
    memberId: string;
    status: 'confirmed' | 'pending' | 'declined';
    joinedAt: Date;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

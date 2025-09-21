// ActivityLog Entity
export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

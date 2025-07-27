// AttendanceRecord Entity
export interface AttendanceRecord {
  id: string;
  memberId: string;
  eventId: string;
  organizationId: string;
  status: 'present' | 'absent' | 'late';
  timestamp: Date;
  notes?: string;
}

// AttendanceStats Entity
export interface AttendanceStats {
  id: string;
  memberId: string;
  organizationId: string;
  totalEvents: number;
  attendedEvents: number;
  attendanceRate: number;
  lastUpdated: Date;
}

// OrganizationRules Entity
export interface OrganizationRules {
  id: string;
  organizationId: string;
  ruleType: 'participation' | 'attendance' | 'notification';
  ruleValue: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

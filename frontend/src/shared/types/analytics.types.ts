/**
 * 참여율 통계
 */
export interface AttendanceStats {
  totalEvents: number;
  totalMembers: number;
  averageAttendance: number;
  totalAttendance: number;
  attendanceRate: number;
  memberStats: MemberAttendanceStats[];
}

/**
 * 멤버별 참여 통계
 */
export interface MemberAttendanceStats {
  memberId: string;
  memberName: string;
  attendedEvents: number;
  totalEvents: number;
  attendanceRate: number;
  status: '위험' | '양호' | '우수' | '정상';
}

/**
 * 이벤트 통계
 */
export interface EventStats {
  total: number;
  published: number;
  completed: number;
  cancelled: number;
  draft: number;
  totalParticipants: number;
  averageParticipants: number;
  upcomingEvents: number;
  pastEvents: number;
}

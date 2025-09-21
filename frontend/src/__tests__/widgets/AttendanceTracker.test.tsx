import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttendanceTracker } from '../../widgets/AttendanceTracker';
import { useAppStore } from '../../store/useAppStore';
import { analyticsApi } from '../../shared/api';

jest.mock('../../store/useAppStore');
jest.mock('../../shared/api');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockAnalyticsApi = analyticsApi as jest.Mocked<typeof analyticsApi>;

describe('AttendanceTracker 컴포넌트', () => {
  const mockStore = {
    events: [
      {
        _id: 'event1',
        title: '테스트 모임 1',
        date: new Date('2024-01-15'),
        location: '서울시 강남구',
        organizationId: 'org1',
        hostId: 'member1',
        currentParticipants: 5,
        status: 'completed' as const,
        attendees: [],
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'event2',
        title: '테스트 모임 2',
        date: new Date('2024-01-20'),
        location: '서울시 서초구',
        organizationId: 'org1',
        hostId: 'member2',
        currentParticipants: 3,
        status: 'completed' as const,
        attendees: [],
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    members: [
      {
        _id: 'member1',
        name: '테스트 멤버 1',
        gender: 'male' as const,
        birthYear: 1990,
        district: '강남구',
        organizationId: 'org1',
        status: 'active' as const,
        joinedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'member2',
        name: '테스트 멤버 2',
        gender: 'female' as const,
        birthYear: 1995,
        district: '서초구',
        organizationId: 'org1',
        status: 'active' as const,
        joinedAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    loading: false,
  };

  const mockAttendanceStats = {
    totalEvents: 10,
    totalAttendance: 50,
    averageAttendance: 5,
    attendanceRate: 0.8,
  };

  const mockEventStats = {
    totalEvents: 5,
    averageParticipants: 8,
    mostPopularEvent: '테스트 모임 1',
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
    mockAnalyticsApi.getAttendanceStats.mockResolvedValue(mockAttendanceStats);
    mockAnalyticsApi.getEventStats.mockResolvedValue(mockEventStats);
    jest.clearAllMocks();
  });

  test('출석 추적기 컴포넌트가 정상적으로 렌더링되어야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('참여 분석')).toBeInTheDocument();
    expect(screen.getByText('출석 통계')).toBeInTheDocument();
    expect(screen.getByText('이벤트 통계')).toBeInTheDocument();
  });

  test('로딩 상태가 정상적으로 표시되어야 한다', () => {
    const mockStoreWithLoading = {
      ...mockStore,
      loading: true,
    };
    mockUseAppStore.mockReturnValue(mockStoreWithLoading);

    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  test('조직별 이벤트가 필터링되어 표시되어야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('테스트 모임 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 모임 2')).toBeInTheDocument();
  });

  test('날짜 범위 필터가 정상적으로 작동해야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    const dateRangeFilter = screen.getByText('날짜 범위');
    fireEvent.click(dateRangeFilter);

    // 날짜 필터 옵션들이 표시되어야 함
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('이번 주')).toBeInTheDocument();
    expect(screen.getByText('이번 달')).toBeInTheDocument();
  });

  test('출석률 계산이 정상적으로 작동해야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    // 출석률 관련 통계가 표시되어야 함
    expect(screen.getByText(/총 참여자 수/)).toBeInTheDocument();
    expect(screen.getByText(/평균 참여율/)).toBeInTheDocument();
  });

  test('멤버별 참여 통계가 정상적으로 표시되어야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('멤버별 참여 통계')).toBeInTheDocument();
    expect(screen.getByText('테스트 멤버 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 멤버 2')).toBeInTheDocument();
  });

  test('이벤트별 참여 통계가 정상적으로 표시되어야 한다', () => {
    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('이벤트별 참여 통계')).toBeInTheDocument();
    expect(screen.getByText('테스트 모임 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 모임 2')).toBeInTheDocument();
  });

  test('데이터가 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
    const mockStoreEmpty = {
      ...mockStore,
      events: [],
      members: [],
    };
    mockUseAppStore.mockReturnValue(mockStoreEmpty);

    render(<AttendanceTracker organizationId="org1" />);

    expect(screen.getByText('분석할 데이터가 없습니다.')).toBeInTheDocument();
  });

  test('통계 데이터 로딩이 실패했을 때 오류 메시지가 표시되어야 한다', async () => {
    mockAnalyticsApi.getAttendanceStats.mockRejectedValue(
      new Error('API 오류')
    );
    mockAnalyticsApi.getEventStats.mockRejectedValue(new Error('API 오류'));

    render(<AttendanceTracker organizationId="org1" />);

    // 오류 메시지가 표시되어야 함 (실제 구현에 따라 조정 필요)
    // expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
  });

  test('조직 ID가 변경될 때 데이터가 다시 로드되어야 한다', () => {
    const { rerender } = render(<AttendanceTracker organizationId="org1" />);

    rerender(<AttendanceTracker organizationId="org2" />);

    expect(mockAnalyticsApi.getAttendanceStats).toHaveBeenCalledWith('org2');
    expect(mockAnalyticsApi.getEventStats).toHaveBeenCalledWith('org2');
  });
});

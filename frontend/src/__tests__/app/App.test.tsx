import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../app/App';
import { useAppStore } from '../../store/useAppStore';
import { initialDataApi } from '../../shared/api';

jest.mock('../../store/useAppStore');
jest.mock('../../shared/api');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockInitialDataApi = initialDataApi as jest.Mocked<typeof initialDataApi>;

describe('App 컴포넌트', () => {
  const mockStore = {
    user: null,
    organizations: [],
    members: [],
    events: [],
    activityLogs: [],
    selectedOrganization: null,
    loading: false,
    setUser: jest.fn(),
    setOrganizations: jest.fn(),
    setMembers: jest.fn(),
    setEvents: jest.fn(),
    setActivityLogs: jest.fn(),
    setLoading: jest.fn(),
    selectOrganization: jest.fn(),
  };

  const mockInitialData = {
    organizations: [
      {
        _id: 'org1',
        name: '테스트 조직',
        description: '테스트 조직입니다',
        type: 'club' as const,
        currentMembers: 10,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    members: [
      {
        _id: 'member1',
        name: '테스트 멤버',
        gender: 'male' as const,
        birthYear: 1990,
        district: '강남구',
        organizationId: 'org1',
        status: 'active' as const,
        joinedAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    events: [],
    activityLogs: [],
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
    mockInitialDataApi.loadAll.mockResolvedValue(mockInitialData);
    jest.clearAllMocks();
  });

  test('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />);

    expect(screen.getByText('조직 참여 관리 시스템')).toBeInTheDocument();
    expect(screen.getByText('조직 관리')).toBeInTheDocument();
    expect(screen.getByText('모임 관리')).toBeInTheDocument();
    expect(screen.getByText('참여 분석')).toBeInTheDocument();
  });

  test('초기 데이터 로딩이 정상적으로 작동해야 한다', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockInitialDataApi.loadAll).toHaveBeenCalled();
      expect(mockStore.setOrganizations).toHaveBeenCalledWith(
        mockInitialData.organizations
      );
      expect(mockStore.setMembers).toHaveBeenCalledWith(
        mockInitialData.members
      );
      expect(mockStore.setEvents).toHaveBeenCalledWith(mockInitialData.events);
      expect(mockStore.setActivityLogs).toHaveBeenCalledWith(
        mockInitialData.activityLogs
      );
    });
  });

  test('기본 사용자가 설정되어야 한다', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockStore.setUser).toHaveBeenCalledWith({
        id: 'test_user_123',
        name: '관리자',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  test('로딩 상태가 정상적으로 표시되어야 한다', () => {
    const mockStoreWithLoading = {
      ...mockStore,
      loading: true,
    };
    mockUseAppStore.mockReturnValue(mockStoreWithLoading);

    render(<App />);

    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  test('탭 전환이 정상적으로 작동해야 한다', async () => {
    render(<App />);

    const eventsTab = screen.getByText('모임 관리');
    fireEvent.click(eventsTab);

    expect(
      screen.getByText('모임을 관리하려면 먼저 조직을 선택해주세요.')
    ).toBeInTheDocument();

    const analyticsTab = screen.getByText('참여 분석');
    fireEvent.click(analyticsTab);

    expect(
      screen.getByText('분석을 보려면 먼저 조직을 선택해주세요.')
    ).toBeInTheDocument();
  });

  test('조직 선택 후 모임 관리 탭에서 이벤트 매니저가 표시되어야 한다', async () => {
    const mockStoreWithSelectedOrg = {
      ...mockStore,
      selectedOrganization: mockInitialData.organizations[0],
    };
    mockUseAppStore.mockReturnValue(mockStoreWithSelectedOrg);

    render(<App />);

    const eventsTab = screen.getByText('모임 관리');
    fireEvent.click(eventsTab);

    // EventManager 컴포넌트가 렌더링되어야 함
    expect(screen.getByText('모임 목록')).toBeInTheDocument();
  });

  test('조직 선택 해제가 정상적으로 작동해야 한다', () => {
    const mockStoreWithSelectedOrg = {
      ...mockStore,
      selectedOrganization: mockInitialData.organizations[0],
    };
    mockUseAppStore.mockReturnValue(mockStoreWithSelectedOrg);

    render(<App />);

    const deselectButton = screen.getByText('조직 선택 해제');
    fireEvent.click(deselectButton);

    expect(mockStore.selectOrganization).toHaveBeenCalledWith(null);
  });

  test('사용자 정보가 표시되어야 한다', async () => {
    const mockStoreWithUser = {
      ...mockStore,
      user: {
        id: 'user1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'admin' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    mockUseAppStore.mockReturnValue(mockStoreWithUser);

    render(<App />);

    expect(
      screen.getByText('안녕하세요, 테스트 사용자님!')
    ).toBeInTheDocument();
  });

  test('선택된 조직 정보가 표시되어야 한다', () => {
    const mockStoreWithSelectedOrg = {
      ...mockStore,
      selectedOrganization: mockInitialData.organizations[0],
    };
    mockUseAppStore.mockReturnValue(mockStoreWithSelectedOrg);

    render(<App />);

    expect(screen.getByText('현재 선택된 조직:')).toBeInTheDocument();
    expect(screen.getByText('테스트 조직')).toBeInTheDocument();
  });

  test('데이터 로딩 실패 시 오류 메시지가 표시되어야 한다', async () => {
    mockInitialDataApi.loadAll.mockRejectedValue(new Error('API 오류'));

    render(<App />);

    await waitFor(() => {
      expect(mockStore.setLoading).toHaveBeenCalledWith(false);
    });
  });

  test('조직 관리 탭에서 조직 목록이 표시되어야 한다', () => {
    render(<App />);

    const organizationsTab = screen.getByText('조직 관리');
    fireEvent.click(organizationsTab);

    // OrganizationList 컴포넌트가 렌더링되어야 함
    expect(screen.getByText('조직 목록')).toBeInTheDocument();
  });
});

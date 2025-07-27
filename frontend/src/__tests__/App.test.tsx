import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { useAppStore } from '../store/useAppStore';

// Mock the store
jest.mock('../store/useAppStore');
jest.mock('../services/api');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('App 컴포넌트', () => {
  const mockStore = {
    user: {
      id: 'current_user',
      name: '관리자',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    selectedOrganization: null,
    events: [],
    loading: false,
    setUser: jest.fn(),
    setUsers: jest.fn(),
    setOrganizations: jest.fn(),
    setParticipants: jest.fn(),
    setMembers: jest.fn(),
    setEvents: jest.fn(),
    setActivityLogs: jest.fn(),
    setLoading: jest.fn(),
    selectOrganization: jest.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />);

    expect(screen.getByText('조직 참여 관리 시스템')).toBeInTheDocument();
    expect(screen.getByText('조직 관리')).toBeInTheDocument();
    expect(screen.getByText('모임 관리')).toBeInTheDocument();
    expect(screen.getByText('참여 분석')).toBeInTheDocument();
  });

  test('사용자 정보가 표시되어야 한다', () => {
    render(<App />);

    expect(screen.getByText('안녕하세요, 관리자님!')).toBeInTheDocument();
  });

  test('탭 전환이 정상적으로 작동해야 한다', () => {
    render(<App />);

    // 모임 관리 탭 클릭
    fireEvent.click(screen.getByText('모임 관리'));
    expect(
      screen.getByText('모임을 관리하려면 먼저 조직을 선택해주세요.')
    ).toBeInTheDocument();

    // 참여 분석 탭 클릭
    fireEvent.click(screen.getByText('참여 분석'));
    expect(
      screen.getByText('분석을 보려면 먼저 조직을 선택해주세요.')
    ).toBeInTheDocument();

    // 조직 관리 탭 클릭
    fireEvent.click(screen.getByText('조직 관리'));
    expect(
      screen.queryByText('모임을 관리하려면 먼저 조직을 선택해주세요.')
    ).not.toBeInTheDocument();
  });

  test('조직이 선택되었을 때 선택된 조직 정보가 표시되어야 한다', () => {
    const mockStoreWithSelectedOrg = {
      ...mockStore,
      selectedOrganization: {
        _id: 'org1',
        name: '테스트 조직',
        description: '테스트 조직입니다',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    mockUseAppStore.mockReturnValue(mockStoreWithSelectedOrg);

    render(<App />);

    expect(screen.getByText('현재 선택된 조직:')).toBeInTheDocument();
    expect(screen.getByText('테스트 조직')).toBeInTheDocument();
    expect(screen.getByText('조직 선택 해제')).toBeInTheDocument();
  });

  test('조직 선택 해제 버튼이 정상적으로 작동해야 한다', () => {
    const mockStoreWithSelectedOrg = {
      ...mockStore,
      selectedOrganization: {
        _id: 'org1',
        name: '테스트 조직',
        description: '테스트 조직입니다',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    mockUseAppStore.mockReturnValue(mockStoreWithSelectedOrg);

    render(<App />);

    fireEvent.click(screen.getByText('조직 선택 해제'));

    expect(mockStore.selectOrganization).toHaveBeenCalledWith(null);
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
});

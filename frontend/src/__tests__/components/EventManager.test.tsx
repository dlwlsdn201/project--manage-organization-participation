import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventManager } from '../../widgets/EventManager';
import { useAppStore } from '../../store/useAppStore';

jest.mock('../../store/useAppStore');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('EventManager 컴포넌트', () => {
  const mockEvents = [
    {
      _id: 'event1',
      title: '테스트 모임 1',
      description: '첫 번째 테스트 모임입니다',
      date: new Date('2024-01-15'),
      location: '서울시 강남구',
      organizationId: 'org1',
      participants: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: 'event2',
      title: '테스트 모임 2',
      description: '두 번째 테스트 모임입니다',
      date: new Date('2024-01-20'),
      location: '서울시 서초구',
      organizationId: 'org1',
      participants: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockStore = {
    events: mockEvents,
    members: [],
    loading: false,
    setEvents: jest.fn(),
    setLoading: jest.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('모임 목록이 정상적으로 렌더링되어야 한다', () => {
    render(<EventManager organizationId="org1" />);

    expect(screen.getByText('모임 목록')).toBeInTheDocument();
    expect(screen.getByText('테스트 모임 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 모임 2')).toBeInTheDocument();
  });

  test('모임이 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
    const mockStoreEmpty = {
      ...mockStore,
      events: [],
    };
    mockUseAppStore.mockReturnValue(mockStoreEmpty);

    render(<EventManager organizationId="org1" />);

    expect(screen.getByText('등록된 모임이 없습니다.')).toBeInTheDocument();
  });

  test('새 모임 추가 버튼이 정상적으로 작동해야 한다', () => {
    render(<EventManager organizationId="org1" />);

    const addButton = screen.getByText('새 모임 추가');
    fireEvent.click(addButton);

    expect(screen.getByText('모임 정보 입력')).toBeInTheDocument();
  });

  test('모임 편집 버튼이 정상적으로 작동해야 한다', () => {
    render(<EventManager organizationId="org1" />);

    const editButtons = screen.getAllByText('편집');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('모임 정보 수정')).toBeInTheDocument();
  });

  test('모임 삭제 버튼이 정상적으로 작동해야 한다', async () => {
    render(<EventManager organizationId="org1" />);

    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그가 나타나야 함
    expect(
      screen.getByText('정말로 이 모임을 삭제하시겠습니까?')
    ).toBeInTheDocument();
  });

  test('참가자 관리 버튼이 정상적으로 작동해야 한다', () => {
    render(<EventManager organizationId="org1" />);

    const manageButtons = screen.getAllByText('참가자 관리');
    fireEvent.click(manageButtons[0]);

    expect(screen.getByText('참가자 관리')).toBeInTheDocument();
  });

  test('로딩 상태가 정상적으로 표시되어야 한다', () => {
    const mockStoreWithLoading = {
      ...mockStore,
      loading: true,
    };
    mockUseAppStore.mockReturnValue(mockStoreWithLoading);

    render(<EventManager organizationId="org1" />);

    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  test('모임 검색이 정상적으로 작동해야 한다', () => {
    render(<EventManager organizationId="org1" />);

    const searchInput = screen.getByPlaceholderText('모임명으로 검색...');
    fireEvent.change(searchInput, { target: { value: '테스트 모임 1' } });

    expect(screen.getByText('테스트 모임 1')).toBeInTheDocument();
    expect(screen.queryByText('테스트 모임 2')).not.toBeInTheDocument();
  });

  test('날짜 필터가 정상적으로 작동해야 한다', () => {
    render(<EventManager organizationId="org1" />);

    const dateFilter = screen.getByText('날짜별 필터');
    fireEvent.click(dateFilter);

    // 날짜 필터 옵션들이 표시되어야 함
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('이번 주')).toBeInTheDocument();
    expect(screen.getByText('이번 달')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrganizationList } from '../../widgets/organization';
import { useAppStore } from '../../store/useAppStore';

jest.mock('../../store/useAppStore');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('OrganizationList 컴포넌트', () => {
  const mockOrganizations = [
    {
      _id: 'org1',
      name: '테스트 조직 1',
      description: '첫 번째 테스트 조직입니다',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: 'org2',
      name: '테스트 조직 2',
      description: '두 번째 테스트 조직입니다',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockStore = {
    organizations: mockOrganizations,
    loading: false,
    setOrganizations: jest.fn(),
    setLoading: jest.fn(),
  };

  const mockOnEditOrganization = jest.fn();

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('조직 목록이 정상적으로 렌더링되어야 한다', () => {
    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    expect(screen.getByText('조직 목록')).toBeInTheDocument();
    expect(screen.getByText('테스트 조직 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 조직 2')).toBeInTheDocument();
  });

  test('조직이 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
    const mockStoreEmpty = {
      ...mockStore,
      organizations: [],
    };
    mockUseAppStore.mockReturnValue(mockStoreEmpty);

    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    expect(screen.getByText('등록된 조직이 없습니다.')).toBeInTheDocument();
  });

  test('새 조직 추가 버튼이 정상적으로 작동해야 한다', () => {
    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    const addButton = screen.getByText('새 조직 추가');
    fireEvent.click(addButton);

    expect(screen.getByText('조직 정보 입력')).toBeInTheDocument();
  });

  test('조직 편집 버튼이 정상적으로 작동해야 한다', () => {
    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    const editButtons = screen.getAllByText('편집');
    fireEvent.click(editButtons[0]);

    expect(mockOnEditOrganization).toHaveBeenCalledWith(mockOrganizations[0]);
  });

  test('조직 삭제 버튼이 정상적으로 작동해야 한다', async () => {
    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그가 나타나야 함
    expect(
      screen.getByText('정말로 이 조직을 삭제하시겠습니까?')
    ).toBeInTheDocument();
  });

  test('로딩 상태가 정상적으로 표시되어야 한다', () => {
    const mockStoreWithLoading = {
      ...mockStore,
      loading: true,
    };
    mockUseAppStore.mockReturnValue(mockStoreWithLoading);

    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  test('조직 검색이 정상적으로 작동해야 한다', () => {
    render(<OrganizationList onEditOrganization={mockOnEditOrganization} />);

    const searchInput = screen.getByPlaceholderText('조직명으로 검색...');
    fireEvent.change(searchInput, { target: { value: '테스트 조직 1' } });

    expect(screen.getByText('테스트 조직 1')).toBeInTheDocument();
    expect(screen.queryByText('테스트 조직 2')).not.toBeInTheDocument();
  });
});

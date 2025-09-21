import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrganizationForm } from '../../features/organization';
import { useAppStore } from '../../store/useAppStore';
import { Organization } from '../../entities';

jest.mock('../../store/useAppStore');

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('OrganizationForm 컴포넌트', () => {
  const mockStore = {
    createOrganization: jest.fn(),
    updateOrganization: jest.fn(),
    loading: false,
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  test('새 조직 생성 폼이 정상적으로 렌더링되어야 한다', () => {
    render(
      <OrganizationForm
        organization={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('조직 정보 입력')).toBeInTheDocument();
    expect(screen.getByLabelText('조직명')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('조직 유형')).toBeInTheDocument();
  });

  test('기존 조직 수정 폼이 정상적으로 렌더링되어야 한다', () => {
    const existingOrganization: Organization = {
      _id: 'org1',
      name: '기존 조직',
      description: '기존 조직 설명',
      type: 'club',
      currentMembers: 5,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <OrganizationForm
        organization={existingOrganization}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('기존 조직')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 조직 설명')).toBeInTheDocument();
  });

  test('필수 필드가 비어있을 때 유효성 검사가 작동해야 한다', async () => {
    mockStore.createOrganization.mockResolvedValue({});

    render(
      <OrganizationForm
        organization={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('저장');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStore.createOrganization).not.toHaveBeenCalled();
    });
  });

  test('올바른 데이터로 새 조직을 생성할 수 있어야 한다', async () => {
    const newOrganization = {
      _id: 'new-org',
      name: '새 조직',
      description: '새 조직 설명',
      type: 'study' as const,
      currentMembers: 0,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockStore.createOrganization.mockResolvedValue(newOrganization);

    render(
      <OrganizationForm
        organization={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 폼 필드 입력
    fireEvent.change(screen.getByLabelText('조직명'), {
      target: { value: '새 조직' },
    });
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '새 조직 설명' },
    });

    const submitButton = screen.getByText('저장');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStore.createOrganization).toHaveBeenCalledWith({
        name: '새 조직',
        description: '새 조직 설명',
        type: 'study',
        currentMembers: 0,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('기존 조직을 수정할 수 있어야 한다', async () => {
    const existingOrganization: Organization = {
      _id: 'org1',
      name: '기존 조직',
      description: '기존 조직 설명',
      type: 'club',
      currentMembers: 5,
      settings: { participationRule: '제한없음' },
      createdBy: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedOrganization = {
      ...existingOrganization,
      name: '수정된 조직',
      description: '수정된 조직 설명',
    };

    mockStore.updateOrganization.mockResolvedValue(updatedOrganization);

    render(
      <OrganizationForm
        organization={existingOrganization}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 폼 필드 수정
    fireEvent.change(screen.getByDisplayValue('기존 조직'), {
      target: { value: '수정된 조직' },
    });
    fireEvent.change(screen.getByDisplayValue('기존 조직 설명'), {
      target: { value: '수정된 조직 설명' },
    });

    const submitButton = screen.getByText('저장');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStore.updateOrganization).toHaveBeenCalledWith('org1', {
        name: '수정된 조직',
        description: '수정된 조직 설명',
        type: 'club',
        currentMembers: 5,
        settings: { participationRule: '제한없음' },
        createdBy: 'user1',
        createdAt: existingOrganization.createdAt,
        updatedAt: existingOrganization.updatedAt,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('취소 버튼이 정상적으로 작동해야 한다', () => {
    render(
      <OrganizationForm
        organization={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('로딩 상태가 정상적으로 표시되어야 한다', () => {
    const mockStoreWithLoading = {
      ...mockStore,
      loading: true,
    };
    mockUseAppStore.mockReturnValue(mockStoreWithLoading);

    render(
      <OrganizationForm
        organization={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('저장 중...')).toBeInTheDocument();
  });
});

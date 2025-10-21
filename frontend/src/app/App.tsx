import { useState, useEffect } from 'react';
import { useAppInit } from './model/useAppInit';
import { useUserStore } from '@/entities/user/model';
import { useOrganizationStore } from '../features/organization/lib';
import { OrganizationsPage } from '@/pages/organizations';
import { EventsPage } from '@/pages/events';
import { AnalyticsPage } from '@/pages/analytics';
import { Organization } from '../entities/organization';
import { LoadingSpinner } from '../shared/ui/Spinner';
import { getCurrentUser } from '../shared/lib/user-utils';
import { message } from 'antd';
import { TabButton } from '../shared/ui/Button';
import { DefaultButton } from '@/shared/ui/Button';
import { startSelfPing } from '@/shared/api/health';

type TabType = 'organizations' | 'events' | 'analytics';

function App() {
  startSelfPing();

  // App-level 초기화 및 로딩 상태
  const { loading, loadInitialData } = useAppInit();

  // User 상태
  const { user, setUser } = useUserStore();

  // Organization 상태
  const { selectedOrganization, setSelectedOrganization } =
    useOrganizationStore();

  const [activeTab, setActiveTab] = useState<TabType>('organizations');

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadInitialData();

        // 기본 사용자 설정
        setUser(getCurrentUser());

        message.success('데이터 로딩이 완료되었습니다.');
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
        message.error('데이터 로딩 중 오류가 발생했습니다.');
      }
    };

    loadData();
  }, [loadInitialData, setUser]);

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setActiveTab('events');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organizations':
        return (
          <OrganizationsPage onEditOrganization={handleEditOrganization} />
        );

      case 'events':
        return (
          <EventsPage organizationId={selectedOrganization?._id || null} />
        );

      case 'analytics':
        return (
          <AnalyticsPage organizationId={selectedOrganization?._id || null} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex flex-col mobile:gap-x-4 mobile:flex-row justify-between items-start mobile:items-center bg-white px-4 mobile:px-8 py-4 shadow-lg gap-4 mobile:gap-0">
        <span className="text-lg mobile:text-xl font-semibold text-gray-900 shrink-0">
          소모임 활동 관리 시스템
        </span>
        <div className="flex flex-col items-start mobile:items-end gap-2 w-full mobile:w-auto">
          {user && (
            <div className="text-xs mobile:text-sm text-slate-600">
              안녕하세요, {user.name}님!
            </div>
          )}
          {selectedOrganization && (
            <div className="text-xs mobile:text-sm text-slate-900 px-3 mobile:px-4 py-2 bg-primary-50 border border-primary-100 rounded-lg w-full mobile:w-auto">
              <span className="break-keep">선택된 조직:</span>{' '}
              <strong>{selectedOrganization.name}</strong>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 mobile:p-[1rem] w-full">
        <nav className="flex mobile:flex-col flex-row gap-2 mobile:gap-2 mb-8 border-b-2 border-slate-200">
          <TabButton
            isActive={activeTab === 'organizations'}
            onClick={() => setActiveTab('organizations')}
          >
            조직 관리
          </TabButton>

          <TabButton
            isActive={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
          >
            <span className="flex items-center gap-2">모임 관리</span>
          </TabButton>

          <TabButton
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            참여 분석
          </TabButton>
        </nav>

        {selectedOrganization && (
          <div className="flex flex-col mobile:flex-row items-start mobile:items-center gap-2 mobile:gap-4 p-3 mobile:p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
            <div className="flex flex-col mobile:flex-row items-start mobile:items-center gap-1 mobile:gap-4 flex-1">
              <span className="text-xs mobile:text-sm text-slate-600">
                현재 관리 중인 조직:
              </span>
              <strong className="text-sm mobile:text-base text-slate-900">
                {selectedOrganization.name}
              </strong>
            </div>
            <DefaultButton
              onClick={() => {
                setSelectedOrganization(null);
                setActiveTab('organizations');
              }}
            >
              조직 선택 해제
            </DefaultButton>
          </div>
        )}

        {loading ? <LoadingSpinner /> : <div>{renderTabContent()}</div>}
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { OrganizationList } from '../widgets/OrganizationList';
import { EventManager } from '../widgets/EventManager';
import { AttendanceTracker } from '../widgets/AttendanceTracker';
import { Organization } from '../entities/organization';
import { initialDataApi } from '../shared/api';
import { message } from 'antd';

type TabType = 'organizations' | 'events' | 'analytics';

function App() {
  const {
    user,
    selectedOrganization,
    events,
    loading,
    setUser,
    setOrganizations,
    setMembers,
    setEvents,
    setActivityLogs,
    setLoading,
    selectOrganization,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('organizations');

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await initialDataApi.loadAll();
        setOrganizations(data.organizations || []);
        setMembers(data.members || []);
        setEvents(data.events || []);
        setActivityLogs(data.activityLogs || []);

        // 기본 사용자 설정 (임시)
        setUser({
          id: 'current_user',
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        message.success('데이터 로딩이 완료되었습니다.');
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
        message.error('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setUser, setOrganizations, setMembers, setActivityLogs, setLoading]);

  const handleEditOrganization = (organization: Organization) => {
    selectOrganization(organization);
    setActiveTab('events');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationList onEditOrganization={handleEditOrganization} />;

      case 'events':
        if (!selectedOrganization) {
          return (
            <div className="empty-state">
              <p>모임을 관리하려면 먼저 조직을 선택해주세요.</p>
            </div>
          );
        }
        return <EventManager organizationId={selectedOrganization._id} />;

      case 'analytics':
        if (!selectedOrganization) {
          return (
            <div className="empty-state">
              <p>분석을 보려면 먼저 조직을 선택해주세요.</p>
            </div>
          );
        }
        return <AttendanceTracker organizationId={selectedOrganization._id} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex justify-between items-center bg-white px-8 py-4 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">
          조직 참여 관리 시스템
        </h1>
        <div className="flex flex-col items-end gap-2">
          {user && (
            <div className="text-sm text-slate-600">
              안녕하세요, {user.name}님!
            </div>
          )}
          {selectedOrganization && (
            <div className="text-sm text-slate-900 px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg">
              현재 선택된 조직: <strong>{selectedOrganization.name}</strong>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-8 w-full">
        <nav className="flex gap-2 mb-8 border-b-2 border-slate-200">
          <button
            className={`px-6 py-3 font-medium text-base transition-all duration-200 border-b-2 ${
              activeTab === 'organizations'
                ? 'text-primary border-primary bg-slate-50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('organizations')}
          >
            조직 관리
          </button>

          <button
            className={`px-6 py-3 font-medium text-base transition-all duration-200 border-b-2 ${
              activeTab === 'events'
                ? 'text-primary border-primary bg-slate-50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('events')}
          >
            모임 관리
            {selectedOrganization && (
              <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded-md ml-2">
                {
                  events.filter(
                    (e) => e.organizationId === selectedOrganization?._id
                  ).length
                }
              </span>
            )}
          </button>
          <button
            className={`px-6 py-3 font-medium text-base transition-all duration-200 border-b-2 ${
              activeTab === 'analytics'
                ? 'text-primary border-primary bg-slate-50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            참여 분석
          </button>
        </nav>

        {selectedOrganization && (
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
            <span className="text-sm text-slate-600">현재 관리 중인 조직:</span>
            <strong className="text-base text-slate-900">
              {selectedOrganization.name}
            </strong>
            <button
              className="px-3 py-1.5 text-sm bg-transparent text-slate-600 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors"
              onClick={() => {
                selectOrganization(null);
                setActiveTab('organizations');
              }}
            >
              조직 선택 해제
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div>{renderTabContent()}</div>
        )}
      </main>
    </div>
  );
}

export default App;

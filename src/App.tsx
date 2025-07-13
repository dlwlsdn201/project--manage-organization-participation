import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { OrganizationList } from './components/OrganizationList';
import { EventManager } from './components/EventManager';
import { AttendanceTracker } from './components/AttendanceTracker';
import { Organization } from './types';
import { loadInitialData } from './utils/mockData';

type TabType = 'organizations' | 'events' | 'analytics';

function App() {
  const {
    user,
    selectedOrganization,
    events,
    setUser,
    setUsers,
    setOrganizations,
    setParticipants,
    setMembers,
    setEvents,
    setActivityLogs,
    selectOrganization,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('organizations');

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = loadInitialData();

    setUser(initialData.user);
    setUsers(initialData.users);
    setOrganizations(initialData.organizations);
    setParticipants(initialData.participants);
    setMembers(initialData.members);
    setEvents(initialData.events);
    setActivityLogs(initialData.activityLogs);
  }, [
    setUser,
    setUsers,
    setOrganizations,
    setParticipants,
    setMembers,
    setEvents,
    setActivityLogs,
  ]);

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
        return <EventManager organizationId={selectedOrganization.id} />;

      case 'analytics':
        if (!selectedOrganization) {
          return (
            <div className="empty-state">
              <p>분석을 보려면 먼저 조직을 선택해주세요.</p>
            </div>
          );
        }
        return <AttendanceTracker organizationId={selectedOrganization.id} />;

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
                    (e) => e.organizationId === selectedOrganization?.id
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

        <div>{renderTabContent()}</div>
      </main>
    </div>
  );
}

export default App;

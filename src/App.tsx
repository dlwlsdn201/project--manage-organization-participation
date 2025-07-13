import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { OrganizationList } from './components/OrganizationList';
import { EventManager } from './components/EventManager';
import { AttendanceTracker } from './components/AttendanceTracker';
import { Organization } from './types';
import { loadInitialData } from './utils/mockData';
import './App.css';

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
    <div className="app">
      <header className="app-header">
        <h1>조직 참여 관리 시스템</h1>
        <div className="header-info">
          {user && <div className="user-info">안녕하세요, {user.name}님!</div>}
          {selectedOrganization && (
            <div className="selected-organization">
              현재 선택된 조직: <strong>{selectedOrganization.name}</strong>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            조직 관리
          </button>

          <button
            className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            모임 관리
            {selectedOrganization && (
              <span className="tab-badge">
                {
                  events.filter(
                    (e) => e.organizationId === selectedOrganization?.id
                  ).length
                }
              </span>
            )}
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            참여 분석
          </button>
        </nav>

        {selectedOrganization && (
          <div className="organization-breadcrumb">
            <span>현재 관리 중인 조직:</span>
            <strong>{selectedOrganization.name}</strong>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                selectOrganization(null);
                setActiveTab('organizations');
              }}
            >
              조직 선택 해제
            </button>
          </div>
        )}

        <div className="tab-content">{renderTabContent()}</div>
      </main>
    </div>
  );
}

export default App;

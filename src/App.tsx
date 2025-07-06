import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OrganizationList } from './components/OrganizationList';
import { EventManager } from './components/EventManager';
import { AttendanceTracker } from './components/AttendanceTracker';
import { Organization } from './types';
import { loadInitialData } from './utils/mockData';
import './App.css';

type TabType = 'organizations' | 'events' | 'analytics';

function AppContent() {
  const { state, dispatch } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('organizations');

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = loadInitialData();

    dispatch({ type: 'SET_USER', payload: initialData.user });
    dispatch({ type: 'SET_USERS', payload: initialData.users });
    dispatch({ type: 'SET_ORGANIZATIONS', payload: initialData.organizations });
    dispatch({ type: 'SET_PARTICIPANTS', payload: initialData.participants });
    dispatch({ type: 'SET_EVENTS', payload: initialData.events });
    dispatch({ type: 'SET_ACTIVITY_LOGS', payload: initialData.activityLogs });
  }, [dispatch]);

  const handleEditOrganization = (organization: Organization) => {
    dispatch({ type: 'SELECT_ORGANIZATION', payload: organization });
    setActiveTab('events');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationList onEditOrganization={handleEditOrganization} />;

      case 'events':
        if (!state.selectedOrganization) {
          return (
            <div className="empty-state">
              <p>모임을 관리하려면 먼저 조직을 선택해주세요.</p>
            </div>
          );
        }
        return <EventManager organizationId={state.selectedOrganization.id} />;

      case 'analytics':
        if (!state.selectedOrganization) {
          return (
            <div className="empty-state">
              <p>분석을 보려면 먼저 조직을 선택해주세요.</p>
            </div>
          );
        }
        return (
          <AttendanceTracker organizationId={state.selectedOrganization.id} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>조직 참여 관리 시스템</h1>
        {state.user && (
          <div className="user-info">안녕하세요, {state.user.name}님!</div>
        )}
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
            {state.selectedOrganization && (
              <span className="tab-badge">
                {
                  state.events.filter(
                    (e) => e.organizationId === state.selectedOrganization?.id
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

        <div className="tab-content">{renderTabContent()}</div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

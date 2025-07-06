import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrganizationForm } from './OrganizationForm';
import { Organization } from '../types';
import {
  Search,
  Plus,
  Users,
  Calendar,
  Settings,
  Trash2,
  Edit,
  MapPin,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';
import { generateId } from '../utils/mockData';

interface OrganizationListProps {
  onEditOrganization: (organization: Organization) => void;
}

export function OrganizationList({
  onEditOrganization,
}: OrganizationListProps) {
  const {
    state,
    selectOrganization,
    deleteOrganization,
    addOrganization,
    updateOrganization,
    addActivityLog,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<
    Organization | undefined
  >();

  const filteredOrganizations = state.organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === null || org.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  const handleSelectOrganization = (organization: Organization) => {
    selectOrganization(organization);
  };

  const handleCreateOrganization = () => {
    setEditingOrganization(undefined);
    setShowForm(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrganization(organization);
    setShowForm(true);
  };

  const handleDeleteOrganization = (id: string, name: string) => {
    if (
      window.confirm(
        `정말로 "${name}" 조직을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 조직의 모든 데이터가 삭제됩니다.`
      )
    ) {
      deleteOrganization(id);

      // 활동 로그 추가
      addActivityLog({
        id: generateId(),
        organizationId: id,
        userId: state.user?.id || '',
        action: 'organization_deleted',
        details: `${name} 조직을 삭제했습니다.`,
        timestamp: new Date(),
        metadata: { organizationName: name },
      });
    }
  };

  const handleSubmitOrganization = async (data: Partial<Organization>) => {
    try {
      if (editingOrganization) {
        // 수정
        const updatedOrganization: Organization = {
          ...editingOrganization,
          ...data,
          updatedAt: new Date(),
        };
        updateOrganization(updatedOrganization);

        addActivityLog({
          id: generateId(),
          organizationId: updatedOrganization.id,
          userId: state.user?.id || '',
          action: 'organization_updated',
          details: `${updatedOrganization.name} 조직 정보를 수정했습니다.`,
          timestamp: new Date(),
          metadata: { organizationName: updatedOrganization.name },
        });
      } else {
        // 생성
        const newOrganization: Organization = {
          id: generateId(),
          ...data,
          memberCount: 1, // 생성자가 첫 번째 멤버
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            isPublic: data.settings?.allowPublicJoin || false,
            allowSelfJoin: data.settings?.allowPublicJoin || false,
            requireApproval: data.settings?.requireApproval || true,
            maxMembers: data.maxMembers,
            allowPublicJoin: data.settings?.allowPublicJoin || false,
            minAttendanceRate: data.settings?.minAttendanceRate || 60,
          },
        } as Organization;

        addOrganization(newOrganization);

        addActivityLog({
          id: generateId(),
          organizationId: newOrganization.id,
          userId: state.user?.id || '',
          action: 'organization_created',
          details: `${newOrganization.name} 조직을 생성했습니다.`,
          timestamp: new Date(),
          metadata: { organizationName: newOrganization.name },
        });
      }

      setShowForm(false);
      setEditingOrganization(undefined);
    } catch (error) {
      console.error('조직 저장 중 오류:', error);
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOrganization(undefined);
  };

  return (
    <div className="organization-list">
      <div className="organization-list-header">
        <div className="header-content">
          <h2>조직 관리</h2>
          <p className="organization-subtitle">
            조직을 생성하거나 관리할 조직을 선택하세요
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateOrganization}>
          <Plus size={20} />새 조직 생성
        </button>
      </div>

      <div className="organization-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="조직 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterActive === null ? 'active' : ''}`}
            onClick={() => setFilterActive(null)}
          >
            전체
          </button>
          <button
            className={`filter-btn ${filterActive === true ? 'active' : ''}`}
            onClick={() => setFilterActive(true)}
          >
            활성
          </button>
          <button
            className={`filter-btn ${filterActive === false ? 'active' : ''}`}
            onClick={() => setFilterActive(false)}
          >
            비활성
          </button>
        </div>
      </div>

      <div className="organization-grid">
        {filteredOrganizations.map((organization) => (
          <div
            key={organization.id}
            className={`organization-card ${state.selectedOrganization?.id === organization.id ? 'selected' : ''}`}
            onClick={() => handleSelectOrganization(organization)}
          >
            <div className="organization-header">
              <div className="organization-info">
                {organization.logo && (
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="organization-logo"
                  />
                )}
                <div>
                  <h3>{organization.name}</h3>
                  <span
                    className={`status-badge ${organization.isActive ? 'active' : 'inactive'}`}
                  >
                    {organization.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              <div className="organization-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditOrganization(organization);
                  }}
                  title="수정"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="action-btn success"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditOrganization(organization);
                  }}
                  title="관리"
                >
                  <Settings size={16} />
                </button>
                <button
                  className="action-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrganization(
                      organization.id,
                      organization.name
                    );
                  }}
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="organization-description">
              {organization.description}
            </p>

            <div className="organization-stats">
              <div className="stat">
                <Users size={16} />
                <span>{organization.memberCount}명</span>
              </div>
              <div className="stat">
                <Calendar size={16} />
                <span>{format(organization.createdAt, 'yyyy.MM.dd')}</span>
              </div>
              {organization.location && (
                <div className="stat">
                  <MapPin size={16} />
                  <span>{organization.location}</span>
                </div>
              )}
              <div className="stat">
                <Building size={16} />
                <span>{organization.type}</span>
              </div>
              <div className="stat">
                <Settings size={16} />
                <span>
                  {organization.settings.isPublic ? '공개' : '비공개'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="empty-state">
          <Building size={48} className="text-gray-400" />
          <p>조건에 맞는 조직이 없습니다.</p>
          {searchTerm ? (
            <button
              className="btn btn-secondary"
              onClick={() => setSearchTerm('')}
            >
              검색 초기화
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleCreateOrganization}
            >
              <Plus size={20} />첫 조직 생성하기
            </button>
          )}
        </div>
      )}

      {showForm && (
        <OrganizationForm
          organization={editingOrganization}
          onSubmit={handleSubmitOrganization}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { OrganizationForm } from './OrganizationForm';
import { Organization } from '../types';
import { Edit, Settings, Trash2, Plus, Users } from 'lucide-react';

interface OrganizationListProps {
  onEditOrganization: (organization: Organization) => void;
}

export function OrganizationList({
  onEditOrganization,
}: OrganizationListProps) {
  const {
    organizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addActivityLog,
  } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);

  const handleCreateOrganization = () => {
    setEditingOrganization(null);
    setShowForm(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrganization(organization);
    setShowForm(true);
  };

  const handleDeleteOrganization = (id: string) => {
    if (window.confirm('정말로 이 조직을 삭제하시겠습니까?')) {
      deleteOrganization(id);
      addActivityLog({
        id: `log_${Date.now()}`,
        organizationId: id,
        userId: 'current_user',
        action: 'organization_deleted',
        details: '조직이 삭제되었습니다.',
        timestamp: new Date(),
      });
    }
  };

  const handleFormSubmit = (data: Partial<Organization>) => {
    if (editingOrganization) {
      const updatedOrganization: Organization = {
        ...editingOrganization,
        ...data,
        updatedAt: new Date(),
      };
      updateOrganization(updatedOrganization);
      addActivityLog({
        id: `log_${Date.now()}`,
        organizationId: updatedOrganization.id,
        userId: 'current_user',
        action: 'organization_updated',
        details: `조직 "${updatedOrganization.name}"이 수정되었습니다.`,
        timestamp: new Date(),
      });
    } else {
      const newOrganization: Organization = {
        id: `org_${Date.now()}`,
        name: data.name || '',
        description: data.description || '',
        location: data.location || '',
        type: data.type || 'club',
        maxMembers: data.maxMembers || 50,
        currentMembers: 0,
        settings: data.settings || { participationRule: '제한없음' },
        createdBy: 'current_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addOrganization(newOrganization);
      addActivityLog({
        id: `log_${Date.now()}`,
        organizationId: newOrganization.id,
        userId: 'current_user',
        action: 'organization_created',
        details: `새 조직 "${newOrganization.name}"이 생성되었습니다.`,
        timestamp: new Date(),
      });
    }
    setShowForm(false);
    setEditingOrganization(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOrganization(null);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      club: '동호회',
      study: '스터디',
      sports: '스포츠',
      volunteer: '봉사활동',
      business: '비즈니스',
      social: '사교모임',
      other: '기타',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="organization-list">
      <div className="organization-header">
        <h2>조직 관리</h2>
        <button className="btn btn-primary" onClick={handleCreateOrganization}>
          <Plus size={20} />새 조직 생성
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="empty-state">
          <p>아직 조직이 없습니다.</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateOrganization}
          >
            <Plus size={20} />첫 조직 생성하기
          </button>
        </div>
      ) : (
        <div className="organization-grid">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="organization-card clickable"
              onClick={() => onEditOrganization(org)}
              title={`${org.name} 관리하기`}
            >
              <div className="card-header">
                <h3>{org.name}</h3>
                <span className="organization-type">
                  {getTypeLabel(org.type)}
                </span>
              </div>

              <div className="card-content">
                <p className="organization-description">{org.description}</p>
                {org.location && (
                  <p className="organization-location">📍 {org.location}</p>
                )}
                <p className="organization-capacity">
                  <Users size={16} />
                  {org.currentMembers}/{org.maxMembers}명
                </p>
                <p className="click-hint">👆 클릭하여 관리하기</p>
              </div>

              <div
                className="card-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditOrganization(org)}
                  title="조직 설정 수정"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteOrganization(org.id)}
                  title="조직 삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OrganizationForm
          organization={editingOrganization || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

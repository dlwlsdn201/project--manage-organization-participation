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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">조직 관리</h2>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          onClick={handleCreateOrganization}
        >
          <Plus size={20} />새 조직 생성
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-600 mb-4">아직 조직이 없습니다.</p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            onClick={handleCreateOrganization}
          >
            <Plus size={20} />첫 조직 생성하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer"
              onClick={() => onEditOrganization(org)}
              title={`${org.name} 관리하기`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  {org.name}
                </h3>
                <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-medium">
                  {getTypeLabel(org.type)}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {org.description}
                </p>
                {org.location && (
                  <p className="text-slate-500 text-sm mb-2">
                    📍 {org.location}
                  </p>
                )}
                <p className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Users size={16} className="text-primary" />
                  {org.currentMembers}/{org.maxMembers}명
                </p>
                <p className="text-primary text-xs font-medium mt-2 opacity-80 hover:opacity-100 transition-opacity">
                  👆 클릭하여 관리하기
                </p>
              </div>

              <div
                className="flex gap-2 justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 hover:scale-105 transition-all duration-200"
                  onClick={() => handleEditOrganization(org)}
                  title="조직 설정 수정"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-200"
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

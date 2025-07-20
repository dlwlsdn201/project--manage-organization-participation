import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { OrganizationForm } from './OrganizationForm';
import { Organization, Member } from '../types';
import { Edit, Settings, Trash2, Plus, Users } from 'lucide-react';
import { initialDataApi, organizationApi, memberApi } from '../services/api';

interface OrganizationListProps {
  onEditOrganization: (organization: Organization) => void;
}

export function OrganizationList({
  onEditOrganization,
}: OrganizationListProps) {
  const {
    organizations,
    members,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addActivityLog,
    setOrganizations,
    setMembers,
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

  // 데이터 리페치 함수
  const refetchData = async () => {
    try {
      const data = await initialDataApi.loadAll();
      setOrganizations(data.organizations || []);
      setMembers(data.members || []);
    } catch (error) {
      console.error('데이터 리페치 실패:', error);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    console.log('handleDeleteOrganization', id);
    const organization = organizations.find((org) => org._id === id);
    if (!organization) return;

    // 구성원이 있는지 확인
    const memberCount = getMemberCount(organization._id);
    const hasMembers = memberCount > 0;

    const confirmMessage = hasMembers
      ? `"${organization.name}" 조직을 삭제하시겠습니까?\n\n⚠️ 주의: 이 조직의 구성원 ${memberCount}명도 함께 삭제됩니다.`
      : `"${organization.name}" 조직을 삭제하시겠습니까?`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteOrganization(id);
        await addActivityLog({
          id: `log_${Date.now()}`,
          organizationId: id,
          userId: 'current_user',
          action: 'organization_deleted',
          details: `조직 "${organization.name}"이 삭제되었습니다. (삭제된 구성원: ${memberCount}명)`,
          timestamp: new Date(),
        });

        // 삭제 후 데이터 리페치
        await refetchData();
      } catch (error) {
        console.error('조직 삭제 실패:', error);
        alert('조직 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleFormSubmit = async (
    data: Partial<Organization> & { members?: Member[] }
  ) => {
    try {
      if (editingOrganization) {
        // 수정 시 중복 이름 확인 (자신 제외)
        const isDuplicateName =
          organizations?.some(
            (org) =>
              org.name === data.name && org._id !== editingOrganization._id
          ) || false;

        if (isDuplicateName) {
          alert('같은 이름의 조직이 이미 존재합니다.');
          return;
        }

        const updatedOrganization: Organization = {
          ...editingOrganization,
          ...data,
          _id: editingOrganization._id,
          updatedAt: new Date(),
        };
        await updateOrganization(updatedOrganization);

        // 구성원 정보가 있으면 생성 (조직 수정 시)
        if (data.members && data.members.length > 0) {
          console.log('조직 수정 - 구성원 생성 시작:', data.members);
          const memberPromises = data.members.map(async (member) => {
            const newMember: Partial<Member> = {
              ...member,
              organizationId: updatedOrganization._id,
              status: 'active' as const,
              joinedAt: member.joinedAt || new Date(),
              updatedAt: new Date(),
            };
            console.log('생성할 구성원 데이터:', newMember);
            return await memberApi.create(newMember);
          });

          const createdMembers = await Promise.all(memberPromises);
          console.log('조직 수정 - 생성된 구성원들:', createdMembers);
          // 로컬 상태에 구성원 추가
          setMembers([...members, ...createdMembers]);
        }

        await addActivityLog({
          id: `log_${Date.now()}`,
          organizationId: updatedOrganization._id,
          userId: 'current_user',
          action: 'organization_updated',
          details: `조직 "${updatedOrganization.name}"이 수정되었습니다.`,
          timestamp: new Date(),
        });
      } else {
        // 생성 시 중복 이름 확인
        const isDuplicateName =
          organizations?.some((org) => org.name === data.name) || false;

        if (isDuplicateName) {
          alert('같은 이름의 조직이 이미 존재합니다.');
          return;
        }

        const newOrganization: Partial<Organization> = {
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
        const createdOrg = await organizationApi.create(newOrganization);
        // 로컬 상태 업데이트
        setOrganizations([...organizations, createdOrg]);

        // 구성원 정보가 있으면 생성
        if (data.members && data.members.length > 0) {
          console.log('구성원 생성 시작:', data.members);
          const memberPromises = data.members.map(async (member) => {
            const newMember: Partial<Member> = {
              ...member,
              organizationId: createdOrg._id,
              status: 'active' as const,
              joinedAt: member.joinedAt || new Date(),
              updatedAt: new Date(),
            };
            console.log('생성할 구성원 데이터:', newMember);
            return await memberApi.create(newMember);
          });

          const createdMembers = await Promise.all(memberPromises);
          console.log('생성된 구성원들:', createdMembers);
          // 로컬 상태에 구성원 추가
          setMembers([...members, ...createdMembers]);
        }

        await addActivityLog({
          id: `log_${Date.now()}`,
          organizationId: createdOrg._id,
          userId: 'current_user',
          action: 'organization_created',
          details: `새 조직 "${createdOrg.name}"이 생성되었습니다.`,
          timestamp: new Date(),
        });
      }
      setShowForm(false);
      setEditingOrganization(null);
    } catch (error) {
      console.error('조직 저장 실패:', error);
      // 에러 처리는 OrganizationForm에서 이미 처리됨
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingOrganization(null);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      club: '동호회',
      study: '스터디',
      culture: '문화,취미',
      sports: '스포츠',
      volunteer: '봉사활동',
      business: '비즈니스',
      social: '사교모임',
      other: '기타',
    };
    return typeMap[type] || type;
  };

  // 조직별 구성원 수 계산
  const getMemberCount = (organizationId: string) => {
    if (!members) return 0;
    return members.filter(
      (member) =>
        member.organizationId === organizationId && member.status === 'active'
    ).length;
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

      {!organizations || organizations.length === 0 ? (
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
              key={org._id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer"
              onClick={() => onEditOrganization(org)}
              title={`${org.name} 관리하기`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  {org.name}
                </h3>
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
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
                  {getMemberCount(org._id)}/{org.maxMembers}명
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
                  onClick={() => handleDeleteOrganization(org._id)}
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

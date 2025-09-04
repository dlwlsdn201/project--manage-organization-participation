import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Organization } from '@/entities';
import { OrganizationForm } from '@/features/organization';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { Button, Modal, message } from 'antd';

interface OrganizationListProps {
  onEditOrganization: (organization: Organization) => void;
}

export function OrganizationList({
  onEditOrganization,
}: OrganizationListProps) {
  const { organizations, loading, deleteOrganization } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrganization = () => {
    setEditingOrganization(null);
    setIsModalVisible(true);
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    try {
      await deleteOrganization(organization._id);
      message.success('조직이 삭제되었습니다.');
    } catch (error) {
      message.error('조직 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    setEditingOrganization(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingOrganization(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">조직 목록</h2>
        <Button
          onClick={handleAddOrganization}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          icon={<Plus size={16} />}
          type="primary"
        >
          새 조직 추가
        </Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="조직명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">등록된 조직이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((organization) => (
            <div
              key={organization._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {organization.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingOrganization(organization);
                      setIsModalVisible(true);
                    }}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="조직 편집"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteOrganization(organization)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="조직 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                  {organization.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{organization.currentMembers}명</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {organization.type}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onEditOrganization(organization)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    모임 관리하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingOrganization ? '조직 정보 수정' : '조직 정보 입력'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={null}
        style={{ minWidth: '60vw' }}
        destroyOnHidden={true}
      >
        <OrganizationForm
          organization={editingOrganization}
          onSuccess={handleModalOk}
          onCancel={handleModalCancel}
        />
      </Modal>
    </div>
  );
}

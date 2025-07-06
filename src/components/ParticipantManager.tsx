import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Participant, User } from '../types';
import {
  Search,
  UserPlus,
  Crown,
  Shield,
  User as UserIcon,
  Ban,
  Check,
  X,
  Mail,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { mockUsers } from '../utils/mockData';

interface ParticipantManagerProps {
  organizationId: string;
}

export function ParticipantManager({
  organizationId,
}: ParticipantManagerProps) {
  const { state, addParticipant, updateParticipant, deleteParticipant } =
    useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    Participant['status'] | 'all'
  >('all');
  const [roleFilter, setRoleFilter] = useState<Participant['role'] | 'all'>(
    'all'
  );
  const [showInviteModal, setShowInviteModal] = useState(false);

  // 현재 조직의 참여자들
  const participants = useMemo(() => {
    return state.participants.filter(
      (p) => p.organizationId === organizationId
    );
  }, [state.participants, organizationId]);

  // 필터링된 참여자들
  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const user = mockUsers.find((u) => u.id === participant.userId);
      const matchesSearch = user
        ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        : false;

      const matchesStatus =
        statusFilter === 'all' || participant.status === statusFilter;
      const matchesRole =
        roleFilter === 'all' || participant.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [participants, searchTerm, statusFilter, roleFilter]);

  const handleUpdateParticipant = (
    participantId: string,
    updates: Partial<Participant>
  ) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant) {
      updateParticipant({
        ...participant,
        ...updates,
        updatedAt: new Date(),
      });
    }
  };

  const handleDeleteParticipant = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant) {
      const user = mockUsers.find((u) => u.id === participant.userId);
      if (
        window.confirm(`정말로 ${user?.name}님을 조직에서 제거하시겠습니까?`)
      ) {
        deleteParticipant(participantId);
      }
    }
  };

  const getRoleIcon = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} className="text-yellow-500" />;
      case 'admin':
        return <Shield size={16} className="text-blue-500" />;
      case 'member':
        return <UserIcon size={16} className="text-gray-500" />;
    }
  };

  const getRoleText = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      case 'member':
        return '멤버';
    }
  };

  const getStatusBadge = (status: Participant['status']) => {
    const statusConfig = {
      active: { text: '활성', className: 'status-active' },
      inactive: { text: '비활성', className: 'status-inactive' },
      pending: { text: '대기', className: 'status-pending' },
      banned: { text: '차단', className: 'status-banned' },
    };

    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.className}`}>{config.text}</span>
    );
  };

  return (
    <div className="participant-manager">
      <div className="participant-header">
        <h2>참여자 관리</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={20} />
          참여자 초대
        </button>
      </div>

      <div className="participant-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="참여자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as Participant['status'] | 'all')
            }
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기</option>
            <option value="banned">차단</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as Participant['role'] | 'all')
            }
          >
            <option value="all">모든 역할</option>
            <option value="owner">소유자</option>
            <option value="admin">관리자</option>
            <option value="member">멤버</option>
          </select>
        </div>
      </div>

      <div className="participant-stats">
        <div className="stat-card">
          <span className="stat-number">{participants.length}</span>
          <span className="stat-label">전체 참여자</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {participants.filter((p) => p.status === 'active').length}
          </span>
          <span className="stat-label">활성 참여자</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {participants.filter((p) => p.status === 'pending').length}
          </span>
          <span className="stat-label">대기 중</span>
        </div>
      </div>

      <div className="participant-list">
        {filteredParticipants.map((participant) => {
          const user = mockUsers.find((u) => u.id === participant.userId);
          if (!user) return null;

          return (
            <div key={participant.id} className="participant-card">
              <div className="participant-info">
                <div className="participant-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="participant-details">
                  <h4>{user.name}</h4>
                  <p className="participant-email">
                    <Mail size={14} />
                    {user.email}
                  </p>
                  <p className="participant-joined">
                    <Calendar size={14} />
                    {format(participant.joinedAt, 'yyyy.MM.dd')} 가입
                  </p>
                </div>
              </div>

              <div className="participant-meta">
                <div className="participant-role">
                  {getRoleIcon(participant.role)}
                  <span>{getRoleText(participant.role)}</span>
                </div>
                {getStatusBadge(participant.status)}
              </div>

              <div className="participant-actions">
                {participant.status === 'pending' && (
                  <>
                    <button
                      className="action-btn success"
                      onClick={() =>
                        handleUpdateParticipant(participant.id, {
                          status: 'active',
                        })
                      }
                      title="승인"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => handleDeleteParticipant(participant.id)}
                      title="거부"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}

                {participant.status === 'active' &&
                  participant.role !== 'owner' && (
                    <>
                      <select
                        value={participant.role}
                        onChange={(e) =>
                          handleUpdateParticipant(participant.id, {
                            role: e.target.value as Participant['role'],
                          })
                        }
                        className="role-select"
                      >
                        <option value="member">멤버</option>
                        <option value="admin">관리자</option>
                      </select>

                      <button
                        className="action-btn warning"
                        onClick={() =>
                          handleUpdateParticipant(participant.id, {
                            status: 'banned',
                          })
                        }
                        title="차단"
                      >
                        <Ban size={16} />
                      </button>
                    </>
                  )}

                {participant.status === 'banned' && (
                  <button
                    className="action-btn success"
                    onClick={() =>
                      handleUpdateParticipant(participant.id, {
                        status: 'active',
                      })
                    }
                    title="차단 해제"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="empty-state">
          <p>조건에 맞는 참여자가 없습니다.</p>
        </div>
      )}

      {/* 초대 모달 (간단한 형태) */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>참여자 초대</h3>
              <button
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>참여자 초대 기능은 개발 중입니다.</p>
              <p>이메일 주소를 입력하여 초대장을 보낼 수 있습니다.</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowInviteModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Organization } from '../types';
import { X, Save, Building, MapPin, Users, FileText } from 'lucide-react';

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

export function OrganizationForm({
  organization,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: 'club' as Organization['type'],
    maxMembers: 50,
    settings: {
      allowPublicJoin: false,
      requireApproval: true,
      minAttendanceRate: 60,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        description: organization.description,
        location: organization.location || '',
        type: organization.type,
        maxMembers: organization.maxMembers || 50,
        settings: {
          allowPublicJoin: organization.settings?.allowPublicJoin || false,
          requireApproval: organization.settings?.requireApproval || true,
          minAttendanceRate: organization.settings?.minAttendanceRate || 60,
        },
      });
    }
  }, [organization]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '조직명을 입력해주세요.';
    } else if (formData.name.length < 2) {
      newErrors.name = '조직명은 2자 이상이어야 합니다.';
    } else if (formData.name.length > 50) {
      newErrors.name = '조직명은 50자 이하여야 합니다.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '조직 설명을 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '조직 설명은 10자 이상이어야 합니다.';
    } else if (formData.description.length > 500) {
      newErrors.description = '조직 설명은 500자 이하여야 합니다.';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = '위치는 100자 이하여야 합니다.';
    }

    if (formData.maxMembers < 5) {
      newErrors.maxMembers = '최대 멤버 수는 5명 이상이어야 합니다.';
    } else if (formData.maxMembers > 1000) {
      newErrors.maxMembers = '최대 멤버 수는 1000명 이하여야 합니다.';
    }

    if (formData.settings.minAttendanceRate < 0) {
      newErrors.minAttendanceRate = '최소 참여율은 0% 이상이어야 합니다.';
    } else if (formData.settings.minAttendanceRate > 100) {
      newErrors.minAttendanceRate = '최소 참여율은 100% 이하여야 합니다.';
    }

    // 중복 이름 체크 (수정 시에는 자기 자신 제외)
    const existingOrg = state.organizations.find(
      (org) =>
        org.name.toLowerCase() === formData.name.toLowerCase() &&
        org.id !== organization?.id
    );
    if (existingOrg) {
      newErrors.name = '이미 존재하는 조직명입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('조직 저장 중 오류:', error);
      setErrors({ submit: '조직 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content organization-form-modal">
        <div className="modal-header">
          <h2>
            <Building size={24} />
            {organization ? '조직 수정' : '새 조직 생성'}
          </h2>
          <button className="modal-close" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="organization-form">
          <div className="form-section">
            <h3>기본 정보</h3>

            <div className="form-group">
              <label htmlFor="name">
                <Building size={16} />
                조직명 *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="예: 독서모임, 등산동호회, 스터디그룹"
                className={errors.name ? 'error' : ''}
                maxLength={50}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <FileText size={16} />
                조직 설명 *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="조직의 목적, 활동 내용, 특징 등을 상세히 설명해주세요."
                className={errors.description ? 'error' : ''}
                rows={4}
                maxLength={500}
              />
              <small>{formData.description.length}/500자</small>
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">
                  <Users size={16} />
                  조직 유형
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    handleChange('type', e.target.value as Organization['type'])
                  }
                >
                  <option value="club">동호회</option>
                  <option value="study">스터디</option>
                  <option value="sports">스포츠</option>
                  <option value="volunteer">봉사</option>
                  <option value="business">비즈니스</option>
                  <option value="social">친목</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxMembers">
                  <Users size={16} />
                  최대 멤버 수
                </label>
                <input
                  id="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) =>
                    handleChange('maxMembers', parseInt(e.target.value) || 0)
                  }
                  min="5"
                  max="1000"
                  className={errors.maxMembers ? 'error' : ''}
                />
                {errors.maxMembers && (
                  <span className="error-message">{errors.maxMembers}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                주요 활동 지역
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="예: 서울 강남구, 부산 해운대구"
                className={errors.location ? 'error' : ''}
                maxLength={100}
              />
              {errors.location && (
                <span className="error-message">{errors.location}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>운영 설정</h3>

            <div className="form-group">
              <label htmlFor="minAttendanceRate">최소 참여율 (%)</label>
              <input
                id="minAttendanceRate"
                type="number"
                value={formData.settings.minAttendanceRate}
                onChange={(e) =>
                  handleSettingChange(
                    'minAttendanceRate',
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                max="100"
                className={errors.minAttendanceRate ? 'error' : ''}
              />
              <small>이 참여율 미만 시 경고 대상이 됩니다.</small>
              {errors.minAttendanceRate && (
                <span className="error-message">
                  {errors.minAttendanceRate}
                </span>
              )}
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowPublicJoin}
                    onChange={(e) =>
                      handleSettingChange('allowPublicJoin', e.target.checked)
                    }
                  />
                  <span className="checkbox-text">
                    <strong>공개 가입 허용</strong>
                    <small>누구나 자유롭게 가입할 수 있습니다.</small>
                  </span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.settings.requireApproval}
                    onChange={(e) =>
                      handleSettingChange('requireApproval', e.target.checked)
                    }
                  />
                  <span className="checkbox-text">
                    <strong>가입 승인 필요</strong>
                    <small>관리자가 가입 요청을 승인해야 합니다.</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? '저장 중...' : organization ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

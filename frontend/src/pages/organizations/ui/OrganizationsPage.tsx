import { Organization } from '@/entities/organization';
import { OrganizationList } from '@/widgets/organization';

interface OrganizationsPageProps {
  onEditOrganization: (organization: Organization) => void;
}

/**
 * 조직 목록 페이지
 * - 조직 목록 조회
 * - 조직 생성/수정/삭제
 * - 조직 선택하여 모임 관리로 이동
 */
export const OrganizationsPage = ({
  onEditOrganization,
}: OrganizationsPageProps) => {
  return <OrganizationList onEditOrganization={onEditOrganization} />;
};


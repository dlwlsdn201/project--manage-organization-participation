import { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
}

export const createTabItems = (
  basicFormComponent: ReactNode,
  memberManagementComponent?: ReactNode,
  memberCount?: number
): TabItem[] => {
  const tabItems: TabItem[] = [
    {
      key: 'basic',
      label: '기본 정보',
      children: basicFormComponent,
    },
  ];

  // 수정 모드일 때만 구성원 관리 탭 추가
  if (memberManagementComponent && memberCount !== undefined) {
    tabItems.push({
      key: 'members',
      label: `구성원 관리 (${memberCount})`,
      children: memberManagementComponent,
    });
  }

  return tabItems;
};

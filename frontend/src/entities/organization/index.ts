// Organization Entity
export interface Organization {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  location?: string;
  type:
    | 'club'
    | 'study'
    | 'culture'
    | 'sports'
    | 'volunteer'
    | 'business'
    | 'social'
    | 'other';
  maxMembers?: number;
  currentMembers: number;
  settings: OrganizationSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  participationRule:
    | '제한없음'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10';
}

// Member Entity
export interface Member {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  district: string;
  organizationId: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
  updatedAt: Date;
}

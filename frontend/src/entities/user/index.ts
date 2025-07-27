// User Entity
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

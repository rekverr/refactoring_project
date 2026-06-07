export type UserRole = 'READER' | 'LIBRARIAN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  activeLoanLimit: number;
  loyaltyPoints: number;
}

export function createReader(id: string, name: string): User {
  return {
    id,
    name,
    role: 'READER',
    status: 'ACTIVE',
    activeLoanLimit: 5,
    loyaltyPoints: 0
  };
}

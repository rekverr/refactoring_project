import { User } from '../models/User';

export class ReservationPriorityService {
  calculate(user: User, activeLoansCount: number, createdAt: Date): number {
    const roleBonus = user.role === 'LIBRARIAN' ? 50 : 0;
    const loyaltyBonus = Math.min(user.loyaltyPoints, 100);
    const loadPenalty = activeLoansCount * 5;
    const waitingBonus = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return roleBonus + loyaltyBonus + waitingBonus - loadPenalty;
  }
}

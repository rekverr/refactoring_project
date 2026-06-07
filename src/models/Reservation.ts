export type ReservationStatus = 'WAITING' | 'READY' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  createdAt: Date;
  priority: number;
  status: ReservationStatus;
}

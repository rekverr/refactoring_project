import { Reservation } from '../models/Reservation';
import { InMemoryRepository } from './Repository';

export class ReservationRepository extends InMemoryRepository<Reservation> {
  findWaitingByBook(bookId: string): Reservation[] {
    return this.findAll()
      .filter((reservation) => reservation.bookId === bookId && reservation.status === 'WAITING')
      .sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());
  }
}

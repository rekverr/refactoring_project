import { BookRepository } from '../storage/BookRepository';
import { UserRepository } from '../storage/UserRepository';
import { LoanRepository } from '../storage/LoanRepository';
import { ReservationRepository } from '../storage/ReservationRepository';
import { Loan } from '../models/Loan';
import { Reservation } from '../models/Reservation';
import { FineStrategy } from './FineStrategy';
import { LibraryEventBus } from './NotificationObserver';
import { ReservationPriorityService } from './ReservationPriorityService';
import { addDays } from '../utils/date';
import { NotFoundError, ValidationError } from '../utils/errors';

export class LibraryService {
  constructor(
    private readonly books: BookRepository,
    private readonly users: UserRepository,
    private readonly loans: LoanRepository,
    private readonly reservations: ReservationRepository,
    private readonly fineStrategy: FineStrategy,
    private readonly events: LibraryEventBus,
    private readonly priorityService: ReservationPriorityService
  ) {}

  borrowBook(bookId: string, userId: string, now = new Date()): Loan {
    const book = this.books.findById(bookId);
    const user = this.users.findById(userId);
    if (!book) throw new NotFoundError('Book', bookId);
    if (!user) throw new NotFoundError('User', userId);
    if (user.status === 'BLOCKED') throw new ValidationError('Blocked users cannot borrow books');
    if (book.status !== 'AVAILABLE') throw new ValidationError('Book is not available');
    const activeLoans = this.loans.findActiveByUser(userId);
    if (activeLoans.length >= user.activeLoanLimit) throw new ValidationError('Active loan limit reached');

    const loan: Loan = {
      id: `loan-${bookId}-${userId}-${now.getTime()}`,
      bookId,
      userId,
      borrowedAt: now,
      dueAt: addDays(now, 14)
    };
    book.status = 'BORROWED';
    this.books.save(book);
    return this.loans.save(loan);
  }

  returnBook(bookId: string, returnedAt = new Date()): number {
    const book = this.books.findById(bookId);
    if (!book) throw new NotFoundError('Book', bookId);
    const loan = this.loans.findActiveByBook(bookId);
    if (!loan) throw new ValidationError('There is no active loan for this book');

    loan.returnedAt = returnedAt;
    this.loans.save(loan);
    const fine = this.fineStrategy.calculate(loan.dueAt, returnedAt);
    if (fine > 0) {
      this.events.publish({
        type: 'FINE_CREATED',
        userId: loan.userId,
        message: `Fine created for book ${book.title}: ${fine}`
      });
    }

    const nextReservation = this.reservations.findWaitingByBook(bookId)[0];
    if (nextReservation) {
      nextReservation.status = 'READY';
      this.reservations.save(nextReservation);
      book.status = 'RESERVED';
      this.events.publish({
        type: 'BOOK_AVAILABLE',
        userId: nextReservation.userId,
        message: `Book ${book.title} is ready for pickup`
      });
    } else {
      book.status = 'AVAILABLE';
    }
    this.books.save(book);
    return fine;
  }

  reserveBook(bookId: string, userId: string, createdAt = new Date()): Reservation {
    const book = this.books.findById(bookId);
    const user = this.users.findById(userId);
    if (!book) throw new NotFoundError('Book', bookId);
    if (!user) throw new NotFoundError('User', userId);
    if (user.status === 'BLOCKED') throw new ValidationError('Blocked users cannot reserve books');
    if (book.status === 'AVAILABLE') throw new ValidationError('Available books should be borrowed directly');

    const priority = this.priorityService.calculate(user, this.loans.findActiveByUser(userId).length, createdAt);
    const reservation: Reservation = {
      id: `reservation-${bookId}-${userId}-${createdAt.getTime()}`,
      bookId,
      userId,
      createdAt,
      priority,
      status: 'WAITING'
    };
    return this.reservations.save(reservation);
  }

  cancelReservation(reservationId: string): void {
    const reservation = this.reservations.findById(reservationId);
    if (!reservation) throw new NotFoundError('Reservation', reservationId);
    if (reservation.status !== 'WAITING') throw new ValidationError('Only waiting reservations can be cancelled');
    reservation.status = 'CANCELLED';
    this.reservations.save(reservation);
  }
}

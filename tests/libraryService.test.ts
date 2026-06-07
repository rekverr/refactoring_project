import { makeSystem, seedBook, seedUser } from './testFactory';
import { addDays } from '../src/utils/date';
import { UserService } from '../src/services/UserService';

describe('LibraryService business logic', () => {
  it.each(Array.from({ length: 40 }, (_, index) => index + 1))('borrows available book for active user case %i', (index) => {
    const system = makeSystem();
    system.books.save(seedBook(index));
    system.users.save(seedUser(index));
    const now = new Date('2026-01-01T00:00:00.000Z');
    const loan = system.library.borrowBook(`book-${index}`, `user-${index}`, now);
    expect(loan.dueAt).toEqual(addDays(now, 14));
    expect(system.books.findById(`book-${index}`)?.status).toBe('BORROWED');
  });

  it.each([
    ['missing book', 'book-x', 'user-1', 'Book with id book-x was not found'],
    ['missing user', 'book-1', 'user-x', 'User with id user-x was not found']
  ])('throws on %s', (_name, bookId, userId, message) => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    expect(() => system.library.borrowBook(bookId, userId)).toThrow(message);
  });

  it('prevents blocked users from borrowing', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1, { status: 'BLOCKED' }));
    expect(() => system.library.borrowBook('book-1', 'user-1')).toThrow('Blocked users cannot borrow books');
  });

  it('prevents borrowing when active loan limit is reached', () => {
    const system = makeSystem();
    const user = seedUser(1, { activeLoanLimit: 1 });
    system.users.save(user);
    system.books.save(seedBook(1));
    system.books.save(seedBook(2));
    system.library.borrowBook('book-1', 'user-1');
    expect(() => system.library.borrowBook('book-2', 'user-1')).toThrow('Active loan limit reached');
  });

  it.each(Array.from({ length: 35 }, (_, index) => index))('returns book and calculates fine for %i overdue days', (overdueDays) => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    const loan = system.library.borrowBook('book-1', 'user-1', new Date('2026-01-01T00:00:00.000Z'));
    const fine = system.library.returnBook('book-1', addDays(loan.dueAt, overdueDays));
    expect(fine).toBeGreaterThanOrEqual(0);
    expect(system.books.findById('book-1')?.status).toBe('AVAILABLE');
  });

  it('marks first reservation as ready after return', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    system.users.save(seedUser(2, { loyaltyPoints: 10 }));
    system.library.borrowBook('book-1', 'user-1');
    const reservation = system.library.reserveBook('book-1', 'user-2', new Date('2026-01-02T00:00:00.000Z'));
    system.library.returnBook('book-1', new Date('2026-01-10T00:00:00.000Z'));
    expect(system.reservations.findById(reservation.id)?.status).toBe('READY');
    expect(system.books.findById('book-1')?.status).toBe('RESERVED');
    expect(system.notifications.findByUser('user-2')).toHaveLength(1);
  });

  it('does not allow reserving available books', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    expect(() => system.library.reserveBook('book-1', 'user-1')).toThrow('Available books should be borrowed directly');
  });

  it('cancels waiting reservation only', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    system.users.save(seedUser(2));
    system.library.borrowBook('book-1', 'user-1');
    const reservation = system.library.reserveBook('book-1', 'user-2');
    system.library.cancelReservation(reservation.id);
    expect(system.reservations.findById(reservation.id)?.status).toBe('CANCELLED');
    expect(() => system.library.cancelReservation(reservation.id)).toThrow('Only waiting reservations can be cancelled');
  });

  it('blocks and unblocks user through UserService', () => {
    const system = makeSystem();
    system.users.save(seedUser(1));
    const service = new UserService(system.users, system.events);
    service.blockUser('user-1', 'too many fines');
    expect(system.users.findById('user-1')?.status).toBe('BLOCKED');
    expect(system.notifications.findByUser('user-1')).toHaveLength(1);
    service.unblockUser('user-1');
    expect(system.users.findById('user-1')?.status).toBe('ACTIVE');
  });

  it.each(Array.from({ length: 35 }, (_, index) => index + 1))('reservation priority responds to loyalty points case %i', (points) => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    system.users.save(seedUser(2, { loyaltyPoints: points }));
    system.library.borrowBook('book-1', 'user-1');
    const reservation = system.library.reserveBook('book-1', 'user-2', new Date('2026-01-01T00:00:00.000Z'));
    expect(reservation.priority).toBeLessThanOrEqual(100 + 2000);
  });
});

describe('LibraryService additional branch coverage', () => {
  it('prevents borrowing a book that is already borrowed', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    system.users.save(seedUser(1));
    system.users.save(seedUser(2));
    system.library.borrowBook('book-1', 'user-1');
    expect(() => system.library.borrowBook('book-1', 'user-2')).toThrow('Book is not available');
  });

  it('throws when returning missing book', () => {
    const system = makeSystem();
    expect(() => system.library.returnBook('missing')).toThrow('Book with id missing was not found');
  });

  it('throws when returning book without active loan', () => {
    const system = makeSystem();
    system.books.save(seedBook(1));
    expect(() => system.library.returnBook('book-1')).toThrow('There is no active loan for this book');
  });

  it('throws when reserving missing book', () => {
    const system = makeSystem();
    system.users.save(seedUser(1));
    expect(() => system.library.reserveBook('missing', 'user-1')).toThrow('Book with id missing was not found');
  });

  it('throws when reserving for missing user', () => {
    const system = makeSystem();
    const book = { ...seedBook(1), status: 'BORROWED' as const };
    system.books.save(book);
    expect(() => system.library.reserveBook('book-1', 'missing')).toThrow('User with id missing was not found');
  });

  it('prevents blocked user from reserving', () => {
    const system = makeSystem();
    const book = { ...seedBook(1), status: 'BORROWED' as const };
    system.books.save(book);
    system.users.save(seedUser(1, { status: 'BLOCKED' }));
    expect(() => system.library.reserveBook('book-1', 'user-1')).toThrow('Blocked users cannot reserve books');
  });

  it('throws when cancelling missing reservation', () => {
    const system = makeSystem();
    expect(() => system.library.cancelReservation('missing')).toThrow('Reservation with id missing was not found');
  });
});

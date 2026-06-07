import { BookRepository } from '../src/storage/BookRepository';
import { UserRepository } from '../src/storage/UserRepository';
import { LoanRepository } from '../src/storage/LoanRepository';
import { ReservationRepository } from '../src/storage/ReservationRepository';
import { NotificationRepository } from '../src/storage/NotificationRepository';
import { LibraryEventBus, NotificationObserver } from '../src/services/NotificationObserver';
import { LibraryService } from '../src/services/LibraryService';
import { ProgressiveFineStrategy } from '../src/services/FineStrategy';
import { ReservationPriorityService } from '../src/services/ReservationPriorityService';
import { createBook } from '../src/models/Book';
import { createReader, User } from '../src/models/User';

export function makeSystem() {
  const books = new BookRepository();
  const users = new UserRepository();
  const loans = new LoanRepository();
  const reservations = new ReservationRepository();
  const notifications = new NotificationRepository();
  const events = new LibraryEventBus();
  events.subscribe(new NotificationObserver(notifications));
  const library = new LibraryService(
    books,
    users,
    loans,
    reservations,
    new ProgressiveFineStrategy(),
    events,
    new ReservationPriorityService()
  );
  return { books, users, loans, reservations, notifications, events, library };
}

export function seedBook(index = 1) {
  return createBook({
    id: `book-${index}`,
    title: `Book ${index}`,
    author: `Author ${index}`,
    isbn: `isbn-${index}`,
    category: 'Architecture'
  });
}

export function seedUser(index = 1, overrides: Partial<User> = {}) {
  return { ...createReader(`user-${index}`, `User ${index}`), ...overrides };
}

import { LibraryEventBus, NotificationObserver } from '../src/services/NotificationObserver';
import { NotificationRepository } from '../src/storage/NotificationRepository';
import { ReservationPriorityService } from '../src/services/ReservationPriorityService';
import { seedUser } from './testFactory';

describe('Observer and priority service', () => {
  it.each(Array.from({ length: 25 }, (_, index) => index + 1))('observer stores notification event %i', (index) => {
    const repo = new NotificationRepository();
    const bus = new LibraryEventBus();
    bus.subscribe(new NotificationObserver(repo));
    bus.publish({ type: 'BOOK_AVAILABLE', userId: `user-${index}`, message: `message ${index}` });
    expect(repo.findByUser(`user-${index}`)[0].message).toBe(`message ${index}`);
  });

  it('can unsubscribe observer', () => {
    const repo = new NotificationRepository();
    const bus = new LibraryEventBus();
    const observer = new NotificationObserver(repo);
    bus.subscribe(observer);
    bus.unsubscribe(observer);
    bus.publish({ type: 'BOOK_AVAILABLE', userId: 'user-1', message: 'message' });
    expect(repo.findAll()).toHaveLength(0);
  });

  it.each(Array.from({ length: 30 }, (_, index) => index))('priority decreases with active loans case %i', (activeLoans) => {
    const service = new ReservationPriorityService();
    const user = seedUser(1, { loyaltyPoints: 80 });
    const priority = service.calculate(user, activeLoans, new Date());
    expect(priority).toBe(80 - activeLoans * 5);
  });
});

describe('Observer and priority additional branches', () => {
  it('does not duplicate observer subscriptions', () => {
    const repo = new NotificationRepository();
    const bus = new LibraryEventBus();
    const observer = new NotificationObserver(repo);
    bus.subscribe(observer);
    bus.subscribe(observer);
    bus.publish({ type: 'BOOK_AVAILABLE', userId: 'user-1', message: 'one' });
    expect(repo.findAll()).toHaveLength(1);
  });

  it('supports librarian role bonus and loyalty cap', () => {
    const service = new ReservationPriorityService();
    const user = seedUser(1, { role: 'LIBRARIAN', loyaltyPoints: 150 });
    const priority = service.calculate(user, 0, new Date());
    expect(priority).toBe(150);
  });
});

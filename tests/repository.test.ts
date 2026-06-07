import { InMemoryRepository } from '../src/storage/Repository';
import { BookRepository } from '../src/storage/BookRepository';
import { UserRepository } from '../src/storage/UserRepository';
import { seedBook, seedUser, makeSystem } from './testFactory';

describe('In-memory repositories', () => {
  it.each(Array.from({ length: 60 }, (_, index) => index + 1))('saves and finds entity %i without leaking references', (id) => {
    const repo = new InMemoryRepository<{ id: string; value: number }>();
    const entity = { id: `id-${id}`, value: id };
    repo.save(entity);
    entity.value = 999;
    expect(repo.findById(`id-${id}`)?.value).toBe(id);
  });

  it('deletes and clears entities', () => {
    const repo = new InMemoryRepository<{ id: string }>();
    repo.save({ id: '1' });
    expect(repo.delete('1')).toBe(true);
    expect(repo.delete('missing')).toBe(false);
    repo.save({ id: '2' });
    repo.clear();
    expect(repo.findAll()).toHaveLength(0);
  });

  it('finds available books and books by isbn', () => {
    const repo = new BookRepository();
    const first = seedBook(1);
    const second = { ...seedBook(2), status: 'BORROWED' as const };
    repo.save(first);
    repo.save(second);
    expect(repo.findByIsbn('isbn-1')?.id).toBe('book-1');
    expect(repo.findAvailable()).toHaveLength(1);
  });

  it('finds blocked users', () => {
    const repo = new UserRepository();
    repo.save(seedUser(1));
    repo.save(seedUser(2, { status: 'BLOCKED' }));
    expect(repo.findBlocked().map((user) => user.id)).toEqual(['user-2']);
  });
});

describe('Specialized repository branches', () => {
  it('returns undefined for missing isbn', () => {
    const repo = new BookRepository();
    repo.save(seedBook(1));
    expect(repo.findByIsbn('missing')).toBeUndefined();
  });

  it('sorts waiting reservations by priority and date', () => {
    const { reservations } = makeSystem();
    reservations.save({ id: 'r-low', bookId: 'book-1', userId: 'u1', priority: 1, status: 'WAITING', createdAt: new Date('2026-01-02') });
    reservations.save({ id: 'r-high', bookId: 'book-1', userId: 'u2', priority: 5, status: 'WAITING', createdAt: new Date('2026-01-03') });
    reservations.save({ id: 'r-cancelled', bookId: 'book-1', userId: 'u3', priority: 99, status: 'CANCELLED', createdAt: new Date('2026-01-01') });
    expect(reservations.findWaitingByBook('book-1').map((item: { id: string }) => item.id)).toEqual(['r-high', 'r-low']);
  });
});

import { Book } from '../models/Book';
import { InMemoryRepository } from './Repository';

export class BookRepository extends InMemoryRepository<Book> {
  findByIsbn(isbn: string): Book | undefined {
    return this.findAll().find((book) => book.isbn === isbn);
  }

  findAvailable(): Book[] {
    return this.findAll().filter((book) => book.status === 'AVAILABLE');
  }
}

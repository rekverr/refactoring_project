export type BookStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: BookStatus;
  priorityScore: number;
}

export function createBook(input: Omit<Book, 'status' | 'priorityScore'>): Book {
  return {
    ...input,
    status: 'AVAILABLE',
    priorityScore: 0
  };
}

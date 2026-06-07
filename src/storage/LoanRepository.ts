import { Loan, isLoanActive } from '../models/Loan';
import { InMemoryRepository } from './Repository';

export class LoanRepository extends InMemoryRepository<Loan> {
  findActiveByUser(userId: string): Loan[] {
    return this.findAll().filter((loan) => loan.userId === userId && isLoanActive(loan));
  }

  findActiveByBook(bookId: string): Loan | undefined {
    return this.findAll().find((loan) => loan.bookId === bookId && isLoanActive(loan));
  }
}

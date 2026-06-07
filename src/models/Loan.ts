export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt?: Date;
}

export function isLoanActive(loan: Loan): boolean {
  return loan.returnedAt === undefined;
}

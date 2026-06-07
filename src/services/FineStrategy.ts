import { daysBetween } from '../utils/date';

export interface FineStrategy {
  calculate(dueAt: Date, returnedAt: Date): number;
}

export class StandardFineStrategy implements FineStrategy {
  constructor(private readonly dailyRate = 10) {}

  calculate(dueAt: Date, returnedAt: Date): number {
    return daysBetween(dueAt, returnedAt) * this.dailyRate;
  }
}

export class ProgressiveFineStrategy implements FineStrategy {
  calculate(dueAt: Date, returnedAt: Date): number {
    const days = daysBetween(dueAt, returnedAt);
    if (days <= 0) return 0;
    if (days <= 7) return days * 10;
    if (days <= 30) return 70 + (days - 7) * 20;
    return 530 + (days - 30) * 50;
  }
}

export class StudentFineStrategy implements FineStrategy {
  calculate(dueAt: Date, returnedAt: Date): number {
    const base = new ProgressiveFineStrategy().calculate(dueAt, returnedAt);
    return Math.floor(base * 0.5);
  }
}

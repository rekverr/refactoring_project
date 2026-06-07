import { ProgressiveFineStrategy, StandardFineStrategy, StudentFineStrategy } from '../src/services/FineStrategy';
import { addDays } from '../src/utils/date';

describe('Fine strategies', () => {
  const due = new Date('2026-01-01T00:00:00.000Z');

  it.each([
    [0, 0], [1, 10], [2, 20], [3, 30], [4, 40], [5, 50], [6, 60], [7, 70],
    [8, 90], [9, 110], [10, 130], [11, 150], [12, 170], [13, 190], [14, 210],
    [15, 230], [16, 250], [17, 270], [18, 290], [19, 310], [20, 330], [21, 350],
    [22, 370], [23, 390], [24, 410], [25, 430], [26, 450], [27, 470], [28, 490],
    [29, 510], [30, 530], [31, 580], [32, 630], [40, 1030], [60, 2030]
  ])('progressive fine for %i overdue days is %i', (days, expected) => {
    expect(new ProgressiveFineStrategy().calculate(due, addDays(due, days))).toBe(expected);
  });

  it.each(Array.from({ length: 30 }, (_, index) => index))('standard fine uses configured daily rate for day %i', (days) => {
    expect(new StandardFineStrategy(7).calculate(due, addDays(due, days))).toBe(days * 7);
  });

  it.each(Array.from({ length: 25 }, (_, index) => index))('student fine is half of progressive for day %i', (days) => {
    const progressive = new ProgressiveFineStrategy().calculate(due, addDays(due, days));
    expect(new StudentFineStrategy().calculate(due, addDays(due, days))).toBe(Math.floor(progressive * 0.5));
  });
});

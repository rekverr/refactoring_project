export type NotificationType = 'BOOK_AVAILABLE' | 'USER_BLOCKED' | 'FINE_CREATED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
}

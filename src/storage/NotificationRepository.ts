import { Notification } from '../models/Notification';
import { InMemoryRepository } from './Repository';

export class NotificationRepository extends InMemoryRepository<Notification> {
  findByUser(userId: string): Notification[] {
    return this.findAll().filter((notification) => notification.userId === userId);
  }
}

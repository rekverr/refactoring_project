import { NotificationRepository } from '../storage/NotificationRepository';
import { Notification, NotificationType } from '../models/Notification';

export interface LibraryEvent {
  type: NotificationType;
  userId: string;
  message: string;
}

export interface EventObserver {
  update(event: LibraryEvent): void;
}

export class LibraryEventBus {
  private readonly observers: EventObserver[] = [];

  subscribe(observer: EventObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: EventObserver): void {
    const index = this.observers.indexOf(observer);
    if (index >= 0) this.observers.splice(index, 1);
  }

  publish(event: LibraryEvent): void {
    this.observers.forEach((observer) => observer.update(event));
  }
}

export class NotificationObserver implements EventObserver {
  constructor(private readonly notifications: NotificationRepository) {}

  update(event: LibraryEvent): void {
    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      userId: event.userId,
      type: event.type,
      message: event.message,
      createdAt: new Date()
    };
    this.notifications.save(notification);
  }
}

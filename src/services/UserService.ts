import { UserRepository } from '../storage/UserRepository';
import { LibraryEventBus } from './NotificationObserver';
import { NotFoundError, ValidationError } from '../utils/errors';

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly events: LibraryEventBus
  ) {}

  blockUser(userId: string, reason: string): void {
    if (reason.trim().length < 3) throw new ValidationError('Block reason is too short');
    const user = this.users.findById(userId);
    if (!user) throw new NotFoundError('User', userId);
    user.status = 'BLOCKED';
    this.users.save(user);
    this.events.publish({
      type: 'USER_BLOCKED',
      userId,
      message: `User was blocked: ${reason}`
    });
  }

  unblockUser(userId: string): void {
    const user = this.users.findById(userId);
    if (!user) throw new NotFoundError('User', userId);
    user.status = 'ACTIVE';
    this.users.save(user);
  }
}

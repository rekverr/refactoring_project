import { User } from '../models/User';
import { InMemoryRepository } from './Repository';

export class UserRepository extends InMemoryRepository<User> {
  findBlocked(): User[] {
    return this.findAll().filter((user) => user.status === 'BLOCKED');
  }
}

import { makeSystem, seedUser } from './testFactory';
import { UserService } from '../src/services/UserService';

describe('UserService edge cases', () => {
  it('rejects too short block reason', () => {
    const system = makeSystem();
    system.users.save(seedUser(1));
    const service = new UserService(system.users, system.events);
    expect(() => service.blockUser('user-1', 'no')).toThrow('Block reason is too short');
  });

  it('throws when blocking missing user', () => {
    const system = makeSystem();
    const service = new UserService(system.users, system.events);
    expect(() => service.blockUser('missing', 'valid reason')).toThrow('User with id missing was not found');
  });

  it('throws when unblocking missing user', () => {
    const system = makeSystem();
    const service = new UserService(system.users, system.events);
    expect(() => service.unblockUser('missing')).toThrow('User with id missing was not found');
  });
});

import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  it('adminGuard is a function', () => {
    expect(typeof adminGuard).toBe('function');
  });
});

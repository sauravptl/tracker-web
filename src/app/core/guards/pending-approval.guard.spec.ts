import { pendingApprovalGuard } from './pending-approval.guard';

describe('pendingApprovalGuard', () => {
  it('pendingApprovalGuard is a function', () => {
    expect(typeof pendingApprovalGuard).toBe('function');
  });
});

import type { AccountStatus } from '../api/LoanLabApi';

/** Account state machine from REQUIREMENTS-LOANLAB.md LL-ACC-04 — the test oracle, written from the requirement, not copied from the app. */
export const ACCOUNT_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  PENDING: ['ACTIVE'],
  ACTIVE: ['FROZEN', 'CLOSED'],
  FROZEN: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
};

import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type { Credentials } from '../config/env';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type Loan = {
  id: number; loanNo: string; accountId: number; accountNo: string; accountStatus: AccountStatus;
  principal: number; outstanding: number; minimumPayment: number; status: 'ACTIVE' | 'CLOSED';
};
export type LoanAccount = { id: number; accountNo: string; userId: number; holderName: string; status: AccountStatus; loans: Loan[] };
export type LoanTxn = {
  id: number; ref: string; type: 'PAYMENT' | 'REVERSAL'; loanId: number; amount: number;
  status: 'POSTED' | 'PARTIALLY_REVERSED' | 'REVERSED'; reversedAmount: number | null; reversibleAmount: number | null;
  originalTransactionId: number | null; reference: string | null; reason: string | null;
  businessDate: string; settlementDate: string | null; balanceAfter: number;
};
export type EodRun = {
  id: number; businessDate: string; nextBusinessDate: string; settledCount: number; paymentsTotal: number; reversalsTotal: number;
  netTotal: number; status: 'BALANCED' | 'OUT_OF_BALANCE'; breaks: { loanId: number; loanNo: string; expected: number; actual: number; difference: number }[];
};
export type LoanSetup = { accountStatus?: AccountStatus; outstanding?: number; principal?: number; noLoan?: boolean };
export type ReversalInput = { originalTransactionId?: number; reference?: string; reason?: string; amount?: number };

let referenceCounter = 0;
/** A unique reversal reference per call (LL-REV-03): parallel workers must never collide. */
export const uniqueReference = (): string => `PW-${process.pid}-${Date.now().toString(36)}-${referenceCounter++}`;

/**
 * API client for LoanLab (REQUIREMENTS-LOANLAB.md). Same idea as ShopLabApi: one object per "user",
 * methods return the raw APIResponse so each test asserts the status code itself.
 */
export class LoanLabApi {
  private readonly request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  get authToken(): string | null {
    return this.token;
  }

  async loginOrFail(user: Credentials): Promise<string> {
    const res = await this.request.post('/api/auth/login', { data: user });
    expect(res.status(), `login as ${user.username}`).toBe(200);
    this.token = (await res.json()).token;
    return this.token as string;
  }

  // ---------- test hooks (no login needed, disabled in production) ----------
  /** Creates an account and a loan for an existing customer directly in the requested state. */
  async createAccount(username: string, setup: LoanSetup = {}): Promise<{ account: LoanAccount; loan: Loan }> {
    const res = await this.request.post('/api/test/loanlab/accounts', { data: { username, ...setup } });
    expect(res.status(), await res.text()).toBe(201);
    return res.json();
  }

  /** Fault injection: changes the stored balance without a ledger entry (reconciliation break). */
  forceOutstanding(loanId: number, outstanding: number): Promise<APIResponse> {
    return this.request.patch(`/api/test/loanlab/loans/${loanId}`, { data: { outstanding } });
  }

  async businessDate(): Promise<string> {
    return (await (await this.request.get('/api/test/loanlab/business-date')).json()).businessDate;
  }

  setBusinessDate(date: string): Promise<APIResponse> {
    return this.request.post('/api/test/loanlab/business-date', { data: { date } });
  }

  async runEod(): Promise<EodRun> {
    const res = await this.request.post('/api/test/loanlab/eod');
    expect(res.status(), await res.text()).toBe(201);
    return res.json();
  }

  // ---------- accounts & loans ----------
  accounts(all = false): Promise<APIResponse> {
    return this.request.get('/api/loanlab/accounts', { params: all ? { all: '1' } : {}, headers: this.headers() });
  }

  account(id: number): Promise<APIResponse> {
    return this.request.get(`/api/loanlab/accounts/${id}`, { headers: this.headers() });
  }

  openAccount(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/loanlab/accounts', { data, headers: this.headers() });
  }

  setAccountStatus(id: number, status: string): Promise<APIResponse> {
    return this.request.patch(`/api/loanlab/accounts/${id}/status`, { data: { status }, headers: this.headers() });
  }

  openLoan(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/loanlab/loans', { data, headers: this.headers() });
  }

  loan(id: number): Promise<APIResponse> {
    return this.request.get(`/api/loanlab/loans/${id}`, { headers: this.headers() });
  }

  async loanOrFail(id: number): Promise<Loan> {
    const res = await this.loan(id);
    expect(res.status(), await res.text()).toBe(200);
    return res.json();
  }

  // ---------- payment, reversal, reporting ----------
  pay(loanId: number, amount: unknown): Promise<APIResponse> {
    return this.request.post(`/api/loanlab/loans/${loanId}/payments`, { data: { amount }, headers: this.headers() });
  }

  async payOrFail(loanId: number, amount: number): Promise<{ transaction: LoanTxn; loan: Loan }> {
    const res = await this.pay(loanId, amount);
    expect(res.status(), await res.text()).toBe(201);
    return res.json();
  }

  reverse(input: ReversalInput): Promise<APIResponse> {
    return this.request.post('/api/loanlab/reversals', { data: input, headers: this.headers() });
  }

  history(loanId: number, query: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get(`/api/loanlab/loans/${loanId}/transactions`, { params: query, headers: this.headers() });
  }

  transaction(id: number): Promise<APIResponse> {
    return this.request.get(`/api/loanlab/transactions/${id}`, { headers: this.headers() });
  }

  async transactionOrFail(id: number): Promise<LoanTxn & { reversals?: LoanTxn[] }> {
    const res = await this.transaction(id);
    expect(res.status(), await res.text()).toBe(200);
    return res.json();
  }

  // ---------- end of day (officer) ----------
  eod(): Promise<APIResponse> {
    return this.request.post('/api/loanlab/eod', { headers: this.headers() });
  }

  eodRuns(): Promise<APIResponse> {
    return this.request.get('/api/loanlab/eod-runs', { headers: this.headers() });
  }
}

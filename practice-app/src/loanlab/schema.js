'use strict';
/**
 * LoanLab tables and deterministic seed data. This file must not require ../db (db.js requires it).
 * Money columns end with _satang and hold integers (1 THB = 100 satang).
 */
const DROP = `
DROP TABLE IF EXISTS ll_eod_runs;
DROP TABLE IF EXISTS ll_transactions;
DROP TABLE IF EXISTS ll_loans;
DROP TABLE IF EXISTS ll_accounts;
DROP TABLE IF EXISTS ll_system;
`;

const CREATE = `
CREATE TABLE ll_system (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE ll_accounts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  account_no  TEXT UNIQUE,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  holder_name TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('PENDING','ACTIVE','FROZEN','CLOSED')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE ll_loans (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_no            TEXT UNIQUE,
  account_id         INTEGER NOT NULL REFERENCES ll_accounts(id),
  principal_satang   INTEGER NOT NULL CHECK (principal_satang > 0),
  opening_satang     INTEGER NOT NULL CHECK (opening_satang >= 0),
  outstanding_satang INTEGER NOT NULL CHECK (outstanding_satang >= 0),
  status             TEXT NOT NULL CHECK (status IN ('ACTIVE','CLOSED')),
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);

-- One row per PAYMENT and per REVERSAL. "reference" is not UNIQUE on purpose: the duplicate check is a
-- business rule in src/loanlab/rules.js (LL-REV-09), which is where the course wants it to be testable.
CREATE TABLE ll_transactions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  txn_ref              TEXT UNIQUE,
  type                 TEXT NOT NULL CHECK (type IN ('PAYMENT','REVERSAL')),
  loan_id              INTEGER NOT NULL REFERENCES ll_loans(id),
  amount_satang        INTEGER NOT NULL CHECK (amount_satang > 0),
  status               TEXT NOT NULL CHECK (status IN ('POSTED','PARTIALLY_REVERSED','REVERSED')),
  reversed_satang      INTEGER NOT NULL DEFAULT 0,
  original_txn_id      INTEGER REFERENCES ll_transactions(id),
  reference            TEXT,
  reason               TEXT,
  business_date        TEXT NOT NULL,
  settlement_date      TEXT,
  balance_after_satang INTEGER NOT NULL,
  created_by           INTEGER REFERENCES users(id),
  created_at           TEXT NOT NULL
);
CREATE INDEX ll_transactions_loan ON ll_transactions (loan_id, id);

CREATE TABLE ll_eod_runs (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  business_date      TEXT NOT NULL,
  next_business_date TEXT NOT NULL,
  settled_count      INTEGER NOT NULL,
  payments_satang    INTEGER NOT NULL,
  reversals_satang   INTEGER NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('BALANCED','OUT_OF_BALANCE')),
  breaks_json        TEXT NOT NULL,
  run_at             TEXT NOT NULL
);
`;

const SEED_TIME = '2026-01-01T00:00:00Z';
const SEED_BUSINESS_DATE = '2026-01-05'; // a Monday

const pad = (id) => String(id).padStart(6, '0');
const accountNo = (id) => `LA-${pad(id)}`;
const loanNo = (id) => `LN-${pad(id)}`;
const txnRef = (type, id, businessDate) => `${type === 'PAYMENT' ? 'PM' : 'RV'}-${businessDate.replace(/-/g, '')}-${pad(id)}`;

/**
 * SEED (amounts in THB)
 *   customer : LA ACTIVE  — loan 50,000.00, no history
 *   jane     : LA ACTIVE  — loan A 20,000.00 → 18,500.00 after one settled payment and one reversed payment
 *                           loan B outstanding 300.00 (below the 500 minimum: exact pay-off only)
 *                           loan C paid in full → CLOSED
 *   locked   : LA FROZEN  — loan 10,000.00 (payments rejected)
 */
const SEED = [
  { user: 'customer', holder: 'Somchai Customer', status: 'ACTIVE', loans: [{ principal: 50000, opening: 50000, txns: [] }] },
  {
    user: 'jane', holder: 'Jane Doe', status: 'ACTIVE', loans: [
      {
        principal: 20000, opening: 20000, txns: [
          { type: 'PAYMENT', amount: 1500, status: 'POSTED', date: '2026-01-02', settled: '2026-01-05' },
          { type: 'PAYMENT', amount: 2000, status: 'REVERSED', reversed: 2000, date: '2026-01-02' },
          { type: 'REVERSAL', amount: 2000, originalIndex: 1, reference: 'SEED-RV-0001', reason: 'Payment was posted to the wrong loan', date: '2026-01-02' },
        ],
      },
      { principal: 5000, opening: 300, txns: [] },
      { principal: 3000, opening: 3000, txns: [{ type: 'PAYMENT', amount: 3000, status: 'POSTED', date: '2025-12-30', settled: '2025-12-31' }] },
    ],
  },
  { user: 'locked', holder: 'Larry Locked', status: 'FROZEN', loans: [{ principal: 10000, opening: 10000, txns: [] }] },
];

function seed(db) {
  db.prepare('INSERT INTO ll_system (key, value) VALUES (?, ?)').run('business_date', SEED_BUSINESS_DATE);
  const user = (username) => db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  const admin = user('admin');
  const insAccount = db.prepare('INSERT INTO ll_accounts (user_id, holder_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
  const insLoan = db.prepare(`INSERT INTO ll_loans (account_id, principal_satang, opening_satang, outstanding_satang, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)`);
  const insTxn = db.prepare(`INSERT INTO ll_transactions (type, loan_id, amount_satang, status, reversed_satang, original_txn_id, reference, reason,
    business_date, settlement_date, balance_after_satang, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  for (const a of SEED) {
    const owner = user(a.user);
    if (!owner) continue;
    const accountId = Number(insAccount.run(owner.id, a.holder, a.status, SEED_TIME, SEED_TIME).lastInsertRowid);
    db.prepare('UPDATE ll_accounts SET account_no = ? WHERE id = ?').run(accountNo(accountId), accountId);
    for (const l of a.loans) {
      const loanId = Number(insLoan.run(accountId, l.principal * 100, l.opening * 100, l.opening * 100, SEED_TIME, SEED_TIME).lastInsertRowid);
      let balance = l.opening * 100;
      const ids = [];
      for (const t of l.txns) {
        const amount = t.amount * 100;
        balance += t.type === 'PAYMENT' ? -amount : amount;
        const id = Number(insTxn.run(t.type, loanId, amount, t.status || 'POSTED', (t.reversed || 0) * 100,
          t.originalIndex === undefined ? null : ids[t.originalIndex], t.reference || null, t.reason || null,
          t.date, t.settled || null, balance, t.type === 'PAYMENT' ? owner.id : admin.id, `${t.date}T03:00:00Z`).lastInsertRowid);
        db.prepare('UPDATE ll_transactions SET txn_ref = ? WHERE id = ?').run(txnRef(t.type, id, t.date), id);
        ids.push(id);
      }
      db.prepare('UPDATE ll_loans SET loan_no = ?, outstanding_satang = ?, status = ? WHERE id = ?')
        .run(loanNo(loanId), balance, balance === 0 ? 'CLOSED' : 'ACTIVE', loanId);
    }
  }

  db.prepare(`INSERT INTO ll_eod_runs (business_date, next_business_date, settled_count, payments_satang, reversals_satang, status, breaks_json, run_at)
    VALUES ('2026-01-02', ?, 1, 350000, 200000, 'BALANCED', '[]', '2026-01-02T12:00:00Z')`).run(SEED_BUSINESS_DATE);
}

module.exports = { DROP, CREATE, seed, accountNo, loanNo, txnRef, SEED_BUSINESS_DATE };

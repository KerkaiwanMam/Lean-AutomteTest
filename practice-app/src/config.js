'use strict';
/**
 * Runtime configuration that tests can change through /api/test/config.
 *
 * bugMode     : when true, the intentional defects listed in BUGS are active.
 *               Use it to prove that your automated tests actually catch regressions.
 * latencyMs   : artificial delay added to every /api request (practice waits & timeouts).
 * failureRate : 0..1 probability that GET /api/products returns HTTP 503 (practice retries
 *               and flaky-test analysis).
 */
const defaults = () => ({
  bugMode: process.env.BUG_MODE === '1',
  latencyMs: Number(process.env.LATENCY_MS || 0),
  failureRate: Number(process.env.FAILURE_RATE || 0),
});

let state = defaults();

// Catalogue of intentional defects. The descriptions are visible to instructors through
// GET /api/test/config?reveal=1 and docs/instructor/bug-catalogue.md. Learners should find
// them through testing, not by reading this file :)
const BUGS = {
  'BUG-01': 'Free-shipping threshold uses > instead of >=',
  'BUG-02': 'VAT is calculated before the discount is applied',
  'BUG-03': 'Product search is case-sensitive',
  'BUG-04': 'Sort by price compares prices as text',
  'BUG-05': 'Pagination skips one product between pages',
  'BUG-06': 'Registration accepts age 17',
  'BUG-07': 'Expired coupon is accepted',
  'BUG-08': 'Any logged-in user can read another user\'s order (IDOR)',
  'BUG-09': 'Review comments are rendered as HTML (stored XSS)',
  'BUG-10': 'API accepts cart quantity above 10',
  'BUG-11': 'Locked account can still log in and use the API',
  'BUG-12': 'Cancelling an order does not restore stock',
  'BUG-13': 'Login error message reveals whether the username exists',
};

/**
 * GRADING MODE — used by tools/grade_suite.py (Skills Assessments, Capstone).
 * GRADING_BUGS=BUG-01[,BUG-07...] switches on ONLY the listed defects, regardless of bugMode, and
 * the learner's suite cannot switch them off through /api/test/config. This lets a grader run a
 * suite once per defect and count which defects the suite detects (a simple mutation-testing score).
 */
const gradingBugs = (process.env.GRADING_BUGS || '')
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter((id) => Object.prototype.hasOwnProperty.call(BUGS, id));

module.exports = {
  get: () => ({ ...state, ...(gradingBugs.length ? { activeBugs: [...gradingBugs] } : {}) }),
  set(patch = {}) {
    if (typeof patch.bugMode === 'boolean') state.bugMode = patch.bugMode;
    if (Number.isFinite(patch.latencyMs)) state.latencyMs = Math.max(0, Math.min(patch.latencyMs, 30000));
    if (Number.isFinite(patch.failureRate)) state.failureRate = Math.max(0, Math.min(patch.failureRate, 1));
    return module.exports.get();
  },
  reset() {
    state = defaults();
    return module.exports.get();
  },
  /** true when the given intentional defect is active */
  bug: (id) => (gradingBugs.length
    ? gradingBugs.includes(id)
    : state.bugMode && Object.prototype.hasOwnProperty.call(BUGS, id)),
  gradingBugs,
  BUGS,
};

'use strict';
/**
 * Grading mode (GRADING_BUGS) — used by tools/grade_suite.py to switch on exactly one planted defect.
 * config.js reads the environment when it is first required, so each test loads a fresh copy.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const CONFIG = path.join(__dirname, '..', 'src', 'config.js');

function loadConfig(env) {
  const saved = { GRADING_BUGS: process.env.GRADING_BUGS, BUG_MODE: process.env.BUG_MODE };
  Object.assign(process.env, env);
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k];
  delete require.cache[require.resolve(CONFIG)];
  const config = require(CONFIG);
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  return config;
}

test('no grading bugs: defects follow bugMode', () => {
  const config = loadConfig({ GRADING_BUGS: undefined, BUG_MODE: undefined });
  assert.equal(config.bug('BUG-01'), false);
  config.set({ bugMode: true });
  assert.equal(config.bug('BUG-01'), true);
  assert.equal(config.get().activeBugs, undefined);
});

test('GRADING_BUGS switches on only the listed defect', () => {
  const config = loadConfig({ GRADING_BUGS: 'bug-07', BUG_MODE: undefined });
  assert.equal(config.bug('BUG-07'), true);
  assert.equal(config.bug('BUG-01'), false);
  assert.deepEqual(config.get().activeBugs, ['BUG-07']);
});

test('the suite under test cannot switch a grading bug off (or others on)', () => {
  const config = loadConfig({ GRADING_BUGS: 'BUG-12', BUG_MODE: undefined });
  config.set({ bugMode: false });
  config.reset();
  assert.equal(config.bug('BUG-12'), true);
  config.set({ bugMode: true });
  assert.equal(config.bug('BUG-03'), false);
});

test('unknown ids in GRADING_BUGS are ignored', () => {
  const config = loadConfig({ GRADING_BUGS: 'BUG-99, nope', BUG_MODE: undefined });
  assert.deepEqual(config.gradingBugs, []);
  assert.equal(config.get().activeBugs, undefined);
});

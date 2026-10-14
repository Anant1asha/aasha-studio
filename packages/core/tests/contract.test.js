const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { ChapterContractManager } = require('../dist/index.js');

test('ChapterContractManager: matches prebuilt foundations from experience registry', () => {
  const coreBaseDir = path.resolve(__dirname, '..');
  const manager = new ChapterContractManager(coreBaseDir);

  const match = manager.generateResourceMatchReport('Mathematics', 6, 'Integers and Number Line');

  assert.ok(match, 'Expected match object to be returned');
  assert.ok(typeof match.report === 'string', 'Expected report markdown string');
  assert.ok(match.report.length > 50, 'Report must contain substantive match analysis');
  assert.ok(match.best, 'Expected best foundation match');
  assert.ok(match.best.id, 'Expected foundation ID (e.g. F01-F20)');
});

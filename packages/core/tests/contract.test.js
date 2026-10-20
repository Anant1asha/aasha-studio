const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
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

function createManagerWithRegistry(t, foundations) {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aasha-contract-test-'));
  const registryDir = path.join(baseDir, 'registry');
  fs.mkdirSync(registryDir, { recursive: true });
  fs.writeFileSync(path.join(registryDir, 'registry.json'), JSON.stringify({ foundations }));
  t.after(() => fs.rmSync(baseDir, { recursive: true, force: true }));
  return new ChapterContractManager(baseDir);
}

test('ChapterContractManager: returns no resource when no foundation matches', (t) => {
  const manager = createManagerWithRegistry(t, [
    { id: 'F01', name: 'Math Escape', subjects: ['Mathematics'], classes: [6], mechanics: ['practice'] },
  ]);

  const match = manager.generateResourceMatchReport('Science', 9, 'Energy');

  assert.equal(match.best, null);
  assert.match(match.report, /No matching resource found/);
  assert.doesNotMatch(match.report, /Escape Run \(F01\)|Existing Coverage: 85%|15%/);
});

test('ChapterContractManager: reports compliance and coverage as unknown without validation evidence', (t) => {
  const manager = createManagerWithRegistry(t, [
    { id: 'F01', name: 'Math Escape', repo: 'https://example.org/math', license: 'MIT', subjects: ['Mathematics'], classes: [6], mechanics: ['practice'] },
  ]);

  const match = manager.generateResourceMatchReport('Mathematics', 6, 'Integers');

  assert.equal(match.best.id, 'F01');
  assert.match(match.report, /Existing Coverage\*\*: UNKNOWN/);
  assert.match(match.report, /License Status\*\*: UNKNOWN/);
  assert.match(match.report, /Offline\*\*: UNKNOWN/);
  assert.match(match.report, /Mobile\*\*: UNKNOWN/);
  assert.match(match.report, /Accessibility\*\*: UNKNOWN/);
  assert.match(match.report, /Localization\*\*: UNKNOWN/);
  assert.match(match.report, /AI Integration\*\*: UNKNOWN/);
  assert.match(match.report, /Mastery\*\*: UNKNOWN/);
  assert.match(match.report, /Telemetry\*\*: UNKNOWN/);
  assert.doesNotMatch(match.report, /\bPASS\b|85%|15%/);
});

test('ChapterContractManager: generated contract does not select fallback or claim compliance for an unmatched resource', async (t) => {
  const manager = createManagerWithRegistry(t, [
    { id: 'F01', name: 'Math Escape', subjects: ['Mathematics'], classes: [6] },
  ]);

  const result = await manager.ensureChapterContract({ subject: 'Science', classNum: 9, topic: 'Energy' });
  const yaml = fs.readFileSync(result.contractPath, 'utf-8');

  assert.equal(result.matchedFoundation, null);
  assert.match(yaml, /matched_foundation_id: null/);
  assert.match(yaml, /telemetry_compliant: "UNKNOWN"/);
  assert.match(yaml, /same_frame_mobile_viewport: "UNKNOWN"/);
});

test('ChapterContractManager: generated contract keeps matched-resource validation status unknown', async (t) => {
  const manager = createManagerWithRegistry(t, [
    { id: 'F01', name: 'Math Escape', repo: 'https://example.org/math', license: 'MIT', subjects: ['Mathematics'], classes: [6], reuse_strategy: 'INSPIRE' },
  ]);

  const result = await manager.ensureChapterContract({ subject: 'Mathematics', classNum: 6, topic: 'Integers' });
  const yaml = fs.readFileSync(result.contractPath, 'utf-8');

  assert.equal(result.matchedFoundation.id, 'F01');
  assert.match(yaml, /match_status: "MATCHED"/);
  assert.match(yaml, /license_status: "UNKNOWN"/);
  assert.match(yaml, /offline_status: "UNKNOWN"/);
  assert.match(yaml, /telemetry_status: "UNKNOWN"/);
  assert.doesNotMatch(yaml, /telemetry_compliant: true|same_frame_mobile_viewport: true/);
});


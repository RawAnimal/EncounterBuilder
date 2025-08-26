import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCR } from '../script/adversaryData.js';

test('formatCR formats fractional and whole CR values', () => {
  assert.strictEqual(formatCR(0.5), '1/2');
  assert.strictEqual(formatCR(0.75), '3/4');
  assert.strictEqual(formatCR(2), '2');
});

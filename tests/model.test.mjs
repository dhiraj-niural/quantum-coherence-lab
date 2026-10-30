import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createExperiment, parity } from '../site/dist/lab/model.mjs';

const reference = JSON.parse(readFileSync(new URL('../site/dist/distributions.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(reference);
function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296);
}
function sequence(values, fallback = 0) {
  let i = 0;
  return () => i < values.length ? values[i++] : fallback;
}

test('parity covers every four-bit string and rejects non-indices', () => {
  for (let i = 0; i < 16; i++) {
    assert.equal(parity(i), reference.labels[i].split('1').length % 2 === 0 ? 1 : 0);
  }
  for (const value of [-1, 16, 1.5, NaN, '1', null]) assert.throws(() => parity(value));
});

test('mapping is randomized once and reveal stays separate from measurement records', () => {
  for (const [first, label] of [[0, 'A'], [0.499, 'A'], [0.5, 'B'], [0.999, 'B']]) {
    const experiment = createExperiment(reference, sequence([first]));
    assert.equal(experiment.coherentLabel, label);
    assert.equal(experiment.identify(label), true);
    assert.equal(experiment.identify(label === 'A' ? 'B' : 'A'), false);
    const result = experiment.measure('X', 3);
    assert.deepEqual(Object.keys(result).sort(), ['basis', 'boxes', 'shots']);
    for (const box of result.boxes) {
      assert.deepEqual(Object.keys(box).sort(), ['counts', 'even', 'label', 'odd', 'recent']);
      assert.equal(box.odd, box.label === label ? 3 : 0);
    }
    experiment.measure('Z', 1);
    assert.equal(experiment.coherentLabel, label);
  }
});

test('Python reference Z predictions match and identical draws give identical Z records', () => {
  reference.states.coherent.Z.forEach((value, i) => {
    assert.ok(Math.abs(value - reference.states.mixed.Z[i]) < 1e-12);
  });
  const draws = [0, 0.49, 0.5, 0.999];
  const result = createExperiment(reference, sequence([0, ...draws, ...draws])).measure('Z', 4);
  assert.deepEqual(result.boxes[0].counts, result.boxes[1].counts);
  assert.deepEqual(result.boxes[0].recent, ['0000', '0000', '1111', '1111']);
  assert.equal(result.boxes[0].even, 4);
});

test('seeded sampling is reproducible, supported, and conserves batch totals', () => {
  const first = createExperiment(reference, seeded(42));
  const second = createExperiment(reference, seeded(42));
  for (const basis of ['Z', 'X', 'X']) {
    const result = first.measure(basis, 257);
    assert.deepEqual(result, second.measure(basis, 257));
    for (const box of result.boxes) {
      assert.equal(box.counts.reduce((a, b) => a + b), 257);
      assert.equal(box.even + box.odd, 257);
      assert.equal(box.odd, box.counts.reduce((sum, count, i) => sum + count * parity(i), 0));
      assert.equal(box.recent.length, 8);
      assert.ok(box.recent.every(label => /^[01]{4}$/.test(label)));
      const state = box.label === first.coherentLabel ? 'coherent' : 'mixed';
      box.counts.forEach((count, i) => {
        if (reference.states[state][basis][i] === 0) assert.equal(count, 0);
      });
    }
  }
});

test('sampling normalizes weights, including large finite weights', () => {
  const altered = clone();
  for (const state of ['coherent', 'mixed']) {
    for (const basis of ['Z', 'X']) {
      altered.states[state][basis] = altered.states[state][basis].map(value => value > 0 ? Number.MAX_VALUE : 0);
    }
  }
  const result = createExperiment(altered, sequence([0], 0.9999999999999999)).measure('X', 1);
  assert.equal(result.boxes[0].counts[14], 1);
  assert.equal(result.boxes[1].counts[15], 1);
});

test('new measurements replace batches, do not mutate earlier results, and use default shots', () => {
  const experiment = createExperiment(reference, sequence([0, 0, 0], 0.999));
  const first = experiment.measure('Z', 1);
  const snapshot = structuredClone(first);
  const second = experiment.measure('Z', 1);
  assert.equal(first.boxes[0].counts[0], 1);
  assert.equal(second.boxes[0].counts[15], 1);
  assert.deepEqual(first, snapshot);
  first.boxes[0].counts[0] = 999;
  assert.equal(experiment.measure('Z').boxes[0].counts[15], 64);
});

test('validated probabilities are isolated from later reference mutation', () => {
  const input = clone();
  const experiment = createExperiment(input, () => 0);
  input.states.coherent.X.fill(0);
  input.labels[1] = 'wrong';
  assert.deepEqual(experiment.measure('X', 1).boxes[0].recent, ['0001']);
});

test('invalid reference shape, labels, and distributions fail before sampling', () => {
  const changes = [
    r => { r.n_qubits = 3; },
    r => { r.labels.reverse(); },
    r => { r.labels.pop(); },
    r => { r.states = null; },
    r => { delete r.states.mixed.X; },
    r => { r.states.coherent.Z = [1]; },
    r => { r.states.coherent.Z.fill(0); },
    r => { r.states.coherent.Z[0] = -1; },
    r => { r.states.coherent.Z[0] = Infinity; },
    r => { r.states.coherent.Z[0] = NaN; },
    r => { r.states.coherent.Z[0] = '0.5'; },
    r => { delete r.states.coherent.Z[1]; },
  ];
  for (const change of changes) {
    const input = clone(); change(input);
    assert.throws(() => createExperiment(input, () => { assert.fail('must validate before RNG'); }));
  }
  assert.throws(() => createExperiment(null));
});

test('invalid calls and RNG outputs are rejected', () => {
  assert.throws(() => createExperiment(reference, null));
  for (const value of [-0.1, 1, NaN, Infinity, '0.5', undefined]) {
    assert.throws(() => createExperiment(reference, () => value));
    assert.throws(() => createExperiment(reference, sequence([0, value])).measure('X', 1));
  }
  const experiment = createExperiment(reference, () => 0);
  for (const basis of ['Y', 'x', null, undefined]) assert.throws(() => experiment.measure(basis));
  for (const shots of [0, -1, 1.5, Infinity, NaN, '2', true, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => experiment.measure('X', shots));
  }
  for (const label of ['a', 'C', 0, null]) assert.throws(() => experiment.identify(label));
});

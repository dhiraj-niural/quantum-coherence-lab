/** Sampling adapter for the Python reference. Every measure call is a fresh batch. */
const SIZE = 16;
const RECENT_LIMIT = 8;
const LABELS = Array.from({ length: SIZE }, (_, i) => i.toString(2).padStart(4, '0'));

/** Parity of a four-bit outcome: 0 means even, 1 means odd. */
export function parity(index) {
  if (!Number.isInteger(index) || index < 0 || index >= SIZE) {
    throw new RangeError('Outcome index must be an integer from 0 to 15.');
  }
  let result = 0;
  for (let bits = index; bits; bits >>>= 1) result ^= bits & 1;
  return result;
}

function normalized(weights, name) {
  if (!Array.isArray(weights) || weights.length !== SIZE) {
    throw new TypeError(`${name} must contain 16 weights.`);
  }
  // Array.from also turns sparse entries into undefined, so holes are rejected.
  const values = Array.from(weights);
  if (values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new TypeError(`${name} weights must be finite, nonnegative numbers.`);
  }
  const max = Math.max(...values);
  if (max === 0) throw new RangeError(`${name} must have positive total weight.`);
  // Scaling first avoids overflow when valid finite weights have a large sum.
  const scaled = values.map(value => value / max);
  const total = scaled.reduce((sum, value) => sum + value, 0);
  return scaled.map(value => value / total);
}

function readReference(reference) {
  if (reference?.n_qubits !== 4 || !Array.isArray(reference.labels) ||
      reference.labels.length !== SIZE ||
      LABELS.some((label, i) => reference.labels[i] !== label)) {
    throw new TypeError('Reference must describe four qubits with canonical labels 0000 through 1111.');
  }
  return Object.fromEntries(['coherent', 'mixed'].map(state => [state,
    Object.fromEntries(['Z', 'X'].map(basis => [basis,
      normalized(reference.states?.[state]?.[basis], `${state}.${basis}`),
    ])),
  ]));
}

/**
 * The identity is fixed for this experiment. measure() exposes only A/B records,
 * counts and the last up to eight outcomes; it never accumulates earlier batches.
 * coherentLabel and identify() are for the caller's explicit reveal step only.
 */
export function createExperiment(reference, rng = Math.random) {
  const probabilities = readReference(reference);
  if (typeof rng !== 'function') throw new TypeError('rng must be a function.');
  function random() {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError('rng must return a finite number in [0, 1).');
    }
    return value;
  }
  const coherentLabel = random() < 0.5 ? 'A' : 'B';

  function measure(basis, shots = 64) {
    if (basis !== 'Z' && basis !== 'X') throw new RangeError('Basis must be Z or X.');
    if (!Number.isSafeInteger(shots) || shots < 1) {
      throw new RangeError('shots must be a positive safe integer.');
    }
    const boxes = ['A', 'B'].map(label => {
      const weights = probabilities[label === coherentLabel ? 'coherent' : 'mixed'][basis];
      const counts = Array(SIZE).fill(0);
      const recent = [];
      const lastSupported = weights.findLastIndex(value => value > 0);
      let odd = 0;
      for (let shot = 0; shot < shots; shot++) {
        const draw = random();
        let cumulative = 0;
        let index = lastSupported;
        for (let i = 0; i < SIZE; i++) {
          cumulative += weights[i];
          if (draw < cumulative) { index = i; break; }
        }
        counts[index]++;
        odd += parity(index);
        if (shot >= shots - RECENT_LIMIT) recent.push(LABELS[index]);
      }
      return { label, counts, even: shots - odd, odd, recent };
    });
    return { basis, shots, boxes };
  }

  function identify(label) {
    if (label !== 'A' && label !== 'B') throw new RangeError('Label must be A or B.');
    return label === coherentLabel;
  }
  return { measure, identify, coherentLabel };
}

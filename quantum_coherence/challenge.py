"""Ideal coherence challenge using pure-state ensembles, not mixed amplitudes.

Each shot measures a fresh independent preparation. X means applying H to
each qubit before Z measurement; its labels 0/1 mean eigenvalues +1/-1.
"""
import json
import math
import random

from .circuit import Gate
from .simulator import apply, probabilities

N_QUBITS = 4
SIZE = 2**N_QUBITS


def ensemble(state_name):
    """Return weighted pure components; probabilities are averaged after evolution."""
    zero, one = [0j] * SIZE, [0j] * SIZE
    zero[0], one[-1] = 1, 1
    if state_name == 'mixed':
        return [(0.5, zero), (0.5, one)]
    if state_name == 'coherent':
        state = [0j] * SIZE
        state[0], state[-1] = 1 / math.sqrt(2), -1 / math.sqrt(2)
        return [(1.0, state)]
    raise ValueError('state_name must be coherent or mixed')


def measurement_probabilities(state_name, basis):
    """Probabilities in q4 q3 q2 q1 label order."""
    if basis not in ('Z', 'X'):
        raise ValueError('basis must be Z or X')
    total = [0.0] * SIZE
    for weight, state in ensemble(state_name):
        if basis == 'X':
            for qubit in range(1, N_QUBITS + 1):
                state = apply(state, Gate('H', qubit))
        for index, probability in enumerate(probabilities(state)):
            total[index] += weight * probability
    return total


def sample_counts(state_name, basis, shots=128, seed=0):
    """Sample fresh preparations reproducibly for a given seed."""
    if isinstance(shots, bool) or not isinstance(shots, int) or shots < 1:
        raise ValueError('shots must be a positive integer')
    weights = measurement_probabilities(state_name, basis)
    rng = random.Random(seed)
    counts = [0] * SIZE
    for index in rng.choices(range(SIZE), weights=weights, k=shots):
        counts[index] += 1
    return counts


def parity_probabilities(state_name, basis):
    """Return [even, odd] probabilities for the number of measured 1 labels."""
    result = [0.0, 0.0]
    for index, probability in enumerate(measurement_probabilities(state_name, basis)):
        result[bin(index).count('1') % 2] += probability
    return result


def distributions():
    """JSON-ready ideal probabilities for browser assets and verification."""
    return {
        'schema_version': 1,
        'n_qubits': N_QUBITS,
        'bit_order': 'q4 q3 q2 q1',
        'labels': [format(i, '04b') for i in range(SIZE)],
        'states': {
            name: {basis: measurement_probabilities(name, basis) for basis in ('Z', 'X')}
            for name in ('coherent', 'mixed')
        },
        'assumptions': [
            'Each shot measures a fresh independent preparation.',
            'Ideal noiseless measurements; no hardware or runtime AI is used.',
            'X labels 0 and 1 mean eigenvalues +1 and -1.',
            'Finite samples provide evidence, not certainty: a mixture can produce only odd outcomes by chance.',
            'This distinguishes two promised preparations, not arbitrary quantum states.',
        ],
    }


if __name__ == '__main__':
    print(json.dumps(distributions(), indent=2, allow_nan=False))

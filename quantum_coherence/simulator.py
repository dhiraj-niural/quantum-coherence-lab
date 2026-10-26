"""Pairwise state-vector simulation. Qubit1 is the least-significant bit."""
import math
import random


def initial(n):
    if n < 1:
        raise ValueError('At least one qubit is required')
    return [1 + 0j] + [0j] * (2**n - 1)


def apply(state, gate):
    size = len(state)
    n = size.bit_length() - 1
    if size != 2**n or not 1 <= gate.target <= n:
        raise ValueError('Invalid state dimension or target')
    mask = 1 << (gate.target - 1)
    out = state.copy()
    if gate.name == 'CX':
        if not 1 <= gate.control <= n or gate.control == gate.target:
            raise ValueError('Invalid control')
        control = 1 << (gate.control - 1)
    elif gate.name not in ('X', 'H'):
        raise ValueError('Unsupported gate')
    for i in range(size):
        if i & mask:
            continue
        j = i | mask
        if gate.name == 'H':
            out[i] = (state[i] + state[j]) / math.sqrt(2)
            out[j] = (state[i] - state[j]) / math.sqrt(2)
        elif gate.name == 'X' or i & control:
            out[i], out[j] = state[j], state[i]
    return out


def trajectory(n, gates):
    states = [initial(n)]
    for gate in gates:
        states.append(apply(states[-1], gate))
    return states


def probabilities(state):
    return [abs(x)**2 for x in state]


def sample(state, shots=1024, seed=0):
    if shots < 1:
        raise ValueError('shots must be positive')
    weights = probabilities(state)
    if not math.isclose(sum(weights), 1, abs_tol=1e-10):
        raise ValueError('State is not normalized')
    rng = random.Random(seed)
    counts = [0] * len(state)
    for value in rng.choices(range(len(state)), weights=weights, k=shots):
        counts[value] += 1
    return counts

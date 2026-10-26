"""Run with Python 3.9+: python3 scripts/learn_measurement.py. No packages needed."""
import math
import random


def change_measurement(amplitudes):
    # Apply H to each of four qubits. Each pair becomes (a+b, a-b)/sqrt(2).
    result = amplitudes[:]
    for bit in range(4):
        for i in range(16):
            if (i >> bit) & 1 == 0:
                j = i | (1 << bit)
                a, b = result[i], result[j]
                result[i] = (a + b) / math.sqrt(2)
                result[j] = (a - b) / math.sqrt(2)
    return result


def probabilities(components, setting):
    # A mixture averages probabilities, never amplitudes.
    total = [0.0] * 16
    for weight, amplitudes in components:
        measured = change_measurement(amplitudes) if setting == 'X' else amplitudes
        for i, amplitude in enumerate(measured):
            total[i] += weight * abs(amplitude) ** 2
    return total


def preparations(sign=-1):
    zero, one = [0.0] * 16, [0.0] * 16
    zero[0], one[15] = 1.0, 1.0
    coherent = [0.0] * 16
    coherent[0], coherent[15] = 1 / math.sqrt(2), sign / math.sqrt(2)
    return {'coherent': [(1.0, coherent)], 'mixture': [(0.5, zero), (0.5, one)]}


def main():
    rng = random.Random(7)
    shots = 128
    for setting in ('Z', 'X'):
        for name, components in preparations().items():
            p = probabilities(components, setting)
            odd = sum(value for i, value in enumerate(p) if bin(i).count('1') % 2)
            draws = rng.choices(range(16), weights=p, k=shots)
            observed = sum(bin(i).count('1') % 2 for i in draws)
            print(f'{setting} {name:8s}: odd probability={odd:.3f}; odd trials={observed}/{shots}')


if __name__ == '__main__':
    main()

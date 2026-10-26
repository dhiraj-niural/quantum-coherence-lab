# What can a quantum measurement hide?

I was fascinated by quantum mechanics as a kid. At Brown, I explored it through quantum mechanics and computational physics coursework. I’m returning to a four-qubit circuit from that work with a question you can investigate yourself: if two experiments give the same results, does that mean they started in the same state?

This article assumes basic algebra and a little Python. You don’t need to know quantum mechanics. By the end, you should be able to predict what the game does and run a simulation yourself.

## Start with four ordinary bits

A bit is a 0 or a 1. Four bits can make 16 strings, from 0000 to 1111. Imagine a machine that flips one fair coin. Heads means it prepares 0000; tails means it prepares 1111. Run it many times and each string appears about half the time.

Call this preparation the mixture. On each run there is one definite choice, even if we haven’t looked at it. A histogram counts the results: the bar above 0000 grows whenever 0000 appears. A taller bar means a more frequent result.

Now imagine another machine. It prepares four qubits—quantum systems whose measurement outcomes can also be recorded as 0 or 1. This preparation is a coherent superposition of 0000 and 1111. We’ll explain what that adds shortly.

For the first measurement, both machines give 0000 with probability one-half and 1111 with probability one-half. Neither gives any other string.

## Make a prediction before touching the controls

Suppose I hide the labels and let you collect a million results from each machine. Could you identify which machine prepares the superposition?

With only this measurement, you cannot. The two probability distributions are identical. More data makes your estimate more precise, but cannot reveal information this particular measurement does not expose. Small differences between the two sampled charts are just random variation.

This is the problem the game asks you to solve. A and B stand for the two preparations. Each trial prepares a fresh system, measures it once, and records four bits. We are not repeatedly looking at one surviving quantum object.

## What the first chart leaves out

To calculate quantum predictions, we keep amplitudes. For this example they can be positive or negative numbers. Squaring their magnitudes gives measurement probabilities. Amplitudes can be negative; probabilities cannot.

Our coherent preparation assigns amplitude +1/√2 to 0000 and −1/√2 to 1111, with zero for all other strings. Squaring either nonzero amplitude gives one-half. That explains the first histogram, but it also shows what gets lost: the relative minus sign.

That sign is a simple example of relative phase. A coherent state keeps this relationship between its amplitudes. The mixture instead prepares 0000 or 1111 on separate trials. We average the probabilities of those alternatives; we do not combine their amplitudes into one state.

The analogy to an ordinary coin ends here. Quantum measurement offers another setting that can make amplitudes combine before probabilities are calculated.

## Change the measurement, not the amount of data

The game calls the first setting Z and the second setting X. These are names for two different quantum measurements, not directions you turn a camera. We simulate X by applying an operation called a Hadamard to each qubit, then performing the original measurement.

For one qubit, the Hadamard takes a pair of amplitudes a and b and replaces them with (a+b)/√2 and (a−b)/√2. Notice that one output adds and the other subtracts. Equal contributions can reinforce; opposite contributions can cancel. This is interference.

We apply that same rule four times, once per qubit. Under this operation, an initial 0000 contributes amplitude +1/4 to every possible output string. An initial 1111 contributes +1/4 when the output has an even number of ones and −1/4 when it has an odd number. Each measured 1 introduces one minus sign.

Our coherent preparation already has a minus sign on its 1111 component. For an output with an even number of ones, the total amplitude is (1/4 − 1/4)/√2 = 0. For an odd output it is (1/4 + 1/4)/√2 = 1/(2√2). Squaring gives probability 1/8 for each of the eight odd outputs.

For the mixture we calculate the two alternatives separately. Either initial string gives probability (1/4)² = 1/16 for every X output; its signs disappear when squared. Averaging those probabilities still gives 1/16. Half the strings have an odd number of ones and half have an even number.

That is the distinguishing prediction: in X, the coherent preparation gives only odd numbers of ones. The mixture gives odd and even equally often in the long run. For example, 0001 and 1110 are odd; 0011 and 1111 are even. The term for this odd/even property is parity.

## Now try the game

Start in Z and compare the charts. Switch to X. Count the ones in a few labels, then look at the odd/even totals beneath each chart. Which preparation fits the coherent prediction?

Choose A or B to reveal the hidden label. Use “Show exact probabilities” to compare the mathematical prediction with the fluctuating sample. “Measure again” makes a new batch; “New round” reshuffles the hidden labels.

The X labels still use 0 and 1, but they record a different measurement: 0 means the +1 outcome and 1 means the −1 outcome. An X result is not a peek at the earlier Z bits.

## Run it yourself in Python

Save the code below as learn_measurement.py and run python3 learn_measurement.py. It uses only Python’s standard library. It starts from the amplitudes and applies the Hadamard rule, rather than hard-coding “odd results only.”

The list has 16 positions, one for each four-bit string. Position 0 means 0000; position 15 means 1111. The bit operations in change_measurement find pairs of positions that differ in just one bit. In each pair the same sum-and-difference rule applies.

```python
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
```

The exact odd probabilities should be 0 and 0 in Z, then 1 and 0.5 in X. On our Python run, the sampled X counts were 128/128 for the coherent preparation and 71/128 for the mixture. Your random counts may differ across Python versions. The exact probabilities are the important check.

Change shots from 128 to 8 and run it again. Then change the seed. Does the mixture always look close to one-half with so few trials?

For a more interesting change, replace sign=-1 with sign=1 in preparations. Before running it, work through the addition above: which outputs should cancel now? The coherent preparation should switch to even-only X outcomes, while its Z probabilities stay unchanged.

## What we have learned—and what we haven’t

The experiment shows why a matching histogram from one measurement does not establish a matching quantum state. The choice of measurement matters. This is established quantum mechanics, simulated on an ordinary computer; no quantum hardware or new research result is claimed.

The game promises exactly two ideal candidate preparations. It is not a test that identifies every possible unknown state. A mixture can also give only odd results by chance: with N independent X trials, that probability is (1/2)ⁿ. Eight such trials occur with probability 1/256 under the mixture model. That is not the probability that your conclusion is wrong; it is the probability of this observation if the mixture model is true.

Real devices add preparation and measurement errors. Those are further questions. Here the goal is smaller and reproducible: understand what the two measurements reveal, explain the cancellation, and make the same prediction with code.

"""Independent analytic and circuit checks for the animation's phase sweep."""
import math
import unittest

from quantum_coherence.animation import phase_probabilities
from quantum_coherence.challenge import measurement_probabilities
from quantum_coherence.circuit import Gate
from quantum_coherence.simulator import apply, probabilities


class PhaseAnimationTests(unittest.TestCase):
    def test_phase_pi_matches_existing_game(self):
        for actual, expected in zip(phase_probabilities(math.pi), measurement_probabilities('coherent', 'X')):
            self.assertAlmostEqual(actual, expected)

    def test_full_sweep_matches_gate_simulation(self):
        for phi in (0, .13, .7, math.pi / 2, math.pi, 4.9, 2 * math.pi):
            state = [0j] * 16
            state[0] = 1 / math.sqrt(2)
            state[15] = complex(math.cos(phi), math.sin(phi)) / math.sqrt(2)
            for qubit in range(1, 5):
                state = apply(state, Gate('H', qubit))
            actual = phase_probabilities(phi)
            self.assertAlmostEqual(sum(actual), 1)
            self.assertTrue(all(-1e-12 <= value <= 1 for value in actual))
            for a, b in zip(actual, probabilities(state)):
                self.assertAlmostEqual(a, b)

    def test_phase_zero_is_even(self):
        p = phase_probabilities(0)
        self.assertAlmostEqual(sum(v for i, v in enumerate(p) if bin(i).count('1') % 2), 0)

    def test_quarter_turn_x_histogram_matches_mixture(self):
        # This coherent state is not a mixture despite equal X probabilities.
        for value in phase_probabilities(math.pi / 2):
            self.assertAlmostEqual(value, 1 / 16)

import json
import unittest

from quantum_coherence import challenge, simulator
from quantum_coherence.circuit import GATES


class ChallengeTests(unittest.TestCase):
    def test_coherent_preparation_matches_existing_circuit(self):
        actual = simulator.trajectory(4, GATES)[-1]
        target = challenge.ensemble('coherent')[0][1]
        for a, b in zip(actual, target):
            self.assertAlmostEqual(abs(a - b), 0)

    def test_z_cannot_distinguish_preparations(self):
        for state in ('coherent', 'mixed'):
            for i, p in enumerate(challenge.measurement_probabilities(state, 'Z')):
                self.assertAlmostEqual(p, 0.5 if i in (0, 15) else 0)

    def test_x_matches_analytic_distributions(self):
        # <x|GHZ-> = (1 - (-1)^parity(x))/sqrt(32).
        coherent = challenge.measurement_probabilities('coherent', 'X')
        mixed = challenge.measurement_probabilities('mixed', 'X')
        for i in range(16):
            self.assertAlmostEqual(coherent[i], 1 / 8 if bin(i).count('1') % 2 else 0)
            self.assertAlmostEqual(mixed[i], 1 / 16)

    def test_mixture_has_no_off_diagonal_coherence(self):
        for i in range(16):
            for j in range(16):
                rho_ij = sum(w * s[i] * complex(s[j]).conjugate()
                             for w, s in challenge.ensemble('mixed'))
                self.assertEqual(rho_ij, 0.5 if i == j and i in (0, 15) else 0)

    def test_parity_and_normalization(self):
        expected = {('coherent', 'Z'): [1, 0], ('mixed', 'Z'): [1, 0],
                    ('coherent', 'X'): [0, 1], ('mixed', 'X'): [0.5, 0.5]}
        for (state, basis), target in expected.items():
            probs = challenge.measurement_probabilities(state, basis)
            self.assertTrue(all(0 <= p <= 1 for p in probs))
            self.assertAlmostEqual(sum(probs), 1)
            for actual, value in zip(challenge.parity_probabilities(state, basis), target):
                self.assertAlmostEqual(actual, value)

    def test_sampling_reproducible_and_supported(self):
        counts = challenge.sample_counts('coherent', 'X', 2048, 42)
        self.assertEqual(counts, challenge.sample_counts('coherent', 'X', 2048, 42))
        self.assertEqual(sum(counts), 2048)
        self.assertEqual(sum(c for i, c in enumerate(counts) if bin(i).count('1') % 2 == 0), 0)
        self.assertNotEqual(counts, challenge.sample_counts('coherent', 'X', 2048, 43))

    def test_sampling_converges_to_mixture_prediction(self):
        counts = challenge.sample_counts('mixed', 'X', 100000, 17)
        self.assertLess(max(abs(c / 100000 - 1 / 16) for c in counts), 0.004)
        even = sum(c for i, c in enumerate(counts) if bin(i).count('1') % 2 == 0)
        self.assertLess(abs(even / 100000 - 0.5), 0.01)

    def test_invalid_inputs(self):
        for shots in (0, -1, 1.2, True):
            with self.assertRaises(ValueError):
                challenge.sample_counts('mixed', 'Z', shots)
        with self.assertRaises(ValueError):
            challenge.measurement_probabilities('unknown', 'Z')
        with self.assertRaises(ValueError):
            challenge.measurement_probabilities('mixed', 'Y')

    def test_export_json(self):
        exported = json.loads(json.dumps(challenge.distributions(), allow_nan=False))
        self.assertEqual(exported['labels'], [format(i, '04b') for i in range(16)])
        for state in ('mixed', 'coherent'):
            for basis in ('X', 'Z'):
                self.assertEqual(len(exported['states'][state][basis]), 16)


if __name__ == '__main__':
    unittest.main()

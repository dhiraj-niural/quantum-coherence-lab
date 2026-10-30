"""Keep the shipped browser model tied to the independent Python simulation."""
import json
from pathlib import Path
import unittest

from quantum_coherence.challenge import distributions


class SiteReferenceTests(unittest.TestCase):
    def test_shipped_probabilities_match_python(self):
        path = Path(__file__).resolve().parents[1] / 'site/dist/distributions.json'
        shipped = json.loads(path.read_text())
        expected = distributions()
        self.assertEqual(shipped['labels'], expected['labels'])
        self.assertEqual(shipped['n_qubits'], expected['n_qubits'])
        for name in ('coherent', 'mixed'):
            for basis in ('Z', 'X'):
                self.assertEqual(len(shipped['states'][name][basis]), 16)
                for actual, reference in zip(shipped['states'][name][basis],
                                             expected['states'][name][basis]):
                    self.assertAlmostEqual(actual, reference, places=12)

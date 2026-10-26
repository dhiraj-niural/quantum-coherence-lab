import math
import unittest
from quantum_homework.circuit import Gate, GATES
from quantum_homework import simulator as sim, reference


class SimulationTests(unittest.TestCase):
    def assertState(self, a, b):
        self.assertLess(max(abs(x-y) for x,y in zip(a,b)), 1e-12)

    def test_hadamard_twice(self):
        state = [0.6+0j, 0.8j]
        self.assertState(sim.apply(sim.apply(state, Gate('H',1)), Gate('H',1)), state)

    def test_bit_order(self):
        self.assertEqual(sim.apply(sim.initial(4), Gate('X',1)).index(1), 1)
        self.assertEqual(sim.apply(sim.initial(4), Gate('X',4)).index(1), 8)

    def test_controlled_x_truth_table(self):
        for i in range(4):
            state = [0j]*4
            state[i] = 1
            out = sim.apply(state, Gate('CX',1,2))
            self.assertEqual(out.index(1), i ^ 1 if i & 2 else i)

    def test_bell_state(self):
        state = sim.trajectory(2,[Gate('H',1),Gate('CX',2,1)])[-1]
        self.assertState(state, [1/math.sqrt(2),0,0,1/math.sqrt(2)])

    def test_independent_reference_every_prefix(self):
        states = sim.trajectory(4,GATES)
        for i,state in enumerate(states):
            self.assertState(state, reference.run(4,GATES[:i]))
            self.assertAlmostEqual(sum(sim.probabilities(state)),1)

    def test_primitive_reference_all_basis_states(self):
        for g in [Gate('X',1),Gate('H',3),Gate('CX',1,4),Gate('CX',4,1)]:
            m = reference.matrix(4,g)
            for i in range(16):
                state = [0j]*16
                state[i] = 1
                self.assertState(sim.apply(state,g), [row[i] for row in m])

    def test_final_analytic_state(self):
        expected = [0j]*16
        expected[0], expected[15] = 1/math.sqrt(2), -1/math.sqrt(2)
        self.assertState(sim.trajectory(4,GATES)[-1], expected)

    def test_relative_phase_is_observable(self):
        final = sim.trajectory(4,GATES)[-1]
        for q in range(1,5):
            final = sim.apply(final,Gate('H',q))
        p = sim.probabilities(final)
        self.assertAlmostEqual(sum(v for i,v in enumerate(p) if bin(i).count('1') % 2),1)
        self.assertAlmostEqual(sum(v for i,v in enumerate(p) if bin(i).count('1') % 2 == 0),0)

    def test_sampling_repeatability_and_support(self):
        state = sim.trajectory(4,GATES)[-1]
        counts = sim.sample(state,1024,42)
        self.assertEqual(counts,sim.sample(state,1024,42))
        self.assertEqual(sum(counts),1024)
        self.assertEqual(sum(counts[1:15]),0)

    def test_invalid_gate(self):
        with self.assertRaises(ValueError):
            sim.apply(sim.initial(2),Gate('CX',1,1))

if __name__ == '__main__':
    unittest.main()

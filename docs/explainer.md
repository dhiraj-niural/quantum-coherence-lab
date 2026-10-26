# When the same counts hide different states

Two quantum states can produce exactly the same counts when measured one way, yet behave differently when measured another way. The missing information is relative phase.

This simulation produces equal chances of0000 and1111. Its two amplitudes have opposite signs. Squaring those amplitudes hides the sign, so a simple histogram cannot reveal it. Changing the measurement basis makes that difference observable: applying a Hadamard gate to every qubit before measuring produces only odd-parity outcomes for this state.

Move through the gates in the viewer to inspect how amplitudes evolve. Exact probabilities come from the numerical state; finite-shot counts fluctuate around those probabilities. A second implementation checks the calculation independently.

The broader question is how to choose measurements that support a reliable conclusion about a quantum state using limited data. Recent research studies this under different assumptions about trusted devices, available measurements and noise. Our current baseline illustrates the issue; it does not implement those research protocols yet.

# Quantum Coherence Lab

**What evidence distinguishes quantum coherence from a matching measurement histogram?**

A Python environment for inspecting quantum state evolution and checking measurement claims. The current baseline tracks a four-qubit GHZ-minus state, verifies every gate against an independent dense-matrix implementation, and separates exact probabilities from sampled counts.

## Run
```sh
python3 -m unittest discover -s tests -v
python3 -m quantum_coherence
```
Open `results/index.html` for the interactive viewer. Python standard library only.

## Read
- [Plain-language explanation](docs/explainer.md)
- [Dated research context and proposed direction](docs/research.md)
- [Executed results and limits](results/report.md)
- [Numerical data](results/simulation.json)

## Code map
`quantum_coherence/circuit.py` defines the gate sequence; `simulator.py` applies pairwise state-vector operations; `reference.py` independently constructs dense operators; `__main__.py` regenerates results and the viewer. Tests check primitive gates, bit order, every circuit prefix and relative phase.

Qubit1 is the least-significant bit. Display order is q4 q3 q2 q1. Current implementation is an ideal four-qubit baseline, not a hardware experiment or a reproduction of the papers below. Research extensions remain explicitly proposed until implemented and evaluated.

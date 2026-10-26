# Four-qubit homework reconstruction

A local, standard-library-only reconstruction of Dhiraj's four-qubit homework circuit. The original exported source was inspected and the transcribed gate sequence matches it. This is **not a successful execution of the original Julia/Yao environment**: Julia is unavailable here. No paid APIs, network requests or external dependencies.

```sh
python3 -m unittest discover -s tests -v
python3 -m quantum_homework
```

- `quantum_homework/circuit.py`: ordered source gates and labels.
- `simulator.py`: pairwise state-vector operations and seeded sampling.
- `reference.py`: independent dense matrices from tensor products/projectors.
- `__main__.py`: deterministic report and standalone viewer generation.
- `tests/`: primitive truth tables, conventions, independent cross-checks and phase-sensitive checks.
- `results/report.md`: measured reconstruction findings and limitations.
- `results/index.html`: standalone gate-by-gate viewer, generated from checked numerical data.
- `preference.md`: local maintenance and evidence conventions.

Qubit1 is the least-significant bit; displayed strings read q4 q3 q2 q1. Gates apply in the listed order to initial0000. Measurement is computational/Z-basis. Tests compare every gate prefix between implementations with tolerance1e-12.

The original has `circuit = ...` but uses undefined `circuit1` for execution. A one-name edit addresses that particular error; no claim that it resolves all Julia/version/runtime issues. Source dates remain unverified. This is a reproduction/demo, not an original quantum algorithm or evidence of AI superiority. The original archive remains outside Git; release/attribution must be reviewed before publication.

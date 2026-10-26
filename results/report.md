# Four-qubit verification results

Executed locally with Python3.9.6, standard library only. No model/API calls. Source export inspected26October2026; hash recorded in simulation.json. Original dates remain unverified.

## Finding
The listed circuit produces **(|0000⟩ − |1111⟩)/√2**, with computational-basis probabilities: each outcome has probability0.5, all others zero (within floating-point tolerance). The relative minus phase is real information that a Z-basis histogram does not reveal. Applying H to all four output qubits produces only odd-parity computational-basis outcomes; a regression test checks this phase-sensitive prediction.

Pairwise simulation and independent dense tensor/projector matrices agree at every prefix. Maximum amplitude discrepancy: 5.55e-17; final normalization error: 1.11e-15. Assertions use tolerance1e-12. Both share the circuit description, so this does not rule out a transcription error; the source sequence was separately checked against the exported main.tex.

|Basis q4q3q2q1|Real amplitude|Exact-state probability (float)|1024 shots, seed42|100×1024 shots, seeds1000–1099|
|---|---:|---:|---:|---:|
|0000|0.7071067812|0.5000000000|493|51129|
|0001|0.0000000000|0.0000000000|0|0|
|0010|0.0000000000|0.0000000000|0|0|
|0011|0.0000000000|0.0000000000|0|0|
|0100|0.0000000000|0.0000000000|0|0|
|0101|0.0000000000|0.0000000000|0|0|
|0110|0.0000000000|0.0000000000|0|0|
|0111|0.0000000000|0.0000000000|0|0|
|1000|0.0000000000|0.0000000000|0|0|
|1001|0.0000000000|0.0000000000|0|0|
|1010|0.0000000000|0.0000000000|0|0|
|1011|0.0000000000|0.0000000000|0|0|
|1100|0.0000000000|0.0000000000|0|0|
|1101|0.0000000000|0.0000000000|0|0|
|1110|0.0000000000|0.0000000000|0|0|
|1111|-0.7071067812|0.5000000000|531|51271|

## Method and limitations
Exact-state calculations establish the ideal distribution; seeded sampling illustrates finite-shot variation. Sampling is pseudorandom and version-dependent. Historical source records are preserved separately; this implementation is independently checked in Python.

The two implementations and10tests validate this small circuit, not a general-purpose quantum framework, research novelty, hardware execution or an AI advantage. No performance claims. No source archive or figure is included in Git. The original baseline had 10 tests; the playable challenge adds nine. This public demo does not claim a research-paper result.

## Reproduction
Run `python3 -m unittest discover -s tests -v`, then `python3 -m quantum_coherence` from the project root. Open index.html for an offline gate-by-gate view. The viewer reads embedded numerical output; it does not replace numerical tests.

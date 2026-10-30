# Quantum Coherence Lab

**What evidence distinguishes quantum coherence from a matching measurement histogram?**

A Python environment for inspecting quantum state evolution and checking measurement claims. The current baseline tracks a four-qubit GHZ-minus state, verifies every gate against an independent dense-matrix implementation, and separates exact probabilities from sampled counts.

## Play
[Play the game](https://quantum-coherence-game.hanczvs.chatgpt.site).

The browser game lives in `site/dist/`. Run `python3 -m http.server 8767 --directory site/dist` and open localhost:8767. Change Z to X, identify the coherent box, and compare finite samples with exact probabilities. No account, external model or paid API is needed.

## Play the lab

The click-to-explore investigation is at `site/dist/lab/`: a small 3D room, optional procedural sound, measurement choices and a field notebook. See [run instructions and scientific limits](docs/playable-lab.md). The existing article and chart view remain available.

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

Qubit1 is the least-significant bit. Display order is q4 q3 q2 q1. Current implementation is an ideal four-qubit baseline, not a hardware experiment or a reproduction of the papers below. The coherent-versus-mixture challenge is implemented and tested; broader certification protocols remain research directions.

`challenge.py` evolves weighted pure-state ensembles and exports the game reference. Nineteen tests cover the original circuit and challenge. The browser samples the analytic distributions; `site/dist/distributions.json` is the Python reference.

## Release media
`media/quantum-teaser.mp4` is a24-second animated explanation using exact model probabilities, not hardware footage. Optional media scripts require Pillow, ffmpeg and the macOS Helvetica font; core simulation remains standard-library-only.

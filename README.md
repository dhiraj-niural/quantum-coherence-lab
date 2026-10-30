# The Last Light · Quantum Coherence Lab

**What evidence distinguishes quantum coherence from a matching measurement histogram?**

A Python environment for inspecting quantum state evolution and checking measurement claims. The current baseline tracks a four-qubit GHZ-minus state, verifies every gate against an independent dense-matrix implementation, and separates exact probabilities from sampled counts.

## Play
[Play the game](https://quantum-coherence-game.hanczvs.chatgpt.site).

A short Halloween discovery game: explore a candlelit room, find a second lens,
test two lanterns and use the evidence to open the courtyard door. No prior
quantum mechanics is needed. Sound is optional, with no jump scares or gore.

Run `python3 -m http.server 8770 --bind 127.0.0.1 --directory site/dist` and open
`http://127.0.0.1:8770/`. Use mouse/touch station controls or WASD/arrow keys.
The [science page](site/dist/lab/science.html) explains the trick and links a
standalone Python exercise. The [longer article](site/dist/article.html) and
[chart explorer](site/dist/chart.html) remain available.

See [controls, architecture and scientific limits](docs/playable-lab.md).
No account, external model or paid API is needed during play.

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

`challenge.py` evolves weighted pure-state ensembles and exports the game reference. Twenty-four Python tests cover the circuit, challenge and teaching exercise. Sixteen JavaScript tests cover sampling, audio and the evidence-gated game. The browser samples the analytic distributions; `site/dist/distributions.json` is the Python reference.

## Release media
`media/quantum-teaser.mp4` is a24-second animated explanation using exact model probabilities, not hardware footage. Optional media scripts require Pillow, ffmpeg and the macOS Helvetica font; core simulation remains standard-library-only.

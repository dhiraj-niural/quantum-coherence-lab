# Visualizing amplitude interference

The animation follows one question: how can preparations with the same Z histogram produce different X results?

The model is the ideal four-qubit state (|0000⟩ + exp(iφ)|1111⟩)/√2. In Z, both outcomes have probability one-half for every φ. After a Hadamard on each qubit, the probability of outcome x is:

    P(x) = [1 + (−1)^number_of_ones(x) cos(φ)] / 16

The two amplitude contributions add before their squared magnitude becomes a probability. Arrows represent those complex amplitudes, not particles moving through space. The phase sweep changes the prepared state; it is not a claim about time evolution under a physical Hamiltonian.

At φ=π the odd outcomes remain. At φ=0 the even outcomes remain. At φ=π/2 the X histogram is uniform, matching the mixture for this measurement even though the state remains coherent. This last case is why the animation must not imply that a single histogram universally detects coherence.

## Local render pipeline

Use a Python environment with Pillow, plus ffmpeg and ffprobe on PATH:

```sh
python3 scripts/produce_animation.py --check-only
python3 scripts/produce_animation.py --output media/interference.mp4 --duration 36 --fps 24
```

The console pipeline first runs the tests, then renders, then checks the video stream and duration and writes a small JSON result beside it. It makes no model or network calls. Code and visuals were developed with AI assistance; this is not generative footage, a hardware experiment or a novel physics claim.

The numerical tests compare the phase sweep with explicit gate evolution and check the limiting phases. Visual readability and whether the explanation teaches something still require viewer judgment.

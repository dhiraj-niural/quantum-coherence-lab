# Same histogram. Different physics.

Imagine two boxes that each produce four bits. Open either box in the usual way and you see only 0000 or 1111, equally often. One box prepares a coherent quantum state; the other randomly prepares one of those two strings. Those counts alone cannot tell you which is which.

The game gives you another measurement setting. In X, count the number of ones in each four-bit result. The coherent box always gives an odd number. The mixture gives odd and even results equally often in the long run. Changing what you measure exposes a distinction that the first histogram hides.

## What you are actually doing
Every shot starts with a fresh preparation. You are not measuring the same object twice, and X is not a camera angle. It is a different quantum measurement, implemented mathematically by a Hadamard gate on each qubit before a Z measurement. X labels 0 and 1 represent outcomes +1 and −1.

The coherent state is (|0000⟩ − |1111⟩)/√2. The mixture is an equal probabilistic choice of |0000⟩ and |1111⟩. Relative phase permits interference in the first case; averaging the two separate preparations does not.

## What the game can establish
This is an ideal simulation comparing two promised preparations. It is not a hardware experiment, universal coherence certification or a new research result. A finite mixture sample can happen to contain only odd results: for N independent X shots its probability is 2⁻ᴺ. Exact mode displays theoretical probabilities; sampled mode displays random experimental-style counts.

## Where it came from
I was fascinated by quantum mechanics as a kid. At Brown I explored quantum mechanics and computational physics through coursework. This project turns that interest into something you can play: make a prediction, change the measurement, and see what the first chart was hiding.

The implementation is Python, with independent numerical checks and a browser interface. See [research context](research.md) for a dated account of related work and its different assumptions.

# The Last Light

*Physics & maths*

A short Halloween puzzle about quantum measurement. Explore a candlelit room,
test two lanterns and find the difference hidden by the first measurement.

**[Play](https://quantum-coherence-game.hanczvs.chatgpt.site)** ·
[How it works](https://quantum-coherence-game.hanczvs.chatgpt.site/lab/science.html)

## Run locally

```sh
python3 -m http.server 8770 --bind 127.0.0.1 --directory site/dist
```

Open `http://127.0.0.1:8770`. Mouse, touch or WASD/arrow keys. Sound is optional.

## Explore the code

- [Game and controls](docs/playable-lab.md)
- [Python simulation](docs/simulation.md)
- [Plain-language explanation](docs/explainer.md)

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.test.mjs
```

An ideal four-qubit teaching simulation, not a hardware experiment or a new
physics result. The room, story and procedural sound are original.
[References and dependencies](docs/playable-lab.md#references-and-dependencies).

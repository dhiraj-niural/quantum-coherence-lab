# The Last Light

A short, click-to-explore investigation built around the existing four-qubit
coherent-state versus mixture simulation. It is an ideal teaching model, not a
hardware experiment or a new physics result.

```sh
python3 -m http.server 8770 --bind 127.0.0.1 --directory site/dist
```

Open `http://127.0.0.1:8770/lab/`. Enter the room, inspect the journal, collect the turned lens and compare measurement settings.
Use the evidence at the door. WASD/arrow keys move between viewpoints; Escape
or Step back returns to the room. Objects and station buttons take
you to the same interaction. Sound is off initially and can be enabled at the
top right. Enabling it plays a short confirmation tone. “Test sound” repeats the
tone and checks for a signal before the device mixer; it cannot detect a muted
tab, system volume or disconnected speakers. “Resume sound” appears if the
browser pauses audio. A muted playthrough retains all evidence and explanation.

## Structure

- `lab/model.mjs` validates and samples the Python-generated `distributions.json`.
  Machine identities are shuffled once per case. Each measurement is a new batch.
- `lab/game.mjs` gates the escape on positive evidence under the two-candidate promise.
- `lab/app.mjs` coordinates discovery, measurement, identification, reveal
  and session-only notebook.
- `lab/scene.mjs` draws an original Three.js room with click-to-approach views.
  Its props and dust are scenery, not a representation of quantum trajectories.
- `lab/sound.mjs` supplies original procedural ambience and short interaction
  sounds. Outcome tones map the last displayed outcomes from A to even/odd.
  There is no runtime inference, recorded voice, provider call or external asset
  request. Three.js is vendored locally with its license.

The numeric model loads before entry. If WebGL is unavailable, station controls
still provide the investigation. The room respects reduced-motion preferences;
the interface supports keyboard controls and narrow layouts. Neither a full
accessibility audit nor a learner study has been completed.

## Scientific limits

Z produces identical predicted distributions for both candidates. More Z shots
cannot identify the preparation. X produces only odd-parity outputs for the
specified GHZ-minus state, while the mixture permits both parities. An even X
output excludes the specified coherent candidate under this ideal promise.
All-odd finite samples alone do not certify general coherence or entanglement.
The game rejects an inconclusive all-odd pair rather than rewarding a guess.

Each shot measures a fresh preparation. The notebook stores batch summaries,
not a cumulative experiment. The linked Python exercise lets readers change the relative sign and compare predictions. Sound is
a designed representation of observations, not the physical sound of a state.

## Checks

```sh
python3 -m unittest discover -s tests -v
node --test tests/*.test.mjs
```

Python checks the shipped reference against the simulator. JavaScript checks
normalization, state-label isolation, fresh batches, deterministic sampling with
an injected RNG, and invalid inputs. Browser review should additionally cover a
wrong Z-only conclusion, X identification, notebook, explanation, reset, sound
toggle, keyboard focus and short-screen layout.

## References and dependencies

The discovery, sound and revisitable-record design was informed by Ethan
Mollick's [WONTFIX](https://github.com/emollick/audiologs), inspected on
30 October 2026 at revision `01f2b389042f949e0d81ecc6f2838c8deb5160a2`.
This lab does not copy its game code, story, voices, sound effects or artwork.

Three.js 0.186.1 is distributed under MIT; its notice is retained in
`site/dist/lab/vendor/LICENSE-three.txt`. The two vendored runtime files were
obtained from the referenced WONTFIX checkout. The scene, interaction and
procedural audio in this lab are separate implementations.

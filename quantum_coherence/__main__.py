"""Regenerate measured results and an offline visualization."""
import json
import platform
from pathlib import Path
from .circuit import GATES, N_QUBITS
from .simulator import trajectory, probabilities, sample
from .reference import run

ROOT = Path(__file__).resolve().parents[1]

def main():
    states = trajectory(N_QUBITS, GATES)
    errors = [max(abs(a-b) for a,b in zip(s,run(N_QUBITS,GATES[:i]))) for i,s in enumerate(states)]
    if max(errors) > 1e-12:
        raise RuntimeError('Independent reference disagreement; refusing to produce report')
    counts = sample(states[-1], 1024, 42)
    repeated = [sample(states[-1],1024,1000+i) for i in range(100)]
    totals = [sum(c[i] for c in repeated) for i in range(16)]
    rows = [{'state':format(i,'04b'),'amplitude_real':v.real,'amplitude_imag':v.imag,
             'probability':abs(v)**2,'shots_1024_seed42':counts[i],
             'shots_102400_seeds1000_1099':totals[i]} for i,v in enumerate(states[-1])]
    result = {'schema':1,'implementation':'Python state-vector simulation with independent dense-matrix verification',
              'python_version':platform.python_version(),'basis_order':'q4 q3 q2 q1; q1 least significant',
              'source_main_tex_sha256':'ae0e0269eb82feeb7b0e4d889e00d4e466c4adccad4bec6c6751b404e22deab3',
              'source_inspected_on':'2026-10-26','gates':[g.label for g in GATES],
              'max_reference_error':max(errors),'normalization_error':abs(sum(probabilities(states[-1]))-1),
              'outcomes':rows,'trajectory':[{'step':i,'gate':'Initial' if not i else GATES[i-1].label,
                  'probabilities':probabilities(s),'real':[x.real for x in s],'imag':[x.imag for x in s]} for i,s in enumerate(states)]}
    output = ROOT/'results'
    output.mkdir(exist_ok=True)
    (output/'simulation.json').write_text(json.dumps(result,indent=2)+'\n')
    table='\n'.join(f"|{r['state']}|{r['amplitude_real']:.10f}|{r['probability']:.10f}|{r['shots_1024_seed42']}|{r['shots_102400_seeds1000_1099']}|" for r in rows)
    (output/'report.md').write_text(f'''# Four-qubit verification results

Executed locally with Python{platform.python_version()}, standard library only. No model/API calls. Source export inspected26October2026; hash recorded in simulation.json. Original dates remain unverified.

## Finding
The listed circuit produces **(|0000⟩ − |1111⟩)/√2**, with computational-basis probabilities: each outcome has probability0.5, all others zero (within floating-point tolerance). The relative minus phase is real information that a Z-basis histogram does not reveal. Applying H to all four output qubits produces only odd-parity computational-basis outcomes; a regression test checks this phase-sensitive prediction.

Pairwise simulation and independent dense tensor/projector matrices agree at every prefix. Maximum amplitude discrepancy: {max(errors):.3g}; final normalization error: {result['normalization_error']:.3g}. Assertions use tolerance1e-12. Both share the circuit description, so this does not rule out a transcription error; the source sequence was separately checked against the exported main.tex.

|Basis q4q3q2q1|Real amplitude|Exact-state probability (float)|1024 shots, seed42|100×1024 shots, seeds1000–1099|
|---|---:|---:|---:|---:|
{table}

## Method and limitations
Exact-state calculations establish the ideal distribution; seeded sampling illustrates finite-shot variation. Sampling is pseudorandom and version-dependent. Historical source records are preserved separately; this implementation is independently checked in Python.

The two implementations and10tests validate this small circuit, not a general-purpose quantum framework, research novelty, hardware execution or an AI advantage. No performance claims. No source archive or figure is included in Git. The original baseline had 10 tests; the playable challenge adds nine. This public demo does not claim a research-paper result.

## Reproduction
Run `python3 -m unittest discover -s tests -v`, then `python3 -m quantum_coherence` from the project root. Open index.html for an offline gate-by-gate view. The viewer reads embedded numerical output; it does not replace numerical tests.
''')
    template=(ROOT/'quantum_coherence/viewer.html').read_text()
    (output/'index.html').write_text(template.replace('__RESULT_DATA__',json.dumps(result)))
    print(json.dumps({'max_reference_error':max(errors),'shots_seed42':{'0000':counts[0],'1111':counts[15]},'results':str(output)},indent=2))

if __name__ == '__main__':
    main()

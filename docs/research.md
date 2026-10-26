# Research context

Reviewed26October2026. Targeted recent-literature scan, not an exhaustive claim to the latest paper. Initial coverage: primary arXiv abstracts and version/publication metadata. A subsequent targeted methods review of Cha and Lee v3 is recorded below; author code and full proofs remain unaudited.

| Work | Date/version | Relevance |
|---|---|---|
| [Disjoint Bell measurements enable near-projective GHZ certification](https://arxiv.org/abs/2606.09947v3), Cha and Lee | Submitted8June2026;v3 revised27August2026; preprint | Studies how allowing disjoint two-qubit Bell measurements changes GHZ verification efficiency compared with local measurements. |
| [Neural quantum states for entanglement depth certification from randomized Pauli measurements](https://arxiv.org/abs/2512.13121v2), Płodzień | Submitted15December2025;v2 June2026; Phys. Rev. Research8,023255(2026) | Uses constrained neural-state models and likelihood comparisons on finite-shot observations; a possible ML connection requiring careful statistical validation. |
| [Size-Independent Robustness in Multipartite Bell Self-Testing](https://arxiv.org/abs/2608.30851v1), Cao et al. |31August2026; preprint | Addresses robust GHZ self-testing as network size grows, under a different device-independent measurement model. |

## Proposed question
Under a stated measurement budget, how do verification protocols behave when states leave the assumed GHZ subspace? Include phase noise and population leakage; phase noise alone is insufficient for a meaningful protocol comparison.

First audit full methods and assumptions. Establish analytical/density-matrix ground truth, compare Z-only, phase-sensitive local measurements and one justified literature protocol, then measure false certification, power and calibration across seeds/noise levels. Separate trusted-device simulation from device-independent guarantees. Only add a learned estimator if it addresses a demonstrated gap and beats appropriate nonlearned baselines.

This is a proposed comparative study, not an originality claim. The existing four-qubit engine is a validation baseline. No listed protocol has been reproduced and no comparative results exist yet.

## Methods review: constraints on a useful comparison
26 October 2026: inspected Cha and Lee v3 Sections II–VI, VIII, IX.1 and X, with partial VII/IX.2 coverage. This is a protocol audit, not a proof audit or reproduction.

- Theorems 1–2 give BM-Cert gap 1−1/(n−1) for even n. At four qubits this is 2/3, equal to the optimal local-Pauli benchmark in Table 1. Our present size cannot establish the asymptotic advantage.
- For a mixture supported only on GHZ+ and GHZ−, all pair ZZ checks pass. X parity alone gives the same acceptance statistic as BM-Cert. A comparison restricted to phase noise would hide the central measurement tradeoff.
- Our circuit prepares GHZ−; the paper uses GHZ+. Adapt the global X sign (or conjugate by a single-qubit Z) before evaluating the protocol.
- BM-Cert uses an all-rounds-pass decision and trusted measurements. It is not interchangeable with BM-Fid's weighted fidelity estimator, whose single-shot values can be negative. Do not clip those values or claim device independence.
- Count measurement resources as well as copies. Joint Bell measurements are a stronger resource than local Pauli measurements. Audit the original optimal local-Pauli protocol before claiming a competitive baseline; a simple equally weighted Z/X verifier has gap 1/2, not 2/3.

Next selection should emphasize counterexamples, exact small-system operator checks and calibrated uncertainty. No expanded-size or noise experiment has been selected or run.

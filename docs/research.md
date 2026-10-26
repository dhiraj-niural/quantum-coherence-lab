# Research context

Reviewed26October2026. Targeted recent-literature scan, not an exhaustive claim to the latest paper. Coverage: primary arXiv abstracts and version/publication metadata; full derivations and code have not yet been audited.

| Work | Date/version | Relevance |
|---|---|---|
| [Disjoint Bell measurements enable near-projective GHZ certification](https://arxiv.org/abs/2606.09947v3), Cha and Lee | Submitted8June2026;v3 revised27August2026; preprint | Studies how allowing disjoint two-qubit Bell measurements changes GHZ verification efficiency compared with local measurements. |
| [Neural quantum states for entanglement depth certification from randomized Pauli measurements](https://arxiv.org/abs/2512.13121v2), Płodzień | Submitted15December2025;v2 June2026; Phys. Rev. Research8,023255(2026) | Uses constrained neural-state models and likelihood comparisons on finite-shot observations; a possible ML connection requiring careful statistical validation. |
| [Size-Independent Robustness in Multipartite Bell Self-Testing](https://arxiv.org/abs/2608.30851v1), Cao et al. |31August2026; preprint | Addresses robust GHZ self-testing as network size grows, under a different device-independent measurement model. |

## Proposed question
Under finite shots and controlled phase noise, which measurement choices distinguish a coherent GHZ state from an incoherent mixture at a fixed measurement budget?

First audit full methods and assumptions. Establish analytical/density-matrix ground truth, compare Z-only, phase-sensitive local measurements and one justified literature protocol, then measure false certification, power and calibration across seeds/noise levels. Separate trusted-device simulation from device-independent guarantees. Only add a learned estimator if it addresses a demonstrated gap and beats appropriate nonlearned baselines.

This is a proposed comparative study, not an originality claim. The existing four-qubit engine is a validation baseline. No listed protocol has been reproduced and no comparative results exist yet.

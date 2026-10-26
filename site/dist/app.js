'use strict';
(() => {
  const outcomes = Array.from({length: 16}, (_, i) => i.toString(2).padStart(4, '0'));
  const odd = i => outcomes[i].replaceAll('0', '').length % 2 === 1;
  const el = id => document.getElementById(id);
  let coherentBox = 0, basis = 'Z', revealed = false, observations = [[], []];
  const probabilities = coherent => outcomes.map((_, i) => basis === 'Z' ? (i === 0 || i === 15 ? .5 : 0) : coherent ? (odd(i) ? 1 / 8 : 0) : 1 / 16);
  function random() { const data = new Uint32Array(1); crypto.getRandomValues(data); return data[0] / 4294967296; }
  function sample(p, n) { const counts = Array(16).fill(0); for (let k = 0; k < n; k++) { const r = random(); let sum = 0; for (let i = 0; i < p.length; i++) { sum += p[i]; if (r < sum) { counts[i]++; break; } } } return counts; }
  function measure() { const n = Number(el('shots').value); observations = [0, 1].map(box => sample(probabilities(box === coherentBox), n)); render(); }
  function render() {
    const exact = el('exact').checked, n = Number(el('shots').value);
    const values = [0, 1].map(box => exact ? probabilities(box === coherentBox) : observations[box].map(count => count / n));
    // A common scale keeps the two histograms comparable; cap never clips a bar.
    const max = Math.max(basis === 'Z' ? .6 : .2, ...values.flat());
    ['a', 'b'].forEach((letter, box) => {
      const chart = el(`chart-${letter}`); chart.replaceChildren();
      values[box].forEach((p, i) => {
        const group = document.createElement('div'); group.className = 'bar-group'; group.tabIndex = 0;
        const detail = exact ? `${(p * 100).toFixed(2)}% probability` : `${observations[box][i]} of ${n} trials (${(p * 100).toFixed(1)}%)`;
        group.dataset.tip = `${outcomes[i]}: ${detail}`; group.setAttribute('aria-label', group.dataset.tip);
        const bar = document.createElement('div'); bar.className = `bar${odd(i) ? ' odd' : ''}`; bar.style.height = `${p / max * 100}%`;
        const label = document.createElement('span'); label.className = 'bar-label'; label.textContent = outcomes[i];
        group.append(bar, label); chart.append(group);
      });
      chart.setAttribute('aria-label', `Box ${letter.toUpperCase()} ${basis}-basis ${exact ? 'exact probabilities' : 'sampled frequencies'}. ${values[box].map((p,i) => `${outcomes[i]}: ${(p*100).toFixed(1)} percent`).join('; ')}`);
      el(`scale-${letter}`).textContent = exact ? 'EXACT PROBABILITY' : 'OBSERVED FREQUENCY';
      const oddP = values[box].reduce((sum, p, i) => sum + (odd(i) ? p : 0), 0);
      el(`parity-${letter}`).innerHTML = `<span>Odd number of 1s <strong>${(oddP*100).toFixed(1)}%</strong></span><span>Even <strong>${((1-oddP)*100).toFixed(1)}%</strong></span>`;
      const boxEl = el(`box-${letter}`); boxEl.querySelector('.trial-badge').textContent = exact ? 'Exact model' : `${n.toLocaleString()} trials`;
      boxEl.querySelector('.box-subtitle').textContent = revealed ? box === coherentBox ? 'Coherent superposition · GHZ−' : 'Incoherent classical mixture' : 'Unknown preparation';
      boxEl.classList.toggle('correct', revealed && box === coherentBox);
    });
    el('basis-z').setAttribute('aria-pressed', String(basis === 'Z')); el('basis-x').setAttribute('aria-pressed', String(basis === 'X'));
    el('view-explanation').textContent = basis === 'Z' ? 'In the Z view, both boxes produce only 0000 or 1111. These outcomes alone cannot distinguish the two preparations.' : 'In the X view, count the 1s in each outcome. One box allows only odd counts; the other allows both odd and even. The darker bars mark odd outcomes.';
    el('step-one').classList.toggle('active', basis === 'Z' && !revealed); el('step-two').classList.toggle('active', basis === 'X' && !revealed); el('step-three').classList.toggle('active', revealed);
    document.querySelectorAll('.guess').forEach(button => { button.disabled = revealed; });
  }
  function feedback(title, text) { const box = el('feedback'); box.replaceChildren(); const icon = document.createElement('span'); icon.className = 'hint-icon'; icon.setAttribute('aria-hidden','true'); icon.textContent = '✦'; const copy = document.createElement('div'); const heading = document.createElement('strong'); heading.textContent = title; const p = document.createElement('p'); p.textContent = text; copy.append(heading,p); box.append(icon,copy); }
  function reset() { coherentBox = random() < .5 ? 0 : 1; basis = 'Z'; revealed = false; el('exact').checked = false; feedback('A matching histogram isn’t the whole story.', 'Try the X view. Look at the number of 1s in each outcome.'); measure(); }
  ['Z','X'].forEach(view => el(`basis-${view.toLowerCase()}`).addEventListener('click', () => { basis = view; measure(); }));
  el('measure').addEventListener('click', measure); el('shots').addEventListener('change', measure); el('exact').addEventListener('change', render); el('reset').addEventListener('click', reset);
  document.querySelectorAll('.guess').forEach(button => button.addEventListener('click', () => {
    const correct = Number(button.dataset.box) === coherentBox; revealed = true;
    const label = coherentBox === 0 ? 'A' : 'B';
    feedback(correct ? `You found it. Box ${label} is the superposition.` : `The hidden difference was in Box ${label}.`, basis === 'Z' ? 'That was a guess: the Z distributions are identical. Switch to X to see the evidence—this state produces only odd numbers of 1s.' : 'Its relative phase cancels every even-parity outcome in the X view. The mixture has no such interference. Finite samples are evidence, not certainty; compare the exact probabilities.');
    render();
  }));
  reset();
})();

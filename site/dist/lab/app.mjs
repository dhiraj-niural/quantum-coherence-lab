import {createExperiment} from './model.mjs';
import {LabSound} from './sound.mjs?v=2';

const $=s=>document.querySelector(s);
const sound=new LabSound();
let room=null,experiment=null,started=false,userMuted=true,basis='Z',batch=null,read=false,solved=false,discovered=false,notes=[],pendingTimers=[];
const captions={archive:'An archived result. A question left open.',bench:'Change the test. Keep track of what you actually observe.',reveal:'The missing outcomes were the clue.'};
const objectives=()=>!read?'Recover the measurement record.':!solved?'Find a measurement that tells them apart.':!discovered?'Find out why the outcomes disappear.':'You found the difference. Now change the question.';
function note(text){if(!notes.includes(text))notes.push(text);$('#note-count').textContent=notes.length;}
function progress(){ $('#objective').textContent=objectives();$('#progress').textContent=`${Number(read)+Number(solved)+Number(discovered)} / 3 discoveries`;document.querySelectorAll('[data-station]').forEach(b=>b.classList.toggle('done',b.dataset.station==='archive'?read:b.dataset.station==='bench'?solved:discovered));}
function clearTones(){pendingTimers.forEach(clearTimeout);pendingTimers=[];}
function panel(name,html){$('#panel').hidden=false;$('#station-label').textContent={archive:'01 / THE RECORD',bench:'02 / THE INSTRUMENT',reveal:'03 / THE DIFFERENCE'}[name];$('#panel-content').innerHTML=html;$('#panel').scrollTop=0;document.body.classList.add('panel-open');const heading=$('#panel-content h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}$('#room-caption').textContent=captions[name];document.querySelectorAll('[data-station]').forEach(b=>b.classList.toggle('selected',b.dataset.station===name));room?.focus(name);sound.cue('open');}
function archive(){
  panel('archive',`<h2>They look the same.</h2><p>The labels came off two preparation machines. One makes a quantum combination. The other makes a random choice between two alternatives.</p><div class="record"><div class="row"><span>Machine A</span><span>0000 or 1111</span></div><div class="row"><span>Machine B</span><span>0000 or 1111</span></div><small>SETTING Z · EXACT MODEL PREDICTIONS<br>Each pattern has a 50% chance in either machine.</small></div><p>Each result is four bits, one per qubit. On this setting, the two machines have exactly the same odds.</p><p>Would taking a thousand more measurements expose the difference?</p><div class="action-row"><button id="predict-more">More data might help</button><button id="predict-change">I need a different test</button></div><p id="prediction" class="status">Make a prediction. You can change your mind.</p><button id="to-bench" class="primary" hidden>Try the instrument →</button><p class="fine">A fictional lab around a real ideal simulation. Every measurement uses a freshly prepared system.</p>`);
  const predict=more=>{read=true;note(`Prediction: ${more?'try collecting more Z measurements':'try a different measurement'}.`);$('#prediction').textContent=more?'Let’s test that. Watch whether the differences are a pattern or just random fluctuation.':'A useful suspicion. Try the available settings and compare what they reveal.';$('#to-bench').hidden=false;progress();sound.cue('open');};
  $('#predict-more').onclick=()=>predict(true);$('#predict-change').onclick=()=>predict(false);$('#to-bench').onclick=bench;
}
function bench(){
  if(!read){archive();return;}
  panel('bench',`<h2>Ask a different question.</h2><p>Choose how to measure. Each run records 64 fresh preparations from each machine.</p><div class="action-row" role="group" aria-label="Measurement setting"><button id="basis-z" class="${basis==='Z'?'active':''}" aria-pressed="${basis==='Z'}">Setting Z</button><button id="basis-x" class="${basis==='X'?'active':''}" aria-pressed="${basis==='X'}">Setting X</button></div><button id="measure" class="primary">Run 64 measurements</button><button id="hint" class="hint">A hint?</button><div id="results"></div><p id="finding" class="status" aria-live="polite">${solved?'Case solved. You can keep exploring.':'Make a measurement before drawing a conclusion.'}</p><div class="action-row"><button id="choose-a">A is the quantum combination</button><button id="choose-b">B is the quantum combination</button></div><button id="to-reveal" class="primary" ${solved?'':'hidden'}>See what changed →</button><p class="fine">A new run replaces the visible batch. Earlier summaries stay in Field notes. Z reads 0/1; in X, the same labels mean +1/−1.</p>`);
  $('#basis-z').onclick=()=>changeBasis('Z');$('#basis-x').onclick=()=>changeBasis('X');$('#measure').onclick=measure;
  $('#hint').onclick=()=>{$('#finding').textContent='Compare how many 1s are in each four-bit result. Does one setting give you a pattern the other does not?';note('Hint opened: compare even and odd counts of 1s.');};
  $('#choose-a').onclick=()=>choose('A');$('#choose-b').onclick=()=>choose('B');$('#to-reveal').onclick=reveal;
  if(batch)renderBatch();
}
function changeBasis(next){clearTones();basis=next;batch=null;bench();$(`#basis-${next.toLowerCase()}`).focus({preventScroll:true});}
function renderBatch(){
  $('#results').innerHTML=`<div class="measurements">${batch.boxes.map(b=>`<div class="box-result"><h3>Machine ${b.label} / ${batch.basis}</h3><div class="key"><span>EVEN ${b.even}</span><span>ODD ${b.odd}</span></div><div class="meter" role="img" aria-label="${b.even} even, ${b.odd} odd outcomes"><span class="even" style="width:${b.even/batch.shots*100}%"></span><span class="odd" style="width:${b.odd/batch.shots*100}%"></span></div>${batch.basis==='Z'?`<div class="fine">0000: ${b.counts[0]} · 1111: ${b.counts[15]}</div>`:''}<div class="readings">${b.recent.join(' ')}</div></div>`).join('')}</div><p class="fine">EVEN / ODD = number of 1s in a result.<br>For example: 0011 has two 1s (even); 0001 has one (odd). Last eight results shown. Sound maps A’s last outcomes to low (even) and high (odd) tones.</p>`;
}
function measure(){
  clearTones();batch=experiment.measure(basis,64);renderBatch();room?.flash();sound.cue('measure');
  const recent=batch.boxes[0].recent;recent.forEach((bits,i)=>pendingTimers.push(setTimeout(()=>sound.outcome([...bits].filter(c=>c==='1').length%2),200+i*100)));
  $('#finding').textContent=basis==='Z'?'Both produce 0000 and 1111. Different counts are sampling noise, not a reliable way to identify the machines.':'A lab note predicts that this particular quantum combination cancels even X outcomes. The random-choice preparation can produce both. Use the observed even outcomes to rule one machine out.';
  note(`${basis} batch, 64 fresh trials per machine. ${batch.boxes.map(b=>`${b.label}: ${b.even} even / ${b.odd} odd`).join('; ')}.`);
}
function choose(label){
  if(!batch){$('#finding').textContent='Take a measurement first. A guess alone is not evidence.';return;}
  if(batch.basis==='Z'){$('#finding').textContent='Z cannot tell these preparations apart. Their exact probabilities are identical, no matter how many trials you run. Try changing the measurement.';note('Z cannot identify either machine: both have the same exact probabilities.');return;}
  if(batch.boxes.every(b=>b.even===0)){$('#finding').textContent='Inconclusive: both machines happened to produce only odd outcomes. A random mixture can do that by chance. Run another batch.';return;}
  const other=batch.boxes.find(b=>b.label!==label);
  if(!experiment.identify(label)){$('#finding').textContent=`Machine ${label} produced even-parity outcomes. Our particular quantum combination cannot do that in X. Look at the other machine.`;return;}
  if(!other.even){$('#finding').textContent='This batch is inconclusive: both happened to produce only odd outcomes. Run another batch. A random mixture can also produce all-odd data by chance.';return;}
  solved=true;$('#finding').textContent=`Yes. The even X outcomes rule out the specified quantum preparation for machine ${other.label}. Under our two-candidate promise, ${label} is the quantum combination.`;$('#finding').classList.add('success');$('#to-reveal').hidden=false;note(`Identified ${label} using even X outcomes in the other machine. This conclusion relies on the ideal two-candidate promise.`);sound.cue('reveal');progress();
}
function reveal(){
  if(!solved){panel('reveal','<h2>The explanation is still sealed.</h2><p>First, use a measurement to identify the two machines. Then we can explain the evidence you found.</p><button id="back-bench" class="primary">Return to the instrument →</button>');$('#back-bench').onclick=bench;return;}
  discovered=true;note('Interference: add signed amplitudes before squaring. Opposite contributions cancel; matching ones reinforce.');progress();
  panel('reveal',`<span class="tag">CASE RESOLVED</span><h2>Absence was the evidence.</h2><p>The quantum preparation contains two alternatives with a relative minus sign. Setting X lets their contributions to an outcome meet.</p><div class="math-card"><h3>AN EVEN OUTCOME · e.g. 0011</h3><div class="amplitudes" aria-label="Positive a plus negative a equals zero"><span class="amp"></span><span>+</span><span class="amp minus"></span><span class="zero">= 0</span></div><p>Equal and opposite amplitudes cancel. Square zero and the probability is zero. That outcome never appears in this ideal preparation.</p></div><p>For odd outcomes, the contributions reinforce instead. The random mixture cannot cancel this way: it averages <em>probabilities</em>, so even outcomes remain possible.</p><p class="fine">The arrows show a calculation, not particle paths. This distinguishes two promised preparations, not all possible quantum states.</p><h3>One last prediction.</h3><p>What if the relative minus sign becomes a plus?</p><div class="action-row"><button id="flip-even">X becomes even-only</button><button id="flip-z">Z changes instead</button></div><p id="transfer" class="status">Try your new understanding.</p><a class="article-link" href="../article.html">See the derivation and reproduce it in Python ↗</a><a class="article-link" href="../learn_measurement.py" download>Download the standalone simulation ↓</a>`);
  $('#flip-even').onclick=()=>{$('#transfer').textContent='Exactly. Z stays unchanged; X becomes even-only. The sign changes which contributions cancel. “Quantum” does not always mean odd.';note('Transfer prediction: changing minus to plus swaps X parity while leaving Z unchanged.');sound.cue('reveal');};
  $('#flip-z').onclick=()=>{$('#transfer').textContent='Z still gives 0000 or 1111 equally. It hides the sign. X changes: even outcomes reinforce and odd outcomes cancel.';};
}
function visit(name){if(!started)return;clearTones();({archive,bench,reveal})[name]();}
let checkingSound=false;
function audioStatus(message){$('#audio-status').hidden=!message;$('#audio-status').textContent=message;}
function syncSound(){
  const ready=sound.state==='running';
  $('#sound').textContent=userMuted?'Sound off':ready?'Sound on':'Resume sound';
  $('#sound').setAttribute('aria-pressed',String(!userMuted&&ready));
  $('#test-sound').hidden=userMuted;
}
async function enableSound(){
  const ok=await sound.start();
  if(!ok){audioStatus('Audio could not start. Try again while this tab is active.');syncSound();return false;}
  userMuted=false;sound.setMuted(document.hidden);syncSound();return true;
}
async function testSound(){
  if(checkingSound)return;
  checkingSound=true;$('#test-sound').disabled=true;
  try{
    if(!await enableSound())return;
    sound.testTone();audioStatus('Playing a short test tone…');
    await new Promise(resolve=>setTimeout(resolve,150));
    if(userMuted||document.hidden){audioStatus('Sound paused. Return to the lab to test again.');return;}
    const rms=sound.outputRms();
    audioStatus(rms>0.001?'Audio signal detected. If silent, check the tab mute, output device and system volume.':'No audio signal detected. Try enabling sound again.');
    $('#audio-status').dataset.rms=rms.toFixed(5);
  }finally{checkingSound=false;$('#test-sound').disabled=false;}
}
async function toggleSound(){
  if(userMuted||sound.state!=='running'){await testSound();return;}
  userMuted=true;sound.setMuted(true);clearTones();syncSound();audioStatus('');
}
$('#sound').onclick=toggleSound;
$('#test-sound').onclick=testSound;
sound.onstatechange=syncSound;
document.addEventListener('visibilitychange',()=>{
  sound.setMuted(userMuted||document.hidden);
  if(document.hidden)clearTones();
  syncSound();
});
$('#enter').onclick=()=>{started=true;$('#entry').hidden=true;$('#play').hidden=false;room?.focus('overview');progress();$('[data-station=archive]').focus();};
document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>visit(b.dataset.station));
$('#close-panel').onclick=()=>{$('#panel').hidden=true;document.body.classList.remove('panel-open');room?.focus('overview');const current=$('[data-station].selected');current?.focus();document.querySelectorAll('[data-station]').forEach(b=>b.classList.remove('selected'));};
$('#notebook').onclick=()=>{$('#notes').replaceChildren(...notes.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));if(!notes.length){const li=document.createElement('li');li.textContent='No records yet. Start at the archive.';$('#notes').append(li);}$('#journal').showModal();};
$('#close-journal').onclick=()=>$('#journal').close();
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#journal').open)$('#close-panel').click();});
let reference;
$('#reset').onclick=()=>{clearTones();experiment=createExperiment(reference);basis='Z';batch=null;read=false;solved=false;discovered=false;notes=[];$('#note-count').textContent=0;$('#panel').hidden=true;document.body.classList.remove('panel-open');$('[data-station=archive]').focus();room?.focus('overview');progress();document.querySelectorAll('[data-station]').forEach(b=>b.classList.remove('selected'));};
try{
  const response=await fetch('../distributions.json');if(!response.ok)throw new Error('Reference data unavailable');reference=await response.json();experiment=createExperiment(reference);
  try{const {createRoom}=await import('./scene.mjs');room=createRoom($('#room'),visit);}catch(error){console.warn('3D view unavailable; all stations remain accessible.',error);$('#room-caption').textContent='3D view unavailable. Use the station buttons to play.';}
  $('#enter').disabled=false;$('#enter').textContent='Enter the lab →';
}catch(error){$('#load-error').textContent='The reference data could not load. Open this demo through its local server, then reload.';console.error(error);}

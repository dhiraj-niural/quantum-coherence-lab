import {createInvestigation} from './game.mjs';
import {LabSound} from './sound.mjs?v=3';
import {bindAudio} from './audio-ui.mjs';

const $=selector=>document.querySelector(selector);
const sound=new LabSound();bindAudio(sound);
let audioEpoch=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden)audioEpoch++;});
let room=null,game=null,reference=null,started=false,basis='Z',station='overview',notes=[],hintLevel=0,timers=[],busy=false,endingShown=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function clearTimers(){timers.forEach(clearTimeout);timers=[];busy=false;}
function later(fn,ms){timers.push(setTimeout(fn,ms));}
function remember(text){if(!notes.includes(text))notes.push(text);$('#note-count').textContent=notes.length;}
function whisper(text){$('#whisper').textContent=text;}
function progress(){
 const s=game.state;
 $('#chapter').textContent=s.solved?'03 / THE LAST LIGHT':s.hasLens?'02 / A DIFFERENT WAY TO LOOK':'01 / THE KEEPER’S ROOM';
 $('#objective').textContent=s.solved?'The path is open.':s.lastX?'Use your evidence at the door.':!s.seenZ?'Try the lanterns on the table.':!s.hasLens?'The journal holds an unfinished note.':!s.lastX?'Try the lens you found.':'Use your evidence at the door.';
 $('#inventory').hidden=!s.hasLens;
}
function openPanel(name,title,html){
 station=name;room?.focus(name);sound.cue('open');
 $('#panel').hidden=false;document.body.classList.add('panel-open');$('#station-label').textContent=title;$('#panel-content').innerHTML=html;$('#panel').scrollTop=0;
 const heading=$('#panel-content h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
 document.querySelectorAll('[data-station]').forEach(b=>b.classList.toggle('selected',b.dataset.station===name));
}
function closePanel(){
 $('#panel').hidden=true;document.body.classList.remove('panel-open');station='overview';room?.focus('overview');
 document.querySelectorAll('[data-station]').forEach(b=>b.classList.remove('selected'));
 $('#step-back').focus({preventScroll:true});
}
function archive(){
 const s=game.state;
 openPanel('archive','THE KEEPER’S JOURNAL',`<h2>A note. A second lens.</h2><div class="item"><div class="lens-art" aria-hidden="true"></div><p>“One lantern uses a quantum preparation. The other uses a random mixture. Exactly one of each.”</p></div><p>“Through the <strong>turned lens</strong>, the quantum lantern always prints an <strong>odd number of lit marks</strong>. Find the one that breaks this rule.”</p><div class="action-row"><button id="take-lens" ${s.hasLens?'disabled':''}>${s.hasLens?'Lens collected':'Take the lens ◈'}</button><button id="go-table">Back to the table</button></div><p class="fine">Odd means 1 or 3 lit marks. Even means 0, 2 or 4.</p>`);
 remember('Keeper’s promise: exactly one specified quantum preparation and one random mixture. Under the turned lens, the quantum one always prints an odd number of lit marks.');
 $('#take-lens').onclick=()=>{game.takeLens();remember('Found the turned lens. It changes the measurement, not the preparation.');progress();archive();$('#go-table').focus();whisper('The glass is cold. The question is different.');sound.cue('reveal');};
 $('#go-table').onclick=bench;
}
function marks(bits){return `<div class="marks" role="img" aria-label="${[...bits].filter(b=>b==='1').length} lit marks: ${bits}">${[...bits].map(bit=>`<i class="mark ${bit==='1'?'lit':''}" aria-hidden="true"></i>`).join('')}</div>`;}
function batchHTML(batch){
 return `<div class="lanterns">${['A','B'].map(label=>{
 const result=batch?.boxes.find(b=>b.label===label);
 return `<div class="lantern-card"><h3>${label}</h3><div class="receipt">${result?result.recent.slice(-4).map(marks).join(''):'<div class="counts">No marks yet</div>'}</div><div class="counts">${result?`Even ${result.even} · Odd ${result.odd}<br>16 trials · last 4 rows shown`: 'Pull the lever to test'}</div></div>`;
 }).join('')}</div>`;
}
function bench(){
 clearTimers();
 const s=game.state, batch=s.lastBatch?.basis===basis?s.lastBatch:null;
 openPanel('bench','THE LANTERN TABLE',`<h2>Ask the glass.</h2><div class="action-row"><button id="ordinary" class="${basis==='Z'?'active':''}" aria-pressed="${basis==='Z'}">Ordinary lens</button><button id="turned" class="${basis==='X'?'active':''}" aria-pressed="${basis==='X'}" ${!s.hasLens?'disabled':''}>${s.hasLens?'Turned lens ◈':'Missing lens ◇'}</button></div><div id="results">${batchHTML(batch)}</div><div class="action-row"><button id="pull" class="primary">Pull the lever</button><button id="go-door">Try the door →</button></div><p id="finding" class="status" role="status">${batch?basis==='Z'?'Both give all-lit or all-dark rows. A different glass might help.':'Count the lit marks. Which lantern breaks the keeper’s rule?':'Each row has four marks. A lit mark counts as one.'}</p><button id="hint" class="hint">A small hint?</button>`);
 $('#ordinary').onclick=()=>{basis='Z';bench();$('#ordinary').focus();};
 if(s.hasLens)$('#turned').onclick=()=>{basis='X';bench();$('#turned').focus();sound.cue('open');};
 $('#pull').onclick=pull;$('#go-door').onclick=door;$('#hint').onclick=hint;
}
function pull(){
 if(busy)return;busy=true;$('#pull').disabled=true;$('#finding').textContent='The mechanism stirs…';
 const batch=game.measure(basis),epoch=audioEpoch;room?.flash();sound.cue('measure');
 remember(`${basis==='Z'?'Ordinary':'Turned'} lens: A ${batch.boxes[0].even} even / ${batch.boxes[0].odd} odd; B ${batch.boxes[1].even} even / ${batch.boxes[1].odd} odd. 16 fresh trials each.`);
 later(()=>{
  busy=false;progress();if(station!=='bench')return;
  $('#results').innerHTML=batchHTML(batch);$('#pull').disabled=false;
  $('#finding').textContent=basis==='Z'?'Both give all-lit or all-dark rows. The keeper left something in the journal.':'Look for an even row: 0, 2 or 4 lit marks. That lantern breaks the rule.';
  if(!game.state.hasLens)whisper('A loose page rustles in the journal.');
  batch.boxes[0].recent.slice(-4).forEach((bits,i)=>later(()=>{if(!document.hidden&&epoch===audioEpoch)sound.outcome([...bits].filter(b=>b==='1').length%2);},i*130));
 },reduced?0:650);
}
function hint(){
 const hints=['Explore the journal. The keeper left a rule and another lens.','The ordinary lens hides the difference. Try the turned lens.','An even row rules out that lantern. The keeper promised one of each, so choose the other.'];
 $('#finding').textContent=hints[Math.min(hintLevel++,2)];
}
function door(){
 const s=game.state;
 if(s.solved){showEnding();return;}
 const evidence=s.lastX?`Turned lens: A gave ${s.lastX.boxes[0].even} even rows. B gave ${s.lastX.boxes[1].even}.`:'The door has two sockets. You need evidence before choosing.';
 openPanel('reveal','THE COURTYARD DOOR',`<h2>Which light will you trust?</h2><p>The keeper’s quantum lantern belongs here.</p><p class="fine">${evidence}</p><div class="action-row"><button id="choose-a">Use lantern A</button><button id="choose-b">Use lantern B</button></div><p id="finding" class="status" role="status">A wrong choice won’t end the game.</p><button id="hint" class="hint">A small hint?</button>`);
 $('#choose-a').onclick=()=>choose('A');$('#choose-b').onclick=()=>choose('B');$('#hint').onclick=hint;
}
function choose(label){
 const result=game.choose(label);
 const responses={
  'need-test':'The lock stays dark. Try the turned lens and compare the marks first.',
  'ruled-out':'That lantern printed an even row. It breaks the keeper’s rule. Try the other.',
  'inconclusive':'Neither lantern printed an even row this time. The evidence is inconclusive. Pull again.',
  'inconsistent':'The evidence doesn’t fit. Start a fresh case.'
 };
 if(result.kind!=='solved'){$('#finding').textContent=responses[result.kind];return;}
 remember(`An even row excluded the other lantern. Under the keeper’s two-candidate promise, ${label} is the specified quantum preparation.`);
 $('#finding').textContent='The latch lifts. A light answers from outside.';
 $('#choose-a').disabled=true;$('#choose-b').disabled=true;
 room?.setSolved(true);sound.cue('reveal');progress();
 later(()=>{closePanel();room?.focus('reveal');whisper('The courtyard is waking.');},reduced?0:600);
 later(showEnding,reduced?100:2200);
}
function showEnding(){
 endingShown=true;$('#panel').hidden=true;document.body.classList.remove('panel-open');$('#play').hidden=true;$('#ending').hidden=false;$('#ending').classList.add('fade-in');$('#understand').focus({preventScroll:true});
}
function visit(name){if(!started||endingShown)return;clearTimers();({archive,bench, reveal:door})[name]?.();}
$('#enter').onclick=()=>{started=true;$('#entry').hidden=true;$('#play').hidden=false;room?.focus('overview');progress();whisper('A lever waits on the table.');$('[data-station="bench"]').focus();};
document.querySelectorAll('[data-station]').forEach(button=>button.onclick=()=>visit(button.dataset.station));
$('#close-panel').onclick=closePanel;$('#step-back').onclick=closePanel;
$('#understand').onclick=()=>{location.href='science.html';};
$('#return-room').onclick=()=>{endingShown=false;$('#ending').hidden=true;$('#play').hidden=false;room?.focus('reveal');whisper('The light stays on.');$('#step-back').focus();};
$('#notebook').onclick=()=>{$('#notes').replaceChildren(...(notes.length?notes:['No notes yet. Try the table or inspect the journal.']).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));$('#journal').showModal();};
$('#close-journal').onclick=()=>$('#journal').close();$('#help').onclick=()=>$('#settings').showModal();$('#close-help').onclick=()=>$('#settings').close();
$('#reset').onclick=()=>{clearTimers();game=createInvestigation(reference);basis='Z';notes=[];hintLevel=0;endingShown=false;$('#note-count').textContent=0;$('#ending').hidden=true;$('#play').hidden=false;room?.setSolved(false);closePanel();progress();whisper('Two lanterns. A fresh mystery.');};
addEventListener('keydown',event=>{
 if(!started||endingShown||$('#journal').open||$('#settings').open||event.altKey||event.metaKey||event.ctrlKey||event.target.matches('input,textarea,select'))return;
 const direction={a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right',w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back'}[event.key];
 if(event.key==='Escape'){event.preventDefault();closePanel();return;}
 if(!direction||event.repeat)return;event.preventDefault();
 if(direction==='back'){closePanel();return;}
 const destination=room?.move(direction)||({left:'archive',right:'reveal',forward:'bench'})[direction];visit(destination);
});
try{
 const response=await fetch('../distributions.json');if(!response.ok)throw new Error('Reference unavailable');reference=await response.json();game=createInvestigation(reference);
 try{const {createRoom}=await import('./scene.mjs?v=3');room=createRoom($('#room'),visit);}catch(error){console.warn('3D unavailable; buttons retain the full puzzle.',error);$('#load-error').textContent='3D is unavailable here. You can still play using the room buttons.';}
 $('#enter').disabled=false;$('#enter').textContent='Enter the room →';
}catch(error){$('#load-error').textContent='The experiment could not load. Reload this page to try again.';console.error(error);}

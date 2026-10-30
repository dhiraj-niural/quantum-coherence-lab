/** Visible user controls for optional audio. No sound before a gesture. */
export function bindAudio(sound){
 const button=document.querySelector('#sound'),test=document.querySelector('#test-sound'),status=document.querySelector('#audio-status');
 let muted=true,checking=false;
 function sync(){button.textContent=muted?'Sound off':sound.state==='running'?'Sound on':'Resume sound';button.setAttribute('aria-pressed',String(!muted&&sound.state==='running'));}
 async function check(){
  if(checking)return;checking=true;test.disabled=true;
  try{
   if(!await sound.start()){status.textContent='Audio could not start. Try again while this tab is active.';return;}
   muted=false;sound.setMuted(document.hidden);sync();sound.testTone();status.textContent='Playing a short tone…';
   await new Promise(resolve=>setTimeout(resolve,150));
   status.textContent=muted||document.hidden?'Sound paused.':sound.outputRms()>.001?'Signal detected. If silent, check the tab mute and system volume.':'No signal detected. Try sound again.';
  }finally{checking=false;test.disabled=false;sync();}
 }
 button.onclick=async()=>{if(muted||sound.state!=='running')return check();muted=true;sound.setMuted(true);status.textContent='';sync();};
 test.onclick=check;sound.onstatechange=sync;
 document.addEventListener('visibilitychange',()=>{sound.setMuted(muted||document.hidden);sync();});
}

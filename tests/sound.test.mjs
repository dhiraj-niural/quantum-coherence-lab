import test from 'node:test';
import assert from 'node:assert/strict';
import {LabSound} from '../site/dist/lab/sound.mjs';

// Lifecycle stand-in; audible output is checked separately in a real browser.
class Parameter {
  value=0;
  cancelScheduledValues(){}
  setValueAtTime(value){this.value=value;}
  linearRampToValueAtTime(value){this.value=value;}
  exponentialRampToValueAtTime(value){this.value=value;}
}
class Node {
  gain=new Parameter(); frequency=new Parameter(); stopped=false;
  connect(target){return target;}
  disconnect(){}
  start(){}
  stop(){this.stopped=true;}
}
class Context {
  state='suspended'; currentTime=1; destination=new Node(); resumes=0; oscillators=[];
  createGain(){return new Node();}
  createOscillator(){const node=new Node();this.oscillators.push(node);return node;}
  createAnalyser(){return {fftSize:2048,connect:target=>target,disconnect(){},getFloatTimeDomainData:data=>data.fill(0.05)};}
  async resume(){this.resumes++;this.state='running';this.onstatechange?.();}
  async close(){this.state='closed';}
}

async function withContext(run){
  const original=globalThis.AudioContext;
  const contexts=[];
  globalThis.AudioContext=class extends Context{constructor(){super();contexts.push(this);}};
  try{await run(contexts);}finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
}
test('audio stays lazy and reuses its context after an interruption',async()=>withContext(async contexts=>{
  const sound=new LabSound();assert.equal(contexts.length,0);
  assert.equal(await sound.start(),true);assert.equal(contexts.length,1);
  const context=contexts[0];assert.equal(context.resumes,1);
  context.state='interrupted';assert.equal(await sound.start(),true);
  assert.equal(context.resumes,2);assert.equal(contexts.length,1);
  await sound.dispose();assert.equal(await sound.start(),false);
}));
test('muting stops current cues and suppresses new ones',async()=>withContext(async contexts=>{
  const sound=new LabSound();await sound.start();const context=contexts[0];
  const ambientCount=context.oscillators.length;sound.testTone();
  assert.equal(context.oscillators.length,ambientCount+1);
  sound.setMuted(true);assert.equal(sound.outputRms(),0);
  assert.equal(context.oscillators.at(-1).stopped,true);
  sound.cue('open');sound.outcome(1);sound.testTone();
  assert.equal(context.oscillators.length,ambientCount+1);
  sound.setMuted(false);assert.ok(sound.outputRms()>0);
  await sound.dispose();assert.ok(context.oscillators.every(node=>node.stopped));
}));
test('failed audio startup remains recoverable',async()=>withContext(async contexts=>{
  const sound=new LabSound();await sound.start();const context=contexts[0];
  context.state='interrupted';context.resume=async()=>{throw new Error('device unavailable');};
  assert.equal(await sound.start(),false);
  context.resume=Context.prototype.resume;
  assert.equal(await sound.start(),true);await sound.dispose();
}));

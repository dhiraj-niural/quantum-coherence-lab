import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createInvestigation} from '../site/dist/lab/game.mjs';
const reference=JSON.parse(readFileSync(new URL('../site/dist/distributions.json',import.meta.url)));
const seeded=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
test('a lucky choice and Z samples cannot unlock the door',()=>{
 const game=createInvestigation(reference,seeded(1));
 assert.equal(game.choose('A').kind,'need-test');
 assert.throws(()=>game.measure('X'));
 game.measure('Z');assert.equal(game.state.seenZ,true);
 assert.equal(game.choose('A').kind,'need-test');assert.equal(game.state.solved,false);
});
test('either shuffled identity can be solved only from distinguishing X evidence',()=>{
 const identities=new Set();
 for(let seed=1;seed<100;seed++){
  const game=createInvestigation(reference,seeded(seed*9001));game.takeLens();
  const batch=game.measure('X');const excluded=batch.boxes.find(b=>b.even>0);
  if(!excluded)continue;
  assert.equal(game.choose(excluded.label).kind,'ruled-out');assert.equal(game.state.solved,false);
  const key=excluded.label==='A'?'B':'A';identities.add(key);
  assert.equal(game.choose(key).kind,'solved');assert.equal(game.state.solved,true);
 }
 assert.equal(identities.size,2);
});
test('two all-odd finite samples remain inconclusive',()=>{
 let first=true;const game=createInvestigation(reference,()=>{if(first){first=false;return 0;}return .1;});
 game.takeLens();game.measure('X');
 assert.equal(game.choose('A').kind,'inconclusive');assert.equal(game.state.solved,false);
});
test('reset creates a new unsolved investigation with no evidence',()=>{
 const game=createInvestigation(reference,seeded(1));game.takeLens();game.measure('X');
 const fresh=createInvestigation(reference,seeded(2));assert.deepEqual(fresh.state,{hasLens:false,seenZ:false,solved:false,lastBatch:null,lastX:null});
});

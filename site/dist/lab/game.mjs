import {createExperiment} from './model.mjs';

/** Discovery state. All observations remain samples from the Python reference. */
export function createInvestigation(reference, rng=Math.random) {
  const experiment=createExperiment(reference,rng);
  let hasLens=false, seenZ=false, solved=false, lastX=null, lastBatch=null;
  return {
    get state(){return {hasLens,seenZ,solved,lastBatch,lastX};},
    takeLens(){hasLens=true;},
    measure(basis){
      if(basis==='X'&&!hasLens)throw new Error('Find the second lens first.');
      lastBatch=experiment.measure(basis,16);
      if(basis==='Z')seenZ=true;
      if(basis==='X')lastX=lastBatch;
      return lastBatch;
    },
    choose(label){
      if(!['A','B'].includes(label))throw new Error('Choose A or B.');
      if(!lastX)return {kind:'need-test'};
      const chosen=lastX.boxes.find(b=>b.label===label);
      const other=lastX.boxes.find(b=>b.label!==label);
      if(chosen.even>0)return {kind:'ruled-out'};
      if(other.even===0)return {kind:'inconclusive'};
      // In the ideal two-candidate puzzle, an even X outcome excludes GHZ-minus.
      solved=experiment.identify(label);
      return {kind:solved?'solved':'inconsistent'};
    }
  };
}

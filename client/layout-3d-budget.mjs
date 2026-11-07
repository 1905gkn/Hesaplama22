// Cooperate with input/paint while preparing large, immutable scenes. No LOD.
export function createPreparationBudget({milliseconds=8,now=()=>performance.now(),pause=()=>new Promise(resolve=>setTimeout(resolve,0))}={}){
 let start=now(),yields=0,longestSlice=0;
 return {checkpoint(){const elapsed=now()-start;if(elapsed<milliseconds)return null;longestSlice=Math.max(longestSlice,elapsed);yields++;return pause().then(()=>{start=now();});},stats(){return {preparationYields:yields,longestPreparationSliceMs:Math.round(longestSlice)};}};
}
export async function populateInstances(mesh,matrices,budget){
 const array=mesh.instanceMatrix.array;
 for(let i=0;i<matrices.length;i++){
  array.set(matrices[i].elements,i*16);
  if((i&255)===255){const pending=budget.checkpoint();if(pending)await pending;}
 }
 mesh.instanceMatrix.needsUpdate=true;
 const pending=budget.checkpoint();if(pending)await pending;
}

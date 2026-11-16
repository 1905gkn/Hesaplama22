import {MeshoptSimplifier} from './cad-render-simplifier.mjs';
self.onmessage=async({data:{id,args}})=>{
 try{
  await MeshoptSimplifier.ready;
  const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(...args);
  self.postMessage({id,indices,error},[indices.buffer]);
 }catch(error){self.postMessage({id,message:error?.message||String(error)});}
};

// Node-only adapter for the existing Three.js Draco decoder used by asset tests.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
export async function nodeDraco(require,THREE){
 const file=path.join(path.dirname(require.resolve('three')),'../examples/jsm/libs/draco/gltf/draco_decoder.js');
 const env={module:{exports:{}},exports:{},require,process,console,setTimeout,clearTimeout,performance,TextDecoder,TextEncoder,WebAssembly,Buffer,__dirname:path.dirname(file),__filename:file};vm.createContext(env);vm.runInContext(fs.readFileSync(file,'utf8'),env);const factory=typeof env.module.exports==='function'?env.module.exports:env.DracoDecoderModule;const d=await factory({});
 return {preload(){},decodeDracoFile(buffer,callback,ids,types,colorSpace,onError){
  const decoder=new d.Decoder(),input=new d.DecoderBuffer(),mesh=new d.Mesh();
  try{input.Init(new Int8Array(buffer),buffer.byteLength);const status=decoder.DecodeBufferToMesh(input,mesh);if(!status.ok())throw Error(status.error_msg());const geometry=new THREE.BufferGeometry();
   for(const [name,id] of Object.entries(ids)){const attribute=decoder.GetAttributeByUniqueId(mesh,id),components=attribute.num_components(),count=mesh.num_points()*components,bytes=count*4,pointer=d._malloc(bytes);decoder.GetAttributeDataArrayForAllPoints(mesh,attribute,d.DT_FLOAT32,bytes,pointer);const values=new Float32Array(d.HEAPF32.buffer,pointer,count).slice();d._free(pointer);geometry.setAttribute(name,new THREE.BufferAttribute(values,components));}
   const count=mesh.num_faces()*3,bytes=count*4,pointer=d._malloc(bytes);decoder.GetTrianglesUInt32Array(mesh,bytes,pointer);const indices=new Uint32Array(d.HEAPU32.buffer,pointer,count).slice();d._free(pointer);geometry.setIndex(new THREE.BufferAttribute(indices,1));callback(geometry);
  }catch(error){if(onError)onError(error);else throw error;}finally{d.destroy(mesh);d.destroy(input);d.destroy(decoder);}
 }};
}


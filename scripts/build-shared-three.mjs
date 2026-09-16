import fs from 'node:fs';
import {build} from 'esbuild';
import * as THREE from 'three';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const root=process.cwd();
const vendor=await build({stdin:{contents:"export * from 'three';",resolveDir:root},bundle:true,format:'iife',globalName:'RafexThree',minify:true,target:'es2022',write:false});
fs.writeFileSync('dist/rafex-three.js',vendor.outputFiles[0].contents);
const versionHash=createHash('sha256').update(vendor.outputFiles[0].contents);
const shim=Object.keys(THREE).map(key=>'export const '+key+'=globalThis.RafexThree.'+key+';').join('\n');
const plugin={name:'one-three-instance',setup(b){b.onResolve({filter:/^three$/},()=>({path:'three',namespace:'shared-three'}));b.onLoad({filter:/.*/,namespace:'shared-three'},()=>({contents:shim,loader:'js'}));}};
let source=fs.readFileSync('dist/server/index.js','utf8');
for(const [entry,file,constant] of [
 ['dist/b2b-viewer.patched.entry.js','b2b-viewer.js','B2B_VIEWER_BASE64'],
 ['client/mr-viewer.entry.js','mr-viewer.js','MR_VIEWER_BASE64'],
 ['client/konsol-viewer.entry.js','konsol-viewer.js','KONSOL_VIEWER_BASE64'],
 ['client/mekik-front-viewer.entry.js','mekik-front-viewer.js','RAFEX_MEKIK_FRONT_VIEWER_BASE64'],
 ['client/drive-in-viewer.entry.js','drive-in-viewer.js','DRIVE_IN_VIEWER_BASE64']]){
  const result=await build({absWorkingDir:root,entryPoints:[entry],bundle:true,format:'iife',minify:true,target:'es2022',write:false,plugins:[plugin]});
  const code=result.outputFiles[0].text;new vm.Script(code);
  versionHash.update(code);
  if(code.includes('Multiple instances of Three.js'))throw Error('Three was still bundled: '+file);
  fs.writeFileSync('dist/'+file,code);
  const re=new RegExp('(const '+constant+' = ["\x27])([A-Za-z0-9+/=]+)(["\x27])');
  if(!re.test(source))throw Error('Viewer constant missing: '+constant);
  source=source.replace(re,(_,a,b,c)=>a+Buffer.from(code).toString('base64')+c);
}
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
let html=Buffer.from(match[2],'base64').toString();
const version=versionHash.digest('hex').slice(0,16);
html=html.replace(/\/(b2b|mr|konsol|mekik-front|drive-in)-viewer\.js(?:\?[^"'\s<>]*)?/g,'/$1-viewer.js?v='+version);
const first=html.indexOf('<script');html=html.slice(0,first)+'<script src="/rafex-three.js?v='+version+'"></script>'+html.slice(first);
source=source.replace(match[0],match[0].replace(match[2],Buffer.from(html).toString('base64')));
const route='    if (path === "/b2b-viewer.js")';
if(!source.includes(route))throw Error('Vendor route anchor missing');
source=source.replace(route,'    if(path === "/rafex-three.js") return new Response(Uint8Array.from(atob(RAFEX_SHARED_THREE_BASE64),c=>c.charCodeAt(0)),{headers:{"content-type":"text/javascript","cache-control":"public, max-age=31536000, immutable"}});\n'+route);
source='const RAFEX_SHARED_THREE_BASE64 = "'+Buffer.from(vendor.outputFiles[0].contents).toString('base64')+'";\n'+source;
fs.writeFileSync('dist/server/index.js',source);
console.log('PASS: five viewers use one shared Three.js instance; bundle syntax checked.');

import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function transform(html){
 if(html.includes('data-performance="v577"'))return html;
 const from="if (!common(root)) { screen = 'types'; root?.removeAttribute('data-rafex-workflow-screen'); return; }";
 if(!html.includes(from))throw Error('Missing workflow reset anchor');
 html=html.replace(from,"if (!common(root)) { root?.removeAttribute('data-rafex-workflow-screen'); return; }");
 const end=html.lastIndexOf('</body>');
 const hook=`<script data-performance="v577">(()=>{
 const apply=m2ApplyProjectRecord;let revision=0;
 m2ApplyProjectRecord=window.m2ApplyProjectRecord=function(project,...args){
  const ticket=++revision,result=apply.call(this,project,...args);
  const opened=value=>{if(value===false)return value;const uuid=window.rafexProjectIdentityV133?.uuid;
   const placed=project?.payload?.areas?.some(a=>a.layout?.racks?.length)||project?.payload?.layout?.racks?.length;
   if(placed)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ticket===revision&&uuid===window.rafexProjectIdentityV133?.uuid)void window.rafexOpenLayoutScreenV370?.();}));return value;};
  return result?.then?result.then(opened):opened(result);
 };
})();</script>`;
 return html.slice(0,end)+hook+html.slice(end);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {build}=await import('esbuild');
 await build({entryPoints:['client/cad-simplify-worker.entry.js'],bundle:true,format:'esm',target:'es2022',minify:true,outfile:'dist/cad-simplify-worker.js'});
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
  let text=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))text=transform(text);else{const match=text.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!match)throw Error('Missing HTML');text=text.replace(match[2],Buffer.from(transform(Buffer.from(match[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,text);
 }
}

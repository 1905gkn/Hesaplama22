import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* type-editor-preserve-v586 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v586 missing '+a.slice(0,90));html=html.replace(a,b);};
 // An engine may be reopened without changing its name. Its common snapshot is
 // still stale after area selection, history restore or a new placement.
 replace('if(free.currentEngine&&free.currentEngine!==target)captureEngine();','if(free.currentEngine)captureEngine();');
 replace('  function renderEngine(system,continued){',`  function renderEngine(system,continued){
    /* type-editor-preserve-v586 */
    const checkpoint586=window.rafexCheckpointAreas586?.();
    try{`);
 replace('    free.continued=Boolean(continued);\n    decoratePage();\n  }','    free.continued=Boolean(continued);\n    decoratePage();\n    }finally{window.rafexResumeAreas586?.(checkpoint586);}\n  }');
 replace('  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};',`  window.rafexCheckpointAreas586=()=>{
    const key=window.rafexProjectIdentityV133?.uuid||'unopened';
    if(!common()||output||restoring||!documentState||owner!==key)return null;
    remember();return {owner,state:clone(documentState)};
  };
  window.rafexResumeAreas586=checkpoint=>{
    if(!checkpoint||output||restoring||checkpoint.owner!==(window.rafexProjectIdentityV133?.uuid||'unopened'))return;
    owner=checkpoint.owner;documentState=clone(checkpoint.state);sessions.set(owner,documentState);
    restore(current().layout,true,true);draw();
  };
  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};`);
 return html;
}
if(/[\\/]type-editor-preserve-v586\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

import fs from 'node:fs';import {independentProject} from './independent-project-v133.mjs';
export function copyArea560(source,id,name,timestamp){
 const layout=independentProject({payload:{layout:source.layout,rackTypes:[]}},id,timestamp).payload.layout;
 return {...structuredClone(source),id,name,layout};
}
export function transform(html){
 if(html.includes('data-area-copy="560"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('560 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('  function draw(){\n    if(!common()||!documentState||output)return;',`  function duplicateArea560(id){
    if(output||restoring||window.rafexProjectSavingV133||window.rafexAreaCaptureBusy530||window.rafexCanEditProjectV134?.()===false)return;
    ensure();remember();const source=documentState?.areas.find(a=>a.id===id);if(!source)return;
    const copyId=crypto.randomUUID(),used=new Set(documentState.areas.map(a=>a.name));let n=1,name=source.name+' · Kopya';while(used.has(name))name=source.name+' · Kopya '+(++n);
    const maximum=documentState.areas.reduce((max,a)=>[...(a.layout.racks||[]),...(a.layout.symbols||[]),...(a.layout.userNotes||[])].reduce((value,item)=>Number.isSafeInteger(Number(item.id))?Math.max(value,Number(item.id)):value,max),0);
    const stamp=Math.max(Date.now(),Math.floor(maximum/1000)+1),copy=window.rafexCopyArea560(source,copyId,name,stamp);
    documentState.areas.splice(documentState.areas.indexOf(source)+1,0,copy);documentState.activeAreaId=copyId;sessions.set(owner,documentState);
    restore(copy.layout,true,true);draw();invalidate();
  }
  function draw(){
    if(!common()||!documentState||output)return;`);
 replace('row.append(open,input);list.appendChild(row);','const duplicate=document.createElement("button");duplicate.type="button";duplicate.className="rafex-copy-area560";duplicate.textContent="Kopyala";duplicate.title="Alanı tüm içeriğiyle kopyala";duplicate.setAttribute("aria-label",(index+1)+". alanı tüm içeriğiyle kopyala");duplicate.disabled=window.rafexCanEditProjectV134?.()===false;duplicate.addEventListener("click",()=>duplicateArea560(a.id));row.append(open,input,duplicate);list.appendChild(row);');
 // IDs of objects inside an area must remain globally unique for project copies.
 const code='(()=>{const independentProject='+independentProject.toString()+';window.rafexCopyArea560='+copyArea560.toString()+';})();';
 const style='<style data-area-copy="560">#rafexAreaList .rafex-area-row{grid-template-columns:auto minmax(0,1fr) auto}#rafexAreaList .rafex-copy-area560{white-space:nowrap}#page .m2-spacing-modal{z-index:1200!important}body:has(.m2-spacing-modal:not([hidden])) #page .rafex-common-project-name-wrap{z-index:0!important;pointer-events:none!important}</style>';
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+style+'<script>'+code+'</script>'+html.slice(at);
}
if(/[\\/]area-copy-modal-v560\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}

import fs from 'node:fs';import {independentProject} from './independent-project-v133.mjs';
export function copyArea560(source,id,name,timestamp){
 const layout=independentProject({payload:{layout:source.layout,rackTypes:[]}},id,timestamp).payload.layout;
 return {...structuredClone(source),id,name,layout};
}
export function transform(html){
 if(html.includes('data-area-copy="560"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('560 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('getView:function(){return Object.assign({},view)}',`fitRacks:function(){
    const b=syncBounds(),aspect=b.w/b.h;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const rack of state()?.racks||[]){
      const bounds=m2RackBounds(rack);
      if(![bounds.left,bounds.top,bounds.right,bounds.bottom].every(Number.isFinite))continue;
      left=Math.min(left,bounds.left);right=Math.max(right,bounds.right);
      top=Math.min(top,bounds.top);bottom=Math.max(bottom,bounds.bottom);
    }
    if(!(right>left&&bottom>top))return fitAll();
    const w=Math.min(maxViewWidth(b),Math.max(Math.min(MIN_W,b.w),(right-left)*1.2,(bottom-top)*1.2*aspect)),h=w/aspect;
    view={x:(left+right-w)/2,y:(top+bottom-h)/2,w,h};
    return apply();
  },getView:function(){return Object.assign({},view)}`);
 replace('  function select(id){if(output||window.rafexProjectSavingV133)return;ensure();if(!documentState.areas.some(a=>a.id===id)||id===documentState.activeAreaId)return;remember();documentState.activeAreaId=id;restore(current().layout);draw();invalidate();}',`  let centerFrame=0;
  function centerArea(){
    cancelAnimationFrame(centerFrame);
    const session=documentState,id=session?.activeAreaId;
    centerFrame=requestAnimationFrame(()=>{
      if(common()&&documentState===session&&session?.activeAreaId===id&&!output&&!window.rafexAreaCaptureBusy530)window.rafexCommonLayoutZoomCrispV126?.fitRacks();
    });
  }
  function select(id){
    if(output||restoring||window.rafexProjectSavingV133||window.rafexAreaCaptureBusy530)return;
    ensure();if(!documentState?.areas.some(a=>a.id===id))return;
    if(id!==documentState.activeAreaId){
      remember();documentState.activeAreaId=id;restore(current().layout);draw();invalidate();
    }
    centerArea();
  }
  function removeArea(id){
    if(output||restoring||window.rafexProjectSavingV133||window.rafexAreaCaptureBusy530||window.rafexCanEditProjectV134?.()===false)return;
    ensure();const index=documentState?.areas.findIndex(a=>a.id===id)??-1;
    if(index<0)return;
    const area=documentState.areas[index];
    if(!window.confirm('“'+area.name+'” alanı ve içindeki çizim silinecek. Emin misiniz?'))return;
    const active=id===documentState.activeAreaId;
    if(!active)remember();
    documentState.areas.splice(index,1);
    if(!documentState.areas.length){add();centerArea();return;}
    if(active){
      documentState.activeAreaId=documentState.areas[Math.min(index,documentState.areas.length-1)].id;
      restore(current().layout);centerArea();
    }
    draw();invalidate();
  }`);
 replace('setView(current().layout.editorViewportV258);draw();invalidate();m2RenderLayout();','setView(current().layout.editorViewportV258);draw();invalidate();m2RenderLayout();centerArea();');
 replace('owner=null;ensure();}draw();}return result;};window.m2ApplyProjectRecord=m2ApplyProjectRecord;',
   'owner=null;ensure();}draw();centerArea();}return result;};window.m2ApplyProjectRecord=m2ApplyProjectRecord;');
 replace('  function draw(){\n    if(!common()||!documentState||output)return;',`  function duplicateArea560(id){
    if(output||restoring||window.rafexProjectSavingV133||window.rafexAreaCaptureBusy530||window.rafexCanEditProjectV134?.()===false)return;
    ensure();remember();const source=documentState?.areas.find(a=>a.id===id);if(!source)return;
    const copyId=crypto.randomUUID(),used=new Set(documentState.areas.map(a=>a.name));let n=1,name=source.name+' · Kopya';while(used.has(name))name=source.name+' · Kopya '+(++n);
    const maximum=documentState.areas.reduce((max,a)=>[...(a.layout.racks||[]),...(a.layout.symbols||[]),...(a.layout.userNotes||[])].reduce((value,item)=>Number.isSafeInteger(Number(item.id))?Math.max(value,Number(item.id)):value,max),0);
    const stamp=Math.max(Date.now(),Math.floor(maximum/1000)+1),copy=window.rafexCopyArea560(source,copyId,name,stamp);
    documentState.areas.splice(documentState.areas.indexOf(source)+1,0,copy);documentState.activeAreaId=copyId;sessions.set(owner,documentState);
    restore(copy.layout,true,true);draw();invalidate();centerArea();
  }
  function draw(){
    if(!common()||!documentState||output)return;`);
 replace('row.append(open,input);list.appendChild(row);','const duplicate=document.createElement("button");duplicate.type="button";duplicate.className="rafex-copy-area560";duplicate.textContent="Kopyala";duplicate.title="Alanı tüm içeriğiyle kopyala";duplicate.setAttribute("aria-label",(index+1)+". alanı tüm içeriğiyle kopyala");duplicate.disabled=window.rafexCanEditProjectV134?.()===false;duplicate.addEventListener("click",()=>duplicateArea560(a.id));const remove=document.createElement("button");remove.type="button";remove.textContent="Sil";remove.className="rafex-delete-area560";remove.setAttribute("aria-label",a.name+" alanını sil");remove.disabled=duplicate.disabled;remove.addEventListener("click",()=>removeArea(a.id));row.append(open,input,duplicate);row.append(remove);list.appendChild(row);');
 // IDs of objects inside an area must remain globally unique for project copies.
 const code='(()=>{const independentProject='+independentProject.toString()+';window.rafexCopyArea560='+copyArea560.toString()+';})();';
 const style='<style data-area-copy="560">#rafexAreaList .rafex-area-row{grid-template-columns:auto minmax(0,1fr) auto auto}#rafexAreaList .rafex-delete-area560{color:#9c2525;white-space:nowrap}#rafexAreaList .rafex-copy-area560{white-space:nowrap}#page .m2-spacing-modal{z-index:1200!important}body:has(.m2-spacing-modal:not([hidden])) #page .rafex-common-project-name-wrap{z-index:0!important;pointer-events:none!important}</style>';
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+style+'<script>'+code+'</script>'+html.slice(at);
}
if(/[\\/]area-copy-modal-v560\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* direct-vector-pdf-v283 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing PDF speed anchor: '+a.slice(0,90));html=html.replaceAll(a,b);};
 rep('requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));',"try{await window.rafexDownloadPreparedPdfV283(print);}catch(error){console.error('PDF indirilemedi',error);alert('PDF oluşturulamadı: '+error.message);}finally{cleanup();}");
 rep("documentState.activeAreaId=area.id;restore(area.layout);await render({sections:areas.length===1});","documentState.activeAreaId=area.id;if(areas.length>1)restore(area.layout);await render({sections:areas.length===1});");
 rep("documentState.activeAreaId=active;restore(current().layout);m2UndoHistory=undo;","documentState.activeAreaId=active;if(areas.length>1)restore(current().layout);m2UndoHistory=undo;");
 rep("!event.target.closest?.('#m2CreateOutputButton')","!event.target.closest?.('#m2CreateOutputButton,.m2-pdf-button')");
 rep("root.querySelectorAll('.m2-b2b-plan-pallet-line').forEach(node=>node.remove());","/* Keep the same pallet geometry as the editor. */");
 rep("  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;paint();});};\n  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});",`  const dirty=new Map();let pending=false;
  function schedule(records){
    const mark=root=>{if(!root?.matches)return;const scope=root.matches(scopes)?root:root.closest(scopes);if(scope)dirty.set(scope,true);else root.querySelectorAll?.(scopes).forEach(node=>dirty.set(node,true));};
    records.forEach(record=>{if(record.target.closest?.(scopes))mark(record.target);for(const node of record.addedNodes)if(node.nodeType===1)mark(node);});
    if(!dirty.size||pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const roots=[...dirty.keys()];dirty.clear();for(const node of roots)if(node.isConnected)clean(node,node.id!=='m2LayoutSvg'&&!node.classList.contains('rafex-drag-scene-v248'));});
  }
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});`);
 const runtime=fs.readFileSync(new URL('../client/direct-vector-pdf.js',import.meta.url),'utf8'),end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script>'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-direct-vector-pdf-v283.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 fs.mkdirSync('dist/pdf-export',{recursive:true});for(const file of fs.readdirSync('assets/pdf-export'))fs.copyFileSync('assets/pdf-export/'+file,'dist/pdf-export/'+file);
}

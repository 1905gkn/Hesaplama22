import fs from 'node:fs';
export function transform(html){
 if(html.includes('scan-delete-protections-v313'))return html;
 const anchor='<span>Bariyer Koruma</span></button>';
 if(!html.includes(anchor))throw Error('Protection dialog anchor missing');
 html=html.replace(anchor,anchor+'<button type="button" id="m2DeleteProtectionsButton" class="m2-protection-choice" onclick="rafexDeleteProtectionsV313()"><span>Korumaları Sil</span></button>');
 const label='m2ProtectionDraft.type==="barrier"?"BARİYER ALANI":m2ProtectionDraft.type.toUpperCase()+" · AYAK KORUMA ALANI"';
 if(!html.includes(label))throw Error('Scan label missing');
 html=html.replace(label,'m2ProtectionDraft.type==="delete-protections"?"AYAK KORUMA SİLME ALANI":'+label);
 const runtime=`<script>
/* scan-delete-protections-v313 */
(()=>{
 window.rafexDeleteProtectionsV313=function(){
  m2ClearAllSelections();m2CloseProtectionDialog();
  m2ProtectionDraft={type:'delete-protections',start:null,hover:null};
  document.getElementById('m2ProtectionButton')?.classList.add('active');
  document.getElementById('m2FloorStatus').textContent='Ayak korumalarını silmek istediğin alanı basılı tutup tarayarak seç.';
  m2RenderLayout();
 };
 const commit=m2CommitProtectionArea;
 m2CommitProtectionArea=function(){
  const draft=m2ProtectionDraft;
  if(draft?.type!=='delete-protections')return commit.apply(this,arguments);
  if(!draft.start||!draft.hover)return;
  m2SyncAttachedProtections();
  const left=Math.min(draft.start.x,draft.hover.x),right=Math.max(draft.start.x,draft.hover.x),top=Math.min(draft.start.y,draft.hover.y),bottom=Math.max(draft.start.y,draft.hover.y);
  const ids=new Set(m2LayoutSymbols.filter(s=>{
   if(!/^(uaks|uakz)$/.test(s.type))return false;
   const x=Number(s.x)+Number(s.w)/2,y=Number(s.y)+Number(s.h)/2;
   return x>=left&&x<=right&&y>=top&&y<=bottom;
  }).map(s=>s.id));
  if(ids.size){m2PushUndo('Ayak korumalarını silme');m2LayoutSymbols=m2LayoutSymbols.filter(s=>!ids.has(s.id));if(ids.has(m2SelectedSymbolId))m2SelectedSymbolId=null;}
  m2ProtectionDraft=null;document.getElementById('m2ProtectionButton')?.classList.remove('active');m2RenderLayout();
  document.getElementById('m2FloorStatus').textContent=ids.size?fmt(ids.size)+' ayak koruma silindi.':'Taranan alanda ayak koruma bulunamadı.';
 };
})();
</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing document body');
 return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-scan-delete-protections-v313.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

import fs from 'node:fs';

export function regionsRuntimeV179(){
 'use strict';
 const $=id=>document.getElementById(id),clone=v=>JSON.parse(JSON.stringify(v));
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const racks=()=>m2LayoutState.racks||[],symbols=()=>m2LayoutSymbols||[];
 const status=t=>{if($('m2FloorStatus'))$('m2FloorStatus').textContent=t;};
 const overlap=(a,b)=>a.left<b.right-.01&&a.right>b.left+.01&&a.top<b.bottom-.01&&a.bottom>b.top+.01;
 let selecting=false,start=null,end=null,draft=null,frame=0;
 function groups(){
  const map=new Map();
  for(const [kind,items] of [['racks',racks()],['symbols',symbols()]])for(const item of items){
   const region=item.rafexRegionV179,key=region?.id||'';
   if(!map.has(key))map.set(key,{id:key,name:region?.name||'Ayrılmamış bölge',color:region?.color||'#267952',paint:!!region?.paint,box:region?.box,racks:[],symbols:[]});
   map.get(key)[kind].push(item.id);
  }
  return [...map.values()];
 }
 function listSections(){
  const parts=groups();if(!parts.some(g=>g.id))return null;
  return parts.map(g=>{
   const rows=window.rafexRegionInventoryV179(g.racks,g.symbols);
   return '<section class="rafex-product-system-section rafex-region-products"><b class="rafex-product-system-title">'+escape(g.name)+'<small>'+g.racks.length+' blok</small></b>'+rows.map(r=>'<span class="m2-layout-product"><span class="rafex-product-copy"><span class="rafex-product-name">'+escape(r.name)+'</span><small>'+escape(r.spec)+'</small></span><strong class="rafex-product-qty">'+r.qty+' '+escape(r.unit)+'</strong></span>').join('')+'</section>';
  });
 }
 window.rafexRegionSectionsV179=listSections;
 window.rafexRegionGroupsV179=groups;
 function draw(){
  const svg=$('m2LayoutSvg');if(!svg)return;
  svg.querySelectorAll('[data-regions-v179],[data-region-ground-v180]').forEach(n=>n.remove());
  const painted=groups().filter(g=>g.id&&g.paint);if(!painted.length&&!(selecting&&start&&end))return;
  const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');layer.setAttribute('data-regions-v179','');layer.setAttribute('pointer-events','none');
  const ground=document.createElementNS(ns,'g');ground.setAttribute('data-region-ground-v180','');ground.setAttribute('pointer-events','none');
  function rectangle(box,color,name,preview=false,id=''){
   const rect=document.createElementNS(ns,'rect');
   for(const [k,v] of Object.entries({x:box.left,y:box.top,width:box.right-box.left,height:box.bottom-box.top,fill:color,'fill-opacity':preview?.10:.24,stroke:color,'stroke-width':2,'vector-effect':'non-scaling-stroke'}))rect.setAttribute(k,v);
   if(preview)rect.setAttribute('stroke-dasharray','6 4');(preview?layer:ground).appendChild(rect);
   if(name){
    const key='region:'+id,offset=m2DimensionOffsets[key]||{},label=document.createElementNS(ns,'text');label.textContent=name;
    for(const [k,v] of Object.entries({x:(box.left+box.right)/2+(Number(offset.x)||0),y:(box.top+box.bottom)/2+(Number(offset.y)||0),fill:color,'font-size':m2DimensionFontSizes[key]||18,'font-weight':800,'text-anchor':'middle','dominant-baseline':'middle','paint-order':'stroke',stroke:'#fff','stroke-width':3}))label.setAttribute(k,v);
    if(!preview){label.setAttribute('data-dimension-key',key);label.setAttribute('data-dimension-axis','free');label.classList.add('m2-dimension-movable');label.style.pointerEvents=m2LayoutTool==='dimension'?'all':'none';label.style.cursor='move';}
    layer.appendChild(label);
   }
  }
  for(const g of painted){
   const ids=new Set(g.racks),ss=new Set(g.symbols),boxes=racks().filter(r=>ids.has(r.id)).map(r=>m2RackBounds(r));
   symbols().filter(s=>ss.has(s.id)).forEach(s=>boxes.push({left:s.x,top:s.y,right:s.x+s.w,bottom:s.y+s.h}));
   const saved=g.box,valid=saved&&['left','right','top','bottom'].every(k=>Number.isFinite(saved[k]))&&saved.right>saved.left&&saved.bottom>saved.top;
   if(valid||boxes.length)rectangle(valid?saved:{left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))},/^#[0-9a-f]{6}$/i.test(g.color)?g.color:'#267952',g.name,false,g.id);
  }
  if(selecting&&start&&end)rectangle({left:Math.min(start.x,end.x),right:Math.max(start.x,end.x),top:Math.min(start.y,end.y),bottom:Math.max(start.y,end.y)},'#267952','AYRAÇ SEÇİMİ',true);
  const content=$('m2LayoutContent')||svg,floor=content.querySelector('.m2-floor-area-inner');
  if(floor)floor.after(ground);else content.prepend(ground);
  svg.appendChild(layer);
 }
 function cancel(){selecting=false;start=end=draft=null;$('rafexRegionDialogV179')?.close();$('m2LayoutSvg')?.classList.remove('rafex-region-selecting');draw();}
 function begin(){
  if($('m2PanV168')?.classList.contains('active'))$('m2PanV168').click();
  const pick=$('rafexPickBlocksV145');if(pick?.classList.contains('active'))pick.click();
  m2ClearAllSelections();cancel();selecting=true;$('m2LayoutSvg')?.classList.add('rafex-region-selecting');
  status('Ayraç: fareyle bir dikdörtgen çizerek bölgeyi seç. Esc: vazgeç.');
 }
 function choose(box){
  const inside=(x,y)=>x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom;
  const rr=racks().filter(r=>inside(r.x+r.w/2,r.y+r.h/2)),ids=new Set(rr.map(r=>r.id));
  const ss=symbols().filter(s=>ids.has(s.rackId)||(s.rackId==null&&inside(s.x+s.w/2,s.y+s.h/2)));
  if(!rr.length&&!ss.length){cancel();status('Seçilen bölgede blok veya aksesuar yok.');return;}
  draft={racks:[...ids],symbols:ss.map(s=>s.id),box:{...box}};selecting=false;start=end=null;$('m2LayoutSvg')?.classList.remove('rafex-region-selecting');draw();
  const counts=new Map();rr.forEach(r=>{const key=r.typeName||r.blockName||'Raf';counts.set(key,(counts.get(key)||0)+1)});
  const rows=window.rafexRegionInventoryV179(draft.racks,draft.symbols);
  let dialog=$('rafexRegionDialogV179');if(!dialog){dialog=document.createElement('dialog');dialog.id='rafexRegionDialogV179';document.body.appendChild(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});}
  dialog.innerHTML='<h3>Ayraç · Bölge sayımı</h3><p>'+rr.length+' blok · '+ss.length+' aksesuar</p><p>'+[...counts].map(([n,q])=>escape(n)+' × '+q).join(' · ')+'</p><div class="region-counts">'+rows.map(r=>'<div><span>'+escape(r.name)+' <small>'+escape(r.spec)+'</small></span><b>'+r.qty+' '+escape(r.unit)+'</b></div>').join('')+'</div><button type="button" data-edit>Renklendir ve isimlendir</button><div data-fields hidden><label>Alan adı<input data-name maxlength="80" placeholder="Örn. Sevkiyat Alanı"></label><label>Renk<input data-color type="color" value="#267952"></label></div><p>Ayır: çizimi renklendir ve ürün listesini ayır. Tamam: yalnızca ürün listesini ayır.</p><div class="region-actions"><button type="button" data-paint>Ayır</button><button type="button" data-list>Tamam</button><button type="button" data-cancel>Vazgeç</button></div>';
  dialog.querySelector('[data-edit]').onclick=()=>{dialog.querySelector('[data-fields]').hidden=false;dialog.querySelector('[data-name]').focus();};
  dialog.querySelector('[data-paint]').onclick=()=>commit(true);dialog.querySelector('[data-list]').onclick=()=>commit(false);dialog.querySelector('[data-cancel]').onclick=cancel;dialog.showModal();
 }
 function commit(paint){
  if(!draft)return;const dialog=$('rafexRegionDialogV179');
  const region={id:crypto.randomUUID(),name:dialog.querySelector('[data-name]').value.trim()||'Bölge '+(groups().filter(g=>g.id).length+1),color:dialog.querySelector('[data-color]').value,paint,box:{...draft.box}};
  m2PushUndo('Ayraç oluşturma');const rr=new Set(draft.racks),ss=new Set(draft.symbols);
  racks().filter(r=>rr.has(r.id)).forEach(r=>r.rafexRegionV179={...region});symbols().filter(s=>ss.has(s.id)).forEach(s=>s.rafexRegionV179={...region});
  cancel();m2RenderLayout();m2RenderLayoutProductList();status(region.name+(paint?' renklendirildi ve ayrı hesaplandı.':' yalnızca ürün listesinde ayrı hesaplandı.'));
 }
 function repeat(){
  const count=Number($('rafexRepeatCountV179')?.value);
  if(!Number.isInteger(count)||count<1||count>1000){status('Eklenecek blok adedini 1–1000 arasında tam sayı olarak yaz.');return false;}
  const source=racks().find(r=>r.id===(m2AutoFillDraft?.rackId??m2LayoutState.selected));
  if(!source){status('Önce çoğaltılacak bir blok seç.');return false;}
  const dir=Number($('rafexRepeatDirectionV179')?.value)||1,a=(source.angle||0)*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),scale=m2LayoutState.scale;
  if(source.freePlacement||source.staged||!m2RackInsideArea(source)){status('Önce kaynak bloğu alan içinde geçerli bir konuma yerleştir.');return false;}
  const shared=!!source.b2bLayout&&!source.b2b?.mr&&source.rafexSystem!=='mr',foot=shared?m2B2BFootWidth(source)*scale:0;
  const aligned=racks().filter(r=>r.id===source.id||(source.joinGroup&&r.joinGroup===source.joinGroup&&Math.abs((r.angle||0)-(source.angle||0))<.01&&Math.abs((r.x+r.w/2-source.x-source.w/2)*uy-(r.y+r.h/2-source.y-source.h/2)*ux)<.1));
  let anchor=aligned.reduce((best,r)=>dir*((r.x+r.w/2)*ux+(r.y+r.h/2)*uy)>dir*((best.x+best.w/2)*ux+(best.y+best.h/2)*uy)?r:best,source);
  const first=anchor,planned=[],accessories=[],attached=symbols().filter(s=>s.rackId===source.id);
  let id=Math.max(Date.now(),...racks().map(r=>Number(r.id)||0),...symbols().map(s=>Number(s.id)||0))+1;
  const group=anchor.joinGroup||'repeat-'+id;
  for(let i=0;i<count;i++){
   const copy=clone(source);copy.id=id++;copy.x=anchor.x+anchor.w/2+dir*ux*((anchor.w+copy.w)/2-foot)-copy.w/2;copy.y=anchor.y+anchor.h/2+dir*uy*((anchor.w+copy.w)/2-foot)-copy.h/2;
   copy.joinGroup=shared?group:null;copy.sharedFootWith=shared?anchor.id:null;copy.sharedFootSide=shared?(dir>0?'left':'right'):null;copy.freePlacement=false;copy.staged=false;copy.locked=true;
   if(copy.independentBlockId)copy.independentBlockId='independent-'+copy.id;
   delete copy.rafexRegionV179;
   copy.seismicBraces=(copy.seismicBraces||[]).filter(b=>(b.rackIds||[]).every(v=>v===source.id)).map(b=>({...b,id:id++,rackIds:[copy.id]}));
   const box=m2RackBounds(copy);
   if(!m2RackInsideArea(copy)||m2RackOverlapsExcept(copy,copy.x,copy.y,copy.angle,shared?[anchor.id]:[])||planned.some(r=>r.id!==anchor.id&&overlap(box,m2RackBounds(r)))){
    status(count+' blok için yeterli çakışmasız alan yok. Hiçbir blok eklenmedi.');return false;
   }
   for(const item of attached){const c=clone(item);c.id=id++;c.rackId=copy.id;c.x+=copy.x-source.x;c.y+=copy.y-source.y;delete c.rafexRegionV179;accessories.push(c);}
   planned.push(copy);anchor=copy;
  }
  m2PushUndo('Adet ile blok ekleme');if(shared)first.joinGroup=group;racks().push(...planned);symbols().push(...accessories);
  m2AutoFillDraft=null;m2SetAutoFillControlsActive(false);m2LayoutState.selected=planned.at(-1).id;m2RenderLayout();status(count+' yeni blok yan yana eklendi.');return true;
 }
 function install(){
  const host=$('m2AutoFillControls'),pick=$('rafexPickBlocksV145');
  if(host&&!$('rafexRepeatV179')){const row=document.createElement('div');row.id='rafexRepeatV179';row.innerHTML='<label>Eklenecek blok adedi<input id="rafexRepeatCountV179" type="number" min="1" max="1000" step="1" value="1"></label><label>Yön<select id="rafexRepeatDirectionV179"><option value="1">Sağa / ileri</option><option value="-1">Sola / geri</option></select></label><button type="button">Tamam · Blok Ekle</button>';host.appendChild(row);row.querySelector('button').onclick=repeat;row.querySelector('input').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();repeat();}};}
  if(host&&$('rafexRepeatV179')){
   const toggle=host.querySelector('.rafex-extension-toggle');let head=host.querySelector('.rafex-repeat-head');
   if(toggle&&!head){head=document.createElement('div');head.className='rafex-repeat-head';host.prepend(head);head.appendChild(toggle);}
   const parent=head||host;if($('rafexRepeatV179').parentElement!==parent)parent.appendChild($('rafexRepeatV179'));
  }
  if(pick&&!$('rafexRegionV179')){const b=document.createElement('button');b.type='button';b.id='rafexRegionV179';b.textContent='Ayraç';b.onclick=begin;pick.after(b);}
  $('rafexRepeatV179')?.querySelectorAll('input,select,button').forEach(n=>{if(n.disabled)n.disabled=false;});
 }
 function point(e){const svg=$('m2LayoutSvg'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
 window.addEventListener('pointerdown',e=>{if(!selecting||!$('m2LayoutSvg')?.contains(e.target)||e.button!==0)return;stop(e);start=end=point(e);$('m2LayoutSvg').setPointerCapture(e.pointerId);draw();},true);
 window.addEventListener('pointermove',e=>{if(!selecting||!start)return;stop(e);end=point(e);if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});},true);
 window.addEventListener('pointerup',e=>{if(!selecting||!start)return;stop(e);end=point(e);$('m2LayoutSvg').releasePointerCapture?.(e.pointerId);choose({left:Math.min(start.x,end.x),right:Math.max(start.x,end.x),top:Math.min(start.y,end.y),bottom:Math.max(start.y,end.y)});},true);
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&(selecting||draft)){stop(e);cancel();}},true);
 window.addEventListener('pointercancel',()=>{if(selecting)cancel();},true);
 const base=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=base.apply(this,arguments);install();draw();return result;};
 let scheduled=false;new MutationObserver(()=>{if(scheduled)return;const host=$('m2AutoFillControls');if((host&&(!$('rafexRepeatV179')||$('rafexRepeatV179').parentElement!==(host.querySelector('.rafex-repeat-head')||host)))||($('rafexPickBlocksV145')&&!$('rafexRegionV179'))){scheduled=true;requestAnimationFrame(()=>{scheduled=false;install();});}}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',()=>queueMicrotask(install));
 window.rafexRegionsV179={begin,choose,cancel,repeat,groups};install();
}

export function transform(html){
 if(html.includes('data-regions-repeat="v179"'))return html;
 const start=html.indexOf('<script data-rafex-layout-inventory="v44">'),end=html.indexOf('</script>',start);if(start<0||end<0)throw Error('Inventory runtime missing');
 let s=html.slice(start,end);
 const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing region anchor: '+a);s=s.replace(a,b);};
 replace('  function racks(){','  let regionScopeV179=null;\n  function allRacksV179(){');
 replace('  function symbols(){','  function allSymbolsV179(){');
 replace('  function accessories(){',`  function racks(){const all=allRacksV179();return regionScopeV179?all.filter(r=>regionScopeV179.racks.has(r.id)):all;}
  function symbols(){const all=allSymbolsV179();return regionScopeV179?all.filter(r=>regionScopeV179.symbols.has(r.id)):all;}
  window.rafexRegionInventoryV179=function(rackIds,symbolIds){const previous=regionScopeV179;try{regionScopeV179={racks:new Set(rackIds),symbols:new Set(symbolIds)};return rows();}finally{regionScopeV179=previous;}};
  function accessories(){`);
 replace('var signature=inventorySignature();',"var signature=inventorySignature()+'#'+JSON.stringify([...racks(),...symbols()].map(r=>r.rafexRegionV179||null));");
 replace("    host.classList.remove('rafex-system-product-lists');","    sections=window.rafexRegionSectionsV179?.()||sections;\n    host.classList.remove('rafex-system-product-lists');");
 html=html.slice(0,start)+s+html.slice(end);
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+`<style data-regions-repeat="v179">
 .rafex-repeat-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.rafex-repeat-head>.rafex-extension-toggle{flex:1;min-width:180px;width:auto!important}
 #rafexRepeatV179{display:flex;align-items:end;gap:8px;padding:9px 12px;flex-wrap:wrap;background:#f3f8f5}
 #rafexRepeatV179 label{display:grid;gap:4px;font-size:11px;font-weight:700}#rafexRepeatV179 input{width:100px!important}#rafexRepeatV179 select{width:145px}#rafexRepeatV179 button{background:#174a35;color:white}
 #page:not(.rafex-free-drawing-page):not([data-rafex-free-drawing="1"]):not([data-rafex-workflow-screen="layout"]) #rafexRepeatV179{display:none}
 #rafexRegionV179{display:block;flex-basis:100%;grid-column:1/-1}#m2LayoutSvg.rafex-region-selecting,#m2LayoutSvg.rafex-region-selecting *{cursor:crosshair!important}
 #rafexRegionDialogV179{width:min(620px,90vw);max-height:85vh;overflow:auto;border:1px solid #abc4b5;border-radius:14px;padding:22px;color:#173c2d}#rafexRegionDialogV179::backdrop{background:#102e25aa}
 #rafexRegionDialogV179 .region-counts{max-height:35vh;overflow:auto;margin:12px 0}#rafexRegionDialogV179 .region-counts>div{display:flex;justify-content:space-between;gap:16px;padding:8px;border-bottom:1px solid #e2eae5}#rafexRegionDialogV179 small{display:block;color:#66796d}#rafexRegionDialogV179 label{display:inline-grid;gap:6px;margin:12px 12px 0 0}#rafexRegionDialogV179 .region-actions{display:flex;gap:8px;justify-content:flex-end}#rafexRegionDialogV179 [data-paint],#rafexRegionDialogV179 [data-list]{background:#174a35;color:white}.rafex-region-products .rafex-product-system-title{flex-direction:column!important;align-items:flex-start!important;gap:6px}.rafex-region-products .rafex-product-system-title small{display:block}
 </style><script>${regionsRuntimeV179.toString()}\nregionsRuntimeV179();</script>`+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-regions-repeat-v179.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

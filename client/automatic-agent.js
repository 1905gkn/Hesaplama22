(function(){
 const $=id=>document.getElementById(id),copy=x=>JSON.parse(JSON.stringify(x));let panel,pending,busy=false,serial=0;
 const stamp=()=>JSON.stringify([window.rafexProjectIdentityV133?.uuid,m2LayoutState,m2LayoutSymbols,window.rafexProjectTypesV133]);
 const status=s=>panel.querySelector('[data-agent-status]').textContent=s;
 function cancel(){serial++;pending=null;if(panel){panel.querySelector('[data-agent-apply]').disabled=true;panel.querySelector('[data-agent-preview]').replaceChildren();}}
 function catalog(){return (window.rafexProjectTypesV133||[]).map(e=>{let d=copy(e.__rafexSnapshot||e.drawing||{}),system=e.__rafexSystem||e.system||d.rafexSystem||(d.b2b?.mr?'mr':d.b2b?'b2b':'mekik2');system=({'drive-in':'drive',mekik:'mekik2'})[system]||system;if(d.b2b)d=b2bLayoutDrawing(d);return {key:system+':'+e.id,name:String(e.name||e.id),system,width:Number(d.totalWidth),depth:Number(d.railLength),drawing:d};}).filter(t=>t.width>0&&t.depth>0&&['b2b','mr','mekik2','drive','konsol'].includes(t.system));}
 function context(){
  if(!window.rafexProjectIdentityV133?.uuid)throw Error('Önce proje aç veya oluştur.');const types=catalog();if(!types.length||types.length>20)throw Error('Projede 1–20 kayıtlı raf tipi gerekli.');
  const scale=Number(m2LayoutState.scale),points=m2LayoutState.points||[];
  if(!(scale>0)||!m2LayoutState.closed||points.length<3)throw Error('Önce Serbest Yerleşim Alanı’nda kapalı depo sınırını çiz ve tamamla.');
  const bounds={left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
  const aisle=Number(panel.querySelector('[data-agent-aisle]').value),margin=Number(panel.querySelector('[data-agent-margin]').value);
  if(!Number.isFinite(aisle)||aisle<500||aisle>20000||!Number.isFinite(margin)||margin<0||margin>20000)throw Error('Koridor 500–20.000 mm, duvar payı 0–20.000 mm olmalı.');
  return {types,scale,bounds,aisle,margin,width:Math.round((bounds.right-bounds.left)/scale),depth:Math.round((bounds.bottom-bounds.top)/scale),existingCount:m2LayoutState.racks.length};
 }
 const overlap=(a,b)=>a.left<b.right-.001&&a.right>b.left+.001&&a.top<b.bottom-.001&&a.bottom>b.top+.001;
 function wallClearance(box,margin){
  const points=m2LayoutState.points,corners=[{x:box.left,y:box.top},{x:box.right,y:box.top},{x:box.right,y:box.bottom},{x:box.left,y:box.bottom}];
  const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];for(let j=0;j<4;j++){const c=corners[j],d=corners[(j+1)%4];if(Math.min(distance(a,c,d),distance(b,c,d),distance(c,a,b),distance(d,a,b))<margin-.001)return false;}}return true;
 }
 function pack(plan,c){
  const racks=[],counts=[],gap=c.aisle*c.scale,margin=c.margin*c.scale,b=c.bounds;let id=Math.max(Date.now(),...m2LayoutState.racks.map(r=>Number(r.id)||0))+1,attempts=0;
  const oldBoxes=m2LayoutState.racks.map(r=>m2RackBounds(r));
  for(const item of plan.items){const t=c.types.find(t=>t.key===item.typeKey);if(!t)throw Error('Bilinmeyen raf tipi.');const w=(item.angle===90?t.depth:t.width)*c.scale,h=(item.angle===90?t.width:t.depth)*c.scale;let count=0;
   for(let y=b.top+margin;y+h<=b.bottom-margin+.001&&count<(item.count||500);y+=h+gap){
    for(let x=b.left+margin;x+w<=b.right-margin+.001&&count<(item.count||500);x+=w+Math.max(c.scale*100,.1)){
     if(++attempts>30000)throw Error('Tarama sınırı aşıldı; daha az tip kullan.');if(racks.length>=500)break;
     const r={...copy(t.drawing),id:id++,typeName:t.name,typeColor:m2TypeColor(t.name),rafexCatalogKey:t.key,rafexSystem:t.system,widthMm:t.width,depthMm:t.depth,w:t.width*c.scale,h:t.depth*c.scale,angle:item.angle,specLocked:true,staged:false,freePlacement:false,locked:true};r.x=x+w/2-r.w/2;r.y=y+h/2-r.h/2;
     const box=m2RackBounds(r),padded={...box,top:box.top-gap,bottom:box.bottom+gap};
     if(!m2RackInsideArea(r)||!wallClearance(box,margin)||m2RackOverlaps(r)||oldBoxes.some(o=>overlap(padded,o))||racks.some(p=>{const q=m2RackBounds(p);return overlap(box,q)||(Math.abs(q.top-box.top)>.001&&overlap(padded,q));}))continue;
     racks.push(r);count++;
    }if(racks.length>=500)break;
   }
   if(item.count&&count!==item.count)throw Error(t.name+': '+item.count+' blok istendi, yalnız '+count+' blok sığıyor. Hiçbir şey uygulanmadı.');counts.push(t.name+': '+count+' blok');
  }
  if(!racks.length)throw Error('Bu ayarlarla boş yer bulunamadı.');return {racks,counts};
 }
 function preview(result,c){
  const box=panel.querySelector('[data-agent-preview]');box.replaceChildren();const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),b=c.bounds;
  svg.setAttribute('viewBox',[b.left-10,b.top-10,b.right-b.left+20,b.bottom-b.top+20].join(' '));svg.setAttribute('aria-label','Agent yerleşim önizlemesi');svg.setAttribute('role','img');
  const polygon=document.createElementNS(ns,'polygon');polygon.setAttribute('points',m2LayoutState.points.map(p=>p.x+','+p.y).join(' '));polygon.setAttribute('fill','#fff');polygon.setAttribute('stroke','#173c2d');svg.append(polygon);
  for(const [list,color]of [[m2LayoutState.racks,'#9ca8a2'],[result.racks,'#22a572']])for(const r of list){const rect=document.createElementNS(ns,'rect');for(const [k,v]of Object.entries({x:r.x,y:r.y,width:r.w,height:r.h,fill:color,stroke:'white','stroke-width':.5,transform:'rotate('+(r.angle||0)+' '+(r.x+r.w/2)+' '+(r.y+r.h/2)+')'}))rect.setAttribute(k,v);svg.append(rect);}
  const text=document.createElement('p');text.textContent=result.counts.join(' · ')+' — Yeşil: önerilen, gri: mevcut. Mevcut raflar silinmez.';box.append(svg,text);
 }
 async function ask(){
  if(busy)return;cancel();let c;try{c=context();}catch(e){status(e.message);return;}const prompt=panel.querySelector('textarea').value.trim();if(!prompt){status('Talebini yaz.');return;}
  const before=stamp(),version=serial;busy=true;panel.querySelector('[data-agent-ask]').disabled=true;status('Alan ve kayıtlı tipler değerlendiriliyor…');
  try{const response=await fetch('/api/layout-agent',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'automatic',requestId:crypto.randomUUID(),prompt,context:{...c,scale:undefined,bounds:undefined,types:c.types.map(({drawing,...t})=>t)}})});const data=await response.json();if(version!==serial)return;if(!response.ok)throw Error(data.error||'Öneri alınamadı.');if(before!==stamp())throw Error('Proje değişti; öneri iptal edildi.');if(data.plan.action==='clarify'){status(data.plan.reason);return;}
   const result=pack(data.plan,c);pending={result,c,before};preview(result,c);panel.querySelector('[data-agent-apply]').disabled=false;status(data.plan.reason+' Önizlemeyi kontrol edip uygula. Bu plan mühendislik veya kaçış yolu onayı değildir.');
  }catch(e){if(version===serial)status(e.message);}finally{busy=false;panel.querySelector('[data-agent-ask]').disabled=false;}
 }
 function apply(){try{if(!pending)return;if(pending.before!==stamp())throw Error('Proje değişti; yeni öneri oluştur.');const {racks}=pending.result;if(racks.some(r=>!m2RackInsideArea(r)||m2RackOverlaps(r)))throw Error('Yerleşim kontrolü geçmedi.');m2PushUndo('Agent otomatik yerleşim');m2LayoutState.racks.push(...copy(racks));m2LayoutState.selected=null;cancel();m2RenderLayout();m2RenderLayoutProductList();m2RefreshActiveReport();status('Uygulandı. Projeyi Kaydet ile saklayabilir, Geri Al ile geri döndürebilirsin.');}catch(e){cancel();status(e.message);}}
 function install(){const dialog=$('rafexPdfAutoDialog');if(!dialog||panel)return;
  dialog.querySelector('h2').textContent='Otomatik Yerleşim';
  const pdf=document.createElement('details');pdf.dataset.pdfWorkflow='';pdf.innerHTML='<summary>PDF / PNG’den yerleşim</summary>';while(dialog.children.length>1)pdf.append(dialog.children[1]);dialog.append(pdf);
  panel=document.createElement('section');panel.id='rafexAgentV188';panel.innerHTML='<h3>Agent ile yerleşim</h3><p>Çizilmiş depo alanı ve bu projenin kayıtlı raf tipleri kullanılır. Tek raf seçmen gerekmez.</p><label>Koridor genişliği (mm)<input data-agent-aisle type="number" min="500" max="20000" value="3000"></label><label>Duvar payı (mm)<input data-agent-margin type="number" min="0" max="20000" value="500"></label><label>Yerleşim talebi<textarea maxlength="1200" rows="3" placeholder="A tipinden 20, B tipinden 10 blok yerleştir."></textarea></label><small>GPT-5.6 Sol · düşük düşünme. İstek başına en fazla 0,10 $, toplam kota 25 $. Her istekte 0,10 $ kota ayrılır; gerçek fatura değildir. Talep, alan ölçüleri ve raf tipi adları/ölçüleri OpenAI’a gönderilir. Koridor ve duvar payını kullanımınıza göre doğrulayın.</small><div><button data-agent-ask>Öneri oluştur</button> <button data-agent-apply disabled>Önizlemeyi uygula</button> <button data-agent-cancel>Öneriden vazgeç</button></div><p data-agent-status role="status">Kapalı depo alanını ve kayıtlı tipleri hazırlayıp talebini yaz.</p><div data-agent-preview></div>';pdf.before(panel);
  panel.querySelector('[data-agent-ask]').onclick=ask;panel.querySelector('[data-agent-apply]').onclick=apply;panel.querySelector('[data-agent-cancel]').onclick=()=>{cancel();status('Öneri iptal edildi.');};panel.addEventListener('input',()=>{cancel();status('Ayar değişti; yeniden öneri oluştur.');});dialog.addEventListener('close',cancel);
 }
 document.addEventListener('click',e=>{if(e.target.closest('#rafexAutoLayoutButton'))requestAnimationFrame(install);});window.rafexAutomaticAgent={install,pack,catalog};
})();

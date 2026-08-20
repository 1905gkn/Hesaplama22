import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Onceki iki runtime ayni kat tiklamasini farkli katmanlarda sardigi icin tekli K secimi
// guvenilmez hale geliyordu. Son build asamasinda bu iki runtime'i kaldirip tek akista birlestir.
html = html
  .replace(/<style\s+data-rafex-tunnel-tray-level-fix-style=["']v1["'][^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<script\s+data-rafex-tunnel-tray-level-fix=["']v1["'][^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\s+data-rafex-customize-levels-performance-style=["']v1["'][^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<script\s+data-rafex-customize-levels-performance=["']v1["'][^>]*>[\s\S]*?<\/script>/gi, "");

const marker = 'data-rafex-between-measure-levels="v1"';
if (!html.includes(marker)) {
  const runtime = `<style data-rafex-between-measure-levels-style="v1">
#m2BetweenMeasureButton.active{background:#214f3b!important;color:#fff!important}
.m2-between-measure-line{stroke:#2b8bb5;stroke-width:1.6;fill:none;vector-effect:non-scaling-stroke}
.m2-between-measure-tick{stroke:#2b8bb5;stroke-width:1.4;vector-effect:non-scaling-stroke}
.m2-between-measure-label-bg{fill:#102a4d;stroke:#fff;stroke-width:1;rx:5}
.m2-between-measure-label{fill:#fff;font-size:13px;font-weight:900;paint-order:stroke;stroke:#102a4d;stroke-width:.6px;pointer-events:none}
.m2-between-first-select{fill:none;stroke:#f2c500;stroke-width:2.5;stroke-dasharray:8 5;vector-effect:non-scaling-stroke;pointer-events:none}
#m2CustomizeModal .m2-customize-dialog{contain:layout paint style}
</style><script ${marker}>(function(){
  if(window.__rafexBetweenMeasureLevelsV1)return;
  window.__rafexBetweenMeasureLevelsV1=true;
  const byId=(id)=>document.getElementById(id);
  const status=(text)=>{const el=byId('m2FloorStatus');if(el)el.textContent=text;};
  const rackById=(id)=>{try{return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find((r)=>Number(r.id)===Number(id)):null;}catch{return null;}};
  const rackBounds=(rack)=>{try{return typeof m2CombinedRackBounds==='function'?m2CombinedRackBounds(rack):m2RackBounds(rack);}catch{return {left:rack.x,right:rack.x+rack.w,top:rack.y,bottom:rack.y+rack.h,cx:rack.x+rack.w/2,cy:rack.y+rack.h/2};}};
  const measures=()=>{try{if(!Array.isArray(m2LayoutState.betweenMeasures))m2LayoutState.betweenMeasures=[];m2LayoutState.betweenMeasures=m2LayoutState.betweenMeasures.filter((m)=>rackById(m.aId)&&rackById(m.bId));return m2LayoutState.betweenMeasures;}catch{return [];}};

  let betweenActive=false, firstRackId=null, editingMeasureId=null, activeCustomizeRackId=null;
  function geom(a,b){
    const A=rackBounds(a),B=rackBounds(b), clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    if(A.right<=B.left){const y=clamp((A.cy+B.cy)/2,Math.max(A.top,B.top),Math.min(A.bottom,B.bottom));return{axis:'horizontal',direction:'right',p1:{x:A.right,y},p2:{x:B.left,y},distance:B.left-A.right};}
    if(B.right<=A.left){const y=clamp((A.cy+B.cy)/2,Math.max(A.top,B.top),Math.min(A.bottom,B.bottom));return{axis:'horizontal',direction:'left',p1:{x:A.left,y},p2:{x:B.right,y},distance:A.left-B.right};}
    if(A.bottom<=B.top){const x=clamp((A.cx+B.cx)/2,Math.max(A.left,B.left),Math.min(A.right,B.right));return{axis:'vertical',direction:'down',p1:{x,y:A.bottom},p2:{x,y:B.top},distance:B.top-A.bottom};}
    if(B.bottom<=A.top){const x=clamp((A.cx+B.cx)/2,Math.max(A.left,B.left),Math.min(A.right,B.right));return{axis:'vertical',direction:'up',p1:{x,y:A.top},p2:{x,y:B.bottom},distance:A.top-B.bottom};}
    const horizontal=Math.abs(B.cx-A.cx)>=Math.abs(B.cy-A.cy);
    if(horizontal){const right=B.cx>=A.cx;return{axis:'horizontal',direction:right?'right':'left',p1:{x:right?A.right:A.left,y:(A.cy+B.cy)/2},p2:{x:right?B.left:B.right,y:(A.cy+B.cy)/2},distance:Math.max(0,right?B.left-A.right:A.left-B.right)};}
    const down=B.cy>=A.cy;return{axis:'vertical',direction:down?'down':'up',p1:{x:(A.cx+B.cx)/2,y:down?A.bottom:A.top},p2:{x:(A.cx+B.cx)/2,y:down?B.top:B.bottom},distance:Math.max(0,down?B.top-A.bottom:A.top-B.bottom)};
  }
  function fmtMm(mm){try{return Number(mm).toLocaleString('tr-TR');}catch{return String(mm);}}
  function renderBetweenOverlay(){
    const host=byId('m2LayoutContent');if(!host)return;
    host.querySelectorAll('[data-between-overlay]').forEach((n)=>n.remove());
    let out='';
    if(betweenActive&&firstRackId){const rack=rackById(firstRackId);if(rack){const b=rackBounds(rack);out+='<rect data-between-overlay="1" class="m2-between-first-select" x="'+(b.left-4)+'" y="'+(b.top-4)+'" width="'+(b.right-b.left+8)+'" height="'+(b.bottom-b.top+8)+'" rx="5"/>';}}
    measures().forEach((m)=>{const a=rackById(m.aId),b=rackById(m.bId);if(!a||!b)return;const g=geom(a,b),mm=Math.max(0,Math.round(g.distance/Math.max(.0001,Number(m2LayoutState.scale)||.04))),mx=(g.p1.x+g.p2.x)/2,my=(g.p1.y+g.p2.y)/2,key='between:'+m.id,pos=typeof m2DimensionPosition==='function'?m2DimensionPosition(key,mx,my-10):{x:mx,y:my-10},text='ARASI '+fmtMm(mm)+' mm',w=Math.max(94,70+String(mm).length*8),tick=g.axis==='horizontal'?'<line class="m2-between-measure-tick" x1="'+g.p1.x+'" y1="'+(g.p1.y-6)+'" x2="'+g.p1.x+'" y2="'+(g.p1.y+6)+'"/><line class="m2-between-measure-tick" x1="'+g.p2.x+'" y1="'+(g.p2.y-6)+'" x2="'+g.p2.x+'" y2="'+(g.p2.y+6)+'"/>':'<line class="m2-between-measure-tick" x1="'+(g.p1.x-6)+'" y1="'+g.p1.y+'" x2="'+(g.p1.x+6)+'" y2="'+g.p1.y+'"/><line class="m2-between-measure-tick" x1="'+(g.p2.x-6)+'" y1="'+g.p2.y+'" x2="'+(g.p2.x+6)+'" y2="'+g.p2.y+'"/>';
      out+='<g data-between-overlay="1"><line class="m2-between-measure-line" x1="'+g.p1.x+'" y1="'+g.p1.y+'" x2="'+g.p2.x+'" y2="'+g.p2.y+'"/>'+tick+'<rect data-between-measure-id="'+m.id+'" data-dimension-key="'+key+'" data-dimension-axis="'+g.axis+'" class="m2-between-measure-label-bg m2-dimension-movable" x="'+(pos.x-w/2)+'" y="'+(pos.y-15)+'" width="'+w+'" height="22"/><text class="m2-between-measure-label" x="'+pos.x+'" y="'+pos.y+'" text-anchor="middle">'+text+'</text></g>';
    });
    if(out)host.insertAdjacentHTML('beforeend',out);
  }
  function installButton(){
    if(byId('m2BetweenMeasureButton'))return;
    const anchor=byId('m2MeasureToolButton');if(!anchor)return;
    const button=document.createElement('button');button.type='button';button.id='m2BetweenMeasureButton';button.textContent='Arası Ölç';button.addEventListener('click',()=>window.m2ToggleBetweenMeasure());anchor.insertAdjacentElement('afterend',button);
  }
  function installModal(){
    if(byId('m2BetweenMeasureModal'))return;
    document.body.insertAdjacentHTML('beforeend','<div class="m2-measure-modal" id="m2BetweenMeasureModal" hidden><div class="m2-measure-dialog" role="dialog" aria-modal="true"><b>Raf arası ölçüyü değiştir</b><small>Yeni mesafeyi milimetre olarak yaz. İkinci seçilen raf bu değere göre taşınır.</small><input id="m2BetweenMeasureInput" type="number" min="0" step="1" inputmode="numeric"><div class="m2-measure-actions"><button type="button" id="m2BetweenCancel">Vazgeç</button><button type="button" class="primary" id="m2BetweenApply">Uygula</button></div></div></div>');
    byId('m2BetweenCancel')?.addEventListener('click',window.m2CancelBetweenMeasureEdit);byId('m2BetweenApply')?.addEventListener('click',window.m2ApplyBetweenMeasureEdit);byId('m2BetweenMeasureInput')?.addEventListener('keydown',(e)=>{if(e.key==='Enter')window.m2ApplyBetweenMeasureEdit();if(e.key==='Escape')window.m2CancelBetweenMeasureEdit();});
  }
  window.m2ToggleBetweenMeasure=function(){
    betweenActive=!betweenActive;firstRackId=null;try{m2LayoutTool=null;m2CustomizeMode=false;m2JoinMode=false;}catch{}
    byId('m2BetweenMeasureButton')?.classList.toggle('active',betweenActive);status(betweenActive?'ARASI ÖLÇ: İlk raf bloğuna tıkla.':'Arası Ölç kapatıldı.');renderBetweenOverlay();
  };
  window.m2EditBetweenMeasure=function(id){const m=measures().find((x)=>Number(x.id)===Number(id));if(!m)return;const a=rackById(m.aId),b=rackById(m.bId);if(!a||!b)return;editingMeasureId=m.id;const g=geom(a,b),input=byId('m2BetweenMeasureInput');if(input)input.value=String(Math.max(0,Math.round(g.distance/Math.max(.0001,Number(m2LayoutState.scale)||.04))));byId('m2BetweenMeasureModal').hidden=false;setTimeout(()=>input?.select(),0);};
  window.m2CancelBetweenMeasureEdit=function(){editingMeasureId=null;if(byId('m2BetweenMeasureModal'))byId('m2BetweenMeasureModal').hidden=true;};
  window.m2ApplyBetweenMeasureEdit=function(){
    const m=measures().find((x)=>Number(x.id)===Number(editingMeasureId));if(!m)return window.m2CancelBetweenMeasureEdit();const a=rackById(m.aId),b=rackById(m.bId);if(!a||!b)return window.m2CancelBetweenMeasureEdit();const desired=Math.max(0,Number(byId('m2BetweenMeasureInput')?.value)||0),scale=Math.max(.0001,Number(m2LayoutState.scale)||.04),g=geom(a,b),delta=desired*scale-g.distance,dx=g.direction==='right'?delta:g.direction==='left'?-delta:0,dy=g.direction==='down'?delta:g.direction==='up'?-delta:0,members=b.joinGroup?m2LayoutState.racks.filter((r)=>r.joinGroup===b.joinGroup):[b],before=members.map((r)=>({r,x:r.x,y:r.y}));
    try{if(typeof m2PushUndo==='function')m2PushUndo('Arası Ölç');members.forEach((r)=>{r.x+=dx;r.y+=dy;});const invalid=members.some((r)=>(typeof m2RackInsideArea==='function'&&!m2RackInsideArea(r))||(typeof m2RackOverlaps==='function'&&m2RackOverlaps(r)));if(invalid){before.forEach((s)=>{s.r.x=s.x;s.r.y=s.y;});if(typeof m2DiscardUndo==='function')m2DiscardUndo();status('Bu mesafe uygulanamadı: raf alan dışına çıkıyor veya başka bir nesneyle çakışıyor.');}else{try{m2SyncAttachedProtections?.();}catch{}status('İki raf arasındaki mesafe '+fmtMm(Math.round(desired))+' mm yapıldı.');}m2RenderLayout();}finally{window.m2CancelBetweenMeasureEdit();}
  };

  function installSvgCapture(){
    const svg=byId('m2LayoutSvg');if(!svg||svg.dataset.betweenMeasureBound==='1')return;svg.dataset.betweenMeasureBound='1';svg.addEventListener('pointerdown',(event)=>{
      const target=event.target instanceof Element?event.target:null;if(!target)return;
      const label=target.closest('[data-between-measure-id]');if(label){try{if(m2LayoutTool==='dimension')return;}catch{}event.preventDefault();event.stopImmediatePropagation();window.m2EditBetweenMeasure(Number(label.dataset.betweenMeasureId));return;}
      if(!betweenActive)return;const rackNode=target.closest('[data-rack]');if(!rackNode)return;event.preventDefault();event.stopImmediatePropagation();const id=Number(rackNode.dataset.rack);if(!rackById(id))return;if(firstRackId==null){firstRackId=id;status('İlk raf seçildi. Şimdi ikinci raf bloğuna tıkla.');renderBetweenOverlay();return;}if(id===firstRackId){status('İkinci raf farklı olmalı.');return;}const list=measures(),aId=firstRackId,bId=id,existing=list.find((m)=>(Number(m.aId)===aId&&Number(m.bId)===bId)||(Number(m.aId)===bId&&Number(m.bId)===aId));if(existing){existing.aId=aId;existing.bId=bId;}else list.push({id:Date.now(),aId,bId});betweenActive=false;firstRackId=null;byId('m2BetweenMeasureButton')?.classList.remove('active');m2RenderLayout();status('Raf arası ölçü eklendi. Değeri değiştirmek için ölçü etiketine tıkla.');
    },true);
  }

  // OZELLESTIR: tekli kat tiklamasina dokunmuyoruz; native handler tek kaynak.
  const rawCollect=window.m2CollectCustomizeRackAccessories;
  const rawToggle=window.m2ToggleCustomizeRackAccessoryLevel;
  const rawAll=window.m2AllCustomizeRackAccessoryLevels;
  const rawRender=window.m2RenderCustomizeRackAccessories;
  const rawOpen=window.m2OpenCustomizeModal;
  const rawTunnel=window.m2ToggleCustomizeTunnel;
  function activeCustomizeRack(){return rackById(activeCustomizeRackId);}
  function isGroundStart(){const r=activeCustomizeRack();const v=String(r?.b2b?.firstPalletPosition||r?.firstPalletPosition||'ground').toLowerCase();return v==='ground'||v==='zemin';}
  function fixAccessoryK1Ui(){const host=byId('m2CustomizeAccessories');if(!host)return;host.querySelectorAll('.m2-customize-accessory-card').forEach((card)=>{const type=card.dataset.accessoryType,hide=isGroundStart()&&(type==='hTraverse'||type==='tray');card.querySelectorAll('.m2-customize-accessory-levels button').forEach((btn)=>{const level=Number((btn.textContent||'').replace(/\\D/g,''));if(level===1)btn.hidden=hide;});});}
  if(typeof rawOpen==='function')window.m2OpenCustomizeModal=function(rackId){activeCustomizeRackId=Number(rackId)||null;const result=rawOpen.apply(this,arguments);requestAnimationFrame(fixAccessoryK1Ui);return result;};
  if(typeof rawRender==='function')window.m2RenderCustomizeRackAccessories=function(){const result=rawRender.apply(this,arguments);fixAccessoryK1Ui();return result;};
  if(typeof rawCollect==='function')window.m2CollectCustomizeRackAccessories=function(){const items=rawCollect.apply(this,arguments);if(!isGroundStart()||!Array.isArray(items))return items;return items.map((item)=>({...item,levels:(item.type==='hTraverse'||item.type==='tray')&&Array.isArray(item.levels)?item.levels.filter((l)=>Number(l)!==1):(item.levels||[])}));};
  if(typeof rawAll==='function')window.m2AllCustomizeRackAccessoryLevels=function(type){const result=rawAll.apply(this,arguments);if(isGroundStart()&&(type==='hTraverse'||type==='tray')&&typeof rawCollect==='function'&&typeof rawToggle==='function'){const item=(rawCollect()||[]).find((x)=>x?.type===type);if(item?.levels?.some((l)=>Number(l)===1))rawToggle(type,1);}fixAccessoryK1Ui();return result;};

  let previewTimer=null;
  const rawPreview=window.m2PreviewRackCustomization;
  if(typeof rawPreview==='function')window.m2PreviewRackCustomization=function(){const args=arguments,ctx=this;if(previewTimer)clearTimeout(previewTimer);previewTimer=setTimeout(()=>{previewTimer=null;try{rawPreview.apply(ctx,args);}catch{}},90);};

  function targetTunnelLevel(){const count=Math.max(1,Math.min(15,Math.round(Number(byId('m2CustomizeLevels')?.value)||1))),height=Math.max(500,Number(byId('m2CustomizeTunnelHeight')?.value)||3600),pallet=Math.max(300,Number(byId('m2CustomizePalletHeight')?.value)||1200);let gap=200,traverse=100,cum=0;try{if(typeof b2bPalletTraverseGap==='number')gap=b2bPalletTraverseGap;}catch{}try{if(typeof b2bTraverseHeight==='function')traverse=Number(b2bTraverseHeight())||traverse;}catch{}const rows=byId('m2CustomizeManualLevels')?.checked?[...document.querySelectorAll('#m2CustomizeLevelRows .m2-custom-level-row')]:[];for(let i=0;i<count;i++){const custom=Number(rows[i]?.querySelector('[data-custom-interval]')?.value);cum+=custom>0?custom:pallet+gap+traverse;if(cum>height){let level=i+1;if(isGroundStart()&&level===1)level=Math.min(count,2);return level;}}return count;}
  function ensureTunnelTray(){if(byId('m2CustomizeTunnel')?.checked!==true)return;try{let items=typeof rawCollect==='function'?rawCollect():[],tray=items.find((x)=>x?.type==='tray');if(!tray&&typeof window.m2EnableCustomizeRackAccessory==='function'){window.m2EnableCustomizeRackAccessory('tray');items=rawCollect?.()||[];tray=items.find((x)=>x?.type==='tray');}if(!tray)return;window.m2SetCustomizeRackTrayWidth?.('tray',300);const target=targetTunnelLevel(),selected=new Set((tray.levels||[]).map(Number));[...selected].filter((l)=>l!==target).forEach((l)=>rawToggle?.('tray',l));if(!selected.has(target))rawToggle?.('tray',target);window.m2RenderCustomizeRackAccessories?.();window.m2PreviewRackCustomization?.();}catch(error){console.warn('Tunel tava esitleme',error);}}
  if(typeof rawTunnel==='function')window.m2ToggleCustomizeTunnel=function(){const result=rawTunnel.apply(this,arguments);if(byId('m2CustomizeTunnel')?.checked===true)requestAnimationFrame(ensureTunnelTray);return result;};

  const rawLayoutRender=window.m2RenderLayout;
  if(typeof rawLayoutRender==='function')window.m2RenderLayout=function(){const result=rawLayoutRender.apply(this,arguments);installButton();installModal();installSvgCapture();renderBetweenOverlay();return result;};

  function install(){installButton();installModal();installSvgCapture();renderBetweenOverlay();fixAccessoryK1Ui();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();</script>`;
  const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw new Error('Portal body kapanisi bulunamadi.');html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
}

if(!html.includes(marker)||!html.includes('m2BetweenMeasureButton')||!html.includes('ARASI ÖLÇ'))throw new Error('Arasi olc runtime eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('Arasi Olc + tekli aksesuar kat secimi + zemin K1 kurali uygulandi.');

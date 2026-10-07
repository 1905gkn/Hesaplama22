export function barrierFrameSlots(rack, scale = 1) {
  const layout = rack?.b2bLayout;
  if (!layout) return [];
  const depth = Number(layout.frameDepth);
  if (!(depth > 0)) return [];
  const rows = Math.max(1, Math.round(Number(layout.rowCount) || 1));
  const gap = Math.max(0, Number(layout.rowGap ?? rack.b2b?.rowGap ?? 0));
  const lengthMm = rows * depth + (rows - 1) * gap;
  const sy = Number(rack.h) / Number(rack.depthMm) || scale;
  const sx = Number(rack.w) / Number(rack.widthMm) || scale;
  const overhang = Math.max(0, Number(layout.palletOverhang) || 0);
  const profileWidthMm = Number(rack.footType) || (Number(rack.widthMm) - Number(layout.sectionWidth)) / 2 || 90;
  const cy = Number(rack.y) + overhang * sy + lengthMm * sy / 2;
  return ['start', 'end'].map(edge => ({ rackId: rack.id, edge, lengthMm, sx, sy, profileWidthMm,
    localX: edge === 'start' ? -rack.w / 2 + profileWidthMm * sx / 2 : rack.w / 2 - profileWidthMm * sx / 2,
    localY: cy - (rack.y + rack.h / 2), angle: Number(rack.angle) || 0, rack }));
}
export function barrierWorldPoint(slot, x = slot.localX, y = slot.localY) {
  const angle = slot.angle * Math.PI / 180, rack = slot.rack;
  return { x: rack.x + rack.w / 2 + x * Math.cos(angle) - y * Math.sin(angle),
    y: rack.y + rack.h / 2 + x * Math.sin(angle) + y * Math.cos(angle) };
}
export function barrierSegmentHitsRect(a, b, rect) {
  let low = 0, high = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const [p, q] of [[-dx,a.x-rect.left],[dx,rect.right-a.x],[-dy,a.y-rect.top],[dy,rect.bottom-a.y]]) {
    if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) low = Math.max(low,t); else high = Math.min(high,t);
    if (low > high) return false;
  }
  return true;
}
export function barrierScanSlots(racks, rect, scale) {
  const selected = [], seen = new Set();
  for (const rack of racks) for (const slot of barrierFrameSlots(rack, scale)) {
    const a = barrierWorldPoint(slot,slot.localX,slot.localY-slot.lengthMm*slot.sy/2);
    const b = barrierWorldPoint(slot,slot.localX,slot.localY+slot.lengthMm*slot.sy/2);
    const half = slot.profileWidthMm * slot.sx / 2;
    const area = {left:rect.left-half,right:rect.right+half,top:rect.top-half,bottom:rect.bottom+half};
    if (!barrierSegmentHitsRect(a,b,area)) continue;
    // Shared frames have one physical barrier even when two rack records own it.
    const key = [a,b].map(p=>`${Math.round(p.x*100)},${Math.round(p.y*100)}`).sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key); selected.push(slot);
  }
  return selected;
}
export function barrierPlacement(slot, side, depthMm = 150) {
  const sign = side < 0 ? -1 : 1;
  const localX = slot.localX + sign * (slot.profileWidthMm/2 + 100 + depthMm/2) * slot.sx;
  const center = barrierWorldPoint(slot,localX,slot.localY);
  const w = slot.lengthMm * slot.sy, h = depthMm * slot.sx;
  return { type:'barrier', name:'Bariyer Koruma', rackId:slot.rackId,
    barrierScan:{edge:slot.edge,side:sign,clearanceMm:100}, localX,localY:slot.localY,
    x:center.x-w/2,y:center.y-h/2,w,h,widthMm:slot.lengthMm,depthMm,
    angle:slot.angle+90,blocking:false,showDetails:false };
}
export function installBarrierScan() {
  if (window.rafexBarrierScan) return;
  let pending = null;
  const status = text => { const host=document.getElementById('m2FloorStatus'); if(host) host.textContent=text; };
  const tr = text => window.rafexTranslateText?.(text) || text;
  function close() { document.getElementById('rafexBarrierDirection')?.remove(); pending=null; }
  function finish(side) {
    if (!pending) return;
    const current = pending;
    const candidates = current.slots.flatMap(slot => {
      const rack=m2LayoutState.racks.find(r=>r.id===slot.rackId);
      if(!rack)return[];
      const fresh=barrierFrameSlots(rack,m2LayoutState.scale).find(s=>s.edge===slot.edge);
      return fresh?[barrierPlacement(fresh,side,current.depthMm)]:[];
    });
    const additions=candidates.filter(candidate=>!m2LayoutSymbols.some(symbol=>symbol.type==='barrier' && Math.hypot(symbol.x+symbol.w/2-candidate.x-candidate.w/2,symbol.y+symbol.h/2-candidate.y-candidate.h/2)<Math.max(1,m2LayoutState.scale*10) && Math.abs(Number(symbol.widthMm)-candidate.widthMm)<1));
    if(additions.length){
      m2PushUndo('Taramayla bariyer ekleme');
      let id=Math.max(Date.now(),...m2LayoutSymbols.map(s=>Number(s.id)||0))+1;
      additions.forEach(symbol=>{symbol.id=id++;m2LayoutSymbols.push(symbol);});
      m2SelectedSymbolId=additions.at(-1).id;
    }
    close();m2RenderLayout();
    if(typeof m2RefreshActiveReport==='function')m2RefreshActiveReport();
    status(additions.length ? `${additions.length} bariyer eklendi; ayaktan net 100 mm önde.` : 'Bu ayaklarda seçilen yöndeki bariyer zaten mevcut.');
  }
  function ask(slots,depthMm) {
    close();pending={slots,depthMm};
    const modal=document.createElement('div');modal.id='rafexBarrierDirection';modal.className='m2-layout-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','rafexBarrierDirectionTitle');
    const angle=slots[0].angle*Math.PI/180,vertical=Math.abs(Math.sin(angle))>Math.abs(Math.cos(angle));
    const plus=vertical?(Math.sin(angle)>0?'Altına':'Üstüne'):(Math.cos(angle)>0?'Sağına':'Soluna');
    const minus=vertical?(Math.sin(angle)>0?'Üstüne':'Altına'):(Math.cos(angle)>0?'Soluna':'Sağına');
    const sizes=[...new Set(slots.map(s=>Math.round(s.lengthMm)))].sort((a,b)=>a-b).join(' / ');
    modal.innerHTML=`<style>#rafexBarrierDirection .rafex-barrier-actions{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-top:16px}#rafexBarrierDirection .rafex-barrier-sides{display:flex;flex-direction:column;gap:8px;flex:0 1 220px}#rafexBarrierDirection .rafex-barrier-actions button{padding:10px 20px;border:0;border-radius:8px;font-weight:700;cursor:pointer}#rafexBarrierDirection [data-side]{background:#197452;color:white}#rafexBarrierDirection .rafex-barrier-cancel{background:#edf0ef;color:#173e30}</style><div class="m2-symbol-dialog"><div class="m2-symbol-head"><div><b id="rafexBarrierDirectionTitle">${tr('Bariyer hangi yönde olsun?')}</b><small>${slots.length} ${tr('ayak takımı')} · ${sizes} mm · ${tr('Ayaktan net uzaklık')}: 100 mm</small></div><button type="button" data-cancel aria-label="${tr('Kapat')}">×</button></div><p>${tr('Taranan ayakların hangi tarafına bariyer eklensin?')}</p><div class="rafex-barrier-actions"><div class="rafex-barrier-sides"><button type="button" data-side="-1">${tr(minus)}</button><button type="button" data-side="1">${tr(plus)}</button></div><button type="button" class="rafex-barrier-cancel" data-cancel>${tr('Vazgeç')}</button></div></div>`;
    modal.addEventListener('click',event=>{const button=event.target.closest('button');if(button?.hasAttribute('data-cancel'))close();else if(button?.dataset.side)finish(Number(button.dataset.side));});
    modal.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}if(event.key==='Tab'){const buttons=[...modal.querySelectorAll('button')];const index=buttons.indexOf(document.activeElement);event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}});
    document.body.appendChild(modal);modal.querySelector('[data-side]')?.focus();
  }
  const start=m2StartProtectionPlacement;
  m2StartProtectionPlacement=function(){
    if(m2ProtectionChoice!=='barrier')return start.apply(this,arguments);
    if(!m2LayoutState.racks.some(rack=>barrierFrameSlots(rack,m2LayoutState.scale).length)){status('Önce çizim alanına en az bir B2B raf ekle.');return;}
    close();
    // A previous barrier stays selected after adding it. Clear that selection
    // before scanning, so the outside-pointer handler cannot cancel this draft.
    if(typeof m2ClearAllSelections==='function')m2ClearAllSelections('',false);
    m2ProtectionDraft={type:'barrier',start:null,hover:null};m2CloseProtectionDialog();
    document.getElementById('m2ProtectionButton')?.classList.add('active');
    status('Bariyer eklenecek ayakları basılı tutup tarayarak seç. Tarama sonunda yönünü seçebilirsin.');
  };
  const commit=m2CommitProtectionArea;
  m2CommitProtectionArea=function(){
    const draft=m2ProtectionDraft;
    if(draft?.type!=='barrier')return commit.apply(this,arguments);
    if(!draft.start||!draft.hover)return;
    const rect={left:Math.min(draft.start.x,draft.hover.x),right:Math.max(draft.start.x,draft.hover.x),top:Math.min(draft.start.y,draft.hover.y),bottom:Math.max(draft.start.y,draft.hover.y)};
    const slots=barrierScanSlots(m2LayoutState.racks,rect,m2LayoutState.scale);
    const depthMm=Math.max(50,Number(document.getElementById('m2BarrierDepth')?.value)||150);
    m2ProtectionDraft=null;document.getElementById('m2ProtectionButton')?.classList.remove('active');m2RenderLayout();
    if(!slots.length){status('Taranan alan içinde bariyer eklenecek raf ayağı bulunamadı.');return;}
    ask(slots,depthMm);
  };
  const sync=m2SyncAttachedProtections;
  m2SyncAttachedProtections=function(){
    sync.apply(this,arguments);
    m2LayoutSymbols.forEach(symbol=>{
      if(symbol.type!=='barrier'||!symbol.barrierScan)return;
      const rack=m2LayoutState.racks.find(r=>r.id===symbol.rackId);if(!rack)return;
      const slot=barrierFrameSlots(rack,m2LayoutState.scale).find(s=>s.edge===symbol.barrierScan.edge);
      if(slot)Object.assign(symbol,barrierPlacement(slot,symbol.barrierScan.side,symbol.depthMm));
    });
  };
  const host=m2BarrierHostRack;
  m2BarrierHostRack=function(symbol){return symbol?.barrierScan ? m2LayoutState.racks.find(r=>r.id===symbol.rackId)||null : host.apply(this,arguments);};
  const open=m2OpenProtectionDialog;
  m2OpenProtectionDialog=function(){open.apply(this,arguments);const modal=document.getElementById('m2ProtectionModal');const note=modal?.querySelector('.m2-symbol-head small');if(note)note.textContent='Ayak veya bariyer koruma için çizimde taranacak alanı seç.';const length=document.getElementById('m2BarrierLength');if(length){length.disabled=true;length.title='Bariyer uzunluğu seçilen ayak derinliğine göre otomatik hesaplanır.';length.closest('label').style.display='none';}};
  window.rafexBarrierScan={cancel:close,finish};
}

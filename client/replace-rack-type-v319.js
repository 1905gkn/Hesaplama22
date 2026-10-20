(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const system = entry => entry.__rafexSystem || entry.system || entry.rafexSystem || entry.drawing?.rafexSystem || (entry.b2b?.mr ? 'mr' : entry.b2b ? 'b2b' : entry.systemType || 'mekik2');
  const rowCount = entry => {
    if (system(entry) !== 'b2b') return null;
    const drawing = entry.__rafexSnapshot || entry.drawing || entry;
    const rows = Number(drawing.b2bLayout?.rowCount);
    return rows === 1 || rows === 2 ? rows : (drawing.b2b?.rowType || drawing.b2bViewerOptions?.rowType) === 'double' ? 2 : 1;
  };
  const compatible = (target, source) => system(target) === system(source) && rowCount(target) === rowCount(source);
  const key = entry => system(entry) + ':' + entry.id;
  const status = text => { const node = document.getElementById('m2FloorStatus'); if (node) node.textContent = text; };
  function replaceRack(rack, drawing, target, scale) {
    const context = {};
    for (const field of ['id','x','y','angle','blockName','joinGroup','sharedFootWith','sharedFootSide','sharedFootType','sharedFootId','locked','staged','freePlacement','specLocked','individualSpec','rafexCatalogKey','independentBlock','independentBlockId','seismicBraces']) {
      if (Object.hasOwn(rack, field)) context[field] = clone(rack[field]);
    }
    const result = {...clone(drawing), ...context};
    result.typeName = target.name;
    result.rafexGlobalTypeLetter = target.name;
    result.rafexOriginalTypeName = target.name;
    result.rafexSectionLetter = target.name;
    if (Object.hasOwn(rack,'rafexCustomNameV203')) result.rafexCustomNameV203 = target.name;
    result.rafexSystem = system(target);
    result.rafexSystemLabel = target.__rafexSystemLabel || target.rafexSystemLabel;
    result.rafexCatalogKey = key(target);
    result.typeColor = typeof m2TypeColor === 'function' ? m2TypeColor(target.name) : rack.typeColor;
    result.widthMm = Number(drawing.totalWidth || drawing.widthMm);
    result.depthMm = Number(drawing.railLength || drawing.depthMm);
    if (![result.widthMm,result.depthMm].every(value=>Number.isFinite(value)&&value>0)) throw Error('Kopyalanacak kesitin ölçüleri geçersiz.');
    result.w = Math.max(.5, result.widthMm * scale);
    result.h = Math.max(.5, result.depthMm * scale);
    return result;
  }
  // Keep the first rack's outer corner fixed and reconnect every shared frame
  // by its centre after a section changes, including neighbours of another type.
  function reflowJoinedArea(area, previous, changedIds) {
    if (!changedIds.size) return;
    const racks=area.layout.racks||[], before=new Map((previous.racks||[]).map(r=>[r.id,r])), after=new Map(racks.map(r=>[r.id,r]));
    const scale=Number(area.layout.scale)||.04, edges=[], adjacency=new Map(racks.map(r=>[r.id,[]]));
    const foot=r=>typeof m2B2BFootWidth==='function'?m2B2BFootWidth(r):Number(r.footType)||100;
    const point=(r,side,row=0)=>{
      const l=r.b2bLayout||{}, depth=Number(r.depthMm)||r.h/scale;
      const y=((row*((Number(l.palletDepth)||depth)+Math.max(0,(Number(l.rowGap)||0)-2*(Number(l.palletOverhang)||0))))+(Number(l.palletOverhang)||0)+(Number(l.frameDepth)||depth)/2)*r.h/depth-r.h/2;
      return m2RackLocalPoint(r,(side==='left'?-1:1)*(r.w/2-foot(r)*scale/2),y);
    };
    for(const child of previous.racks||[]){
      const parent=before.get(child.sharedFootWith);if(!parent||!after.has(child.id)||!after.has(parent.id))continue;
      if(!['left','right'].includes(child.sharedFootSide))throw Error('Birleşim ayağının yönü bulunamadı: '+child.id);
      const side=child.sharedFootSide;
      let match=null;
      for(const opposite of ['left','right'])for(let c=0;c<(Number(child.b2bLayout?.rowCount)||1);c++)for(let p=0;p<(Number(parent.b2bLayout?.rowCount)||1);p++){
        const a=point(child,side,c),b=point(parent,opposite,p),distance=Math.hypot(a.x-b.x,a.y-b.y);
        if(!match||distance<match.distance)match={c,p,distance,opposite};
      }
      const edge={child:child.id,parent:parent.id,side,...match};edges.push(edge);adjacency.get(child.id).push(edge);adjacency.get(parent.id).push(edge);
    }
    // Older saved groups can omit parent links. Recover only actual coincident
    // foot centres; proximity or a common group name alone is not a shared foot.
    const buckets=new Map(),pairKey=(a,b)=>JSON.stringify([a,b].sort()),pairs=new Set(edges.map(e=>pairKey(e.child,e.parent)));
    for(const child of previous.racks||[]){if(!child.joinGroup||!after.has(child.id))continue;
      for(const side of ['left','right'])for(let c=0;c<(Number(child.b2bLayout?.rowCount)||1);c++){
        const a=point(child,side,c),gx=Math.floor(a.x/.02),gy=Math.floor(a.y/.02);
        for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const parent of buckets.get(JSON.stringify([child.joinGroup,gx+dx,gy+dy]))||[]){
          const pair=pairKey(child.id,parent.id);if(parent.id===child.id||pairs.has(pair)||Math.hypot(a.x-parent.x,a.y-parent.y)>=.02)continue;
          const edge={child:child.id,parent:parent.id,side,opposite:parent.side,c,p:parent.row};pairs.add(pair);edges.push(edge);adjacency.get(child.id).push(edge);adjacency.get(parent.id).push(edge);
        }
        const key=JSON.stringify([child.joinGroup,gx,gy]);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push({...a,id:child.id,side,row:c});
      }
    }
    const visited=new Set();
    for(const candidate of racks){
      if(visited.has(candidate.id))continue;
      const component=[],todo=[candidate.id],seen=new Set();
      while(todo.length){const id=todo.pop();if(seen.has(id))continue;seen.add(id);component.push(id);for(const edge of adjacency.get(id)||[])todo.push(edge.child===id?edge.parent:edge.child);}
      component.forEach(id=>visited.add(id));if(!component.some(id=>changedIds.has(id)))continue;
      const members=component.map(id=>before.get(id)), ids=new Set(component);
      const root=members.find(r=>!ids.has(r.sharedFootWith))||members[0], current=after.get(root.id);
      const a=m2RackLocalPoint(root,-root.w/2,-root.h/2),b=m2RackLocalPoint(current,-current.w/2,-current.h/2);
      current.x+=a.x-b.x;current.y+=a.y-b.y;
      const placed=new Set([root.id]),queue=[root.id];
      while(queue.length){const id=queue.shift();for(const edge of adjacency.get(id)||[]){
        const next=edge.child===id?edge.parent:edge.child;if(placed.has(next))continue;
        const parent=after.get(edge.parent),child=after.get(edge.child),pa=point(parent,edge.opposite,edge.p),ca=point(child,edge.side,edge.c);
        const moving=after.get(next),direction=next===edge.child?1:-1;moving.x+=(pa.x-ca.x)*direction;moving.y+=(pa.y-ca.y)*direction;
        placed.add(next);queue.push(next);
      }}
      for(const id of component)changedIds.add(id);
    }
    for(const edge of edges){
      if(!changedIds.has(edge.child)&&!changedIds.has(edge.parent))continue;
      const parent=after.get(edge.parent),child=after.get(edge.child),a=point(parent,edge.opposite,edge.p),b=point(child,edge.side,edge.c);
      if(Math.hypot(a.x-b.x,a.y-b.y)>.01)throw Error('Birleşim geometrisi tutarsız; değişiklik uygulanmadı.');
      const oldParent=before.get(parent.id),oldChild=before.get(child.id);
      if(Number(oldParent.b2bLayout?.rowCount)===Number(oldChild.b2bLayout?.rowCount)){
        for(let row=0;row<(Number(child.b2bLayout?.rowCount)||1);row++){
          const oldPoint=point(oldChild,edge.side,row);let match=null;
          for(let p=0;p<(Number(oldParent.b2bLayout?.rowCount)||1);p++){const q=point(oldParent,edge.opposite,p),distance=Math.hypot(q.x-oldPoint.x,q.y-oldPoint.y);if(!match||distance<match.distance)match={row:p,distance};}
          if(match&&match.distance<.02){const p=point(parent,edge.opposite,match.row),c=point(child,edge.side,row);if(Math.hypot(p.x-c.x,p.y-c.y)>.01)throw Error('Birleşik rafların sıra aralıkları farklı; ortak ayaklar hizalanamıyor.');}
        }
      }
    }
    for(const symbol of area.layout.symbols||[]){
      if(!/^(uaks|uakz)$/.test(symbol.type)||!changedIds.has(symbol.rackId))continue;
      const old=before.get(symbol.rackId),rack=after.get(symbol.rackId);if(!old||!rack)continue;
      const local=(r,p)=>{const angle=(Number(r.angle)||0)*Math.PI/180,dx=p.x-r.x-r.w/2,dy=p.y-r.y-r.h/2;return{x:dx*Math.cos(angle)+dy*Math.sin(angle),y:-dx*Math.sin(angle)+dy*Math.cos(angle)};};
      const oldFeet=m2RackFootPoints(old).map(p=>local(old,p)),newFeet=m2RackFootPoints(rack).map(p=>local(rack,p));
      const nearest=oldFeet.map((p,index)=>({index,distance:Math.hypot(p.x-Number(symbol.localX),p.y-Number(symbol.localY))})).sort((a,b)=>a.distance-b.distance)[0];
      if(nearest&&newFeet[nearest.index]){symbol.localX=newFeet[nearest.index].x;symbol.localY=newFeet[nearest.index].y;}
      const p=m2RackLocalPoint(rack,Number(symbol.localX)||0,Number(symbol.localY)||0);symbol.x=p.x-symbol.w/2;symbol.y=p.y-symbol.h/2;symbol.angle=rack.angle;
    }
  }

  // Validate detached area copies before committing any catalog or layout changes.
  function validateReplacementArea(area, previous, changedIds) {
    if (!changedIds.size) return;
    const savedLayout = m2LayoutState, savedSymbols = m2LayoutSymbols;
    const fail = (rack, reason) => { throw Error((area.name || 'Alan') + ' · ' + (rack.typeName || 'Raf') + ' (' + rack.id + '): ' + reason); };
    const overlap = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>.001 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.001;
    try {
      m2LayoutState = {...area.layout, drag:null};
      m2LayoutSymbols = area.layout.symbols || [];
      const racks = area.layout.racks || [];
      for (const rack of racks) {
        if (!changedIds.has(rack.id)) continue;

        if (rack.staged) continue;
        if (!m2RackInsideArea(rack)) fail(rack,'Yeni kesit alan sınırını aşıyor veya duvarla çakışıyor.');
        // Corner containment alone misses a rack spanning a recess in a concave area.
        if (area.layout.closed) {
          const inset = m2WallMeasurementInset, side = m2RackVisualSideOverhang(rack) + inset;
          const corners = [[-rack.w/2-side,-rack.h/2-inset],[rack.w/2+side,-rack.h/2-inset],[rack.w/2+side,rack.h/2+inset],[-rack.w/2-side,rack.h/2+inset]].map(([dx,dy])=>m2RackLocalPoint(rack,dx,dy));
          const points = area.layout.points || [];
          for (let i=0;i<points.length;i++) {
            if (m2WallCrossesRack(points[i],points[(i+1)%points.length],corners)) fail(rack,'Yeni kesit duvarla çakışıyor.');
          }
        }
        const bounds = m2RackBounds(rack);
        for (const other of racks) {
          if (other.id === rack.id || other.staged) continue;
          if (rack.joinGroup && rack.joinGroup === other.joinGroup) continue;
          // Shared-frame centres have already been realigned and checked above.
          if (rack.sharedFootWith === other.id || other.sharedFootWith === rack.id) continue;
          if (overlap(bounds,m2RackBounds(other))) fail(rack,'Yeni kesit ' + (other.typeName || 'raf') + ' (' + other.id + ') ile çakışıyor.');
        }
        for (const symbol of m2LayoutSymbols) {
          if (symbol.blocking && overlap(bounds,m2SymbolBounds(symbol))) fail(rack,'Yeni kesit kolon veya engelle çakışıyor.');
        }
      }
    } finally {
      m2LayoutState = savedLayout;
      m2LayoutSymbols = savedSymbols;
    }
  }
  function applyReplacement(target, source) {
    if (key(target) === key(source) || !compatible(target, source)) throw Error('Aynı sistemde ve aynı sıra tipinde farklı bir kesit seçin. Tek sıra çift sıraya, çift sıra tek sıraya dönüştürülemez.');
    if (window.rafexCanEditProjectV134?.() === false) throw Error('Bu proje değiştirilemiyor.');
    const types = window.rafexProjectTypesV133 || m2SavedRackTypes;
    const index = types.findIndex(entry => key(entry) === key(target));
    if (index < 0) throw Error('Raf tipi bulunamadı; listeyi yeniden açın.');
    let drawing = clone(source.__rafexSnapshot || source.drawing);
    if (system(source) === 'b2b' && typeof m2B2BRecordV108 === 'function') drawing = m2B2BRecordV108(drawing);
    drawing.rafexGlobalTypeLetter = target.name;
    drawing.typeName = target.name;
    // Identical replacement geometry may intentionally retain distinct catalog letters.
    drawing.rafexDistinctCatalogType = key(target);
    const oldAreas = window.rafexAreaDocument?.();
    if (!oldAreas || !window.rafexReplaceAreaDocumentV319) throw Error('Proje alanları hazır değil.');
    const owner = window.rafexProjectIdentityV133?.uuid;
    const nextAreas = clone(oldAreas);
    let count = 0;
    for (const area of nextAreas.areas) {
      const scale = Number(area.layout.scale) || .04;
      const previous = oldAreas.areas.find(item => item.id === area.id).layout;
      const changedIds = new Set();
      area.layout.racks = (area.layout.racks || []).map(rack => {
        const matches = system(rack) === system(target) && (rack.rafexCatalogKey ? rack.rafexCatalogKey === key(target) : rack.typeName === target.name);
        if (!matches) return rack;
        if (!compatible(rack, source)) throw Error(target.name + ' içinde farklı sıra tipinde blok var; sıra tipi değiştirilmedi.');
        count++;
        changedIds.add(rack.id);
        return replaceRack(rack, drawing, target, scale);
      });
      reflowJoinedArea(area, previous, changedIds);
      validateReplacementArea(area, previous, changedIds);
    }
    const nextTypes = types.map((entry,i) => i === index ? {...entry,drawing:clone(drawing),__rafexSnapshot:clone(drawing)} : entry);
    const identity = window.rafexProjectIdentityV133;
    const oldExcluded = clone(identity?.excludedRackTypes || []);
    const undo = {label: target.name + ' kesitini değiştir', replaceTypeV319:{owner,areas:oldAreas,types:clone(types),excluded:oldExcluded}};
    const history = m2UndoHistory.slice();
    window.rafexProjectTypesV133 = nextTypes;
    try {
      window.rafexReplaceAreaDocumentV319(nextAreas, owner);
    } catch (error) { window.rafexProjectTypesV133 = types; throw error; }
    if (identity && window.rafexCatalogFingerprint) identity.excludedRackTypes = Array.from(new Set([...oldExcluded,window.rafexCatalogFingerprint(target)]));
    m2UndoHistory = [...history, undo].slice(-30);
    m2UpdateUndoButton();
    m2RenderSavedRackTypes();
    window.__rafexFreeOutputDirty = true;
    status(target.name + ' adı korundu; ' + count + ' blok ' + source.name + ' kesitine göre değiştirildi. Projeyi kaydederek değişikliği saklayabilirsiniz.');
    return count;
  }
  const previousUndo = m2UndoLastAction;
  m2UndoLastAction = function(...args) {
    const saved = m2UndoHistory.at(-1)?.replaceTypeV319;
    if (!saved) return previousUndo.apply(this,args);
    if (saved.owner !== window.rafexProjectIdentityV133?.uuid) return;
    const history = m2UndoHistory.slice(0,-1);
    window.rafexProjectTypesV133 = clone(saved.types);
    window.rafexProjectIdentityV133.excludedRackTypes = clone(saved.excluded);
    window.rafexReplaceAreaDocumentV319(saved.areas,saved.owner);
    m2UndoHistory = history;
    m2RenderSavedRackTypes(); m2UpdateUndoButton();
    status('Kesit değişikliği tüm alanlarda geri alındı.');
  };
  window.m2UndoLastAction = m2UndoLastAction;
  let dialog, targetKey, projectOwner;
  function open(target) {
    const types = window.rafexProjectTypesV133 || m2SavedRackTypes;
    const sources = types.filter(entry => compatible(target, entry) && key(entry) !== key(target));
    if (!sources.length) { status('Bu sistemde aynı sıra tipinde kopyalanabilecek başka bir kesit yok.'); return; }
    dialog?.remove();
    dialog = document.createElement('dialog');
    dialog.id = 'rafexReplaceTypeV319';
    dialog.innerHTML = '<form method="dialog"><h3>Değiştir · <span data-name></span></h3><label>Kopyalanacak kesit<select aria-label="Kopyalanacak kesit"></select></label><p>Seçilen kesitin özellikleri bu projedeki tüm <b data-name></b> bloklarına uygulanır. İsimleri ve tek / çift sıra tipi korunur.</p><p data-error role="alert"></p><footer><button value="cancel">Vazgeç</button><button type="button" data-apply>Değiştir</button></footer></form>';
    dialog.querySelectorAll('[data-name]').forEach(node => node.textContent = target.name);
    const select = dialog.querySelector('select');
    for (const entry of sources) { const option = document.createElement('option'); option.value = key(entry); option.textContent = entry.name; select.appendChild(option); }
    targetKey = key(target); projectOwner = window.rafexProjectIdentityV133?.uuid;
    dialog.querySelector('[data-apply]').onclick = () => {
      try {
        if (projectOwner !== window.rafexProjectIdentityV133?.uuid) throw Error('Proje değişti; pencereyi yeniden açın.');
        const current = window.rafexProjectTypesV133 || m2SavedRackTypes;
        const target = current.find(entry => key(entry) === targetKey), source = current.find(entry => key(entry) === select.value);
        if (!target || !source) throw Error('Kesit listesi değişti; pencereyi yeniden açın.');
        applyReplacement(target,source); dialog.close();
      } catch(error) { dialog.querySelector('[data-error]').textContent = error.message; }
    };
    document.body.appendChild(dialog); dialog.showModal();
  }
  function decorate() {
    document.querySelectorAll('#m2SavedTypeList .m2-saved-type-row').forEach(row => {
      if (row.querySelector('[data-replace-type-v319]')) return;
      const info = row.querySelector('[data-saved-index]'), remove = row.querySelector('.m2-type-delete');
      if (!info || !remove) return;
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.replaceTypeV319 = info.dataset.savedIndex;
      button.className = 'rafex-replace-type-v319'; button.textContent = 'Değiştir';
      const entry = m2SavedRackTypes[Number(info.dataset.savedIndex)];
      button.setAttribute('aria-label',(entry?.name || 'Raf tipi') + ' kesitini değiştir');
      button.onclick = event => { event.stopPropagation(); const entry=m2SavedRackTypes[Number(button.dataset.replaceTypeV319)]; if(entry) open(entry); };
      remove.before(button);
    });
  }
  const style = document.createElement('style');
  style.textContent = '#m2SavedTypeList .m2-saved-type-row{grid-template-columns:minmax(0,1fr) 34px 34px auto 30px!important}.rafex-replace-type-v319{font-size:11px!important;padding:5px 8px!important;min-width:0!important;border:1px solid #b9cec0!important;border-radius:7px!important;background:#f1f7f3!important;color:#173c2d!important}#rafexReplaceTypeV319{width:min(440px,90vw);border:1px solid #cddcd2;border-radius:12px;padding:20px;color:#173c2d}#rafexReplaceTypeV319::backdrop{background:#07150e88}#rafexReplaceTypeV319 label{display:grid;gap:8px;font-weight:bold}#rafexReplaceTypeV319 select{width:100%;padding:10px}#rafexReplaceTypeV319 p{font-size:13px;line-height:1.5}#rafexReplaceTypeV319 footer{display:flex;justify-content:flex-end;gap:8px}#rafexReplaceTypeV319 [data-error]{color:#a21d2b}';
  document.head.appendChild(style);
  new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true});
  decorate();
})();








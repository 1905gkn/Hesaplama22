(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const system = entry => entry.__rafexSystem || entry.system || entry.rafexSystem || entry.drawing?.rafexSystem || (entry.b2b?.mr ? 'mr' : entry.b2b ? 'b2b' : entry.systemType || 'mekik2');
  const key = entry => system(entry) + ':' + entry.id;
  const status = text => { const node = document.getElementById('m2FloorStatus'); if (node) node.textContent = text; };
  function replaceRack(rack, drawing, target, scale) {
    const context = {};
    for (const field of ['id','x','y','angle','blockName','joinGroup','sharedFootWith','sharedFootSide','sharedFootType','sharedFootId','locked','staged','freePlacement','specLocked','individualSpec','rafexCatalogKey']) {
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
    if (!(result.widthMm > 0 && result.depthMm > 0)) throw Error('Kopyalanacak kesitin ölçüleri geçersiz.');
    result.w = Math.max(.5, result.widthMm * scale);
    result.h = Math.max(.5, result.depthMm * scale);
    return result;
  }
  function applyReplacement(target, source) {
    if (key(target) === key(source) || system(target) !== system(source)) throw Error('Aynı sistemde farklı bir kesit seçin.');
    if (window.rafexCanEditProjectV134?.() === false) throw Error('Bu proje değiştirilemiyor.');
    const types = window.rafexProjectTypesV133 || m2SavedRackTypes;
    const index = types.findIndex(entry => key(entry) === key(target));
    if (index < 0) throw Error('Raf tipi bulunamadı; listeyi yeniden açın.');
    let drawing = clone(source.__rafexSnapshot || source.drawing);
    if (system(source) === 'b2b' && typeof m2B2BRecordV108 === 'function') drawing = m2B2BRecordV108(drawing);
    drawing.rafexGlobalTypeLetter = target.name;
    drawing.typeName = target.name;
    const oldAreas = window.rafexAreaDocument?.();
    if (!oldAreas || !window.rafexReplaceAreaDocumentV319) throw Error('Proje alanları hazır değil.');
    const owner = window.rafexProjectIdentityV133?.uuid;
    const nextAreas = clone(oldAreas);
    let count = 0;
    for (const area of nextAreas.areas) {
      const scale = Number(area.layout.scale) || .04;
      area.layout.racks = (area.layout.racks || []).map(rack => {
        const matches = system(rack) === system(target) && (rack.rafexCatalogKey ? rack.rafexCatalogKey === key(target) : rack.typeName === target.name);
        if (!matches) return rack;
        count++;
        return replaceRack(rack, drawing, target, scale);
      });
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
    const sources = types.filter(entry => system(entry) === system(target) && key(entry) !== key(target));
    if (!sources.length) { status('Bu sistemde kopyalanabilecek başka bir kesit yok.'); return; }
    dialog?.remove();
    dialog = document.createElement('dialog');
    dialog.id = 'rafexReplaceTypeV319';
    dialog.innerHTML = '<form method="dialog"><h3>Değiştir · <span data-name></span></h3><label>Kopyalanacak kesit<select aria-label="Kopyalanacak kesit"></select></label><p>Seçilen kesitin özellikleri bu projedeki tüm <b data-name></b> bloklarına uygulanır. İsimleri korunur.</p><p data-error role="alert"></p><footer><button value="cancel">Vazgeç</button><button type="button" data-apply>Değiştir</button></footer></form>';
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
(() => {
  const VERSION = 'b2b-accessories-v1';
  const TYPES = {
    palletStop: { label: 'Palet Dayama' },
    hTraverse: { label: 'H Travers' },
    tray: { label: 'Tava' },
  };
  let accessories = [];

  const cloneState = () => accessories.map((item) => ({
    type: item.type,
    levels: [...new Set((item.levels || []).map(Number).filter(Number.isFinite))].sort((a,b) => a-b),
    ...(item.type === 'tray' ? { width: [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300 } : {}),
  }));
  const levelCount = () => Math.max(1, Math.min(15, Math.round(Number(document.getElementById('b2bLevels')?.value) || 1)));
  const sectionWidth = () => {
    try {
      const geometry = typeof window.b2bPalletGeometry === 'function' ? window.b2bPalletGeometry() : null;
      const value = Number(geometry?.sectionWidth || geometry?.calculatedWidth);
      if (value > 0) return value;
    } catch {}
    const count = Math.max(1, Number(document.getElementById('b2bPalletCount')?.value) || 3);
    const palletType = document.getElementById('b2bPalletType')?.value || 'euro';
    const palletWidth = palletType === 'american' ? 1000 : 800;
    return count * palletWidth + (count + 1) * 75;
  };
  const trayPlan = (clearWidth, trayWidth) => {
    const width = Math.max(0, Math.round(Number(clearWidth) || 0));
    const tray = [200,250,300].includes(Number(trayWidth)) ? Number(trayWidth) : 300;
    const full = Math.floor(width / tray);
    const remainder = width - full * tray;
    const pieces = full > 0 ? [{ width: tray, count: full }] : [];
    if (remainder >= 50) pieces.push({ width: remainder, count: 1 });
    return { clearWidth: width, trayWidth: tray, full, remainder, pieces, ignoredRemainder: remainder > 0 && remainder < 50 ? remainder : 0 };
  };

  function style() {
    if (document.querySelector(`style[data-${VERSION}]`)) return;
    const node = document.createElement('style');
    node.setAttribute(`data-${VERSION}`, '1');
    node.textContent = `
      .b2b-accessory-area{margin-top:14px;padding-top:14px;border-top:1px solid #e0e6e1}.b2b-accessory-launch{width:100%;padding:11px 12px;border:1px solid #173c2d;border-radius:9px;background:#173c2d;color:#fff;font-weight:800}.b2b-accessory-picker{display:none;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}.b2b-accessory-area.open .b2b-accessory-picker{display:grid}.b2b-accessory-picker button{padding:9px 6px;border:1px solid #d7dfd9;border-radius:8px;background:#f6f8f6;color:#173c2d;font-size:10px;font-weight:800}.b2b-accessory-list{display:grid;gap:9px;margin-top:10px}.b2b-accessory-card{padding:10px;border:1px solid #dce3de;border-radius:10px;background:#fbfcfb}.b2b-accessory-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.b2b-accessory-card-head b{font-size:11px;color:#173c2d}.b2b-accessory-remove{padding:5px 8px;border:0;border-radius:7px;background:#f1e8e8;color:#8b2f2f;font-size:9px}.b2b-accessory-tray-width{display:flex;align-items:center;gap:5px;margin-top:9px}.b2b-accessory-tray-width span{font-size:9px;color:#69756d;font-weight:800}.b2b-accessory-tray-width button{padding:6px 9px;border:1px solid #d5ddd7;border-radius:7px;background:#fff;color:#173c2d;font-size:9px}.b2b-accessory-tray-width button.active{background:#f2c500;border-color:#d8b100;color:#17201b}.b2b-accessory-level-title{display:flex;align-items:center;justify-content:space-between;margin-top:9px}.b2b-accessory-level-title span{font-size:9px;color:#69756d;font-weight:800}.b2b-accessory-all{padding:5px 8px;border:1px solid #cdd7d1;border-radius:7px;background:#fff;color:#173c2d;font-size:9px}.b2b-accessory-levels{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.b2b-accessory-levels button{min-width:34px;padding:6px 7px;border:1px solid #d3ddd6;border-radius:7px;background:#fff;color:#173c2d;font-size:9px}.b2b-accessory-levels button.active{background:#214f3b;border-color:#214f3b;color:#fff}.b2b-accessory-note{margin-top:7px;padding:7px 8px;border-radius:7px;background:#eef4ef;color:#526158;font-size:9px;line-height:1.4}.b2b-accessory-empty{padding:10px;border:1px dashed #ccd7cf;border-radius:9px;color:#7a867f;text-align:center;font-size:9px}@media(max-width:720px){.b2b-accessory-picker{grid-template-columns:1fr}}
    `;
    document.head.appendChild(node);
  }

  function markup() {
    return `<div class="b2b-accessory-area" id="b2bAccessoryArea">
      <button class="b2b-accessory-launch" type="button" onclick="rafexAccessoryToggle()">+ Aksesuar Ekle</button>
      <div class="b2b-accessory-picker">
        <button type="button" onclick="rafexAccessoryAdd('palletStop')">Palet Dayama</button>
        <button type="button" onclick="rafexAccessoryAdd('hTraverse')">H Travers</button>
        <button type="button" onclick="rafexAccessoryAdd('tray')">Tava</button>
      </div>
      <div class="b2b-accessory-list" id="b2bAccessoryList"></div>
    </div>`;
  }

  function ensureArea() {
    if (document.getElementById('b2bAccessoryArea')) return true;
    const body = document.querySelector('.b2b-input-card .b2b-input-body');
    if (!body) return false;
    body.insertAdjacentHTML('beforeend', markup());
    return true;
  }

  function notify() {
    try {
      if (typeof window.b2bApplyInputs === 'function') window.b2bApplyInputs({ target: document.getElementById('b2bAccessoryArea'), accessoryChange: true });
    } catch (error) { console.warn('Aksesuar güncelleme', error); }
  }

  function render() {
    style();
    if (!ensureArea()) return;
    const list = document.getElementById('b2bAccessoryList');
    if (!list) return;
    const levels = levelCount();
    accessories = accessories.map((item) => ({ ...item, levels: (item.levels || []).filter((level) => level >= 1 && level <= levels) }));
    if (!accessories.length) {
      list.innerHTML = '<div class="b2b-accessory-empty">Henüz aksesuar eklenmedi.</div>';
      return;
    }
    const clear = sectionWidth();
    list.innerHTML = accessories.map((item, index) => {
      const selected = new Set(item.levels || []);
      const levelButtons = Array.from({ length: levels }, (_, i) => i + 1).map((level) => `<button type="button" class="${selected.has(level) ? 'active' : ''}" onclick="rafexAccessoryToggleLevel(${index},${level})">K${level}</button>`).join('');
      let trayControls = '';
      let note = '';
      if (item.type === 'tray') {
        const width = [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300;
        const plan = trayPlan(clear, width);
        trayControls = `<div class="b2b-accessory-tray-width"><span>Tava eni</span>${[200,250,300].map((w) => `<button type="button" class="${width === w ? 'active' : ''}" onclick="rafexAccessorySetTrayWidth(${index},${w})">${w} mm</button>`).join('')}</div>`;
        const pieceText = plan.pieces.map((p) => `${p.count} × ${p.width} mm`).join(' + ') || 'Tava yok';
        note = `<div class="b2b-accessory-note">${clear.toLocaleString('tr-TR')} mm travers için: <b>${pieceText}</b>${plan.ignoredRemainder ? ` · kalan ${plan.ignoredRemainder} mm (&lt;50 mm) için tava eklenmez` : ''}.</div>`;
      }
      return `<div class="b2b-accessory-card">
        <div class="b2b-accessory-card-head"><b>${TYPES[item.type]?.label || item.type}</b><button class="b2b-accessory-remove" type="button" onclick="rafexAccessoryRemove(${index})">Kaldır</button></div>
        ${trayControls}
        <div class="b2b-accessory-level-title"><span>Eklenecek katlar</span><button class="b2b-accessory-all" type="button" onclick="rafexAccessoryAllLevels(${index})">${selected.size === levels ? 'Tümünü Kaldır' : 'Tüm Katlar'}</button></div>
        <div class="b2b-accessory-levels">${levelButtons}</div>
        ${note}
      </div>`;
    }).join('');
  }

  window.rafexAccessoryToggle = () => {
    ensureArea();
    document.getElementById('b2bAccessoryArea')?.classList.toggle('open');
  };
  window.rafexAccessoryAdd = (type) => {
    if (!TYPES[type]) return;
    const existing = accessories.findIndex((item) => item.type === type);
    if (existing < 0) accessories.push({ type, levels: [], ...(type === 'tray' ? { width: 300 } : {}) });
    document.getElementById('b2bAccessoryArea')?.classList.add('open');
    render();
    notify();
  };
  window.rafexAccessoryRemove = (index) => { accessories.splice(index, 1); render(); notify(); };
  window.rafexAccessoryToggleLevel = (index, level) => {
    const item = accessories[index]; if (!item) return;
    const set = new Set(item.levels || []); set.has(level) ? set.delete(level) : set.add(level); item.levels = [...set].sort((a,b) => a-b); render(); notify();
  };
  window.rafexAccessoryAllLevels = (index) => {
    const item = accessories[index]; if (!item) return;
    const count = levelCount(); item.levels = (item.levels || []).length === count ? [] : Array.from({length:count},(_,i)=>i+1); render(); notify();
  };
  window.rafexAccessorySetTrayWidth = (index, width) => {
    const item = accessories[index]; if (!item || item.type !== 'tray') return;
    item.width = [200,250,300].includes(Number(width)) ? Number(width) : 300; render(); notify();
  };
  window.rafexAccessoryState = () => cloneState();
  window.rafexTrayPlan = trayPlan;

  function hook(name, factory) {
    const current = window[name];
    if (typeof current !== 'function' || current.__rafexAccessories) return;
    const wrapped = factory(current); wrapped.__rafexAccessories = true; window[name] = wrapped;
  }

  function installHooks() {
    hook('b2bPanelMarkup', (previous) => function (...args) {
      const html = previous.apply(this, args);
      setTimeout(render, 0);
      if (html.includes('id="b2bAccessoryArea"')) return html;
      const needle = '<input id="b2bModuleCount" type="hidden" value="1">';
      return html.includes(needle) ? html.replace(needle, `${needle}${markup()}`) : html;
    });
    hook('b2bReadInputState', (previous) => function (...args) {
      const state = previous.apply(this, args);
      return state ? { ...state, accessories: cloneState() } : state;
    });
    hook('b2bApplySavedInputState', (previous) => function (state, ...args) {
      accessories = Array.isArray(state?.accessories) ? state.accessories.filter((item) => TYPES[item?.type]).map((item) => ({ type:item.type, levels:Array.isArray(item.levels)?item.levels.map(Number).filter(Number.isFinite):[], ...(item.type === 'tray' ? { width:[200,250,300].includes(Number(item.width))?Number(item.width):300 } : {}) })) : [];
      const result = previous.call(this, state, ...args);
      setTimeout(() => { render(); notify(); }, 0);
      return result;
    });
    hook('b2b3DOptions', (previous) => function (...args) {
      const options = previous.apply(this, args);
      return { ...options, accessories: cloneState() };
    });
    hook('m2Rack3DOptions', (previous) => function (rack, ...args) {
      const options = previous.call(this, rack, ...args);
      const saved = Array.isArray(rack?.b2b?.accessories) ? rack.b2b.accessories : cloneState();
      return { ...options, accessories: saved.map((item) => ({...item, levels:[...(item.levels || [])]})) };
    });
    hook('b2bApplyInputs', (previous) => function (event, ...args) {
      const result = previous.call(this, event, ...args);
      if (event?.target?.id === 'b2bLevels' || event?.target?.id === 'b2bPalletCount' || event?.target?.id === 'b2bPalletType' || event?.accessoryChange) setTimeout(render, 0);
      return result;
    });
  }

  style();
  installHooks();
  setTimeout(render, 0);
  window.addEventListener('rafex-b2b-viewer-ready', installHooks);
})();

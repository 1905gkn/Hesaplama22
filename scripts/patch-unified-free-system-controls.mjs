import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-unified-free-system-controls="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Unified free system controls: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-unified-free-drawing="v1"')) throw new Error("Unified free system controls: Serbest Cizim runtime bulunamadi.");
if (!html.includes('data-rafex-unified-free-catalog="v1"')) throw new Error("Unified free system controls: ortak katalog runtime bulunamadi.");

html = html.replace(/<style\s+data-rafex-unified-free-system-controls="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-unified-free-system-controls="v1">[\s\S]*?<\/script>/g, "");

// Serbest Cizim karma yerlesiminde B2B uzatma tetigi aktif modulu degil,
// tiklanan rafin gercek sistemini takip etsin. Boylece Mekik seciliyken bile
// yerlesimdeki B2B rafa cift tiklayarak Uzatma Mesafesi acilabilir.
const doubleTapNeedle = 'if (m2ActiveModule === "b2b" && !m2MultiSelect.rackIds.has(id) && m2LastRackTap.id === id && now - m2LastRackTap.at < 520)';
const doubleTapReplacement = 'if ((rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b) && !m2MultiSelect.rackIds.has(id) && m2LastRackTap.id === id && now - m2LastRackTap.at < 520)';
const doubleTapCount = html.split(doubleTapNeedle).length - 1;
if (!doubleTapCount) throw new Error("Unified free system controls: B2B cift tik uzatma tetigi bulunamadi.");
html = html.replaceAll(doubleTapNeedle, doubleTapReplacement);

const dblClickNeedle = '          if (!rackNode || m2ActiveModule !== "b2b") return;\n          event.preventDefault(); event.stopPropagation();\n          m2StartAutoFillGuide(Number(rackNode.dataset.rack));';
const dblClickReplacement = '          if (!rackNode) return;\n          const rack = m2LayoutState.racks.find((item) => item.id === Number(rackNode.dataset.rack));\n          if (!(rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b)) return;\n          event.preventDefault(); event.stopPropagation();\n          m2StartAutoFillGuide(Number(rackNode.dataset.rack));';
const dblClickCount = html.split(dblClickNeedle).length - 1;
if (!dblClickCount) throw new Error("Unified free system controls: B2B dblclick uzatma tetigi bulunamadi.");
html = html.replaceAll(dblClickNeedle, dblClickReplacement);

const runtime = String.raw`<style data-rafex-unified-free-system-controls="v1">
#page.rafex-free-drawing-page .rafex-free-shortcuts{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 12px;padding:9px 11px;border:1px solid #d8e5dc;border-radius:9px;background:#fff;color:#526158;font-size:10px;font-weight:800}
#page.rafex-free-drawing-page .rafex-free-shortcuts>b{color:#173c2d;font-size:10px;letter-spacing:.05em}
#page.rafex-free-drawing-page .rafex-free-shortcut-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:7px;background:#edf4ef;color:#31513f;white-space:nowrap}
#page.rafex-free-drawing-page .rafex-free-shortcut-chip kbd{padding:1px 5px;border:1px solid #cfdcd3;border-bottom-width:2px;border-radius:4px;background:#fff;color:#173c2d;font:900 9px Arial}
#page.rafex-free-drawing-page .rafex-free-shortcuts [data-b2b-shortcut]{display:none}
#page.rafex-free-drawing-page[data-rafex-free-context-system="b2b"] .rafex-free-shortcuts [data-b2b-shortcut]{display:inline-flex}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2AutoFillControls,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2CustomizeRackButton,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2JoinRackButton,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2SeparateRackButton,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2SharedFootLabelButton{display:none!important}
#page.rafex-free-drawing-page[data-rafex-free-context-system="b2b"] #m2AutoFillControls{display:flex}
</style>
<script data-rafex-unified-free-system-controls="v1">(function(){
  if(window.__rafexUnifiedFreeSystemControlsV1)return;
  window.__rafexUnifiedFreeSystemControlsV1=true;

  var syncTimer=0;
  var originalStartAutoFill=window.m2StartAutoFillGuide;
  var originalOpenCustomize=window.m2OpenCustomizeModal;
  var originalToggleJoin=window.m2ToggleJoinMode;
  var originalSeparate=window.m2SeparateSelectedRack;
  var originalRenderLayout=window.m2RenderLayout;

  function isFree(){
    var page=document.getElementById('page');
    return !!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }
  function status(text){var box=document.getElementById('m2FloorStatus');if(box)box.textContent=text;}
  function rackSystem(rack){
    if(!rack)return '';
    return rack.rafexSystem||(rack.b2bLayout||rack.b2b?'b2b':'mekik2');
  }
  function selectedRack(){
    try{
      var id=m2LayoutState?.selected;
      if(id==null&&m2MultiSelect?.rackIds?.size===1)id=Array.from(m2MultiSelect.rackIds)[0];
      return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find(function(rack){return Number(rack.id)===Number(id);}):null;
    }catch{return null;}
  }
  function selectedSavedSystem(){
    try{
      var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[m2SelectedSavedType]:null;
      return entry?.__rafexSystem||'';
    }catch{return '';}
  }
  function pickerSystem(){
    return document.querySelector('input[name="rafexUnifiedSystem"]:checked')?.value||'';
  }
  function contextSystem(){
    var rack=selectedRack();
    if(rack)return rackSystem(rack);
    var saved=selectedSavedSystem();
    if(saved)return saved;
    var picker=pickerSystem();
    if(picker)return picker;
    try{return m2ActiveModule==='b2b'?'b2b':'mekik2';}catch{return 'mekik2';}
  }
  function isB2BRack(rack){return rackSystem(rack)==='b2b'&&!!(rack?.b2bLayout||rack?.b2b);}

  window.rafexRackSystemOf=rackSystem;
  window.rafexFreeSelectedRackSystem=function(){return rackSystem(selectedRack())||contextSystem();};

  function ensureShortcutBar(){
    if(!isFree())return;
    var page=document.getElementById('page');
    if(page.querySelector('.rafex-free-shortcuts'))return;
    var note=page.querySelector('.rafex-free-mode-note');
    var floor=page.querySelector('.m2-floor-editor');
    var host=document.createElement('div');
    host.className='rafex-free-shortcuts';
    host.innerHTML='<b>KLAVYE</b>'+
      '<span class="rafex-free-shortcut-chip"><kbd>ESC</kbd> Seçimi temizle</span>'+
      '<span class="rafex-free-shortcut-chip"><kbd>DEL</kbd>/<kbd>⌫</kbd> Sil</span>'+
      '<span class="rafex-free-shortcut-chip"><kbd>ENTER</kbd> Ölçüyü uygula</span>'+
      '<span class="rafex-free-shortcut-chip"><kbd>0–9</kbd> Ölçü girişi</span>'+
      '<span class="rafex-free-shortcut-chip" data-b2b-shortcut><kbd>O</kbd> B2B Özelleştir</span>'+
      '<span class="rafex-free-shortcut-chip" data-b2b-shortcut><kbd>C</kbd> B2B Çoğalt</span>'+
      '<span class="rafex-free-shortcut-chip" data-b2b-shortcut><kbd>ÇİFT TIK</kbd> B2B Uzat</span>';
    if(note)note.insertAdjacentElement('afterend',host);else if(floor)floor.insertAdjacentElement('beforebegin',host);else page.appendChild(host);
  }

  function syncControls(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(function(){
      if(!isFree())return;
      ensureShortcutBar();
      var page=document.getElementById('page'),system=contextSystem(),rack=selectedRack();
      page.dataset.rafexFreeContextSystem=system==='b2b'?'b2b':'mekik2';
      var controls=document.getElementById('m2AutoFillControls');
      if(controls){
        var b2b=system==='b2b';
        controls.hidden=!b2b;
        if(!b2b)controls.style.setProperty('display','none','important');else controls.style.removeProperty('display');
        if(b2b&&!window.m2AutoFillDraft){
          controls.classList.add('is-disabled');
          controls.querySelectorAll('input,button').forEach(function(el){el.disabled=true;});
          var input=document.getElementById('m2AutoFillLength');
          if(input){input.placeholder=rack&&isB2BRack(rack)?'Rafa çift tıkla':'Önce B2B rafı çift tıkla';if(document.activeElement!==input)input.value='';}
        }
      }
    },0);
  }

  if(typeof originalStartAutoFill==='function'){
    var wrappedStart=function(rackId){
      if(isFree()){
        var rack=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find(function(item){return Number(item.id)===Number(rackId);}):null;
        if(!isB2BRack(rack)){status('Uzatma Mesafesi yalnızca B2B raflarında kullanılabilir.');syncControls();return;}
      }
      var result=originalStartAutoFill.apply(this,arguments);syncControls();return result;
    };
    try{m2StartAutoFillGuide=wrappedStart;}catch{}
    window.m2StartAutoFillGuide=wrappedStart;
  }

  if(typeof originalOpenCustomize==='function'){
    var wrappedCustomize=function(rackId){
      if(isFree()){
        var rack=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find(function(item){return Number(item.id)===Number(rackId);}):null;
        if(!isB2BRack(rack)){status('Özelleştir bu Serbest Çizim içinde yalnızca B2B rafına uygulanır.');return;}
      }
      return originalOpenCustomize.apply(this,arguments);
    };
    try{m2OpenCustomizeModal=wrappedCustomize;}catch{}
    window.m2OpenCustomizeModal=wrappedCustomize;
  }

  if(typeof originalToggleJoin==='function'){
    var wrappedJoin=function(){
      if(isFree()){
        var rack=selectedRack();
        if(rack&&!isB2BRack(rack)){status('Birleştir yalnızca B2B raflarında kullanılabilir.');return;}
      }
      var result=originalToggleJoin.apply(this,arguments);syncControls();return result;
    };
    try{m2ToggleJoinMode=wrappedJoin;}catch{}
    window.m2ToggleJoinMode=wrappedJoin;
  }

  if(typeof originalSeparate==='function'){
    var wrappedSeparate=function(){
      if(isFree()){
        var rack=selectedRack();
        if(rack&&!isB2BRack(rack)){status('Ayır yalnızca B2B birleşik raflarında kullanılabilir.');return;}
      }
      var result=originalSeparate.apply(this,arguments);syncControls();return result;
    };
    try{m2SeparateSelectedRack=wrappedSeparate;}catch{}
    window.m2SeparateSelectedRack=wrappedSeparate;
  }

  if(typeof originalRenderLayout==='function'){
    var wrappedRender=function(){var result=originalRenderLayout.apply(this,arguments);if(isFree())syncControls();return result;};
    try{m2RenderLayout=wrappedRender;}catch{}
    window.m2RenderLayout=wrappedRender;
  }

  // B2B'ye ait O/C kisa yollarini aktif modul yerine secili raf sistemine bagla.
  // Ortak Esc/Delete/Enter/0-9 akisi mevcut handler'da aynen kalir.
  document.addEventListener('keydown',function(event){
    if(!isFree()||event.defaultPrevented)return;
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName||''))return;
    var key=String(event.key||'').toLowerCase();
    if(key!=='o'&&key!=='c')return;
    var rack=selectedRack(),system=rack?rackSystem(rack):contextSystem();
    if(system!=='b2b'){
      event.preventDefault();event.stopImmediatePropagation();
      status((key==='o'?'O · Özelleştir':'C · Çoğalt')+' B2B kısa yoludur; Mekik rafına uygulanmadı.');
      return;
    }
    if(!rack&&key==='c'){
      var racks=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks:[];
      rack=[...racks].reverse().find(isB2BRack)||null;
      if(rack)m2LayoutState.selected=rack.id;
    }
    if(!rack||!isB2BRack(rack)){
      event.preventDefault();event.stopImmediatePropagation();status('Önce bir B2B raf bloğu seç.');return;
    }
    event.preventDefault();event.stopImmediatePropagation();
    if(key==='o')window.m2OpenCustomizeModal?.(rack.id);
    else if(typeof window.m2DuplicateRack==='function')window.m2DuplicateRack();
    syncControls();
  },true);

  // Masaustu cift tik: B2B rafi hangi sistem secili olursa olsun uzatma acilir.
  // Mekik cift tik bu B2B davranisini hic almaz.
  document.addEventListener('dblclick',function(event){
    if(!isFree())return;
    var rackNode=event.target?.closest?.('#m2LayoutSvg [data-rack]');
    if(!rackNode)return;
    var rack=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find(function(item){return Number(item.id)===Number(rackNode.dataset.rack);}):null;
    if(!isB2BRack(rack))return;
    event.preventDefault();event.stopImmediatePropagation();
    window.m2StartAutoFillGuide?.(rack.id);
  },true);

  document.addEventListener('click',function(){if(isFree())syncControls();},true);
  document.addEventListener('pointerup',function(){if(isFree())syncControls();},true);
  document.addEventListener('change',function(event){if(isFree()&&(event.target?.matches?.('input[name="rafexUnifiedSystem"]')||event.target?.closest?.('#page')))syncControls();},true);

  function boot(){ensureShortcutBar();syncControls();setTimeout(syncControls,180);setTimeout(syncControls,700);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Unified free system controls: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, 'rafex-free-shortcuts', 'Uzatma Mesafesi yalnızca B2B', 'rafexFreeSelectedRackSystem', 'rack?.rafexSystem === "b2b"']) {
  if (!finalHtml.includes(required)) throw new Error(`Unified free system controls dogrulama hatasi: ${required}`);
}
console.log(`FINAL: Serbest Cizim sistem bazli kontroller + B2B Uzatma + kisa yollar uygulandi (v1). doubleTap=${doubleTapCount}, dblClick=${dblClickCount}`);

import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common project name v87: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-common-project-name="v87">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-project-name="v87">[\s\S]*?<\/script>\s*/g, "")
  // v91 once hid every project-name field in Ortak Cizim. The current UI puts
  // the shared project name exactly where the redundant top add button lived.
  .replace(/<style\s+data-rafex-common-no-project-name="v91">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-no-project-name="v91">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-project-name="v87">
#page.rafex-free-drawing-page .rafex-common-project-name-wrap{display:flex;align-items:flex-end;gap:8px;min-width:260px;flex:1 1 320px;max-width:430px}
#page.rafex-free-drawing-page #rafexUnifiedSystemPicker .rafex-system-picker-actions{justify-content:flex-start}
#page.rafex-free-drawing-page #rafexUnifiedAddModule{display:none!important}
#page.rafex-free-drawing-page .rafex-common-project-name-field{display:flex;flex-direction:column;gap:5px;width:100%;margin:0}
#page.rafex-free-drawing-page .rafex-common-project-name-field>span{font-size:10px;font-weight:900;letter-spacing:.04em;color:#526158}
#page.rafex-free-drawing-page #rafexCommonProjectName{width:100%;height:38px;padding:0 11px;border:1px solid #cbd9cf;border-radius:9px;background:#fff;color:#173c2d;font:800 12px Arial;outline:none}
#page.rafex-free-drawing-page #rafexCommonProjectName:focus{border-color:#173c2d;box-shadow:0 0 0 2px rgba(23,60,45,.09)}
#page.rafex-free-drawing-page .rafex-native-project-name-v87{display:none!important}
#page:not(.rafex-free-drawing-page) .rafex-native-project-name-v87{display:revert!important}
@media(max-width:720px){#page.rafex-free-drawing-page .rafex-common-project-name-wrap{flex-basis:100%;max-width:none;min-width:0;width:100%}}
</style>
<script data-rafex-common-project-name="v87">(function(){
  if(window.__rafexCommonProjectNameV87)return;
  window.__rafexCommonProjectNameV87=true;

  var syncTimer=0;
  var commonName=typeof window.__rafexCommonProjectName==='string'?window.__rafexCommonProjectName:'';

  function isCommon(){
    var page=document.getElementById('page');
    return !!(page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }
  function norm(value){
    return String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function nativeProjectInputs(){
    var page=document.getElementById('page');
    if(!page)return [];
    var found=[];
    function add(input,label){
      if(!input||input.id==='rafexCommonProjectName'||input.closest('.rafex-common-project-name-wrap'))return;
      if(found.some(function(item){return item.input===input;}))return;
      found.push({input:input,label:label||null});
    }
    page.querySelectorAll('label').forEach(function(label){
      if(label.closest('.rafex-common-project-name-wrap'))return;
      var text=norm(label.textContent);
      if(text.indexOf('proje adi')<0&&text.indexOf('project name')<0)return;
      var input=label.querySelector('input,textarea');
      if(!input&&label.htmlFor)input=document.getElementById(label.htmlFor);
      if(!input&&label.parentElement)input=label.parentElement.querySelector('input,textarea');
      add(input,label);
    });
    page.querySelectorAll('input,textarea').forEach(function(input){
      if(input.id==='rafexCommonProjectName'||input.closest('.rafex-common-project-name-wrap'))return;
      var meta=norm([input.id,input.name,input.placeholder,input.getAttribute('aria-label')].filter(Boolean).join(' '));
      if(/(^| )(proje adi|project name|projectname|projeadi)( |$)/.test(meta))add(input,null);
    });
    return found;
  }
  function fieldRoot(item){
    var page=document.getElementById('page');
    var node=item.label||item.input.parentElement;
    var fallback=node;
    for(var depth=0;node&&node!==page&&depth<4;depth+=1,node=node.parentElement){
      var text=norm(node.textContent);
      var count=node.querySelectorAll?node.querySelectorAll('input,textarea,select').length:0;
      if((text.indexOf('proje adi')>=0||text.indexOf('project name')>=0)&&count<=2)return node;
    }
    return fallback;
  }
  function markNativeFields(items){
    items.forEach(function(item){var root=fieldRoot(item);if(root)root.classList.add('rafex-native-project-name-v87');});
  }
  function ensureCommonField(items){
    if(!isCommon())return null;
    var actions=document.querySelector('#rafexUnifiedSystemPicker .rafex-system-picker-actions');
    if(!actions)return null;
    var wrap=actions.querySelector('.rafex-common-project-name-wrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='rafex-common-project-name-wrap';
      wrap.innerHTML='<label class="rafex-common-project-name-field" for="rafexCommonProjectName"><span>Proje Adı</span><input id="rafexCommonProjectName" type="text" autocomplete="off" placeholder="Ortak proje adını yaz"></label>';
      var addButton=document.getElementById('rafexUnifiedAddModule');
      actions.insertBefore(wrap,addButton||actions.firstChild);
      var input=wrap.querySelector('#rafexCommonProjectName');
      input.addEventListener('input',function(){
        commonName=input.value;
        window.__rafexCommonProjectName=commonName;
        nativeProjectInputs().forEach(function(item){item.input.value=commonName;});
      });
      input.addEventListener('change',function(){
        nativeProjectInputs().forEach(function(item){
          if(item.input.value!==commonName)item.input.value=commonName;
          try{item.input.dispatchEvent(new Event('change',{bubbles:true}));}catch(error){}
        });
      });
    }
    var input=wrap.querySelector('#rafexCommonProjectName');
    if(!commonName){
      var existing=(items||[]).map(function(item){return String(item.input.value||'').trim();}).find(Boolean);
      if(existing){commonName=existing;window.__rafexCommonProjectName=commonName;}
    }
    if(input&&input.value!==commonName)input.value=commonName;
    return input;
  }
  function sync(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(function(){
      if(!isCommon())return;
      var items=nativeProjectInputs();
      ensureCommonField(items);
      markNativeFields(items);
      if(commonName){items.forEach(function(item){if(item.input.value!==commonName)item.input.value=commonName;});}
    },0);
  }
  function boot(){
    sync();
    var page=document.getElementById('page');
    if(page){
      new MutationObserver(function(){sync();}).observe(page,{childList:true,subtree:true});
    }
    document.addEventListener('change',function(event){if(isCommon()&&event.target&&event.target.matches&&event.target.matches('input[name="rafexUnifiedSystem"]'))sync();},true);
    document.addEventListener('click',function(event){
      if(!isCommon())return;
      var target=event.target&&event.target.closest?event.target.closest('#rafexUnifiedAddModule,button'):null;
      if(!target)return;
      var common=document.getElementById('rafexCommonProjectName');
      if(common){commonName=common.value;window.__rafexCommonProjectName=commonName;nativeProjectInputs().forEach(function(item){item.input.value=commonName;});}
    },true);
    setTimeout(sync,120);setTimeout(sync,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common project name v87: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-common-project-name="v87"',
  'id="rafexCommonProjectName"',
  'rafex-native-project-name-v87',
  "function isCommon()"
]) {
  if (!html.includes(required)) throw new Error(`Common project name v87 dogrulama eksigi: ${required}`);
}
if (html.includes('data-rafex-common-no-project-name="v91"')) {
  throw new Error("Common project name v87: eski v91 gizleme yamasi kaldirilmadi");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v87: Ortak Cizim ust ekleme dugmesi kaldirildi; yerine ortak Proje Adi alani getirildi. Sistem sayfalari degismedi.");


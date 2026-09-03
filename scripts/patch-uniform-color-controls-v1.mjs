import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Uniform color controls: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-uniform-color-controls="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-uniform-color-controls="v1">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-uniform-color-controls="v1">
#page[data-rafex-common-active="1"] .rafex-uniform-color-row{
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;
  grid-column:1/-1!important;margin:0!important
}
#page[data-rafex-common-active="1"] .rafex-uniform-color-field,
#page[data-rafex-common-active="1"] .b2b-field:has(>select#b2bFootColor),
#page[data-rafex-common-active="1"] .b2b-field:has(>select#b2bTraverseColor),
#page[data-rafex-common-active="1"] .mr-form label:has(>select#mrUprightFinish),
#page[data-rafex-common-active="1"] .mr-form label:has(>select#mrTraverseFinish),
#page[data-rafex-common-active="1"] .konsol-field:has(>select#konsolLegColor),
#page[data-rafex-common-active="1"] .konsol-field:has(>select#konsolArmColor){
  display:grid!important;gap:5px!important;color:#5a111d!important;font:800 10px/1.2 Arial,sans-serif!important
}
#page[data-rafex-common-active="1"] .rafex-uniform-color-field select,
#page[data-rafex-common-active="1"] #b2bFootColor,#page[data-rafex-common-active="1"] #b2bTraverseColor,
#page[data-rafex-common-active="1"] #mrUprightFinish,#page[data-rafex-common-active="1"] #mrTraverseFinish,
#page[data-rafex-common-active="1"] #konsolLegColor,#page[data-rafex-common-active="1"] #konsolArmColor{
  width:100%!important;min-height:34px!important;padding:7px 30px 7px 11px!important;
  border:1px solid #dfc5cb!important;border-radius:8px!important;background:#fff!important;
  color:#1c1113!important;font:800 11px/1 Arial,sans-serif!important;box-shadow:none!important;opacity:1!important
}
#page[data-rafex-common-active="1"] #konsolLegColor:disabled{color:#1c1113!important;background:#fff!important;cursor:default!important}
@media(max-width:560px){#page[data-rafex-common-active="1"] .rafex-uniform-color-row{grid-template-columns:1fr!important}}
</style>
<script data-rafex-uniform-color-controls="v1">(function(){
  if(window.__rafexUniformColorControlsV1)return;window.__rafexUniformColorControlsV1=true;
  var frame=0;
  function common(page){return page&&page.getAttribute('data-rafex-common-active')==='1'}
  function system(page){return String(page?.getAttribute('data-rafex-common-system')||page?.dataset.m2Module||'').toLowerCase()}
  function cleanOptionText(root){root.querySelectorAll('#mrUprightFinish option,#mrTraverseFinish option').forEach(function(option){option.textContent=String(option.textContent||'').split(' · ')[0].trim()})}
  function makeSelect(id,items){var select=document.createElement('select');select.id=id;select.className=id.indexOf('Foot')>-1?'rafex-mekik-foot-color':'rafex-mekik-traverse-color';items.forEach(function(item,index){var option=document.createElement('option');option.value=item[0];option.textContent=item[1];if(!index)option.selected=true;select.appendChild(option)});return select}
  function addMekikColors(page,key){
    if(key!=='mekik2'&&key!=='drive'&&key!=='drivein')return;
    var form=page.querySelector('.m2-form');if(!form||form.querySelector('.rafex-uniform-color-row'))return;
    var row=document.createElement('div');row.className='rafex-uniform-color-row';row.dataset.rafexColorControls='v1';
    var foot=document.createElement('label');foot.className='rafex-uniform-color-field';foot.textContent='Ayak rengi';foot.appendChild(makeSelect('rafexMekikFootColor',[['ral5010','RAL 5010'],['pgv','PGV']]));
    var beam=document.createElement('label');beam.className='rafex-uniform-color-field';beam.textContent='Travers rengi';beam.appendChild(makeSelect('rafexMekikTraverseColor',[['ral1007','RAL 1007'],['ral2004','RAL 2004']]));
    row.append(foot,beam);form.prepend(row);
  }
  function sync(){frame=0;var page=document.getElementById('page');if(!common(page))return;cleanOptionText(page);addMekikColors(page,system(page));}
  function queue(){if(!frame)frame=requestAnimationFrame(sync)}
  new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system','data-m2-module']});
  document.addEventListener('click',queue,true);document.addEventListener('change',queue,true);window.addEventListener('load',sync);queue();setTimeout(sync,180);setTimeout(sync,700);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Uniform color controls: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
for (const required of ['data-rafex-uniform-color-controls="v1"', 'rafexMekikFootColor', 'RAL 5010', 'RAL 1007', 'Travers rengi']) {
  if (!html.includes(required)) throw new Error("Uniform color controls eksigi: " + required);
}
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v1: Mekik, Drive-In, MR ve Konsol renk secimleri tek tip RAL kontrolune donusturuldu.");

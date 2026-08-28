import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Product detail restore v86: HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-product-detail-restore="v86">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-product-detail-restore="v86">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`<style data-rafex-product-detail-restore="v86">
#page.rafex-free-drawing-page .rafex-system-product-row{
  flex-basis:280px!important;width:280px!important;min-width:280px!important;max-width:280px!important;
  height:62px!important;min-height:62px!important;max-height:62px!important
}
#page.rafex-free-drawing-page .rafex-system-product-row>span{
  padding:7px 9px!important;gap:3px!important
}
#page.rafex-free-drawing-page .rafex-system-product-row>span>b{
  font-size:10px!important;line-height:1.15!important;white-space:normal!important;overflow:visible!important
}
#page.rafex-free-drawing-page .rafex-system-product-row>span>small{
  display:block!important;font-size:8px!important;line-height:1.15!important;white-space:normal!important;
  overflow:visible!important;color:#68736c!important
}
#page.rafex-free-drawing-page .m2-layout-product{
  min-width:280px!important;max-width:none!important;min-height:58px!important;align-items:stretch!important
}
#page.rafex-free-drawing-page .m2-layout-product>span:first-child{
  min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important;
  gap:3px!important;padding:6px 9px!important
}
#page.rafex-free-drawing-page .m2-layout-product>span:first-child>b{
  font-size:10px!important;line-height:1.15!important
}
#page.rafex-free-drawing-page .m2-layout-product>span:first-child>small{
  display:block!important;font-size:8px!important;line-height:1.15!important;color:#68736c!important;white-space:normal!important
}
</style>
<script data-rafex-product-detail-restore="v86">(()=>{
  if(window.__rafexProductDetailRestoreV86)return;window.__rafexProductDetailRestoreV86=true;
  const clean=(v)=>String(v||'').replace(/\s+/g,' ').trim();
  const low=(v)=>clean(v).toLocaleLowerCase('tr-TR');
  const split=(value)=>{const parts=clean(value).split(' · ').map(clean).filter(Boolean);if(parts.length<2)return null;return{title:parts.shift(),detail:parts.join(' · ')}};
  const sourceRows=()=>{try{return typeof window.m2LayoutProductRows==='function'?(window.m2LayoutProductRows()||[]):[]}catch{return[]}};
  const normalizedRows=()=>sourceRows().map((row)=>{
    const raw=clean(row?.name||row?.item),parts=split(raw),title=clean(row?.item||(parts?.title||raw)),detail=clean(row?.spec||(parts?.detail||''));
    return{title,detail,raw,qty:Number(row?.qty)||0};
  }).filter((row)=>row.title);
  const findDetail=(title,qty,rows)=>{
    const key=low(title);let found=rows.find((row)=>row.detail&&row.qty===qty&&(low(row.title)===key||low(row.raw).startsWith(key+' ·')));
    if(!found)found=rows.find((row)=>row.detail&&(low(row.title)===key||low(row.raw).startsWith(key+' ·')));
    return found?.detail||'';
  };
  const make=(tag,text,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=text;return el};
  const decorateClassic=(host)=>{
    host.querySelectorAll('.m2-layout-product').forEach((row)=>{
      const cell=row.querySelector(':scope > span:first-child');if(!cell||cell.dataset.rafexDetailRestored==='1')return;
      const raw=clean(cell.textContent),parts=split(raw);if(!parts)return;
      cell.textContent='';cell.append(make('b',parts.title));const small=make('small',parts.detail,'rafex-restored-product-detail');small.dataset.rafexRestoredDetail='1';cell.append(small);cell.dataset.rafexDetailRestored='1';
    });
  };
  const decorateSystem=(host)=>{
    const rows=normalizedRows();
    host.querySelectorAll('.rafex-system-product-row').forEach((row)=>{
      const cell=row.querySelector(':scope > span'),titleNode=cell?.querySelector('b');if(!cell||!titleNode)return;
      let small=cell.querySelector('small'),detail=clean(small?.textContent).replace(/^\u00a0$/,'');
      const qty=Number(clean(row.querySelector(':scope > strong')?.textContent).replace(/[^0-9.-]/g,''))||0;
      if(!detail){const parts=split(titleNode.textContent);if(parts){titleNode.textContent=parts.title;detail=parts.detail}else detail=findDetail(titleNode.textContent,qty,rows)}
      if(!detail)return;
      if(!small){small=make('small','');cell.append(small)}small.classList.remove('rafex-product-spec-placeholder');small.removeAttribute('aria-hidden');small.textContent=detail;small.dataset.rafexRestoredDetail='1';
    });
  };
  const decorate=()=>{const host=document.getElementById('m2LayoutProductList');if(!host)return;decorateClassic(host);decorateSystem(host)};
  const original=window.m2RenderLayoutProductList;
  if(typeof original==='function'&&!original.__rafexProductDetailRestoreV86){
    const wrapped=function(){const result=original.apply(this,arguments);decorate();requestAnimationFrame(decorate);return result};wrapped.__rafexProductDetailRestoreV86=true;wrapped.__rafexOriginal=original;window.m2RenderLayoutProductList=wrapped;try{m2RenderLayoutProductList=wrapped}catch{}
  }
  requestAnimationFrame(decorate);
})();</script>`;
html=html.replace('</body>',runtime+'\n</body>');
if(!html.includes('data-rafex-product-detail-restore="v86"'))throw new Error('Product detail restore v86 marker missing');
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('v86: Urun adetlerine dokunmadan teknik bilgi satirlari geri getirildi.');

import fs from 'node:fs';
function runtime(){
 if(window.rafexLayoutAgentV188)return;
 const $=id=>document.getElementById(id);let busy=false,pending=null,generation=0;
 const snapshot=()=>JSON.stringify({points:m2LayoutState.points,racks:m2LayoutState.racks,symbols:m2LayoutState.symbols,scale:m2LayoutState.scale});
 function clear(){pending=null;$('rafexAgentPreviewV188')?.remove();const b=$('rafexAgentApplyV188');if(b)b.disabled=true;}
 function install(){
  const auto=$('rafexPdfAutoDialog');
  if(auto&&!auto.querySelector('[data-rack-agent]')){
   const button=document.createElement('button');button.type='button';button.dataset.rackAgent='';button.textContent='Seçili raf için agent · yan yana yerleştir';
   button.onclick=()=>{auto.close();$('rafexOpenLayoutScreen')?.click();requestAnimationFrame(()=>{install();const panel=$('rafexAgentV188');if(panel){panel.open=true;panel.scrollIntoView({block:'center'});}});};auto.querySelector('header').after(button);
  }
  const host=$('m2AutoFillControls');if(!host||$('rafexAgentV188'))return;
  const box=document.createElement('details');box.id='rafexAgentV188';
  box.innerHTML='<summary>Otomatik yerleşim · Agent</summary><p>Seçili rafı yan yana çoğaltır. Örnek: “Sağa 20 yeni blok ekle”. Diğer yerleşim türleri bu sürümde desteklenmez.</p><label>Yerleşim talebi<textarea id="rafexAgentPromptV188" maxlength="1200" rows="2" placeholder="Sağa 20 yeni blok ekle"></textarea></label><small>GPT-5.6 Sol · düşük düşünme · istek başına en fazla 0,10 $ · toplam üst bütçe 25 $. Her gönderimde güvenlik için 0,10 $ kota ayrılır; bu, gerçek fatura tutarı değildir. Talep metni ve raf sistemi OpenAI’a gönderilir.</small><div><button type="button" id="rafexAgentAskV188">Öneri oluştur</button> <button type="button" id="rafexAgentApplyV188" disabled>Uygula</button> <button type="button" id="rafexAgentCancelV188">Vazgeç</button></div><p role="status" id="rafexAgentStatusV188">Önce alan içinde bir raf seç.</p>';
  host.appendChild(box);$('rafexAgentAskV188').onclick=ask;$('rafexAgentApplyV188').onclick=apply;$('rafexAgentCancelV188').onclick=()=>{generation++;clear();status('Öneri iptal edildi. Gönderilmiş API isteğinin kotası geri alınmaz.');};
 }
 function status(s){const n=$('rafexAgentStatusV188');if(n)n.textContent=s;}
 async function ask(){
  if(busy)return;clear();
  const source=m2LayoutState.racks.find(r=>r.id===m2LayoutState.selected);
  if(!source||source.freePlacement||source.staged||!m2RackInsideArea(source)){status('Önce alan içinde geçerli bir raf seç.');return;}
  const prompt=$('rafexAgentPromptV188').value.trim();if(!prompt){status('Yerleşim talebini yaz.');return;}
  const before=snapshot(),sourceId=source.id,version=++generation;
  let system=source.rafexSystem||source.systemType||(source.b2bLayout?'b2b':'mekik2');if(source.b2b?.mr)system='mr';if(['drive-in','drivein'].includes(system))system='drive';
  busy=true;$('rafexAgentAskV188').disabled=true;status('Öneri hazırlanıyor; çizim henüz değişmedi…');
  try{
   const response=await fetch('/api/layout-agent',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),prompt,source:{system}})});
   const data=await response.json();if(version!==generation)return;if(!response.ok)throw Error(data.error||'Öneri alınamadı.');
   if(before!==snapshot())throw Error('İşlem sırasında çizim değişti. Öneri uygulanmadı.');
   if(data.plan.action!=='repeat'){status(data.plan.reason);return;}
   const options={count:data.plan.count,direction:data.plan.direction,sourceId};
   const preview=window.rafexRegionsV179.repeat({...options,dryRun:true});
   if(!preview){status('Öneri alana sığmıyor veya başka rafla çakışıyor. Hiçbir raf eklenmedi.');return;}
   pending={options,before};draw(preview.racks);$('rafexAgentApplyV188').disabled=false;
   status(options.count+' yeni blok · '+(options.direction===1?'sağa / ileri':'sola / geri')+'. Kesikli alanlar önizlemedir. Uygula ile eklenir.');
  }catch(e){if(version===generation)status(e.message);}finally{busy=false;if($('rafexAgentAskV188'))$('rafexAgentAskV188').disabled=false;}
 }
 function draw(racks){const svg=$('m2LayoutSvg');if(!svg)return;const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.id='rafexAgentPreviewV188';g.style.pointerEvents='none';
  racks.forEach(r=>{const p=document.createElementNS(ns,'rect');for(const [k,v]of Object.entries({x:r.x,y:r.y,width:r.w,height:r.h,fill:'#25a879',opacity:.3,stroke:'#12613f','stroke-width':2,'stroke-dasharray':'6 4',transform:'rotate('+(r.angle||0)+' '+(r.x+r.w/2)+' '+(r.y+r.h/2)+')'}))p.setAttribute(k,v);g.appendChild(p);});svg.appendChild(g);
 }
 function apply(){if(!pending)return;const p=pending;if(p.before!==snapshot()){clear();status('Çizim değişti. Yeni öneri oluştur.');return;}clear();const ok=window.rafexRegionsV179.repeat(p.options);status(ok?'Yerleşim uygulandı. Geri Al ile geri döndürebilirsin.':'Geometri kontrolü geçmedi; raf eklenmedi.');}
 const base=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=base.apply(this,arguments);install();if(pending){if(pending.before!==snapshot()){clear();status('Çizim değişti; öneri iptal edildi.');}else{const p=window.rafexRegionsV179.repeat({...pending.options,dryRun:true});if(p)draw(p.racks);}}return result;};
 document.addEventListener('click',e=>{if(e.target.closest('#rafexAutoLayoutButton,#rafexOpenLayoutScreen'))requestAnimationFrame(install);});
 window.rafexLayoutAgentV188={install,clear};install();
}
export function transform(html){
 if(html.includes('data-layout-agent="v188"'))return html;
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+`<style data-layout-agent="v188">#rafexAgentV188{padding:12px;border:1px solid #bdd6c8;border-radius:10px;margin:10px 0;background:#f4faf6}#rafexAgentV188 summary{cursor:pointer;font-weight:bold}#rafexAgentV188 textarea{display:block;width:100%;box-sizing:border-box;margin:8px 0}#rafexAgentV188 small{display:block;margin:8px 0;line-height:1.5}#rafexAgentV188 button{margin-top:8px}#page:not(.rafex-free-drawing-page):not([data-rafex-free-drawing="1"]):not([data-rafex-workflow-screen="layout"]) #rafexAgentV188{display:none}</style><script>${runtime.toString()}\nruntime();</script>`+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-agent-v188.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

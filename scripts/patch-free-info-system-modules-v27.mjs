import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html
  .replace(/<style data-rafex-free-info-modules="v27">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-free-info-modules="v27">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-free-info-modules="v27">
#rafexFreeInfoModal .rafex-free-info-dialog{width:min(1240px,96vw)!important}
#rafexFreeInfoModal .rafex-free-info-body{padding:14px!important}
#rafexFreeInfoModal .rafex-free-info-meta{grid-template-columns:repeat(6,minmax(0,1fr))!important}
#rafexFreeInfoModal .rafex-free-info-views{grid-template-columns:1fr!important;gap:12px!important}
#rafexFreeInfoModal .rafex-free-info-views.mekik-only{grid-template-columns:1fr 1fr!important}
#rafexFreeInfoModal .rafex-free-info-view{background:#fff!important}
#rafexFreeInfoModal .rafex-free-info-view>strong{font-size:11px!important;letter-spacing:.04em!important}
#rafexFreeInfoModal .rafex-free-info-loading{min-height:360px;display:grid;place-items:center;color:#536158;font-weight:900;background:#f7faf8;border:1px solid #e0e7e2;border-radius:9px}
#rafexFreeInfoModal .rafex-free-info-3d{margin-top:12px;border:1px solid #dbe4de;border-radius:12px;overflow:hidden;background:#fff}
#rafexFreeInfoModal .rafex-free-info-3d-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:9px 11px;background:#f4f7f5;border-bottom:1px solid #dbe4de;color:#173c2d}
#rafexFreeInfoModal .rafex-free-info-3d-head>div:first-child{display:grid;gap:2px}
#rafexFreeInfoModal .rafex-free-info-3d-head b{font-size:11px}
#rafexFreeInfoModal .rafex-free-info-3d-head small{color:#68766d;font-size:9px;font-weight:800}
#rafexFreeInfoModal .rafex-free-info-3d-actions{display:flex;gap:6px;flex-wrap:wrap}
#rafexFreeInfoModal .rafex-free-info-3d-actions button{min-height:32px;padding:6px 10px;border:1px solid #b8c9be;background:#fff;color:#214f3b;border-radius:7px;font-size:9px;font-weight:900}
#rafexFreeInfoModal .rafex-free-info-3d-actions button.active{background:#214f3b;color:#fff}
#rafexFreeInfoModal .rafex-free-info-canvas-wrap{position:relative;height:560px;min-height:420px;background:#fff;overflow:hidden}
#rafexFreeInfoModal .rafex-free-info-canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
#rafexFreeInfoModal .rafex-free-info-canvas:active{cursor:grabbing}
#rafexFreeInfoModal .rafex-free-info-3d-status{position:absolute;left:10px;bottom:10px;z-index:2;padding:6px 9px;border:1px solid #d6e0d9;border-radius:8px;background:#ffffffed;color:#536158;font-size:9px;font-weight:900;pointer-events:none}
#rafexFreeInfoModal .rafex-free-info-view svg{display:block;width:100%!important;height:auto!important;min-height:260px}
@media(max-width:900px){#rafexFreeInfoModal .rafex-free-info-meta{grid-template-columns:repeat(2,minmax(0,1fr))!important}#rafexFreeInfoModal .rafex-free-info-views.mekik-only{grid-template-columns:1fr!important}#rafexFreeInfoModal .rafex-free-info-canvas-wrap{height:460px}}
</style>
<script data-rafex-free-info-modules="v27">
(()=>{
  if(window.__rafexFreeInfoModulesV27)return;window.__rafexFreeInfoModulesV27=true;
  let activeInfoViewer=null,activeInfoToken=0;
  const esc=(v)=>String(v==null?'':v).replace(/[&<>\"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const entries=()=>{try{return Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[]}catch{return[]}};
  const systemOf=(entry)=>{const d=entry?.drawing||entry||{},s=String(entry?.__rafexSystem||entry?.rafexSystem||d.rafexSystem||'').toLowerCase();if(s==='mr'||d?.b2b?.mr||d?.plan?.mr)return'mr';if(s==='b2b'||d.b2b||d.b2bLayout)return'b2b';return'mekik2'};
  const destroyInfoViewer=()=>{activeInfoToken+=1;try{activeInfoViewer?.destroy?.()}catch{}activeInfoViewer=null};
  const ensureModal=()=>{let m=document.getElementById('rafexFreeInfoModal');if(!m){m=document.createElement('div');m.id='rafexFreeInfoModal';m.className='rafex-free-info-modal';m.hidden=true;m.innerHTML='<div class="rafex-free-info-dialog"><div class="rafex-free-info-head"><b id="rafexFreeInfoTitle">RAF İÇERİĞİ</b><button type="button" aria-label="Kapat">×</button></div><div class="rafex-free-info-body" id="rafexFreeInfoBody"></div></div>';m.addEventListener('click',(e)=>{if(e.target===m)m.hidden=true});m.querySelector('button').onclick=()=>{m.hidden=true};document.body.appendChild(m)}if(!m.dataset.rafexInfo3dCleanup){m.dataset.rafexInfo3dCleanup='1';m.addEventListener('click',(e)=>{if(e.target===m||e.target?.closest?.('.rafex-free-info-head button'))destroyInfoViewer()},true);document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&!m.hidden){destroyInfoViewer();m.hidden=true}})}return m};
  const metaHtml=(entry,sys)=>{const d=entry.drawing||{};const rows=[['Sistem',sys==='b2b'?'B2B':sys==='mr'?'MR':'Mekik'],['Tip',entry.name||'Raf'],['Genişlik',(Math.round(Number(d.totalWidth||d.widthMm)||0)).toLocaleString('tr-TR')+' mm'],['Derinlik',(Math.round(Number(d.railLength||d.depthMm)||0)).toLocaleString('tr-TR')+' mm'],['Kat',Math.round(Number(d.levels)||0)],['Ayak',String(d.footProfile||d.b2b?.uprightType||d.footType||'-')]];return '<div class="rafex-free-info-meta">'+rows.map(([k,v])=>'<div><small>'+esc(k)+'</small><b>'+esc(v)+'</b></div>').join('')+'</div>'};
  const b2bOptions=(d)=>{let o={};try{o=typeof m2Rack3DOptions==='function'?(m2Rack3DOptions(d)||{}):{}}catch{}const b=d.b2b||{},l=d.b2bLayout||{};return{...o,moduleCount:1,moduleOptions:null,palletCount:Math.max(1,Math.min(4,Number(l.palletCount||b.palletCount||d.bays)||3)),palletWidth:Number(l.palletWidth||b.palletWidth||d.palW)||800,palletDepth:Number(l.palletDepth||b.palletDepth||d.palD)||1200,palletHeight:Number(d.palletHeight||b.palletHeight)||1200,levels:Math.max(1,Number(d.levels||b.levels)||4),rowType:(Number(l.rowCount)===2||b.rowType==='double')?'double':'single',rowGap:Number(l.rowGap??b.rowGap)||200,footHeight:Number(d.sideUprightHeight||d.totalRackHeight||b.footHeight)||undefined,showPallets:true,dimensions:{levels:true,markers:true,eye:true,width:true,depth:true}}};
  const mrConfig=(d)=>{const b=d.b2b||{},l=d.b2bLayout||{};return{modules:1,levels:Math.max(1,Number(d.levels||b.levels)||4),width:Number(b.width||l.sectionWidth||d.palW)||2400,depth:Number(b.depth||d.railLength||d.palD)||800,firstTraverse:Number(b.firstTraverse??d.firstRailHeight)||200,levelGap:Number(b.levelGap||d.levelH)||1000,uprightHeight:Number(b.uprightHeight||d.sideUprightHeight)||3200,uprightType:b.uprightType||'MR60',uprightThickness:Number(b.uprightThickness)||1.5,traverseType:b.traverseType||'ZS65',traverseThickness:Number(b.traverseThickness)||1.5,uprightFinish:b.uprightFinish||'ral5010',traverseFinish:b.traverseFinish||'ral1007',accessories:Array.isArray(b.accessories)?b.accessories:[],dimensionScale:Number(b.dimensionScale)||1,dimensions:{levels:true,markers:true,width:true,depth:true}}};
  const viewButtons=(sys)=>'<div class="rafex-free-info-3d-actions"><button type="button" data-info-view="perspective" class="active">Perspektif</button><button type="button" data-info-view="front">Önden</button><button type="button" data-info-view="side">Yandan</button>'+(sys==='mr'?'<button type="button" data-info-view="top">Üstten</button>':'')+'</div>';
  const interactiveHtml=(entry,sys)=>metaHtml(entry,sys)+'<div class="rafex-free-info-3d"><div class="rafex-free-info-3d-head"><div><b>'+(sys==='b2b'?'B2B':'MR')+' · 3D MODÜL</b><small>Sol tuş: döndür · tekerlek: yakınlaştır · sağ tuş: kaydır · 3D ölçüler aktif</small></div>'+viewButtons(sys)+'</div><div class="rafex-free-info-canvas-wrap"><canvas class="rafex-free-info-canvas" aria-label="'+(sys==='b2b'?'B2B':'MR')+' interaktif 3D modül"></canvas><span class="rafex-free-info-3d-status">3D modül hazırlanıyor…</span></div></div>';
  const bindViewerControls=(root,viewer)=>{root.querySelectorAll('[data-info-view]').forEach((button)=>button.addEventListener('click',()=>{const view=button.dataset.infoView;try{viewer?.setView?.(view)}catch{}root.querySelectorAll('[data-info-view]').forEach((item)=>item.classList.toggle('active',item===button))}))};
  async function mountInteractive(entry,sys,body,token){
    body.innerHTML=interactiveHtml(entry,sys);const canvas=body.querySelector('.rafex-free-info-canvas'),status=body.querySelector('.rafex-free-info-3d-status');if(!canvas)throw new Error('3D alanı oluşturulamadı.');
    if(sys==='b2b'){
      const create=window.RafexB2BViewer?.createDetached;if(typeof create!=='function')throw new Error('B2B interaktif 3D motoru hazır değil.');
      const viewer=create(canvas,b2bOptions(entry.drawing));if(token!==activeInfoToken){viewer?.destroy?.();return}activeInfoViewer=viewer;bindViewerControls(body,viewer);canvas.addEventListener('b2b-viewer-ready',()=>{if(token!==activeInfoToken)return;status.textContent='Mouse ile döndür · tekerlek ile yakınlaştır · ölçüler 3D model üzerinde';viewer.setView?.('perspective')},{once:true});canvas.addEventListener('b2b-viewer-error',(event)=>{if(token===activeInfoToken)status.textContent=event.detail?.message||'B2B 3D yüklenemedi.'},{once:true});return;
    }
    const create=window.RafexMRViewer?.createDetached;if(typeof create!=='function')throw new Error('MR interaktif 3D motoru hazır değil.');
    const viewer=create(canvas,mrConfig(entry.drawing));if(token!==activeInfoToken){viewer?.destroy?.();return}activeInfoViewer=viewer;bindViewerControls(body,viewer);canvas.addEventListener('mr-viewer-ready',()=>{if(token!==activeInfoToken)return;status.textContent='Mouse ile döndür · tekerlek ile yakınlaştır · ölçüler 3D model üzerinde';viewer.setView?.('perspective')},{once:true});canvas.addEventListener('mr-viewer-error',(event)=>{if(token===activeInfoToken)status.textContent=event.detail?.message||'MR 3D yüklenemedi.'},{once:true});
  }
  async function showInfo(index){
    destroyInfoViewer();const token=activeInfoToken;const entry=entries()[index];if(!entry?.drawing)return;const d=entry.drawing,sys=systemOf(entry),m=ensureModal(),body=m.querySelector('#rafexFreeInfoBody');m.querySelector('#rafexFreeInfoTitle').textContent=(sys==='b2b'?'B2B':sys==='mr'?'MR':'MEKİK')+' · '+String(entry.name||'Raf')+' · MODÜL';m.hidden=false;
    try{
      if(sys==='mekik2'){
        const front=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'front',true):'';const side=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'side',true):'';
        body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-views mekik-only">'+(front?'<div class="rafex-free-info-view"><strong>ÖNDEN GÖRÜŞ</strong>'+front+'</div>':'')+(side?'<div class="rafex-free-info-view"><strong>YAN GÖRÜŞ</strong>'+side+'</div>':'')+'</div>';return;
      }
      await mountInteractive(entry,sys,body,token);
    }catch(error){if(token!==activeInfoToken)return;body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-loading">'+esc(error?.message||'Modül görünümü hazırlanamadı.')+'</div>'}
  }
  window.rafexFreeShowInfoV3=showInfo;
})();
</script>`;

html = html.replace('</body>', runtime + '</body>');
for(const required of ['data-rafex-free-info-modules="v27"','3D MODÜL','createDetached','3D ölçüler aktif','mekik-only','rafexFreeShowInfoV3=showInfo'])if(!html.includes(required))throw new Error('Bilgi modül v27 doğrulaması eksik: '+required);
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Serbest bilgi penceresi: B2B/MR mouse ile döndürülebilir 3D + 3D ölçüler; Mekik yalnız ön/yan (v28).');

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
#rafexFreeInfoModal .rafex-free-info-dialog{width:min(1180px,96vw)!important}
#rafexFreeInfoModal .rafex-free-info-body{padding:14px!important}
#rafexFreeInfoModal .rafex-free-info-meta{grid-template-columns:repeat(6,minmax(0,1fr))!important}
#rafexFreeInfoModal .rafex-free-info-views{grid-template-columns:1fr!important;gap:12px!important}
#rafexFreeInfoModal .rafex-free-info-views.mekik-only{grid-template-columns:1fr 1fr!important}
#rafexFreeInfoModal .rafex-free-info-view{background:#fff!important}
#rafexFreeInfoModal .rafex-free-info-view>strong{font-size:11px!important;letter-spacing:.04em!important}
#rafexFreeInfoModal .rafex-free-info-view img{display:block;width:100%;height:auto;max-height:620px;object-fit:contain;background:#fff}
#rafexFreeInfoModal .rafex-free-info-loading{min-height:360px;display:grid;place-items:center;color:#536158;font-weight:900;background:#f7faf8;border:1px solid #e0e7e2;border-radius:9px}
@media(max-width:900px){#rafexFreeInfoModal .rafex-free-info-meta{grid-template-columns:repeat(2,minmax(0,1fr))!important}#rafexFreeInfoModal .rafex-free-info-views.mekik-only{grid-template-columns:1fr!important}}
</style>
<script data-rafex-free-info-modules="v27">
(()=>{
  if(window.__rafexFreeInfoModulesV27)return;window.__rafexFreeInfoModulesV27=true;
  const esc=(v)=>String(v==null?'':v).replace(/[&<>\"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const entries=()=>{try{return Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[]}catch{return[]}};
  const systemOf=(entry)=>{const d=entry?.drawing||entry||{},s=String(entry?.__rafexSystem||entry?.rafexSystem||d.rafexSystem||'').toLowerCase();if(s==='mr'||d?.b2b?.mr||d?.plan?.mr)return'mr';if(s==='b2b'||d.b2b||d.b2bLayout)return'b2b';return'mekik2'};
  const ensureModal=()=>{let m=document.getElementById('rafexFreeInfoModal');if(m)return m;m=document.createElement('div');m.id='rafexFreeInfoModal';m.className='rafex-free-info-modal';m.hidden=true;m.innerHTML='<div class="rafex-free-info-dialog"><div class="rafex-free-info-head"><b id="rafexFreeInfoTitle">RAF İÇERİĞİ</b><button type="button" aria-label="Kapat">×</button></div><div class="rafex-free-info-body" id="rafexFreeInfoBody"></div></div>';m.addEventListener('click',(e)=>{if(e.target===m)m.hidden=true});m.querySelector('button').onclick=()=>{m.hidden=true};document.body.appendChild(m);return m};
  const metaHtml=(entry,sys)=>{const d=entry.drawing||{};const rows=[['Sistem',sys==='b2b'?'B2B':sys==='mr'?'MR':'Mekik'],['Tip',entry.name||'Raf'],['Genişlik',(Math.round(Number(d.totalWidth||d.widthMm)||0)).toLocaleString('tr-TR')+' mm'],['Derinlik',(Math.round(Number(d.railLength||d.depthMm)||0)).toLocaleString('tr-TR')+' mm'],['Kat',Math.round(Number(d.levels)||0)],['Ayak',String(d.footProfile||d.b2b?.uprightType||d.footType||'-')]];return '<div class="rafex-free-info-meta">'+rows.map(([k,v])=>'<div><small>'+esc(k)+'</small><b>'+esc(v)+'</b></div>').join('')+'</div>'};
  const b2bOptions=(d)=>{let o={};try{o=typeof m2Rack3DOptions==='function'?(m2Rack3DOptions(d)||{}):{}}catch{}const b=d.b2b||{},l=d.b2bLayout||{};return{...o,moduleCount:1,palletCount:Math.max(1,Math.min(4,Number(l.palletCount||b.palletCount||d.bays)||3)),palletWidth:Number(l.palletWidth||b.palletWidth||d.palW)||800,palletDepth:Number(l.palletDepth||b.palletDepth||d.palD)||1200,palletHeight:Number(d.palletHeight||b.palletHeight)||1200,levels:Math.max(1,Number(d.levels||b.levels)||4),rowType:(Number(l.rowCount)===2||b.rowType==='double')?'double':'single',rowGap:Number(l.rowGap??b.rowGap)||200,showPallets:true,dimensions:{levels:false,markers:false,eye:false,width:false,depth:false}}};
  const mrConfig=(d)=>{const b=d.b2b||{};return{modules:1,levels:Math.max(1,Number(d.levels||b.levels)||4),width:Number(b.width||l?.sectionWidth||d.palW)||2400,depth:Number(b.depth||d.railLength||d.palD)||800,firstTraverse:Number(b.firstTraverse||d.firstRailHeight)||200,levelGap:Number(b.levelGap||d.levelH)||1000,uprightHeight:Number(b.uprightHeight||d.sideUprightHeight)||3200,uprightType:b.uprightType||'MR60',uprightThickness:Number(b.uprightThickness)||1.5,traverseType:b.traverseType||'ZS65',traverseThickness:Number(b.traverseThickness)||1.5,uprightFinish:b.uprightFinish||'ral5010',traverseFinish:b.traverseFinish||'ral1007',accessories:Array.isArray(b.accessories)?b.accessories:[],dimensions:{levels:false,markers:false,width:false,depth:false}}};
  async function showInfo(index){
    const entry=entries()[index];if(!entry?.drawing)return;const d=entry.drawing,sys=systemOf(entry),m=ensureModal(),body=m.querySelector('#rafexFreeInfoBody');m.querySelector('#rafexFreeInfoTitle').textContent=(sys==='b2b'?'B2B':sys==='mr'?'MR':'MEKİK')+' · '+String(entry.name||'Raf')+' · MODÜL';m.hidden=false;body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-loading">Modül hazırlanıyor…</div>';
    try{
      if(sys==='mekik2'){
        const front=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'front',true):'';const side=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'side',true):'';
        body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-views mekik-only">'+(front?'<div class="rafex-free-info-view"><strong>ÖNDEN GÖRÜŞ</strong>'+front+'</div>':'')+(side?'<div class="rafex-free-info-view"><strong>YAN GÖRÜŞ</strong>'+side+'</div>':'')+'</div>';return;
      }
      if(sys==='b2b'){
        const capture=window.RafexB2BViewer?.captureViews;if(typeof capture!=='function')throw new Error('B2B modül motoru hazır değil.');
        const result=await capture(b2bOptions(d),{width:1500,height:980,pixelRatio:1.6,cameraPadding:1.18,frontDimensions:{levels:false,markers:false,eye:false,width:false,depth:false},sideDimensions:{levels:false,markers:false,eye:false,width:false,depth:false},side:'right'});
        if(!result?.front)throw new Error('B2B modülü oluşturulamadı.');body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-views"><div class="rafex-free-info-view"><strong>B2B MODÜL</strong><img src="'+result.front+'" alt="B2B modül görünümü"></div></div>';return;
      }
      const capture=window.RafexMRViewer?.captureView;if(typeof capture!=='function')throw new Error('MR modül motoru hazır değil.');
      const image=await capture(mrConfig(d),{width:1500,height:980,view:'perspective'});if(!image)throw new Error('MR modülü oluşturulamadı.');body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-views"><div class="rafex-free-info-view"><strong>MR MODÜL</strong><img src="'+image+'" alt="MR modül görünümü"></div></div>';
    }catch(error){body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-loading">'+esc(error?.message||'Modül görünümü hazırlanamadı.')+'</div>'}
  }
  window.rafexFreeShowInfoV3=showInfo;
})();
</script>`;

// avoid accidental undefined variable in generated mrConfig
const fixedRuntime = runtime.replace("Number(b.width||l?.sectionWidth||d.palW)", "Number(b.width||d.b2bLayout?.sectionWidth||d.palW)");
html = html.replace('</body>', fixedRuntime + '</body>');
for(const required of ['data-rafex-free-info-modules="v27"','B2B MODÜL','MR MODÜL','mekik-only','rafexFreeShowInfoV3=showInfo'])if(!html.includes(required))throw new Error('Bilgi modül v27 doğrulaması eksik: '+required);
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Serbest bilgi penceresi: B2B/MR tek modül, Mekik yalnız ön/yan (v27).');

import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html
  .replace(/<style data-rafex-cantilever="v1">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-cantilever="v1">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-cantilever="v1">
#page.rafex-cantilever-v1{padding-bottom:40px}
#page .k-grid{display:grid;grid-template-columns:minmax(320px,.9fr) minmax(520px,1.4fr);gap:18px;margin-top:18px}
#page .k-card{background:#fff;border:1px solid #dfe5e0;border-radius:14px;padding:18px}
#page .k-card h3{margin:0 0 4px;font-size:17px}
#page .k-card>p{margin:0 0 14px;color:#68736c;font-size:11px;line-height:1.5}
#page .k-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#page .k-field{display:grid;gap:5px;color:#536058;font-size:10px;font-weight:800}
#page .k-field input,#page .k-field select{width:100%;padding:10px;border:1px solid #e5d991;background:#fff8d5;border-radius:8px;font-weight:800;color:#17201b}
#page .k-field.wide{grid-column:1/-1}
#page .k-note{margin-top:12px;padding:11px 12px;border-left:3px solid #f2c500;background:#fff8d5;color:#625600;font-size:11px;line-height:1.5}
#page .k-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
#page .k-actions button{background:#edf2ee;color:#173c2d}
#page .k-actions button.primary-k{background:#f2c500;color:#17201b}
#page .k-actions button.danger-k{background:#f7e9e9;color:#9a2929}
#page .k-visual{min-height:500px;border:1px solid #dfe5e0;border-radius:12px;background:#fbfcfb;overflow:hidden}
#page .k-visual svg{display:block;width:100%;height:100%;min-height:500px}
#page .k-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
#page .k-summary div{padding:10px 12px;background:#173c2d;color:#fff;border-radius:9px}
#page .k-summary small{display:block;color:#b8c8be;font-size:8px;margin-bottom:3px}
#page .k-summary b{font-size:16px}
#page .k-section{margin-top:18px}
#page .k-section-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:10px}
#page .k-section-head h3{margin:0}
#page .k-section-head p{margin:3px 0 0;color:#68736c;font-size:11px}
#page .k-layout-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-bottom:10px}
#page .k-layout-tools .k-field{width:150px}
#page .k-layout-wrap{position:relative;border:1px solid #cfd8d2;border-radius:12px;background:#fff;overflow:hidden}
#page #kLayoutSvg{display:block;width:100%;height:620px;touch-action:none;background:#fff}
#page .k-layout-status{padding:9px 12px;border-top:1px solid #e7ece8;color:#68736c;font-size:10px}
#page .k-selected{margin-left:auto;padding:9px 12px;border-radius:9px;background:#173c2d;color:#fff;font-size:10px;font-weight:800;min-width:180px;text-align:center}
#page .k-pdf-card{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px 18px;background:#fff;border:1px solid #dfe5e0;border-radius:12px}
#page .k-pdf-card h4{margin:0 0 4px}
#page .k-pdf-card p{margin:0;color:#68736c;font-size:11px}
#page .k-pdf-card button{background:#173c2d;color:#fff;white-space:nowrap}
@media(max-width:980px){#page .k-grid{grid-template-columns:1fr}#page .k-summary{grid-template-columns:repeat(2,1fr)}}
</style>
<script data-rafex-cantilever="v1">
(()=>{
  if(window.__rafexCantileverV1)return;
  window.__rafexCantileverV1=true;
  const STORAGE='rafex-cantilever-v1';
  const LAYOUT_STORAGE='rafex-cantilever-layout-v1';
  const defaults={project:'',side:'single',spacing:1500,height:5000,levels:4,armLength:1200,modules:4,load:500,areaW:50000,areaH:30000};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const fmt=(n)=>{try{return Math.round(Number(n)||0).toLocaleString('tr-TR')}catch{return String(Math.round(Number(n)||0))}};
  const esc=(v)=>String(v==null?'':v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const loadState=()=>{try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(STORAGE)||'{}'))}catch{return Object.assign({},defaults)}};
  const loadLayout=()=>{try{const v=JSON.parse(localStorage.getItem(LAYOUT_STORAGE)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  let state=loadState();
  let layout=loadLayout();
  let selectedId=null;
  let drag=null;
  const save=()=>{localStorage.setItem(STORAGE,JSON.stringify(state));localStorage.setItem(LAYOUT_STORAGE,JSON.stringify(layout))};
  const currentSpec=()=>({side:state.side,spacing:clamp(state.spacing,1000,2000),height:clamp(state.height,1500,12000),levels:clamp(state.levels,1,12),armLength:clamp(state.armLength,300,2500),modules:clamp(state.modules,1,20),load:clamp(state.load,0,5000)});
  const footprint=(spec)=>({w:Math.max(80,(Math.max(1,spec.modules)-1)*spec.spacing+80),h:(spec.side==='double'?spec.armLength*2:spec.armLength)+120});
  const levelYs=(spec,top,bottom)=>{const out=[];for(let i=0;i<spec.levels;i++)out.push(bottom-(i+1)*(bottom-top)/(spec.levels+1));return out};
  function previewSvg(){
    const s=currentSpec(), W=960,H=560,left=80,right=880,top=72,bottom=472;
    const count=Math.max(1,s.modules), usable=right-left, step=count>1?usable/(count-1):0, armPx=Math.max(45,Math.min(125,s.armLength/12));
    let uprights='',arms='',dims='';
    const ys=levelYs(s,top,bottom);
    for(let i=0;i<count;i++){
      const x=count===1?(left+right)/2:left+i*step;
      uprights+='<rect x="'+(x-5)+'" y="'+top+'" width="10" height="'+(bottom-top)+'" rx="2" fill="#87978f"/>';
      if(s.side==='double')uprights+='<rect x="'+(x-armPx)+'" y="'+(bottom-8)+'" width="'+(armPx*2)+'" height="8" rx="2" fill="#87978f"/>';
      else uprights+='<rect x="'+x+'" y="'+(bottom-8)+'" width="'+armPx+'" height="8" rx="2" fill="#87978f"/>';
      ys.forEach((y)=>{if(s.side==='double')arms+='<rect x="'+(x-armPx)+'" y="'+(y-4)+'" width="'+(armPx*2)+'" height="8" rx="2" fill="#d6aa22"/>';else arms+='<rect x="'+x+'" y="'+(y-4)+'" width="'+armPx+'" height="8" rx="2" fill="#d6aa22"/>';});
      if(i<count-1){const nx=left+(i+1)*step;dims+='<line x1="'+x+'" y1="510" x2="'+nx+'" y2="510" stroke="#597064"/><line x1="'+x+'" y1="502" x2="'+x+'" y2="518" stroke="#597064"/><line x1="'+nx+'" y1="502" x2="'+nx+'" y2="518" stroke="#597064"/><text x="'+((x+nx)/2)+'" y="532" text-anchor="middle" font-size="13" fill="#40564b" font-weight="700">'+fmt(s.spacing)+' mm</text>';}
    }
    const sideText=s.side==='double'?'Çift taraflı':'Tek taraflı';
    return '<svg id="kPreviewSvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Konsol kollu raf ön görünüşü"><defs><pattern id="kg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e8eeeb" stroke-width="1"/></pattern></defs><rect width="960" height="560" fill="#fff"/><rect width="960" height="560" fill="url(#kg)"/><text x="480" y="30" text-anchor="middle" font-size="20" font-weight="900" fill="#173c2d">Konsol Kollu · Ön Görünüş</text><text x="480" y="51" text-anchor="middle" font-size="12" fill="#68736c">'+sideText+' · '+fmt(s.modules)+' ayak hattı · '+fmt(s.levels)+' kol seviyesi</text><line x1="45" y1="472" x2="915" y2="472" stroke="#8d9a93" stroke-width="2"/>'+uprights+arms+dims+'<line x1="34" y1="72" x2="34" y2="472" stroke="#597064"/><line x1="26" y1="72" x2="42" y2="72" stroke="#597064"/><line x1="26" y1="472" x2="42" y2="472" stroke="#597064"/><text x="20" y="278" transform="rotate(-90 20 278)" text-anchor="middle" font-size="13" font-weight="800" fill="#40564b">Ayak '+fmt(s.height)+' mm</text><rect x="596" y="82" width="314" height="48" rx="10" fill="#fff8d5" stroke="#e5d991"/><text x="753" y="101" text-anchor="middle" font-size="11" font-weight="900" fill="#625600">AYAK PROFİLİ</text><text x="753" y="119" text-anchor="middle" font-size="11" fill="#625600">Ayağın devamı · aynı renk · '+(s.side==='double'?'iki taraf':'tek taraf')+'</text></svg>';
  }
  function render(){
    const page=document.getElementById('page');if(!page)return;
    page.classList.add('rafex-cantilever-v1');
    page.classList.remove('b2b-mode','mr-mode');
    page.innerHTML='<section class="hero"><div><p>RAF SİSTEMLERİ</p><h2>Konsol Kollu Raf</h2></div><div class="capacity"><small>AYAK ARASI</small><b id="kHeroSpacing">'+fmt(state.spacing)+' mm</b></div></section>'+
      '<div class="k-grid"><section class="k-card"><h3>Proje Girdileri</h3><p>Geometrik konfigürasyon, serbest yerleşim ve B2B benzeri A4 çıktı akışı.</p><div class="k-form">'+
      '<label class="k-field wide">Proje adı<input id="kProject" value="'+esc(state.project)+'" placeholder="Proje adı"></label>'+
      '<label class="k-field">Sistem yönü<select id="kSide"><option value="single"'+(state.side==='single'?' selected':'')+'>Tek taraflı</option><option value="double"'+(state.side==='double'?' selected':'')+'>Çift taraflı</option></select></label>'+
      '<label class="k-field">Ayak arası mesafe<select id="kSpacing"><option>1000</option><option>1250</option><option>1500</option><option>1750</option><option>2000</option></select></label>'+
      '<label class="k-field">Ayak yüksekliği (mm)<input id="kHeight" type="number" min="1500" max="12000" step="100" value="'+state.height+'"></label>'+
      '<label class="k-field">Kol seviyesi<input id="kLevels" type="number" min="1" max="12" value="'+state.levels+'"></label>'+
      '<label class="k-field">Kol uzunluğu (mm)<input id="kArmLength" type="number" min="300" max="2500" step="50" value="'+state.armLength+'"></label>'+
      '<label class="k-field">Ayak hattı adedi<input id="kModules" type="number" min="1" max="20" value="'+state.modules+'"></label>'+
      '<label class="k-field wide">Birim kol yükü (kg)<input id="kLoad" type="number" min="0" max="5000" step="50" value="'+state.load+'"></label></div>'+
      '<div class="k-note"><b>Ayak profili:</b> tabanda ayrı bir parça gibi değil, ayağın devamı olarak çizilir ve ayak ile aynı renktedir. Tek taraflı sistemde tek yönde, çift taraflı sistemde iki yönde devam eder.</div>'+
      '<div class="k-actions"><button class="primary-k" id="kAddLayout">+ Rafı Serbest Alana Ekle</button><button id="kPrint">PDF / Çıktı Oluştur</button></div></section>'+
      '<section class="k-card"><h3>Raf Görünüşü</h3><p>Ayak profili ile dikey ayak aynı malzeme/rengin tek devamı olarak gösterilir.</p><div class="k-visual" id="kVisual">'+previewSvg()+'</div><div class="k-summary"><div><small>SİSTEM</small><b id="kSumSide">'+(state.side==='double'?'Çift taraflı':'Tek taraflı')+'</b></div><div><small>AYAK ARASI</small><b id="kSumSpacing">'+fmt(state.spacing)+' mm</b></div><div><small>KOL</small><b id="kSumArm">'+fmt(state.armLength)+' mm</b></div><div><small>YÜKSEKLİK</small><b id="kSumHeight">'+fmt(state.height)+' mm</b></div></div></section></div>'+
      '<section class="k-card k-section"><div class="k-section-head"><div><h3>Serbest Yerleşim</h3><p>B2B mantığında: raf ekle, seç, sürükle, çoğalt, 90° döndür ve sil.</p></div><div class="k-selected" id="kSelected">Seçili raf yok</div></div><div class="k-layout-tools">'+
      '<label class="k-field">Alan eni (mm)<input id="kAreaW" type="number" min="5000" step="500" value="'+state.areaW+'"></label><label class="k-field">Alan boyu (mm)<input id="kAreaH" type="number" min="5000" step="500" value="'+state.areaH+'"></label>'+ 
      '<div class="k-actions" style="margin-top:0"><button id="kDuplicate">Çoğalt</button><button id="kRotate">90° Döndür</button><button class="danger-k" id="kDelete">Sil</button><button class="danger-k" id="kClear">Temizle</button></div></div><div class="k-layout-wrap"><svg id="kLayoutSvg" viewBox="0 0 '+state.areaW+' '+state.areaH+'" aria-label="Konsol kollu serbest yerleşim"></svg><div class="k-layout-status" id="kStatus">Rafları alan içine yerleştirebilirsin; alan dışına çıkış ve raf çakışması engellenir.</div></div></section>'+
      '<section class="k-section k-pdf-card"><div><h4>Yatay A4 Proje Sayfası</h4><p>Ön görünüş, serbest yerleşim ve temel proje bilgileri B2B benzeri çıktı düzeninde hazırlanır.</p></div><button id="kPrint2">Çıktıyı Oluştur</button></section>';
    const spacing=document.getElementById('kSpacing');if(spacing)spacing.value=String(state.spacing);
    bind();drawLayout();
  }
  function readForm(){
    const g=(id)=>document.getElementById(id);
    state.project=g('kProject')?.value||'';state.side=g('kSide')?.value==='double'?'double':'single';state.spacing=Number(g('kSpacing')?.value)||1500;state.height=Number(g('kHeight')?.value)||5000;state.levels=Number(g('kLevels')?.value)||4;state.armLength=Number(g('kArmLength')?.value)||1200;state.modules=Number(g('kModules')?.value)||4;state.load=Number(g('kLoad')?.value)||0;state.areaW=Math.max(5000,Number(g('kAreaW')?.value)||50000);state.areaH=Math.max(5000,Number(g('kAreaH')?.value)||30000);save();
  }
  function updatePreview(){readForm();const v=document.getElementById('kVisual');if(v)v.innerHTML=previewSvg();const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t};set('kHeroSpacing',fmt(state.spacing)+' mm');set('kSumSide',state.side==='double'?'Çift taraflı':'Tek taraflı');set('kSumSpacing',fmt(state.spacing)+' mm');set('kSumArm',fmt(state.armLength)+' mm');set('kSumHeight',fmt(state.height)+' mm');const svg=document.getElementById('kLayoutSvg');if(svg)svg.setAttribute('viewBox','0 0 '+state.areaW+' '+state.areaH);drawLayout();}
  function itemSize(item){const f=footprint(item.spec);return item.angle%180===90?{w:f.h,h:f.w}:{w:f.w,h:f.h}}
  function overlaps(item,x,y){const a=itemSize(item),ax2=x+a.w,ay2=y+a.h;return layout.some((o)=>{if(o.id===item.id)return false;const b=itemSize(o),bx=o.x,by=o.y;return x<bx+b.w&&ax2>bx&&y<by+b.h&&ay2>by})}
  function validPos(item,x,y){const z=itemSize(item);return x>=0&&y>=0&&x+z.w<=state.areaW&&y+z.h<=state.areaH&&!overlaps(item,x,y)}
  function drawLayout(){
    const svg=document.getElementById('kLayoutSvg');if(!svg)return;svg.setAttribute('viewBox','0 0 '+state.areaW+' '+state.areaH);
    let s='<defs><pattern id="kFloorGrid" width="1000" height="1000" patternUnits="userSpaceOnUse"><path d="M1000 0H0V1000" fill="none" stroke="#e7ece8" stroke-width="20"/></pattern></defs><rect x="0" y="0" width="'+state.areaW+'" height="'+state.areaH+'" fill="#fff"/><rect x="0" y="0" width="'+state.areaW+'" height="'+state.areaH+'" fill="url(#kFloorGrid)"/><rect x="20" y="20" width="'+(state.areaW-40)+'" height="'+(state.areaH-40)+'" fill="none" stroke="#173c2d" stroke-width="40"/>';
    layout.forEach((item,index)=>{const size=itemSize(item),sel=item.id===selectedId,fill=sel?'#f2c500':'#d6aa22',stroke=sel?'#173c2d':'#8d7414';s+='<g data-kid="'+item.id+'" style="cursor:grab"><rect x="'+item.x+'" y="'+item.y+'" width="'+size.w+'" height="'+size.h+'" rx="80" fill="'+fill+'" fill-opacity=".72" stroke="'+stroke+'" stroke-width="'+(sel?70:35)+'"/><line x1="'+item.x+'" y1="'+(item.y+size.h/2)+'" x2="'+(item.x+size.w)+'" y2="'+(item.y+size.h/2)+'" stroke="#87978f" stroke-width="55"/><text x="'+(item.x+size.w/2)+'" y="'+(item.y+size.h/2-110)+'" text-anchor="middle" font-size="340" font-weight="900" fill="#173c2d">K'+(index+1)+'</text><text x="'+(item.x+size.w/2)+'" y="'+(item.y+size.h/2+330)+'" text-anchor="middle" font-size="240" font-weight="700" fill="#40564b">'+fmt(item.spec.spacing)+' mm · '+(item.spec.side==='double'?'Çift':'Tek')+'</text></g>';});
    svg.innerHTML=s;updateSelected();
  }
  function updateSelected(){const box=document.getElementById('kSelected'),item=layout.find((x)=>x.id===selectedId);if(box)box.textContent=item?'Seçili: K'+(layout.indexOf(item)+1)+' · '+fmt(item.spec.spacing)+' mm':'Seçili raf yok'}
  function addLayout(){readForm();const spec=currentSpec(),sz=footprint(spec),id=Date.now()+Math.floor(Math.random()*1000),item={id,spec,x:Math.max(0,(state.areaW-sz.w)/2),y:Math.max(0,(state.areaH-sz.h)/2),angle:0};let tries=0;while(overlaps(item,item.x,item.y)&&tries<20){item.x=Math.min(state.areaW-sz.w,Math.max(0,item.x+500));item.y=Math.min(state.areaH-sz.h,Math.max(0,item.y+500));tries++}if(!validPos(item,item.x,item.y)){const st=document.getElementById('kStatus');if(st)st.textContent='Yeni raf için boş alan bulunamadı.';return}layout.push(item);selectedId=id;save();drawLayout()}
  function duplicate(){const src=layout.find((x)=>x.id===selectedId);if(!src)return;const copy=JSON.parse(JSON.stringify(src));copy.id=Date.now()+Math.floor(Math.random()*1000);let found=false;for(let d=500;d<=5000;d+=500){if(validPos(copy,src.x+d,src.y)){copy.x=src.x+d;found=true;break}if(validPos(copy,src.x,src.y+d)){copy.y=src.y+d;found=true;break}}if(!found)return;layout.push(copy);selectedId=copy.id;save();drawLayout()}
  function rotate(){const item=layout.find((x)=>x.id===selectedId);if(!item)return;const old=item.angle;item.angle=(item.angle+90)%180;if(!validPos(item,item.x,item.y))item.angle=old;save();drawLayout()}
  function del(){layout=layout.filter((x)=>x.id!==selectedId);selectedId=null;save();drawLayout()}
  function bind(){
    ['kProject','kSide','kSpacing','kHeight','kLevels','kArmLength','kModules','kLoad','kAreaW','kAreaH'].forEach((id)=>{const e=document.getElementById(id);if(!e)return;e.addEventListener(id==='kProject'?'input':'change',updatePreview)});
    document.getElementById('kAddLayout')?.addEventListener('click',addLayout);document.getElementById('kDuplicate')?.addEventListener('click',duplicate);document.getElementById('kRotate')?.addEventListener('click',rotate);document.getElementById('kDelete')?.addEventListener('click',del);document.getElementById('kClear')?.addEventListener('click',()=>{layout=[];selectedId=null;save();drawLayout()});document.getElementById('kPrint')?.addEventListener('click',printOutput);document.getElementById('kPrint2')?.addEventListener('click',printOutput);
    const svg=document.getElementById('kLayoutSvg');if(!svg)return;
    svg.addEventListener('pointerdown',(e)=>{const g=e.target.closest?.('[data-kid]');if(!g)return;const id=Number(g.dataset.kid),item=layout.find((x)=>x.id===id);if(!item)return;selectedId=id;const pt=pointerPoint(svg,e);drag={id,startX:item.x,startY:item.y,offX:pt.x-item.x,offY:pt.y-item.y};svg.setPointerCapture?.(e.pointerId);drawLayout()});
    svg.addEventListener('pointermove',(e)=>{if(!drag)return;const item=layout.find((x)=>x.id===drag.id);if(!item)return;const pt=pointerPoint(svg,e),x=pt.x-drag.offX,y=pt.y-drag.offY;if(validPos(item,x,y)){item.x=x;item.y=y;drawLayout()}});
    const end=()=>{if(drag){drag=null;save();drawLayout()}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('click',(e)=>{const g=e.target.closest?.('[data-kid]');if(!g)return;selectedId=Number(g.dataset.kid);drawLayout()});
  }
  function pointerPoint(svg,e){const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return{x:(e.clientX-r.left)*vb.width/Math.max(1,r.width)+vb.x,y:(e.clientY-r.top)*vb.height/Math.max(1,r.height)+vb.y}}
  function printOutput(){
    readForm();const preview=previewSvg(),layoutSvg=document.getElementById('kLayoutSvg')?.outerHTML||'';const s=currentSpec(),title=esc(state.project||'Konsol Kollu Raf Projesi');const w=window.open('','_blank');if(!w)return;const doc='<!doctype html><html><head><meta charset="utf-8"><title>'+title+'</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font:12px Arial;color:#17201b;margin:0}.head{display:flex;justify-content:space-between;border-bottom:3px solid #f2c500;padding:0 0 8px;margin-bottom:10px}.head h1{margin:0;font-size:22px}.head b{color:#173c2d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.card{border:1px solid #dfe5e0;border-radius:8px;padding:8px;break-inside:avoid}.card h2{font-size:14px;margin:0 0 6px;color:#173c2d}.card svg{width:100%;height:160mm;max-height:160mm}.spec{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}.spec div{padding:7px;background:#f4f6f4;border-radius:5px}.spec small{display:block;color:#68736c;font-size:8px}.spec b{font-size:11px}@media print{button{display:none}}</style></head><body><div class="head"><div><h1>'+title+'</h1><b>RAFEX · KONSOL KOLLU</b></div><div>Yatay A4 Proje Sayfası</div></div><div class="spec"><div><small>Sistem</small><b>'+(s.side==='double'?'Çift taraflı':'Tek taraflı')+'</b></div><div><small>Ayak arası</small><b>'+fmt(s.spacing)+' mm</b></div><div><small>Ayak yüksekliği</small><b>'+fmt(s.height)+' mm</b></div><div><small>Kol uzunluğu</small><b>'+fmt(s.armLength)+' mm</b></div><div><small>Kol seviyesi</small><b>'+fmt(s.levels)+'</b></div><div><small>Ayak hattı</small><b>'+fmt(s.modules)+'</b></div><div><small>Birim kol yükü</small><b>'+fmt(s.load)+' kg</b></div><div><small>Ayak profili</small><b>Ayağın devamı · aynı renk</b></div></div><div class="grid"><div class="card"><h2>Ön Görünüş</h2>'+preview+'</div><div class="card"><h2>Serbest Yerleşim</h2>'+layoutSvg+'</div></div><script>setTimeout(()=>window.print(),350)<\/script></body></html>';w.document.open();w.document.write(doc);w.document.close();
  }
  window.rafexRenderCantileverV1=render;
  document.addEventListener('click',(e)=>{const b=e.target?.closest?.('[data-page="konsol"]');if(!b)return;setTimeout(render,0)},true);
  const mo=new MutationObserver(()=>{const title=document.getElementById('pageTitle')?.textContent||'',page=document.getElementById('page');if(!page||page.classList.contains('rafex-cantilever-v1'))return;if(title.trim()==='Konsol Kollu'&&page.textContent.includes('Teknik formüller tanımlandığında'))render()});
  mo.observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;

html = html.replace('</body>', runtime + '</body>');
for (const required of ['data-rafex-cantilever="v1"','rafexRenderCantileverV1','Ayak arası mesafe','Ayak profili','Serbest Yerleşim','PDF / Çıktı Oluştur']) {
  if (!html.includes(required)) throw new Error(`Konsol Kollu v1 doğrulaması eksik: ${required}`);
}
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol Kollu v1: ayak profili, mesafe secimi, serbest yerlesim ve A4 cikti eklendi.');

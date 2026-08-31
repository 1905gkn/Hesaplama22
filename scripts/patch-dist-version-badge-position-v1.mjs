import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v17"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

function istanbulStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const val = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${val('day')}.${val('month')}.${val('year')} ${val('hour')}:${val('minute')}:${val('second')}`;
}
const buildTime = istanbulStamp();

// Eski tum badge enjeksiyonlarini ve bilinen kart elemanlarini build cikisindan fiziksel olarak temizle.
html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<style\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<(?:div|span)\s+id="rafexVersionBadge"[^>]*>[\s\S]*?<\/(?:div|span)>\s*/g, '')
  .replace(/<(?:div|span)\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/(?:div|span)>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoCard"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoTop"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoLogin"[^>]*>[\s\S]*?<\/div>\s*/g, '');

const cardInner = `<span class="rafex-version-dot" aria-hidden="true"></span><span class="rafex-version-copy"><span class="rafex-version-main">Son sürüm · ${buildSha}</span><span class="rafex-version-time">Yüklenme: ${buildTime}</span></span>`;
const singleCard = `<div id="rafexVersionInfoCard" class="rafex-version-info-card rafex-version-login" aria-label="Son sürüm ve yüklenme bilgisi">${cardInner}</div>`;

const style = `
<style ${marker}>
  #rafexVersionBadge,#rafexBuildVersionBadge,#rafexVersionInfoTop,#rafexVersionInfoLogin{display:none!important;}
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  .rafex-version-info-card{
    box-sizing:border-box!important;
    min-width:188px!important;
    height:46px!important;
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    padding:6px 12px!important;
    border:1px solid #dfadb5!important;
    border-radius:12px!important;
    background:#fff8f9!important;
    color:#65000d!important;
    box-shadow:none!important;
    white-space:nowrap!important;
    flex:0 0 auto!important;
    font-family:Arial,sans-serif!important;
    line-height:1.15!important;
    opacity:1!important;
    visibility:visible!important;
  }
  #rafexVersionInfoCard.rafex-version-header{position:static!important;inset:auto!important;margin:0!important;transform:none!important;z-index:auto!important;}
  #rafexVersionInfoCard.rafex-version-login{position:fixed!important;right:18px!important;bottom:18px!important;top:auto!important;left:auto!important;margin:0!important;transform:none!important;z-index:99991!important;}
  .rafex-version-dot{width:6px!important;height:6px!important;border-radius:50%!important;background:#690013!important;flex:0 0 6px!important;}
  .rafex-version-copy{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:3px!important;min-width:0!important;}
  .rafex-version-main{color:#65000d!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important;}
  .rafex-version-time{color:#8c646a!important;font-size:9px!important;font-weight:400!important;}
  @media(max-width:760px){
    .rafex-version-info-card{min-width:172px!important;height:42px!important;padding:5px 10px!important;gap:8px!important;}
    .rafex-version-main{font-size:10px!important;}.rafex-version-time{font-size:8px!important;}
    #rafexVersionInfoCard.rafex-version-login{right:10px!important;bottom:10px!important;}
  }
</style>`;

if (html.includes('<body>')) html = html.replace('<body>', `<body>${singleCard}`);
else throw new Error('body etiketi bulunamadi.');

const runtime = `
<script ${marker}>
(function(){
  if(window.__rafexSinglePhysicalVersionCardV17)return;
  window.__rafexSinglePhysicalVersionCardV17=true;

  function normalized(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVersionCopy(el){
    var txt=normalized(el);
    return (txt.includes('son sürüm') || txt.includes('son surum')) && (txt.includes('yüklenme') || txt.includes('yuklenme'));
  }
  function visible(el){
    return !!(el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  }
  function findHistoryButton(){
    var direct=document.querySelector('button.history-top');
    if(direct)return direct;
    return Array.from(document.querySelectorAll('button')).find(function(btn){
      var t=normalized(btn);
      return t.includes('proje geçmişi') || t.includes('proje gecmisi');
    }) || null;
  }
  function removeAllOtherVersionCopies(card){
    ['rafexVersionBadge','rafexBuildVersionBadge','rafexVersionInfoTop','rafexVersionInfoLogin'].forEach(function(id){
      var old=document.getElementById(id);if(old)old.remove();
    });
    Array.from(document.body ? document.body.querySelectorAll('*') : []).forEach(function(el){
      if(el===card || card.contains(el))return;
      if(!isVersionCopy(el))return;
      var r=el.getBoundingClientRect ? el.getBoundingClientRect() : {width:0,height:0};
      var cardSized=r.width>=110 && r.width<=420 && r.height>=24 && r.height<=120;
      var labelled=String(el.getAttribute && el.getAttribute('aria-label') || '').toLocaleLowerCase('tr-TR').includes('son sürüm');
      var known=el.classList && (el.classList.contains('rafex-version-info-card') || el.classList.contains('version-badge') || el.classList.contains('version-info'));
      if(cardSized || labelled || known)el.remove();
    });
  }
  function place(){
    if(!document.body)return;
    var card=document.getElementById('rafexVersionInfoCard');
    if(!card)return;
    removeAllOtherVersionCopies(card);

    var app=document.getElementById('app');
    var auth=document.getElementById('auth');
    var history=findHistoryButton();
    var actions=history && (history.closest('.top-actions') || history.parentElement);
    var appVisible=visible(app) || (!!history && !visible(auth));

    if(appVisible && history && actions){
      if(card.parentElement!==actions || card.previousElementSibling!==history){
        history.insertAdjacentElement('afterend',card);
      }
      card.classList.remove('rafex-version-login');
      card.classList.add('rafex-version-header');
    }else{
      if(card.parentElement!==document.body)document.body.appendChild(card);
      card.classList.remove('rafex-version-header');
      card.classList.add('rafex-version-login');
    }
  }

  var queued=false;
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(function(){queued=false;place();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  window.addEventListener('hashchange',schedule);
  schedule();
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  setTimeout(schedule,1500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
const inventoryRuntime = `
<style data-rafex-layout-inventory-style="v44">
/* Kayitli tip kartlarinin renkli govdesi A tipi ile ayni sabit boydadir. */
#page.rafex-free-drawing-page .m2-saved-type{
  box-sizing:border-box!important;
  flex:0 0 445px!important;
  width:445px!important;
  min-width:445px!important;
  max-width:445px!important;
  overflow:hidden!important;
}
#page.rafex-free-drawing-page .m2-saved-type small{
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
@media(max-width:760px){
  #page.rafex-free-drawing-page .m2-saved-type-row{width:100%!important;min-width:0!important}
  #page.rafex-free-drawing-page .m2-saved-type{
    flex:1 1 auto!important;width:auto!important;min-width:0!important;max-width:none!important;
  }
}

#page.rafex-free-drawing-page #m2LayoutProductList{
  display:grid!important;
  grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;
  gap:8px!important;
  align-items:stretch!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList>b{grid-column:1/-1!important}
#page.rafex-free-drawing-page #m2LayoutProductList .m2-layout-product{
  box-sizing:border-box!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  justify-content:flex-start!important;
  gap:7px!important;
  min-width:0!important;
  min-height:72px!important;
  padding:9px 11px!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList .m2-layout-product>.rafex-product-copy{
  display:flex!important;
  flex-direction:column!important;
  gap:3px!important;
  min-width:0!important;
  width:100%!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList .rafex-product-name{
  color:#173c2d!important;
  font-size:10px!important;
  font-weight:900!important;
  line-height:1.2!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList .m2-layout-product small{
  display:block!important;
  color:#66746c!important;
  font-size:8px!important;
  line-height:1.25!important;
  overflow-wrap:anywhere!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList .m2-layout-product>.rafex-product-qty{
  display:block!important;
  grid-column:auto!important;
  margin-top:auto!important;
  color:#0d5139!important;
  font-size:13px!important;
  font-weight:950!important;
  line-height:1!important;
  text-align:left!important;
  white-space:nowrap!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList>.rafex-product-system-section{
  grid-column:1/-1!important;
  display:grid!important;
  grid-template-columns:repeat(auto-fit,minmax(190px,1fr))!important;
  gap:8px!important;
  padding:10px!important;
  border:1px solid #d8e2db!important;
  border-radius:10px!important;
  background:#f7faf8!important;
}
#page.rafex-free-drawing-page #m2LayoutProductList .rafex-product-system-title{
  grid-column:1/-1!important;
  display:block!important;
  padding:7px 10px!important;
  border-radius:7px!important;
  background:#173c2d!important;
  color:#fff!important;
  font-size:11px!important;
  font-weight:950!important;
  line-height:1.1!important;
  letter-spacing:.03em!important;
}
</style>
<script data-rafex-layout-inventory="v44">
(function(){
  window.__rafexLayoutInventoryActive=true;
  if(window.__rafexLayoutInventoryV44)return;
  window.__rafexLayoutInventoryV44=true;
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function n(value){return Math.max(0,Math.round(Number(value)||0));}
  function textNumber(value){return n(value).toLocaleString('tr-TR');}
  function racks(){try{return typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)?m2LayoutState.racks:[];}catch(e){return[];}}
  function symbols(){try{return typeof m2LayoutSymbols!=='undefined'&&Array.isArray(m2LayoutSymbols)?m2LayoutSymbols:[];}catch(e){return[];}}
  function accessories(){
    var result=[],all=symbols();
    function push(name,qty,spec){qty=n(qty);if(qty)result.push({name:name,qty:qty,spec:spec||'',unit:'adet'});}
    var uaks=all.filter(function(item){return item&&item.type==='uaks';}).length;
    var uakz=all.filter(function(item){return item&&item.type==='uakz';}).length;
    push('UAKS ayak koruma',uaks,'');
    push('UAKZ ayak koruma',uakz,'');
    push('Klipsli dübel',uaks*4,'12×110 · UAKS');
    push('Klipsli dübel',uakz*4,'12×110 · UAKZ');
    var barriers=new Map();
    all.filter(function(item){return item&&item.type==='barrier';}).forEach(function(item){var length=n(item.widthMm),key=(length?textNumber(length)+' mm':'Özel ölçü');barriers.set(key,(barriers.get(key)||0)+1);});
    barriers.forEach(function(qty,spec){push('Bariyer koruma',qty,spec);push('Klipsli dübel',qty*8,'12×110 · Bariyer');});
    var light=0,heavy=0;
    racks().forEach(function(rack){(Array.isArray(rack&&rack.seismicBraces)?rack.seismicBraces:[]).forEach(function(brace){if(brace&&brace.type==='heavy')heavy++;else if(brace&&brace.type==='light')light++;});});
    push('Hafif deprem çaprazı',light,'');
    push('Ağır deprem çaprazı',heavy,'');
    return result;
  }
  function rackSystem(rack){
    var isMr=!!(rack&&((rack.b2b&&rack.b2b.mr)||rack.rafexSystem==='mr'||rack.systemType==='mr'||(rack.b2bLayout&&rack.b2bLayout.palletType==='mr')||(rack.plan&&rack.plan.mr)));
    if(isMr)return 'mr';
    if(rack&&rack.b2bLayout)return 'b2b';
    return 'mekik2';
  }
  function decimalText(value){
    var parsed=Number(String(value==null?'':value).replace(',','.'));
    if(!Number.isFinite(parsed)||parsed<=0)return '';
    return parsed.toLocaleString('tr-TR',{maximumFractionDigits:2});
  }
  function recommendationText(value){
    if(Array.isArray(value))value=value[0];
    if(value&&typeof value==='object')value=value.profile||value.type||value.name||value.label||value.recommendation||value.st37||value.st52||'';
    var text=String(value||'').replace(/^\\s*\\d+[.]?\\s*(?:ÖNERİ|ONERI)\\s*[·:\-]?\\s*/i,'').trim();
    var profile=text.match(/\\d+\\s*[x×]\\s*\\d+\\s*[x×]\\s*\\d+(?:[,.]\\d+)?(?:\\s*mm)?(?:\\s*ST\\s*(?:37|52))?/i);
    if(profile)return profile[0].replace(/\\s*[x×]\\s*/g,'×').replace(/ST\\s+/i,'ST').replace(/\\s+/g,' ').trim();
    return text.split(/\\s*[·|]\\s*/)[0].replace(/\\s*[-–]?\\s*\\d[\\d.]*\\s*kg.*$/i,'').trim();
  }
  function mekikColumnSpacing(rack){
    var direct=['columnSpacing','columnPitch','bayPitch','bayWidth','traverseWidth','traverseLength','kolonAraligi'];
    for(var i=0;i<direct.length;i++){var value=n(rack&&rack[direct[i]]);if(value)return value;}
    var pallet=n(rack&&rack.palW);
    var sideRaw=rack&&(rack.sideClearance??rack.sideGap??rack.palletSideGap??rack.baySideGap);
    var side=Number(sideRaw);
    if(!Number.isFinite(side)||side<0)side=75;
    if(pallet)return pallet+Math.round(side*2);
    return 0;
  }
  function recommendedRailThickness(rack){
    var thickness=Number(String(rack&&rack.railThickness||'').replace(',','.'));
    if(Number.isFinite(thickness)&&thickness>0)return thickness;
    try{if(typeof m2RecommendedRailThickness==='function')return Number(String(m2RecommendedRailThickness(Number(rack&&rack.palletWeight)||0)).replace(',','.'))||0;}catch(e){}
    return 0;
  }
  function copyValue(value){
    try{if(typeof structuredClone==='function')return structuredClone(value);}catch(e){}
    try{return JSON.parse(JSON.stringify(value));}catch(e){return value;}
  }
  function trayPieceCount(clearWidth,trayWidth){
    clearWidth=Math.max(0,n(clearWidth));
    trayWidth=[200,250,300].includes(n(trayWidth))?n(trayWidth):300;
    var full=Math.floor(clearWidth/trayWidth),remainder=clearWidth-full*trayWidth;
    return full+(remainder>=50?1:0);
  }
  function b2bAccessoryRows(rack){
    var out=[],state=rack&&rack.b2b||{},layout=rack&&rack.b2bLayout||{};
    var rowCount=Math.max(1,n(layout.rowCount)||(state.rowType==='double'?2:1));
    var clearWidth=Math.max(0,n(layout.sectionWidth||rack&&rack.widthMm));
    var levelCount=Math.max(1,n(rack&&rack.levels||state.levels));
    (Array.isArray(state.accessories)?state.accessories:[]).forEach(function(item){
      var levels=new Set((Array.isArray(item&&item.levels)?item.levels:[]).map(function(value){return n(value);}).filter(function(value){return value>=1&&value<=levelCount;})).size;
      if(!levels)return;
      var qty=levels*rowCount,name='',spec='Aksesuar';
      if(item.type==='tray'){
        qty*=Math.max(1,trayPieceCount(clearWidth,item.width));
        name='Tava';spec=textNumber(n(item.width)||300)+' mm';
      }else if(item.type==='hTraverse')name='H Travers';
      else if(item.type==='palletStop')name='Palet Dayama';
      if(name&&qty>0)out.push({name:name,qty:qty,spec:spec,unit:'adet'});
    });
    return out;
  }
  function rows(targetSystem){
    var map=new Map();
    function add(name,qty,spec,unit){
      qty=n(qty);if(!qty||!name)return;
      name=String(name);spec=String(spec||'');unit=String(unit||'adet');
      var key=name+'|'+spec+'|'+unit,current=map.get(key)||{name:name,spec:spec,unit:unit,qty:0};
      current.qty+=qty;map.set(key,current);
    }
    function grouped(values){
      var out=new Map();(Array.isArray(values)?values:[]).forEach(function(value){var key=String(n(value));if(Number(key)>0)out.set(key,(out.get(key)||0)+1);});return out;
    }
    racks().forEach(function(rack){
      var system=rackSystem(rack);
      if(targetSystem&&system!==targetSystem)return;
      var isMr=system==='mr';
      if(isMr&&typeof window.rafexMrQuantitySummaryV42==='function'){
        try{(window.rafexMrQuantitySummaryV42([rack])||[]).forEach(function(row){add(row.item,row.qty,row.spec,row.unit);});return;}catch(e){}
      }
      if(rack&&rack.b2bLayout){
        var rowCount=Math.max(1,n(rack.b2bLayout.rowCount)||((rack.b2b&&rack.b2b.rowType==='double')?2:1));
        var footTeams=Math.max(1,2*rowCount-(rack.sharedFootWith?rowCount:0));
        var profileQty=footTeams*2;
        var height=n(rack.footLy||rack.totalRackHeight||rack.sideUprightHeight);
        var profile=String(rack.footProfile||rack.footProfileKey||(rack.b2b&&rack.b2b.footProfile)||'Ayak');
        var footSpec=profile+(height?' · L '+textNumber(height)+' mm':'');
        add('Ayak takımı',footTeams,footSpec);
        add('Ayak pabucu',profileQty,'Kaynaklı');
        add('Şim',profileQty,'');
        add('Kimyasal dübel',profileQty*2,'KIDM12120');
        var levelCount=Math.max(1,n(rack.levels));
        try{if(typeof m2B2BVisibleTraverseLevels==='function')levelCount=Math.max(1,n(m2B2BVisibleTraverseLevels(rack)));}catch(e){}
        var traverseQty=levelCount*2*rowCount;
        var traverseLength=n(rack.b2bLayout.sectionWidth||rack.widthMm);
        var traverseType=String((rack.b2b&&rack.b2b.traverseType)||rack.traverseRecommendation||'CC140');
        add('Travers',traverseQty,(traverseLength?textNumber(traverseLength)+' mm · ':'')+traverseType);
        add('Emniyet pimi',traverseQty*2,'');
        try{
          if(typeof b2bStraightTiePlan==='function'){
            var tie=b2bStraightTiePlan(rack),stations=rowCount===2?footTeams/rowCount:0;
            add('Düz arabağ',n(tie&&tie.count)*stations,textNumber(tie&&tie.length)+' × '+textNumber(tie&&tie.width)+' mm · galvaniz');
          }
        }catch(e){}
        b2bAccessoryRows(rack).forEach(function(row){add(row.name,row.qty,row.spec,row.unit);});
        return;
      }
      var bays=n(rack&&rack.bays),levels=n(rack&&rack.levels),columnCount=bays+1;
      var feet=rack&&rack.plan&&Array.isArray(rack.plan.feet)?rack.plan.feet:[];
      var braces=rack&&rack.plan&&Array.isArray(rack.plan.braces)?rack.plan.braces:[];
      grouped(feet).forEach(function(count,length){add('Ayak takımı',count*columnCount,(rack.footProfile?String(rack.footProfile)+' · ':'')+'L '+textNumber(length)+' mm');});
      if(rack&&rack.hasExtra)add('Ayak Profili',columnCount,'L '+textNumber(rack.straightProfileLength||rack.sideUprightHeight)+' mm');
      var systemType=String(rack&&rack.systemType||'fifo').toLocaleLowerCase('tr-TR');
      var channelTraverseCount=Math.max(0,feet.length*2+(rack&&rack.hasExtra?1:0)-(systemType==='fifo'?2:1));
      var traverseType=recommendationText(rack&&(rack.traverseRecommendation||rack.traverseType));
      var traverseWidth=mekikColumnSpacing(rack);
      var traverseSpec=(traverseType?traverseType+(traverseWidth?' · ':''):'')+(traverseWidth?textNumber(traverseWidth)+' mm':'');
      add('Travers',channelTraverseCount*bays*levels,traverseSpec);
      var railQty=bays*2*levels;
      var railThickness=recommendedRailThickness(rack),railHeight=n(rack&&rack.railHeight)||150,railLength=n(rack&&(rack.railLength||rack.depthMm)),depthCount=n(rack&&rack.depth);
      var railParts=[];
      if(railThickness)railParts.push(decimalText(railThickness)+' mm kalınlık');
      railParts.push('H '+textNumber(railHeight)+' mm');
      if(railLength)railParts.push('L '+textNumber(railLength)+' mm');
      if(depthCount)railParts.push(textNumber(depthCount)+' derinlik');
      add('Ray',railQty,railParts.join(' · '));
      add('Palet yastığı',railQty,'');
      add('Arka stoper',railQty,'');
      add('Forklift stoperi',columnCount,'');
      add('Giriş konsolu',columnCount*levels,'');
      add('Yatay çapraz seti',bays*Math.floor(levels/2),'');
      grouped(braces).forEach(function(count,length){add('Düz arabağ',count*columnCount*Math.ceil(levels/2),textNumber(length)+' mm');});
    });
    if(!targetSystem||targetSystem==='common')accessories().forEach(function(row){add(row.name||row.item,row.qty,row.spec,row.unit);});
    var order=['Ayak takımı','Ayak Profili','Ayak profili','Ayak pabucu','Şim','Kimyasal dübel','Travers','Emniyet pimi','Düz arabağ','Tava','H Travers','Palet Dayama','Ray','Palet yastığı','Arka stoper','Forklift stoperi','Giriş konsolu','Yatay çapraz seti','Hafif deprem çaprazı','Ağır deprem çaprazı','UAKS ayak koruma','UAKZ ayak koruma','Bariyer koruma','Klipsli dübel'];
    return Array.from(map.values()).sort(function(a,b){var ai=order.indexOf(a.name),bi=order.indexOf(b.name);if(ai<0)ai=999;if(bi<0)bi=999;return ai-bi||a.name.localeCompare(b.name,'tr')||a.spec.localeCompare(b.spec,'tr');});
  }
  function cleanup(){
    document.querySelectorAll('.m2-selected-rack-main b').forEach(function(node){if(/YERLEŞİM AYAK TOPLAMI/i.test(String(node.textContent||'')))node.remove();});
  }
  function renderRow(row){
    return '<span class="m2-layout-product"><span class="rafex-product-copy"><span class="rafex-product-name">'+esc(row.name)+'</span>'+(row.spec?'<small>'+esc(row.spec)+'</small>':'')+'</span><strong class="rafex-product-qty">'+textNumber(row.qty)+' '+esc(row.unit)+'</strong></span>';
  }
  function renderSection(key,label,list){
    if(!list.length)return '';
    return '<section class="rafex-product-system-section rafex-product-system-'+esc(key)+'"><b class="rafex-product-system-title">'+esc(label)+'</b>'+list.map(renderRow).join('')+'</section>';
  }
  var inventoryPending=0,lastInventorySignature='';
  function inventorySignature(){
    var rackRows=racks().map(function(rack){
      var layout=rack&&rack.b2bLayout||{},state=rack&&rack.b2b||{},plan=rack&&rack.plan||{};
      return [rack&&rack.id,rackSystem(rack),rack&&rack.bays,rack&&rack.levels,rack&&rack.depth,rack&&rack.loadedLevels,rack&&rack.footProfile,rack&&rack.footProfileKey,rack&&rack.footLy,rack&&rack.totalRackHeight,rack&&rack.sideUprightHeight,rack&&rack.hasExtra?1:0,rack&&rack.straightProfileLength,rack&&rack.systemType,recommendationText(rack&&(rack.traverseRecommendation||rack.traverseType)),mekikColumnSpacing(rack),rack&&rack.railThickness,rack&&rack.railHeight,rack&&(rack.railLength||rack.depthMm),rack&&rack.palletWeight,layout.rowCount,layout.sectionWidth,layout.palletCount,layout.frameDepth,state.rowType,state.levels,state.tunnelHeight,JSON.stringify(state.accessories||[]),JSON.stringify(state.customLevels||[]),JSON.stringify(plan.feet||[]),JSON.stringify(plan.braces||[]),JSON.stringify(rack&&rack.seismicBraces||[])].join('~');
    }).join('|');
    var symbolRows=symbols().map(function(item){return [item&&item.id,item&&item.type,item&&item.rackId,item&&item.widthMm].join('~');}).join('|');
    return rackRows+'#'+symbolRows;
  }
  function render(force){
    var host=document.getElementById('m2LayoutProductList');if(!host)return false;
    var signature=inventorySignature();
    if(force!==true&&signature===lastInventorySignature&&host.dataset.rafexInventoryStable==='v46'){cleanup();return true;}
    lastInventorySignature=signature;
    var sections=[
      renderSection('b2b','B2B ÜRÜNLERİ',rows('b2b')),
      renderSection('mekik2','MEKİK ÜRÜNLERİ',rows('mekik2')),
      renderSection('mr','MR ÜRÜNLERİ',rows('mr')),
      renderSection('common','SERBEST ALAN AKSESUARLARI',rows('common'))
    ].filter(Boolean);
    host.classList.remove('rafex-system-product-lists');
    host.dataset.rafexInventoryStable='v46';
    host.innerHTML='<b>ÜRÜN LİSTESİ</b>'+(sections.length?sections.join(''):'<span class="m2-layout-product"><span class="rafex-product-copy">Henüz ürün yok</span><strong class="rafex-product-qty">0 adet</strong></span>');
    cleanup();return true;
  }
  function schedule(force){if(inventoryPending)return;inventoryPending=requestAnimationFrame(function(){inventoryPending=0;render(force===true);});}
  function byId(id){return document.getElementById(id);}
  function activeCustomizeRack(){
    try{return racks().find(function(item){return Number(item&&item.id)===Number(m2CustomizeRackId);})||null;}catch(e){return null;}
  }
  function savedTypes(){try{return typeof m2SavedRackTypes!=='undefined'&&Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[];}catch(e){return[];}}
  function customizeState(rack){
    if(!rack||!rack.b2bLayout)return null;
    var customLevels=[],selectedAccessories=[],showPallets;
    try{if(byId('m2CustomizeManualLevels')&&byId('m2CustomizeManualLevels').checked&&typeof m2CustomizeLevelData==='function')customLevels=copyValue(m2CustomizeLevelData()||[]);}catch(e){}
    try{if(typeof m2CollectCustomizeRackAccessories==='function')selectedAccessories=copyValue(m2CollectCustomizeRackAccessories()||[]);}catch(e){}
    try{if(typeof m2CustomizePalletsVisible==='function')showPallets=m2CustomizePalletsVisible()!==false;}catch(e){}
    return {
      rackId:Number(rack.id),
      name:String(byId('m2CustomizeName')&&byId('m2CustomizeName').value||rack.typeName||'Özel Raf').trim()||'Özel Raf',
      count:Math.max(1,Math.min(4,n(byId('m2CustomizePalletCount')&&byId('m2CustomizePalletCount').value)||1)),
      levels:Math.max(1,Math.min(15,n(byId('m2CustomizeLevels')&&byId('m2CustomizeLevels').value)||1)),
      palletHeight:Math.max(300,n(byId('m2CustomizePalletHeight')&&byId('m2CustomizePalletHeight').value)||1200),
      rowCount:byId('m2CustomizeRowType')&&byId('m2CustomizeRowType').value==='double'?2:1,
      rowGap:Math.max(0,n(byId('m2CustomizeRowGap')&&byId('m2CustomizeRowGap').value)),
      customLevels:customLevels,
      tunnelHeight:byId('m2CustomizeTunnel')&&byId('m2CustomizeTunnel').checked?Math.max(500,n(byId('m2CustomizeTunnelHeight')&&byId('m2CustomizeTunnelHeight').value)||3600):0,
      accessories:selectedAccessories,
      showPallets:showPallets
    };
  }
  function persistCustomizeState(target,state){
    if(!target||!state)return;
    var oldCount=Math.max(1,n(target.b2bLayout&&target.b2bLayout.palletCount||target.bays)||1);
    target.bays=state.count;target.levels=state.levels;target.palletHeight=state.palletHeight;
    target.b2bLayout=Object.assign({},target.b2bLayout||{},{palletCount:state.count,rowCount:state.rowCount,rowGap:state.rowGap});
    target.b2b=Object.assign({},target.b2b||{},{palletCount:state.count,levels:state.levels,palletHeight:state.palletHeight,rowType:state.rowCount===2?'double':'single',rowGap:state.rowGap,customLevels:copyValue(state.customLevels),tunnelHeight:state.tunnelHeight,accessories:copyValue(state.accessories)});
    if(state.showPallets!==undefined)target.b2b.showPallets=state.showPallets;
    try{if(oldCount!==state.count&&typeof m2B2BResizeRack==='function')m2B2BResizeRack(target,state.count);}catch(e){}
  }
  var previousCustomizeApply=null;try{if(typeof m2ApplyRackCustomization==='function')previousCustomizeApply=m2ApplyRackCustomization;}catch(e){}
  if(typeof previousCustomizeApply==='function'&&!previousCustomizeApply.__rafexInventoryCustomizeV45){
    var inventoryCustomizeApply=function(){
      var rack=activeCustomizeRack(),state=customizeState(rack);
      var result=previousCustomizeApply.apply(this,arguments);
      if(!state)return result;
      var live=racks().find(function(item){return Number(item&&item.id)===state.rackId;})||rack;
      persistCustomizeState(live,state);
      savedTypes().forEach(function(entry){
        if(entry&&entry.source==='custom'&&entry.drawing&&String(entry.name||'').toLocaleLowerCase('tr-TR')===state.name.toLocaleLowerCase('tr-TR'))persistCustomizeState(entry.drawing,state);
      });
      try{if(typeof m2RenderSavedRackTypes==='function')m2RenderSavedRackTypes();}catch(e){}
      try{if(typeof m2ScheduleReportRefresh==='function')m2ScheduleReportRefresh(0);}catch(e){}
      schedule(true);
      return result;
    };
    inventoryCustomizeApply.__rafexInventoryCustomizeV45=true;
    try{m2ApplyRackCustomization=inventoryCustomizeApply;}catch(e){}window.m2ApplyRackCustomization=inventoryCustomizeApply;
  }
  var previousList=null;try{if(typeof m2RenderLayoutProductList==='function')previousList=m2RenderLayoutProductList;}catch(e){}
  var finalList=function(){return render();};finalList.__rafexLayoutInventoryV44=true;
  try{m2RenderLayoutProductList=finalList;}catch(e){}window.m2RenderLayoutProductList=finalList;
  var previousLayout=null;try{if(typeof m2RenderLayout==='function')previousLayout=m2RenderLayout;}catch(e){}
  if(typeof previousLayout==='function'&&!previousLayout.__rafexLayoutInventoryV44){
    var finalLayout=function(){var result=previousLayout.apply(this,arguments);schedule();return result;};
    finalLayout.__rafexLayoutInventoryV44=true;try{m2RenderLayout=finalLayout;}catch(e){}window.m2RenderLayout=finalLayout;
  }
  document.addEventListener('click',schedule,true);
  document.addEventListener('change',schedule,true);
  document.addEventListener('pointerup',schedule,true);
  window.addEventListener('load',schedule);
  if(document.body){
    new MutationObserver(function(){
      var host=document.getElementById('m2LayoutProductList');
      if(host&&(host.classList.contains('rafex-system-product-lists')||host.querySelector('details.rafex-system-product-disclosure')))setTimeout(render,0);
      else cleanup();
    }).observe(document.body,{subtree:true,childList:true});
  }
  schedule();setTimeout(schedule,300);setTimeout(schedule,1200);
  window.rafexLayoutInventoryRowsV44=rows;
})();
</script>`;
// JavaScript içindeki yazdırma şablonlarında da </body> metni bulunuyor.
 // İlk eşleşmeye replace uygulamak dış <script> etiketini erken kapatıp kaynak
 // kodunu sayfanın altında düz metin olarak gösterir. Yalnız gerçek, son body
 // kapanışına ekle.
const finalBodyClose = html.lastIndexOf('</body>');
if (finalBodyClose >= 0) {
  html = html.slice(0, finalBodyClose) + inventoryRuntime + '\n' + runtime + '\n' + html.slice(finalBodyClose);
} else {
  html += runtime;
}

const runtimeIndex = html.lastIndexOf(`<script ${marker}>`);
const verifiedBodyClose = html.lastIndexOf('</body>');
if (runtimeIndex < 0 || verifiedBodyClose < 0 || runtimeIndex > verifiedBodyClose) {
  throw new Error('Version badge runtime gercek body kapanisina eklenemedi.');
}

const count = (needle) => html.split(needle).length - 1;
if (count('id="rafexVersionInfoCard"') !== 1) throw new Error('Tek fiziksel version card sayisi 1 degil.');
if (count('id="rafexVersionInfoTop"') !== 0 || count('id="rafexVersionInfoLogin"') !== 0) throw new Error('Eski ikili version card build icinde kaldi.');

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v17: exactly one physical card: ${buildSha} @ ${buildTime}`);

import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
const marker = 'data-rafex-final-products-mekik="v4"';
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Final products/Mekik v4: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-final-products-mekik="v4">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-products-mekik="v4">[\s\S]*?<\/script>\s*/g, "");

// Serbest Cizim sistem urun listesi alfabetik siralamak yerine teknik siralamayi kullansin.
html = html.replaceAll(
  "return Array.from(rows.values()).sort(function(a,b){return a.item.localeCompare(b.item,'tr');});",
  "return Array.from(rows.values()).sort(function(a,b){var ra=window.rafexProductRank?window.rafexProductRank(a.item):50,rb=window.rafexProductRank?window.rafexProductRank(b.item):50;return ra-rb||String(a.item||'').localeCompare(String(b.item||''),'tr');});"
);

const runtime = String.raw`<style data-rafex-final-products-mekik="v4">
/* Serbest Cizim: miktar degeri urun/kod metninin yakinda dursun. */
#page.rafex-free-drawing-page .rafex-system-product-row{
  grid-template-columns:minmax(180px,520px) max-content!important;
  justify-content:start!important;column-gap:12px!important
}
#page.rafex-free-drawing-page .m2-layout-product{
  display:grid!important;grid-template-columns:minmax(180px,520px) max-content!important;
  justify-content:start!important;column-gap:12px!important
}
#page.rafex-free-drawing-page .rafex-system-product-row>strong,
#page.rafex-free-drawing-page .m2-layout-product>strong{text-align:left!important}

/* Raf Islemleri B2B/Mekik kontrol farkinda sayfayi yukari-asagi oynatmasin. */
#page.rafex-free-drawing-page .m2-tool-group.rack-tools{
  min-height:205px!important;align-content:start!important
}

/* Mekik akış okları: yalın, golgesiz, daha kibar. */
#page.rafex-free-drawing-page #m2LayoutSvg .m2-flow-badge{
  fill:transparent!important;stroke:none!important;filter:none!important
}
#page.rafex-free-drawing-page #m2LayoutSvg .m2-flow-symbol{
  fill:#315f88!important;font-size:8px!important;font-weight:800!important;
  paint-order:normal!important;stroke:none!important;filter:none!important;opacity:.82!important
}

/* Kurumsal urun dokumunde adet/kod birbirinden kopmasin. */
.m2-corporate-bom-head,.m2-corporate-bom-row{
  grid-template-columns:1.1fr 1.35fr .28fr .25fr!important
}

/* Karma Serbest Cizim raporunda Mekik her zaman tek yarim-sayfa kartina sigar. */
.m2-corporate-type-card.rafex-mekik-fit-v4{
  height:100%!important;min-height:0!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
  overflow:hidden!important
}
.m2-corporate-type-card.rafex-mekik-fit-v4>strong{
  grid-column:1/-1!important;grid-row:1!important;
  flex-direction:row!important;justify-content:flex-start!important;
  gap:10px!important;padding:4px 9px!important;min-height:0!important
}
.m2-corporate-type-card.rafex-mekik-fit-v4>strong small{margin:0!important;padding:0!important;border:0!important}
.m2-corporate-type-card.rafex-mekik-fit-v4>.m2-corporate-view{
  grid-row:2!important;min-height:0!important;height:100%!important;overflow:hidden!important
}
.m2-corporate-type-card.rafex-mekik-fit-v4>.m2-corporate-view svg{
  width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  transform:scale(.86)!important;transform-origin:center center!important;overflow:visible!important
}
</style>
<script data-rafex-final-products-mekik="v4">(function(){
  if(window.__rafexFinalProductsMekikV4)return;
  window.__rafexFinalProductsMekikV4=true;

  function low(value){return String(value||'').toLocaleLowerCase('tr-TR');}
  function qsa(root,selector){try{return Array.from((root||document).querySelectorAll(selector));}catch{return[];}}
  function freePage(){var p=document.getElementById('page');return !!(p&&p.classList.contains('rafex-free-drawing-page'));}
  function systemOfRack(rack){if(!rack)return '';return rack.rafexSystem||(rack.b2bLayout||rack.b2b?'b2b':'mekik2');}

  window.rafexProductRank=function(name){
    var n=low(name);
    if(/ayak takımı|upright frame|cadre de montant/.test(n))return 10;
    if(/ayak profili|upright profile|profil de montant/.test(n))return 20;
    if(/ayak pabucu|base plate|plaque de pied/.test(n))return 30;
    if(/şim|shim|cale/.test(n))return 40;
    if(/kimyasal dübel|chemical anchor|ancrage chimique/.test(n))return 50;
    if(/^travers\b|traverse/.test(n))return 60;
    if(/emniyet pimi|safety pin|goupille/.test(n))return 70;
    if(/düz arabağ|straight tie|liaison droite/.test(n))return 80;
    if(/tava|h travers|palet dayama|aksesuar|accessor/.test(n))return 90;
    if(/deprem çaprazı|seismic|earthquake/.test(n))return 100;
    if(/uaks|uakz|bariyer|ayak koruma|klipsli dübel|clip.*anchor/.test(n))return 110;
    return 95;
  };

  function stableSort(rows){
    return (Array.isArray(rows)?rows:[]).map(function(row,index){return {row:row,index:index};}).sort(function(a,b){
      var ra=window.rafexProductRank(a.row&& (a.row.item||a.row.name)),rb=window.rafexProductRank(b.row&& (b.row.item||b.row.name));
      return ra-rb||a.index-b.index;
    }).map(function(x){return x.row;});
  }

  function trayPieces(clear,width){
    clear=Math.max(0,Math.round(Number(clear)||0));width=[200,250,300].includes(Number(width))?Number(width):300;
    var full=Math.floor(clear/width),rem=clear-full*width;return full+(rem>=50?1:0);
  }
  function b2bAccessories(entry,labels){
    var d=entry&&entry.drawing?entry.drawing:entry||{};
    if(!(d.b2bLayout||d.b2b))return [];
    var multiplier=Math.max(1,Number(entry&&entry.rackCount)||1),rowCount=Math.max(1,Number(d.b2bLayout&&d.b2bLayout.rowCount)||(d.b2b&&d.b2b.rowType==='double'?2:1));
    var clear=Math.max(0,Number(d.b2bLayout&&d.b2bLayout.sectionWidth)||Number(d.totalWidth)||0),out=[];
    var items=Array.isArray(d.b2b&&d.b2b.accessories)?d.b2b.accessories:[];
    items.forEach(function(item){
      var levels=new Set((item&&item.levels||[]).map(Number).filter(Number.isFinite)).size;if(!levels)return;
      var qty=levels*rowCount*multiplier,name='';
      if(item.type==='tray'){qty*=Math.max(1,trayPieces(clear,item.width));name='Tava';}
      else if(item.type==='hTraverse')name='H Travers';
      else if(item.type==='palletStop')name='Palet Dayama';
      if(name&&qty>0)out.push({item:name,spec:item.type==='tray'?String(Number(item.width)||300)+' mm':'Aksesuar',qty:Math.round(qty),unit:(labels&&labels.unitEach)||'adet'});
    });
    var custom=Array.isArray(d.accessories)?d.accessories:[];
    custom.forEach(function(item){var qty=Math.max(0,Math.round(Number(item&&item.qty)||0))*multiplier;if(qty)out.push({item:String(item.name||'Aksesuar'),spec:String(item.code||'Aksesuar'),qty:qty,unit:(labels&&labels.unitEach)||'adet'});});
    return out;
  }

  function addIfMissing(rows,row){
    var key=low(row.item)+'|'+low(row.spec);var exists=rows.some(function(x){return low(x&&x.item)+'|'+low(x&&x.spec)===key;});if(!exists&&row.qty>0)rows.push(row);
  }

  function enhanceBomRows(rows,entry,labels){
    rows=Array.isArray(rows)?rows.slice():[];var d=entry&&entry.drawing?entry.drawing:entry||{};
    if(d.b2bLayout){
      try{
        if(typeof m2B2BFootProductData==='function'){
          var p=m2B2BFootProductData(d),mult=Math.max(1,Number(entry&&entry.rackCount)||1),rowCount=Math.max(1,Number(d.b2bLayout.rowCount)||1),teams=Math.max(1,Number(entry&&entry.footTeamCount)||2*rowCount*mult);
          addIfMissing(rows,{item:(labels&&labels.items&&labels.items.foot)||'Ayak profili',spec:p.code+' · '+p.profile+' · L '+Math.round(p.height)+' mm',qty:teams*2,unit:(labels&&labels.unitEach)||'adet'});
        }
      }catch(e){}
      b2bAccessories(entry,labels).forEach(function(row){addIfMissing(rows,row);});
    }
    return stableSort(rows);
  }

  try{
    var originalBom=window.m2CorporateBomRows;
    if(typeof originalBom==='function'&&!originalBom.__rafexProductsV4){
      var wrappedBom=function(entry,labels){return enhanceBomRows(originalBom.apply(this,arguments)||[],entry,labels);};wrappedBom.__rafexProductsV4=true;
      try{m2CorporateBomRows=wrappedBom;}catch{}window.m2CorporateBomRows=wrappedBom;
    }
  }catch(e){console.warn('BOM v4 kurulamadı',e);}

  function augmentProtectionRows(rows){
    var out=[];
    (rows||[]).forEach(function(row){
      out.push(row);var n=low(row&&row.name),qty=Math.max(0,Number(row&&row.qty)||0);
      if(n==='uaks ayak koruma')out.push({name:'Klipsli dübel 12x110 · UAKS',qty:qty*4});
      else if(n==='uakz ayak koruma')out.push({name:'Klipsli dübel 12x110 · UAKZ',qty:qty*4});
      else if(n.indexOf('bariyer koruma')===0)out.push({name:'Klipsli dübel 12x110 · Bariyer',qty:qty*8});
    });
    return out;
  }
  function layoutAccessoryRows(){
    var rows=[];try{
      (m2LayoutState&&m2LayoutState.racks||[]).filter(function(r){return systemOfRack(r)==='b2b';}).forEach(function(rack){
        b2bAccessories({drawing:rack,rackCount:1},{unitEach:'adet'}).forEach(function(r){var found=rows.find(function(x){return x.name===r.item&&x.spec===r.spec;});if(found)found.qty+=r.qty;else rows.push({name:r.item+(r.spec&&r.spec!=='Aksesuar'?' · '+r.spec:''),spec:r.spec,qty:r.qty});});
      });
    }catch(e){}return rows;
  }
  try{
    var originalLayoutRows=window.m2LayoutProductRows;
    if(typeof originalLayoutRows==='function'&&!originalLayoutRows.__rafexProductsV4){
      var wrappedLayoutRows=function(){
        var rows=originalLayoutRows.apply(this,arguments)||[],extra=layoutAccessoryRows();
        extra.forEach(function(row){var found=rows.find(function(x){return low(x&&x.name)===low(row.name);});if(found)found.qty+=row.qty;else rows.push(row);});
        rows=augmentProtectionRows(rows);return stableSort(rows);
      };wrappedLayoutRows.__rafexProductsV4=true;try{m2LayoutProductRows=wrappedLayoutRows;}catch{}window.m2LayoutProductRows=wrappedLayoutRows;
    }
  }catch(e){console.warn('Yerleşim ürün v4 kurulamadı',e);}

  function currentB2BState(){try{return typeof b2bReadInputState==='function'?b2bReadInputState():null;}catch{return null;}}
  function appendB2BParts(){
    var host=document.getElementById('m2Parts');if(!host)return;host.querySelectorAll('[data-rafex-b2b-extra-v4]').forEach(function(n){n.remove();});
    var state=currentB2BState();if(!state)return;var drawing={b2b:state,b2bLayout:{rowCount:state.rowType==='double'?2:1,sectionWidth:(typeof b2bPalletGeometry==='function'?Number(b2bPalletGeometry().sectionWidth):0)}};
    var rows=b2bAccessories({drawing:drawing,rackCount:1},{unitEach:'adet'});
    rows.forEach(function(row){var div=document.createElement('div');div.className='m2-part';div.dataset.rafexB2BExtraV4='1';div.innerHTML='<span>'+String(row.item)+(row.spec&&row.spec!=='Aksesuar'?' · '+String(row.spec):'')+'</span><b>'+Number(row.qty).toLocaleString('tr-TR')+' adet</b>';host.appendChild(div);});
  }

  var colorMap={};try{colorMap=JSON.parse(localStorage.getItem('rafex_b2b_type_colors_v4')||'{}')||{};}catch{}
  function stabilizeTypeColors(){
    qsa(document,'.m2-corporate-type-card').forEach(function(card){
      if(card.querySelector('.m2-set-projection'))return;var key=String(card.dataset.rafexTypeName||card.querySelector('strong span')?.textContent||'').trim();if(!key)return;
      var current=card.style.getPropertyValue('--m2-type-color')||getComputedStyle(card).getPropertyValue('--m2-type-color');
      if(!colorMap[key]&&current)colorMap[key]=current.trim();if(colorMap[key])card.style.setProperty('--m2-type-color',colorMap[key]);
    });try{localStorage.setItem('rafex_b2b_type_colors_v4',JSON.stringify(colorMap));}catch{}
  }
  function tagMekikCards(){
    qsa(document,'.m2-corporate-type-card').forEach(function(card){var mekik=!!card.querySelector('.m2-set-projection');card.classList.toggle('rafex-mekik-fit-v4',mekik);if(mekik)card.dataset.rafexSystem='mekik2';});
  }
  function postReport(){tagMekikCards();stabilizeTypeColors();}

  try{
    var originalRenderReport=window.m2RenderCorporateReport;
    if(typeof originalRenderReport==='function'&&!originalRenderReport.__rafexProductsV4){
      var wrappedReport=function(){var result=originalRenderReport.apply(this,arguments);setTimeout(postReport,0);setTimeout(postReport,120);return result;};wrappedReport.__rafexProductsV4=true;try{m2RenderCorporateReport=wrappedReport;}catch{}window.m2RenderCorporateReport=wrappedReport;
    }
  }catch(e){}
  try{
    var prep=window.__rafexPrepareCorporatePrint;
    if(typeof prep==='function'&&!prep.__rafexProductsV4){var wrappedPrep=function(){postReport();var r=prep.apply(this,arguments);postReport();setTimeout(postReport,0);return r;};wrappedPrep.__rafexProductsV4=true;window.__rafexPrepareCorporatePrint=wrappedPrep;}
  }catch(e){}

  function schedule(){[0,40,140,350].forEach(function(ms){setTimeout(function(){if(freePage()){try{if(typeof m2RenderLayoutProductList==='function')m2RenderLayoutProductList();}catch{}}appendB2BParts();postReport();},ms);});}
  document.addEventListener('click',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('input',function(e){if(e.target&&/b2b|m2Customize/i.test(e.target.id||''))schedule();},true);
  schedule();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Final products/Mekik v4: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const verify=Buffer.from(encoded,"base64").toString("utf8");
for(const required of [marker,'Klipsli dübel 12x110','rafex-mekik-fit-v4','rafex_b2b_type_colors_v4','Ayak profili'])if(!verify.includes(required))throw new Error('Final products/Mekik v4 dogrulama: '+required);
console.log('FINAL v4: urun adetleri yakinlastirildi; sabit Raf Islemleri yuksekligi; Mekik yarim-sayfa fit; B2B aksesuar/tava/duz arabag sayimi; teknik urun sirasi; koruma klipsli dubelleri; tip renk sabitleme; kibar Mekik oklari.');

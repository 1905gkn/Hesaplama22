import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Eski kullanici yamalarini temizle. V3 tek kaynak olarak calisir.
html = html.replace(/<script\s+data-rafex-user-20260819=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-user-20260819-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");

// Kesit Yer Belirleme: aci etiketini acik ve okunur tut.
html = html.replaceAll(
  'if (angles) angles.textContent = `${Math.round(value.azimuth)}° / ${Math.round(value.elevation)}°`;',
  'if (angles) { const az=Math.round(value.azimuth), el=Math.round(value.elevation); angles.textContent = `Yatay açı: ${az}° · Yukarı/Aşağı: ${el>=0?"+":""}${el}°`; angles.dataset.azimuth=String(az); angles.dataset.elevation=String(el); }',
);
html = html.replaceAll(
  '<small data-rafex-angle-label style="margin-left:8px;color:#68736c">41° / 24°</small>',
  '<small data-rafex-angle-label data-azimuth="41" data-elevation="24" style="margin-left:8px;color:#68736c">Yatay açı: 41° · Yukarı/Aşağı: +24°</small>',
);

// Ozellestir her acildiginda paletler gorunur baslasin.
html = html.replaceAll(
  'if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(rack.b2b?.showPallets!==false,false);',
  'if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(true,false);',
);

// Kesit: Sigdir aciyi bozmasin.
html = html.replaceAll(
  'value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;',
  'value.x = 0; value.y = 0; value.scale = 1;',
);

// Kesit: elle aci girisi ve onden gorunus.
if (!html.includes("function frontCurrent()")) {
  const needle = "  function fitCurrent() {";
  const helper = `  function applyManualAngles() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    const azimuthInput = document.querySelector("[data-rafex-azimuth-input]");
    const elevationInput = document.querySelector("[data-rafex-elevation-input]");
    value.azimuth = clamp(number(azimuthInput?.value, value.azimuth), -180, 180);
    value.elevation = clamp(number(elevationInput?.value, value.elevation), -35, 75);
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

  function frontCurrent() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.azimuth = 0;
    value.elevation = 0;
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

`;
  if (!html.includes(needle)) throw new Error("Kesit fitCurrent bulunamadi.");
  html = html.replace(needle, helper + needle);
}

if (!html.includes("data-rafex-front")) {
  const fitButton = '<button type="button" data-rafex-fit>Sığdır</button><span></span>';
  const fitAndFront = '<button type="button" data-rafex-fit>Sığdır</button><button type="button" data-rafex-front>Önden</button><span></span>';
  if (!html.includes(fitButton)) throw new Error("Kesit Sigdir butonu bulunamadi.");
  html = html.replace(fitButton, fitAndFront);
}

if (!html.includes("data-rafex-angle-input-row")) {
  const palletRow = '<div class="rafex-option-row"><strong>PALETLER</strong><button type="button" data-rafex-pallets>Paletleri Gizle</button></div>';
  const angleRow = '<div class="rafex-option-row rafex-angle-inputs" data-rafex-angle-input-row><strong>AÇI °</strong><label>Sağa/Sola ° <input type="number" min="-180" max="180" step="1" data-rafex-azimuth-input></label><label>Yukarı/Aşağı ° <input type="number" min="-35" max="75" step="1" data-rafex-elevation-input></label><button type="button" data-rafex-angle-apply>Uygula</button></div>';
  if (!html.includes(palletRow)) throw new Error("Kesit palet satiri bulunamadi.");
  html = html.replace(palletRow, angleRow + palletRow);
}

if (!html.includes('modal.querySelector("[data-rafex-front]")')) {
  const fitListener = '    modal.querySelector("[data-rafex-fit]")?.addEventListener("click", fitCurrent);';
  if (!html.includes(fitListener)) throw new Error("Kesit Sigdir listener bulunamadi.");
  html = html.replace(
    fitListener,
    fitListener + '\n    modal.querySelector("[data-rafex-front]")?.addEventListener("click", frontCurrent);',
  );
}

if (!html.includes("data-rafex-angle-apply\")?.addEventListener")) {
  const downListener = '    modal.querySelector("[data-rafex-rotate-down]")?.addEventListener("click", () => rotateView(0, -6));';
  const listeners = downListener + `
    modal.querySelector("[data-rafex-angle-apply]")?.addEventListener("click", applyManualAngles);
    modal.querySelectorAll("[data-rafex-azimuth-input],[data-rafex-elevation-input]").forEach((input) => {
      input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); applyManualAngles(); } });
      input.addEventListener("change", applyManualAngles);
    });`;
  if (!html.includes(downListener)) throw new Error("Kesit aci listener noktasi bulunamadi.");
  html = html.replace(downListener, listeners);
}

if (!html.includes("const azimuthInput = document.querySelector(\"[data-rafex-azimuth-input]\");")) {
  const angleNode = '    const angles = document.querySelector("[data-rafex-angle-label]");';
  const angleInputs = angleNode + `
    const azimuthInput = document.querySelector("[data-rafex-azimuth-input]");
    const elevationInput = document.querySelector("[data-rafex-elevation-input]");
    if (azimuthInput && document.activeElement !== azimuthInput) azimuthInput.value = String(Math.round(value.azimuth));
    if (elevationInput && document.activeElement !== elevationInput) elevationInput.value = String(Math.round(value.elevation));`;
  if (!html.includes(angleNode)) throw new Error("Kesit aci etiketi noktasi bulunamadi.");
  html = html.replace(angleNode, angleInputs);
}

// Kesit acma fonksiyonlarini disaridan erisilebilir yap; buton DOM degisse bile V3 tekrar baglar.
if (!html.includes("__rafexOpenSectionPlacementV3")) {
  const bootNeedle = "  function boot(attempt = 0) {";
  const expose = `  window.__rafexOpenSectionPlacementV3 = openEditor;
  window.__rafexEnsureSectionPlacementV3 = ensureButton;

`;
  if (!html.includes(bootNeedle)) throw new Error("Kesit boot noktasi bulunamadi.");
  html = html.replace(bootNeedle, expose + bootNeedle);
}

const runtime = `<script data-rafex-user-20260819="v3">(function(){
  if(window.__rafexUser20260819V3)return;
  window.__rafexUser20260819V3=true;

  const num=function(value,fallback){var n=Number(value);return Number.isFinite(n)?n:(fallback||0);};
  const rackLevels=function(rack){return Math.max(1,Math.round(num(rack&&((rack.levels!=null&&rack.levels)||(rack.b2b&&rack.b2b.levels)||(rack.b2bLayout&&rack.b2bLayout.levels)),1)));};
  const rackRows=function(rack){return Math.max(1,Math.round(num(rack&&rack.b2bLayout&&rack.b2bLayout.rowCount,rack&&rack.b2b&&rack.b2b.rowType==="double"?2:1)));};
  const rackGap=function(rack){return Math.max(0,Math.round(num(rack&&((rack.b2bLayout&&rack.b2bLayout.rowGap)||(rack.b2b&&rack.b2b.rowGap)),125)));};
  const seismicSpec=function(rack){return rackRows(rack)===2?(rackLevels(rack)+" KAT · ÇİFT SIRA · SIRA ARALIĞI "+rackGap(rack)+" mm"):(rackLevels(rack)+" KAT · TEK SIRA · 125 mm");};
  const status=function(text){var node=document.getElementById("m2FloorStatus");if(node)node.textContent=text;};
  const seismicButton=function(){return document.getElementById("m2SeismicButton");};
  const braceCount=function(){try{return (m2LayoutState&&m2LayoutState.racks||[]).reduce(function(sum,rack){return sum+(Array.isArray(rack.seismicBraces)?rack.seismicBraces.length:0);},0);}catch(error){return 0;}};

  // Deprem caprazi ekleme modu: secimden sonra acik kalir, ESC veya ayni buton kapatir.
  var seismicPlacementActive=false;
  var persistentType="light";
  const paintSeismicMode=function(){
    var button=seismicButton();
    if(!button)return;
    button.classList.toggle("active",seismicPlacementActive);
    button.setAttribute("aria-pressed",seismicPlacementActive?"true":"false");
    button.title=seismicPlacementActive?"Ekleme modunu kapatmak için tekrar tıkla veya ESC":"Deprem çaprazı ekle";
  };
  const stopSeismicMode=function(message){
    seismicPlacementActive=false;
    try{m2SeismicDraft=null;}catch(error){}
    paintSeismicMode();
    try{if(typeof m2RenderLayout==="function")m2RenderLayout();}catch(error){}
    if(message)status(message);
  };
  try{
    var originalSeismicOpen=window.m2OpenSeismicDialog;
    if(typeof originalSeismicOpen==="function"){
      window.m2OpenSeismicDialog=function(){
        if(seismicPlacementActive){stopSeismicMode("Deprem çaprazı ekleme modu kapatıldı.");return;}
        return originalSeismicOpen.apply(this,arguments);
      };
    }
    var originalSeismicStart=window.m2StartSeismicPlacement;
    if(typeof originalSeismicStart==="function"){
      window.m2StartSeismicPlacement=function(){
        var result=originalSeismicStart.apply(this,arguments);
        try{persistentType=(m2SeismicDraft&&m2SeismicDraft.type)||m2SeismicChoice||persistentType;}catch(error){}
        seismicPlacementActive=true;
        paintSeismicMode();
        status((persistentType==="heavy"?"Ağır":"Hafif")+" deprem çaprazı ekleme modu açık. ESC veya aynı buton kapatır.");
        return result;
      };
    }
    var originalSeismicCommit=window.m2CommitSeismicArea;
    if(typeof originalSeismicCommit==="function"){
      window.m2CommitSeismicArea=function(){
        var type=persistentType;
        try{type=(m2SeismicDraft&&m2SeismicDraft.type)||m2SeismicChoice||type;}catch(error){}
        var before=braceCount();
        var result=originalSeismicCommit.apply(this,arguments);
        if(seismicPlacementActive){
          persistentType=type==="heavy"?"heavy":"light";
          try{m2SeismicDraft={type:persistentType,start:null,hover:null};}catch(error){}
          paintSeismicMode();
          try{if(typeof m2RenderLayout==="function")m2RenderLayout();if(typeof m2RenderLayoutProductList==="function")m2RenderLayoutProductList();}catch(error){}
          var added=Math.max(0,braceCount()-before);
          status(added?(added+" adet "+(persistentType==="heavy"?"ağır":"hafif")+" deprem çaprazı eklendi. Mod açık; devam edebilirsin."):"Yeni çapraz eklenmedi. Mod açık; tekrar seçim yapabilirsin.");
        }
        return result;
      };
    }
  }catch(error){console.warn("Deprem çaprazı sürekli ekleme modu kurulamadı",error);}
  document.addEventListener("keydown",function(event){
    if(event.key!=="Escape"||!seismicPlacementActive)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    stopSeismicMode("Deprem çaprazı ekleme modu ESC ile kapatıldı.");
  },true);

  // Urun listesinde deprem bilgisini ilgili satirin yaninda goster; serbest cizimin ustune metin basma.
  const detailedSeismicProductRows=function(){
    var grouped=new Map();
    try{
      (m2LayoutState&&m2LayoutState.racks||[]).forEach(function(rack){
        (rack.seismicBraces||[]).forEach(function(brace){
          var type=brace&&brace.type==="heavy"?"heavy":"light";
          var spec=seismicSpec(rack);
          var key=type+"|"+spec;
          grouped.set(key,(grouped.get(key)||0)+1);
        });
      });
    }catch(error){}
    return Array.from(grouped.entries()).map(function(entry){
      var parts=entry[0].split("|"),type=parts.shift(),spec=parts.join("|");
      return {name:(type==="heavy"?"Ağır deprem çaprazı":"Hafif deprem çaprazı")+" · "+spec,qty:entry[1]};
    });
  };
  try{
    var originalProductRows=window.m2LayoutProductRows;
    if(typeof originalProductRows==="function"){
      window.m2LayoutProductRows=function(){
        var base=originalProductRows.apply(this,arguments)||[];
        var clean=base.filter(function(row){
          var name=String(row&&row.name||"").toLocaleLowerCase("tr-TR");
          return name!=="hafif deprem çaprazı"&&name!=="ağır deprem çaprazı";
        });
        return clean.concat(detailedSeismicProductRows());
      };
    }
  }catch(error){console.warn("Deprem ürün listesi ayrıştırılamadı",error);}

  // Normal urun dokumune deprem caprazi ve duz arabag satirlarini KOD / OLCU / TANIM bilgisiyle ekle.
  try{
    var originalBomRows=window.m2CorporateBomRows;
    if(typeof originalBomRows==="function"){
      window.m2CorporateBomRows=function(entry,labels){
        var rows=originalBomRows.apply(this,arguments)||[];
        var extra=[],seen=new Set(rows.map(function(row){return String(row&&row.item||"")+"|"+String(row&&row.spec||"");}));
        var racks=[];
        try{
          var ids=new Set((entry&&entry.rackIds||[]).map(Number));
          racks=(m2LayoutState&&m2LayoutState.racks||[]).filter(function(rack){return ids.has(Number(rack.id));});
          if(!racks.length&&entry&&entry.drawing){
            var name=String(entry.name||entry.drawing.typeName||"");
            racks=(m2LayoutState&&m2LayoutState.racks||[]).filter(function(rack){return String(rack.typeName||"")===name;});
          }
        }catch(error){}
        var seismicGrouped=new Map();
        racks.forEach(function(rack){
          (rack.seismicBraces||[]).forEach(function(brace){
            var type=brace&&brace.type==="heavy"?"heavy":"light",spec=seismicSpec(rack),key=type+"|"+spec;
            seismicGrouped.set(key,(seismicGrouped.get(key)||0)+1);
          });
        });
        seismicGrouped.forEach(function(qty,key){
          var parts=key.split("|"),type=parts.shift(),spec=parts.join("|");
          var item=type==="heavy"?"Ağır deprem çaprazı":"Hafif deprem çaprazı";
          var seenKey=item+"|"+spec;
          if(!seen.has(seenKey)){extra.push({item:item,spec:spec,qty:qty,unit:labels&&labels.unitEach||"adet"});seen.add(seenKey);}
        });
        var tieGrouped=new Map();
        racks.forEach(function(rack){
          try{
            if(rackRows(rack)!==2||typeof b2bStraightTiePlan!=="function")return;
            var plan=b2bStraightTiePlan(rack);
            if(!plan||!plan.count)return;
            var factor=rack.sharedFootWith?1:2;
            var spec=Math.round(num(plan.length,0))+" × "+Math.round(num(plan.width,0))+" mm · galvaniz";
            tieGrouped.set(spec,(tieGrouped.get(spec)||0)+Math.round(num(plan.count,0))*factor);
          }catch(error){}
        });
        tieGrouped.forEach(function(qty,spec){
          var item=labels&&labels.items&&labels.items.straightBrace||"Düz arabağ";
          var seenKey=item+"|"+spec;
          if(qty>0&&!seen.has(seenKey)){extra.push({item:item,spec:spec,qty:qty,unit:labels&&labels.unitEach||"adet"});seen.add(seenKey);}
        });
        if(!extra.length)return rows;
        var insertAt=rows.length;
        rows.forEach(function(row,index){
          var item=String(row&&row.item||"").toLocaleLowerCase("tr-TR");
          if(/çapraz|brace|arabağ|tie|liaison/.test(item))insertAt=index+1;
        });
        return rows.slice(0,insertAt).concat(extra,rows.slice(insertAt));
      };
    }
  }catch(error){console.warn("Deprem/düz arabağ dökümü bağlanamadı",error);}

  // Ozellestir: girilen kat ve palet sayisini tek kaynak kabul et; 3D'yi aninda ayni canvas uzerinde yenile.
  const customizeModal=function(){return document.getElementById("m2CustomizeModal");};
  const customizeRack=function(){try{return m2LayoutState&&m2LayoutState.racks&&m2LayoutState.racks.find(function(item){return item.id===m2CustomizeRackId;})||null;}catch(error){return null;}};
  const customizeDraft=function(){
    var rack=customizeRack();
    if(!rack)return null;
    var count=Math.max(1,Math.min(4,Math.round(num(document.getElementById("m2CustomizePalletCount")&&document.getElementById("m2CustomizePalletCount").value,1))));
    var levels=Math.max(1,Math.min(15,Math.round(num(document.getElementById("m2CustomizeLevels")&&document.getElementById("m2CustomizeLevels").value,1))));
    var palletHeight=Math.max(300,num(document.getElementById("m2CustomizePalletHeight")&&document.getElementById("m2CustomizePalletHeight").value,1200));
    var rowType=document.getElementById("m2CustomizeRowType")&&document.getElementById("m2CustomizeRowType").value==="double"?"double":"single";
    var rowGap=Math.max(0,num(document.getElementById("m2CustomizeRowGap")&&document.getElementById("m2CustomizeRowGap").value,0));
    var custom=[];
    try{custom=document.getElementById("m2CustomizeManualLevels")&&document.getElementById("m2CustomizeManualLevels").checked&&typeof m2CustomizeLevelData==="function"?m2CustomizeLevelData():[];}catch(error){}
    var options={};
    try{options=typeof m2Rack3DOptions==="function"?Object.assign({},m2Rack3DOptions(rack)):{};}catch(error){}
    options.palletCount=count;
    options.levels=levels;
    options.palletHeight=palletHeight;
    options.rowType=rowType;
    options.rowGap=rowGap;
    var layout=rack.b2bLayout||{};
    var palletWidth=Math.max(300,num(layout.palletWidth||options.palletWidth||rack.palW,800));
    options.sectionWidth=layout.palletType==="euro"&&count===4?3600:count*palletWidth+(count+1)*75;
    options.palletHeights=custom.map(function(item){return Math.max(300,num(item&&item.palletHeight,palletHeight));});
    options.levelClearances=custom.map(function(item){return Math.max(0,num(item&&item.interval,0)-num(item&&item.palletHeight,palletHeight)-num(options.traverseHeight,140));});
    try{
      var previewRack=Object.assign({},rack,{levels:levels,palletHeight:palletHeight,b2bLayout:Object.assign({},layout,{palletCount:count,rowCount:rowType==="double"?2:1,rowGap:rowGap}),b2b:Object.assign({},rack.b2b||{},{palletCount:count,levels:levels,palletHeight:palletHeight,rowType:rowType,rowGap:rowGap,customLevels:custom})});
      if(typeof m2B2BCalculatedFootHeight==="function")options.footHeight=m2B2BCalculatedFootHeight(previewRack);
    }catch(error){}
    try{if(typeof m2CollectCustomizeRackAccessories==="function")options.accessories=m2CollectCustomizeRackAccessories();}catch(error){}
    try{if(typeof m2CustomizePalletsVisible==="function")options.showPallets=m2CustomizePalletsVisible()!==false;else options.showPallets=true;}catch(error){options.showPallets=true;}
    try{
      if(rowType==="double"&&typeof b2bStraightTieCount==="function"&&options.footHeight){
        options.straightTieCount=b2bStraightTieCount(options.footHeight);
        if(typeof b2bStraightTiePositions==="function")options.straightTiePositions=b2bStraightTiePositions(options.footHeight);
      }else{options.straightTieCount=0;options.straightTiePositions=[];}
    }catch(error){}
    return {rack:rack,count:count,levels:levels,palletHeight:palletHeight,rowType:rowType,rowGap:rowGap,custom:custom,options:options};
  };
  const forceCustomizePreview=function(){
    var modal=customizeModal();
    if(!modal||modal.hidden)return;
    var state=customizeDraft(),canvas=document.getElementById("m2CustomizeCanvas"),service=window.RafexB2BViewer;
    if(!state||!canvas||!service)return;
    try{
      var mounted=typeof service.isMountedOn==="function"?service.isMountedOn(canvas):(typeof service.getActiveCanvas==="function"?service.getActiveCanvas()===canvas:false);
      if(!mounted&&typeof service.mount==="function")service.mount(canvas,state.options);
      else if(typeof service.update==="function")service.update(state.options);
    }catch(error){console.warn("Özelleştir 3D yenilenemedi",error);}
  };
  window.__rafexForceCustomizePreviewV3=forceCustomizePreview;

  try{
    var originalCustomizeOpen=window.m2OpenCustomizeModal;
    if(typeof originalCustomizeOpen==="function"){
      window.m2OpenCustomizeModal=function(){
        var result=originalCustomizeOpen.apply(this,arguments);
        setTimeout(function(){
          try{if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(true,false);}catch(error){}
          forceCustomizePreview();
        },0);
        return result;
      };
    }
    var originalCustomizeApply=window.m2ApplyRackCustomization;
    if(typeof originalCustomizeApply==="function"){
      window.m2ApplyRackCustomization=function(){
        var state=customizeDraft();
        var customName=String(document.getElementById("m2CustomizeName")&&document.getElementById("m2CustomizeName").value||"").trim()||"Özel Raf";
        var rack=state&&state.rack;
        var result=originalCustomizeApply.apply(this,arguments);
        if(rack&&state){
          rack.bays=state.count;
          rack.levels=state.levels;
          if(rack.b2bLayout)rack.b2bLayout.palletCount=state.count;
          rack.b2b=Object.assign({},rack.b2b||{},{palletCount:state.count,levels:state.levels,palletHeight:state.palletHeight,rowType:state.rowType,rowGap:state.rowGap});
          try{if(typeof m2B2BResizeRack==="function")m2B2BResizeRack(rack,state.count);}catch(error){}
          try{
            if(typeof m2SavedRackTypes!=="undefined"&&Array.isArray(m2SavedRackTypes)){
              var target=m2SavedRackTypes.find(function(entry){return entry&&entry.source==="custom"&&String(entry.name||"").toLocaleLowerCase("tr-TR")===customName.toLocaleLowerCase("tr-TR");});
              if(target&&target.drawing){
                target.drawing.bays=state.count;
                target.drawing.levels=state.levels;
                if(target.drawing.b2bLayout)target.drawing.b2bLayout.palletCount=state.count;
                target.drawing.b2b=Object.assign({},target.drawing.b2b||{},{palletCount:state.count,levels:state.levels,palletHeight:state.palletHeight,rowType:state.rowType,rowGap:state.rowGap});
              }
            }
          }catch(error){}
          try{if(typeof m2RenderSavedRackTypes==="function")m2RenderSavedRackTypes();if(typeof m2RenderLayout==="function")m2RenderLayout();if(typeof m2ScheduleReportRefresh==="function")m2ScheduleReportRefresh(0);}catch(error){}
        }
        return result;
      };
    }
    ["m2EnableCustomizeRackAccessory","m2RemoveCustomizeRackAccessory","m2ToggleCustomizeRackAccessoryLevel","m2AllCustomizeRackAccessoryLevels","m2SetCustomizeRackTrayWidth","m2ToggleCustomizePallets"].forEach(function(name){
      var original=window[name];
      if(typeof original!=="function")return;
      window[name]=function(){var result=original.apply(this,arguments);requestAnimationFrame(forceCustomizePreview);return result;};
    });
  }catch(error){console.warn("Özelleştir davranışları kurulamadı",error);}

  var customizeRoot=customizeModal();
  if(customizeRoot){
    var previewFields=new Set(["m2CustomizePalletCount","m2CustomizeLevels","m2CustomizeManualLevels","m2CustomizePalletHeight","m2CustomizeRowType","m2CustomizeRowGap","m2CustomizeTunnel","m2CustomizeTunnelHeight"]);
    var refreshOnField=function(event){if(previewFields.has(event.target&&event.target.id))requestAnimationFrame(forceCustomizePreview);};
    customizeRoot.addEventListener("input",refreshOnField,true);
    customizeRoot.addEventListener("change",refreshOnField,true);
    new MutationObserver(function(){if(customizeRoot.hidden===false)setTimeout(function(){try{if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(true,false);}catch(error){}forceCustomizePreview();},0);}).observe(customizeRoot,{attributes:true,attributeFilter:["hidden"]});
  }

  // Kesit Yer Belirleme butonunu DOM yenilenmelerinde tekrar bagla ve tiklamayi garanti et.
  const keepSectionAlive=function(){try{if(typeof window.__rafexEnsureSectionPlacementV3==="function")window.__rafexEnsureSectionPlacementV3();}catch(error){}};
  document.addEventListener("click",function(event){
    var button=event.target&&event.target.closest&&event.target.closest("#m2SectionPlacementButton");
    if(!button)return;
    setTimeout(function(){
      var modal=document.getElementById("m2SectionPlacementModal");
      if((!modal||modal.hidden)&&typeof window.__rafexOpenSectionPlacementV3==="function"){
        try{window.__rafexOpenSectionPlacementV3();}catch(error){console.warn("Kesit Yer Belirleme açılamadı",error);}
      }
    },35);
  },true);
  var sectionObserver=new MutationObserver(function(){clearTimeout(window.__rafexSectionEnsureTimerV3);window.__rafexSectionEnsureTimerV3=setTimeout(keepSectionAlive,80);});
  sectionObserver.observe(document.body,{childList:true,subtree:true});
  keepSectionAlive();
  setInterval(keepSectionAlive,1500);

  paintSeismicMode();
})();</script>`;

const style = `<style data-rafex-user-20260819-style="v3">
#m2SeismicButton.active{background:#f2c500!important;color:#17201b!important;box-shadow:0 0 0 3px #f2c50033!important}
.m2-corporate-bom-card h3{font-size:15px!important;line-height:1.25!important}
.m2-corporate-bom-head span{font-size:10.5px!important;line-height:1.25!important}
.m2-corporate-bom-row span{font-size:11.5px!important;line-height:1.4!important}
.rafex-angle-inputs label{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:850;color:#173c2d}
.rafex-angle-inputs input{width:82px;padding:7px 8px;border:1px solid #cfd9d2;border-radius:7px;background:#fff;color:#173c2d;font-weight:900}
.rafex-angle-inputs [data-rafex-angle-apply]{background:#173c2d!important;color:#fff!important}
.rafex-placement-controls{grid-template-columns:auto 32px 58px 32px auto auto minmax(4px,1fr) 36px 36px 36px 36px!important}
@media(max-width:820px){.rafex-placement-controls{grid-template-columns:auto 32px 52px 32px auto auto!important}.rafex-angle-inputs{align-items:stretch}.rafex-angle-inputs label{flex:1 1 140px}.rafex-angle-inputs input{width:100%}}
@media print{.m2-corporate-bom-card h3{font-size:14px!important}.m2-corporate-bom-head span{font-size:10px!important}.m2-corporate-bom-row span{font-size:11px!important}}
</style>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> bulunamadi.");
html = html.slice(0, bodyEnd) + style + runtime + html.slice(bodyEnd);

if (!html.includes('data-rafex-user-20260819="v3"')) throw new Error("V3 runtime eklenemedi.");
if (!html.includes("Ağır deprem çaprazı") || !html.includes("SIRA ARALIĞI")) throw new Error("Deprem döküm ayrıştırması eklenemedi.");
if (!html.includes("data-rafex-angle-input-row") || !html.includes("data-rafex-front")) throw new Error("Kesit manuel açı/önden kontrolleri eklenemedi.");
if (!html.includes("__rafexOpenSectionPlacementV3") || !html.includes("__rafexEnsureSectionPlacementV3")) throw new Error("Kesit açılış güvencesi eklenemedi.");
if (!html.includes("rack.bays=state.count") || !html.includes("__rafexForceCustomizePreviewV3")) throw new Error("Özelleştir kat/palet düzeltmesi eklenemedi.");
if (html.includes("rafex-seismic-info")) throw new Error("Serbest yerleşimde eski deprem bilgi etiketi kaldı.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("Rafex 2026-08-19 V3: seismic BOM/product, Customize and Section Positioner fixes injected.");

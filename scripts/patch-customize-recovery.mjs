import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// 2026-08-19 V3 icinde Ozellestir'in kendi calisan akisini ikinci kez yoneten
// custom preview/apply katmani modal davranisini bozdu. Bu katmani tamamen kaldirip
// kaynak m2OpenCustomizeModal / m2PreviewRackCustomization / m2ApplyRackCustomization
// fonksiyonlarini tekrar tek dogru kaynak haline getiriyoruz.
const brokenCustomizeStart = "  // Ozellestir: girilen kat ve palet sayisini tek kaynak kabul et; 3D'yi aninda ayni canvas uzerinde yenile.";
const nextRuntimeSection = "  // Kesit Yer Belirleme butonunu DOM yenilenmelerinde tekrar bagla ve tiklamayi garanti et.";
const brokenStartIndex = html.indexOf(brokenCustomizeStart);
const nextSectionIndex = brokenStartIndex >= 0 ? html.indexOf(nextRuntimeSection, brokenStartIndex) : -1;
if (brokenStartIndex >= 0 && nextSectionIndex > brokenStartIndex) {
  html = html.slice(0, brokenStartIndex)
    + "  // Ozellestir recovery: native kaynak akisi kullaniliyor.\n"
    + html.slice(nextSectionIndex);
} else if (html.includes("__rafexForceCustomizePreviewV3")) {
  throw new Error("Ozellestir V3 runtime blogu guvenli sekilde kaldirilamadi.");
}

// Her Ozellestir acilisinda paletler gorunur baslasin. Kullanici modal acikken
// yine Goster/Gizle butonuyla istedigi gibi degistirebilir.
html = html.replaceAll(
  'if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(rack.b2b?.showPallets!==false,false);',
  'if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(true,false);',
);

// Palet/goz adedinin sadece b2bLayout icinde degil rack.bays ve rack.b2b icinde de
// kaydedilmesini render ve kayit oncesinde yap. Boylece 2 palet dendiginde eski bays
// degeri sonraki cizim/urun listesi akisini geri ezemez.
const resizeNeedle = 'rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);rack.totalRackHeight=rack.sideUprightHeight;rack.b2b.footHeight=rack.sideUprightHeight;m2B2BResizeRack(rack,count);';
const resizeReplacement = 'rack.bays=count;if(rack.b2b){rack.b2b.palletCount=count;rack.b2b.levels=rack.levels;}rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);rack.totalRackHeight=rack.sideUprightHeight;rack.b2b.footHeight=rack.sideUprightHeight;m2B2BResizeRack(rack,count);';
if (!html.includes(resizeReplacement)) {
  if (!html.includes(resizeNeedle)) throw new Error("Ozellestir kaydetme/resize noktasi bulunamadi.");
  html = html.replace(resizeNeedle, resizeReplacement);
}

// Kaynak fonksiyonlari degistirmeden yalniz iki guvenli UX kuralini ekle:
// 1) modal acildiginda palet gorunurlugunu gercek 3D preview'e uygula,
// 2) bir aksesuar ilk kez eklenince tum mevcut katlara aninda uygula.
if (!html.includes('data-rafex-customize-recovery="v1"')) {
  const recoveryRuntime = `<script data-rafex-customize-recovery="v1">(function(){
  if(window.__rafexCustomizeRecoveryV1)return;
  window.__rafexCustomizeRecoveryV1=true;
  const preview=function(){try{if(typeof window.m2PreviewRackCustomization==="function")window.m2PreviewRackCustomization();}catch(error){console.warn("Ozellestir native preview yenilenemedi",error);}};

  try{
    const originalOpen=window.m2OpenCustomizeModal;
    if(typeof originalOpen==="function"&&!originalOpen.__rafexRecoveryV1){
      const wrapped=function(){
        const result=originalOpen.apply(this,arguments);
        requestAnimationFrame(function(){
          try{if(typeof window.m2SetCustomizePalletsVisible==="function")window.m2SetCustomizePalletsVisible(true,false);}catch(error){}
          try{if(typeof window.m2RenderCustomizeRackAccessories==="function")window.m2RenderCustomizeRackAccessories();}catch(error){}
          preview();
        });
        return result;
      };
      wrapped.__rafexRecoveryV1=true;
      window.m2OpenCustomizeModal=wrapped;
    }
  }catch(error){console.warn("Ozellestir acilis recovery kurulamadı",error);}

  try{
    const originalEnable=window.m2EnableCustomizeRackAccessory;
    if(typeof originalEnable==="function"&&!originalEnable.__rafexRecoveryV1){
      const wrapped=function(type){
        const result=originalEnable.apply(this,arguments);
        try{
          const items=typeof window.m2CollectCustomizeRackAccessories==="function"?window.m2CollectCustomizeRackAccessories():[];
          const item=Array.isArray(items)?items.find(function(entry){return entry&&entry.type===type;}):null;
          if(item&&(!Array.isArray(item.levels)||item.levels.length===0)&&typeof window.m2AllCustomizeRackAccessoryLevels==="function"){
            window.m2AllCustomizeRackAccessoryLevels(type);
          }else{
            preview();
          }
          if(typeof window.m2RenderCustomizeRackAccessories==="function")window.m2RenderCustomizeRackAccessories();
        }catch(error){preview();}
        return result;
      };
      wrapped.__rafexRecoveryV1=true;
      window.m2EnableCustomizeRackAccessory=wrapped;
    }
  }catch(error){console.warn("Ozellestir aksesuar recovery kurulamadı",error);}
})();</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadi.");
  html = html.slice(0, bodyEnd) + recoveryRuntime + html.slice(bodyEnd);
}

if (html.includes("__rafexForceCustomizePreviewV3")) throw new Error("Bozuk Ozellestir V3 runtime hala build icinde.");
if (!html.includes(resizeReplacement)) throw new Error("Palet/goz sayisi native kayda baglanamadi.");
if (!html.includes('data-rafex-customize-recovery="v1"')) throw new Error("Ozellestir recovery runtime eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("Rafex Customize recovery: V3 override removed, native preview/apply restored.");

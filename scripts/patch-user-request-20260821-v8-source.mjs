import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const accessoryPath = path.join(root, "client", "b2b-accessories.js");

let html = fs.readFileSync(portalPath, "utf8");
let accessories = fs.readFileSync(accessoryPath, "utf8");
let changes = 0;

function replaceOnce(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`v8-source: ${label} bulunamadi`);
  changes += 1;
  return source.replace(from, to);
}

// Özelleştir modalında ZEMİN seviyesi draft'tan silinmesin.
html = replaceOnce(
  html,
  "window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>level>=1&&level<=levelCount())}));",
  "window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>((item.type==='palletStop'&&level===0)||(level>=1&&level<=levelCount())))}));",
  "collect ZEMIN"
);

html = replaceOnce(
  html,
  "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>level>=1&&level<=count)}));",
  "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>((item.type==='palletStop'&&level===0)||(level>=1&&level<=count)))}));",
  "render ZEMIN preserve"
);

html = replaceOnce(
  html,
  "const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type=\"button\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');",
  "const levelValues=(type==='palletStop'?[0]:[]).concat(Array.from({length:count},(_,i)=>i+1));const levels=levelValues.map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">'+(level===0?'ZEMİN':'K'+level)+'</button>').join('');",
  "ZEMIN button"
);

html = replaceOnce(
  html,
  "window.m2AllCustomizeRackAccessoryLevels=(type)=>{const item=itemFor(type);if(!item)return;const count=levelCount();item.levels=(item.levels||[]).filter((level)=>level>=1&&level<=count).length===count?[]:Array.from({length:count},(_,i)=>i+1);window.m2RenderCustomizeRackAccessories();preview();};",
  "window.m2AllCustomizeRackAccessoryLevels=(type)=>{const item=itemFor(type);if(!item)return;const count=levelCount(),ground=item.type==='palletStop'&&(item.levels||[]).includes(0),k=(item.levels||[]).filter((level)=>level>=1&&level<=count);item.levels=k.length===count?(ground?[0]:[]):(ground?[0]:[]).concat(Array.from({length:count},(_,i)=>i+1));window.m2RenderCustomizeRackAccessories();preview();};",
  "all levels preserve ZEMIN"
);

// Özelleştir açılırken seçili rack aksesuarlarını yükle.
html = replaceOnce(
  html,
  "if($(\"m2CustomizeManualLevels\").checked){[...document.querySelectorAll(\"#m2CustomizeLevelRows .m2-custom-level-row\")].forEach((row,index)=>{const item=rack.b2b.customLevels[index];if(!item)return;row.querySelector('[data-custom-interval]').value=String(item.interval);row.querySelector('[data-custom-pallet]').value=String(item.palletHeight);});}\n        $(\"m2CustomizeModal\").hidden=false;",
  "if($(\"m2CustomizeManualLevels\").checked){[...document.querySelectorAll(\"#m2CustomizeLevelRows .m2-custom-level-row\")].forEach((row,index)=>{const item=rack.b2b.customLevels[index];if(!item)return;row.querySelector('[data-custom-interval]').value=String(item.interval);row.querySelector('[data-custom-pallet]').value=String(item.palletHeight);});}\n        if(typeof m2LoadCustomizeRackAccessories==='function')m2LoadCustomizeRackAccessories(rack.b2b?.accessories||[]);\n        $(\"m2CustomizeModal\").hidden=false;",
  "load rack accessories"
);

// Kaydet dediğinde draft aksesuarlar gerçek rack state'ine yazılsın.
html = replaceOnce(
  html,
  "rack.b2b={...(rack.b2b||{}),rowType:rowCount===2?\"double\":\"single\",rowGap,levels:rack.levels,palletHeight:rack.palletHeight,customLevels:$(\"m2CustomizeManualLevels\")?.checked?m2CustomizeLevelData():[],tunnelHeight:$(\"m2CustomizeTunnel\")?.checked?Math.max(500,Number($(\"m2CustomizeTunnelHeight\")?.value)||3600):0};",
  "rack.b2b={...(rack.b2b||{}),rowType:rowCount===2?\"double\":\"single\",rowGap,levels:rack.levels,palletHeight:rack.palletHeight,customLevels:$(\"m2CustomizeManualLevels\")?.checked?m2CustomizeLevelData():[],tunnelHeight:$(\"m2CustomizeTunnel\")?.checked?Math.max(500,Number($(\"m2CustomizeTunnelHeight\")?.value)||3600):0,accessories:typeof m2CollectCustomizeRackAccessories==='function'?m2CollectCustomizeRackAccessories():(rack.b2b?.accessories||[])};",
  "save rack accessories"
);

// Native B2B aksesuar panelinde de ZEMİN kaybolmasın ve seçilebilir olsun.
accessories = replaceOnce(
  accessories,
  "accessories = accessories.map((item) => ({ ...item, levels: (item.levels || []).filter((level) => level >= 1 && level <= levels) }));",
  "accessories = accessories.map((item) => ({ ...item, levels: (item.levels || []).filter((level) => (item.type === 'palletStop' && level === 0) || (level >= 1 && level <= levels)) }));",
  "native render preserve ZEMIN"
);

accessories = replaceOnce(
  accessories,
  "const levelButtons = Array.from({ length: levels }, (_, i) => i + 1).map((level) => `<button type=\"button\" class=\"${selected.has(level) ? 'active' : ''}\" onclick=\"rafexAccessoryToggleLevel(${index},${level})\">K${level}</button>`).join('');",
  "const levelValues = (item.type === 'palletStop' ? [0] : []).concat(Array.from({ length: levels }, (_, i) => i + 1));\n      const levelButtons = levelValues.map((level) => `<button type=\"button\" class=\"${selected.has(level) ? 'active' : ''}\" onclick=\"rafexAccessoryToggleLevel(${index},${level})\">${level === 0 ? 'ZEMİN' : `K${level}`}</button>`).join('');",
  "native ZEMIN button"
);

accessories = replaceOnce(
  accessories,
  "const count = levelCount(); item.levels = (item.levels || []).length === count ? [] : Array.from({length:count},(_,i)=>i+1); render(); notify();",
  "const count = levelCount(), ground = item.type === 'palletStop' && (item.levels || []).includes(0), k = (item.levels || []).filter((level) => level >= 1 && level <= count); item.levels = k.length === count ? (ground ? [0] : []) : (ground ? [0] : []).concat(Array.from({length:count},(_,i)=>i+1)); render(); notify();",
  "native all levels preserve ZEMIN"
);

// Tünel: sabit 3600 değil, rack'in gerçek tunnelHeight değeri. O alanın altındaki travers/aksesuar yok.
accessories = accessories.replaceAll(
  "if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) return;",
  "if (this.options.tunnelHeight > 0 && this.traverseBottom(level) < this.options.tunnelHeight) return;"
);
accessories = accessories.replace(
  "if (accessory.type === 'palletStop' && numericLevel === 0 && this.models.palletStop) {\n            [0, 250].forEach((baseHeight, groundIndex) => {",
  "if (accessory.type === 'palletStop' && numericLevel === 0 && this.models.palletStop) {\n            if (this.options.tunnelHeight > 0) return;\n            [0, 250].forEach((baseHeight, groundIndex) => {"
);

if (!html.includes("m2LoadCustomizeRackAccessories(rack.b2b?.accessories||[])") || !html.includes("accessories:typeof m2CollectCustomizeRackAccessories")) throw new Error("v8-source: customize save/load baglantisi yok");
if (!html.includes("data-level=\"'+level+'\"")) throw new Error("v8-source: ZEMIN data-level duzeltmesi yok");
if (!accessories.includes("this.traverseBottom(level) < this.options.tunnelHeight")) throw new Error("v8-source: dinamik tunnel filtresi yok");

fs.writeFileSync(portalPath, html);
fs.writeFileSync(accessoryPath, accessories);
console.log(`SOURCE v8: ${changes} kaynak duzeltmesi; aksesuar katlari/ZEMIN, save-load ve dinamik tunnel filtresi aktif.`);

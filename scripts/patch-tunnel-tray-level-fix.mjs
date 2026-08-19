import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const accessoryPath = path.join(root, "client", "b2b-accessories.js");

let portal = fs.readFileSync(portalPath, "utf8");
let accessories = fs.readFileSync(accessoryPath, "utf8");

const trayNeedle = "const tray = this.accessoryModel(this.models.tray, { x:pieceWidth, y:beamSeatSpan, z:45 }, true);";
const trayReplacement = "const tray = this.accessoryModel(this.models.tray, { x:pieceWidth, y:beamSeatSpan, z:1 }, true);";
if (!accessories.includes(trayReplacement)) {
  if (!accessories.includes(trayNeedle)) throw new Error("Tava kalinligi render satiri bulunamadi.");
  accessories = accessories.replace(trayNeedle, trayReplacement);
}

const marker = 'data-rafex-tunnel-tray-level-fix="v1"';
if (!portal.includes(marker)) {
  const runtime = `<style data-rafex-tunnel-tray-level-fix-style="v1">
#m2CustomizeAccessories .m2-customize-accessory-levels button{pointer-events:auto!important;touch-action:manipulation!important;position:relative!important;z-index:4!important}
</style><script ${marker}>(function(){
  if(window.__rafexTunnelTrayLevelFixV1)return;
  window.__rafexTunnelTrayLevelFixV1=true;
  let lastLevelCall={key:'',time:0};
  let tunnelSyncBusy=false;
  const byId=(id)=>document.getElementById(id);
  const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(byId('m2CustomizeLevels')?.value)||1)));
  const collect=()=>{try{return typeof window.m2CollectCustomizeRackAccessories==='function'?window.m2CollectCustomizeRackAccessories():[];}catch{return [];}};
  const preview=()=>{try{if(typeof window.m2PreviewRackCustomization==='function')window.m2PreviewRackCustomization();}catch{}};

  const originalLevelToggle=window.m2ToggleCustomizeRackAccessoryLevel;
  if(typeof originalLevelToggle==='function'&&!originalLevelToggle.__rafexLevelPointerFix){
    const wrapped=function(type,level){
      const key=String(type)+':'+String(level),now=Date.now();
      if(lastLevelCall.key===key&&now-lastLevelCall.time<350)return;
      lastLevelCall={key,time:now};
      return originalLevelToggle.apply(this,arguments);
    };
    wrapped.__rafexLevelPointerFix=true;
    window.m2ToggleCustomizeRackAccessoryLevel=wrapped;
  }

  document.addEventListener('pointerdown',function(event){
    const target=event.target instanceof Element?event.target.closest('#m2CustomizeAccessories .m2-customize-accessory-levels button'):null;
    if(!target)return;
    const card=target.closest('.m2-customize-accessory-card');
    const type=card?.dataset?.accessoryType;
    const level=Number((target.textContent||'').replace(/\\D/g,''));
    if(!type||!level||typeof window.m2ToggleCustomizeRackAccessoryLevel!=='function')return;
    event.preventDefault();
    event.stopPropagation();
    window.m2ToggleCustomizeRackAccessoryLevel(type,level);
  },true);

  function targetTunnelLevel(){
    const count=levelCount();
    const tunnelHeight=Math.max(500,Number(byId('m2CustomizeTunnelHeight')?.value)||3600);
    let cumulative=0;
    const manual=byId('m2CustomizeManualLevels')?.checked===true;
    const rows=manual?[...document.querySelectorAll('#m2CustomizeLevelRows .m2-custom-level-row')]:[];
    const palletHeight=Math.max(300,Number(byId('m2CustomizePalletHeight')?.value)||1200);
    let gap=200,traverse=100;
    try{if(typeof b2bPalletTraverseGap==='number'&&Number.isFinite(b2bPalletTraverseGap))gap=b2bPalletTraverseGap;}catch{}
    try{if(typeof b2bTraverseHeight==='function'){const value=Number(b2bTraverseHeight());if(value>0)traverse=value;}}catch{}
    const fallbackInterval=Math.max(1,palletHeight+gap+traverse);
    for(let index=0;index<count;index++){
      const rowInterval=Number(rows[index]?.querySelector('[data-custom-interval]')?.value);
      cumulative+=manual&&rowInterval>0?rowInterval:fallbackInterval;
      if(cumulative>tunnelHeight)return index+1;
    }
    return count;
  }

  function normalizeTunnelTray(){
    if(tunnelSyncBusy||byId('m2CustomizeTunnel')?.checked!==true)return;
    tunnelSyncBusy=true;
    try{
      const target=targetTunnelLevel();
      let items=collect();
      let tray=Array.isArray(items)?items.find((item)=>item&&item.type==='tray'):null;
      if(!tray&&typeof window.m2EnableCustomizeRackAccessory==='function'){
        window.m2EnableCustomizeRackAccessory('tray');
        items=collect();
        tray=Array.isArray(items)?items.find((item)=>item&&item.type==='tray'):null;
      }
      if(!tray)return;
      if(typeof window.m2SetCustomizeRackTrayWidth==='function')window.m2SetCustomizeRackTrayWidth('tray',300);
      const selected=new Set(Array.isArray(tray.levels)?tray.levels.map(Number):[]);
      if(typeof window.m2ToggleCustomizeRackAccessoryLevel==='function'){
        [...selected].filter((level)=>level!==target).forEach((level)=>window.m2ToggleCustomizeRackAccessoryLevel('tray',level));
        if(!selected.has(target))window.m2ToggleCustomizeRackAccessoryLevel('tray',target);
      }
      preview();
    }finally{
      tunnelSyncBusy=false;
    }
  }
  window.m2EnsureTunnelTray=normalizeTunnelTray;

  const originalTunnelToggle=window.m2ToggleCustomizeTunnel;
  if(typeof originalTunnelToggle==='function'&&!originalTunnelToggle.__rafexTunnelTrayFix){
    const wrapped=function(){
      const result=originalTunnelToggle.apply(this,arguments);
      if(byId('m2CustomizeTunnel')?.checked===true)requestAnimationFrame(normalizeTunnelTray);
      return result;
    };
    wrapped.__rafexTunnelTrayFix=true;
    window.m2ToggleCustomizeTunnel=wrapped;
  }

  document.addEventListener('input',function(event){
    const id=event.target?.id;
    if((id==='m2CustomizeTunnelHeight'||id==='m2CustomizePalletHeight'||id==='m2CustomizeLevels')&&byId('m2CustomizeTunnel')?.checked===true){
      requestAnimationFrame(normalizeTunnelTray);
    }
  },true);
  document.addEventListener('change',function(event){
    if(event.target?.id==='m2CustomizeManualLevels'&&byId('m2CustomizeTunnel')?.checked===true)requestAnimationFrame(normalizeTunnelTray);
  },true);
})();</script>`;
  const bodyEnd=portal.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error('Portal body kapanisi bulunamadi.');
  portal=portal.slice(0,bodyEnd)+runtime+portal.slice(bodyEnd);
}

if(!portal.includes(marker))throw new Error('Tunel tava/kat tiklama runtime eklenemedi.');
if(!accessories.includes(trayReplacement))throw new Error('Tava 1 mm kalinlik patch uygulanamadi.');

fs.writeFileSync(portalPath,portal);
fs.writeFileSync(accessoryPath,accessories);
console.log('Ozellestir kat tiklama + tunel ustu 300 mm / 1 mm tava kurali eklendi.');

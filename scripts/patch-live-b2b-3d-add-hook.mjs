import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-b2b-3d-add-hook="v4"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B 3D add hook: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-b2b-3d-add-hook="v4">[\s\S]*?<\/script>/g, "");

const runtime = `<script ${marker}>(function(){
  if(window.__rafexB2B3DAddHookV4)return;
  window.__rafexB2B3DAddHookV4=true;

  let activeWatch=null;

  function stateRackCount(){
    try{
      return typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState&&m2LayoutState.racks)
        ?m2LayoutState.racks.length
        :-1;
    }catch{return -1;}
  }

  function domRackCount(){
    return document.querySelectorAll('.m2-rack-card[data-rack]').length;
  }

  function pauseUpper3D(){
    if(typeof window.rafexPauseB2B3D==='function'){
      window.rafexPauseB2B3D();
      return true;
    }
    if(typeof window.rafexStopMain3DForFreeLayout==='function'){
      window.rafexStopMain3DForFreeLayout();
      return true;
    }
    return false;
  }

  function stopWatch(){
    if(activeWatch){clearInterval(activeWatch);activeWatch=null;}
  }

  function watchForRealAddition(beforeState,beforeDom){
    stopWatch();
    let ticks=0;
    activeWatch=setInterval(function(){
      ticks+=1;
      const afterState=stateRackCount();
      const afterDom=domRackCount();
      const stateAdded=beforeState>=0&&afterState>beforeState;
      const domAdded=afterDom>beforeDom;
      if(stateAdded||domAdded){
        stopWatch();
        pauseUpper3D();
        return;
      }
      if(ticks>=75)stopWatch();
    },40);
  }

  function addControl(target,eventType){
    if(!(target instanceof Element))return null;
    const button=target.closest('button,[role="button"],a');
    if(button){
      const onclick=button.getAttribute('onclick')||'';
      if(/(?:^|[^A-Za-z0-9_$])(m2AddRack|m2DuplicateRack|m2AddSelectedSavedRack|m2ApplyAutoFillLength)\s*\(/.test(onclick))return button;
      if(button.id==='m2AutoFillApplyButton')return button;
    }
    if(eventType==='dblclick'){
      const saved=target.closest('.m2-saved-type');
      if(saved)return saved;
    }
    return null;
  }

  function onTrustedAddIntent(event){
    if(!event.isTrusted)return;
    const control=addControl(event.target,event.type);
    if(!control)return;
    if(control.closest('#rafexB2BPausedOverlay,#rafexMain3DRefreshButton,.rafex-module-refresh'))return;
    const beforeState=stateRackCount();
    const beforeDom=domRackCount();
    setTimeout(function(){watchForRealAddition(beforeState,beforeDom);},0);
  }

  document.addEventListener('click',onTrustedAddIntent,true);
  document.addEventListener('dblclick',onTrustedAddIntent,true);
})();</script>`;

html = html.replace(/<\/body>/i, `${runtime}</body>`);
const nextBase64 = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${nextBase64}${match[2]}`);
fs.writeFileSync(workerPath, worker, "utf8");
console.log("B2B 3D add hook v4 injected.");

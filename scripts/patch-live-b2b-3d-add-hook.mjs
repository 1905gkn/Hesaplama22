import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-b2b-3d-add-hook="v5"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B 3D add hook v5: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Remove the previous polling-only hook. It could miss insertions because the
// rendered free-layout rack is an SVG node, not an .m2-rack-card element.
html = html
  .replace(/<script\s+data-rafex-b2b-3d-add-hook="v4">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-b2b-3d-add-hook="v5">[\s\S]*?<\/script>/g, "");

const sourcePatches = [
  [
    'm2PushUndo("Raf ekleme");m2LayoutState.racks.push(rack);',
    'm2PushUndo("Raf ekleme");m2LayoutState.racks.push(rack);window.rafexPauseB2B3DIfUserAdd?.();'
  ],
  [
    'm2PushUndo("Raf çoğaltma");m2LayoutState.racks.push(copy); m2LayoutState.selected',
    'm2PushUndo("Raf çoğaltma");m2LayoutState.racks.push(copy);window.rafexPauseB2B3DIfUserAdd?.(); m2LayoutState.selected'
  ],
  [
    'm2LayoutState.racks.push(probe);anchor=probe;',
    'm2LayoutState.racks.push(probe);window.rafexPauseB2B3DIfUserAdd?.();anchor=probe;'
  ]
];

let patchedCount = 0;
for (const [from, to] of sourcePatches) {
  if (html.includes(to)) continue;
  if (html.includes(from)) {
    html = html.replace(from, to);
    patchedCount += 1;
  }
}

const runtime = `<script ${marker}>(function(){
  if(window.__rafexB2B3DAddHookV5)return;
  window.__rafexB2B3DAddHookV5=true;

  let userAddIntentUntil=0;
  let pauseTimer=0;

  function isRealAddControl(target,event){
    if(!(target instanceof Element))return false;
    const button=target.closest('button,[role="button"],a');
    if(button){
      const onclick=button.getAttribute('onclick')||'';
      if(/(?:^|[^A-Za-z0-9_$])(m2AddRack|m2AddSelectedSavedRack|m2DuplicateRack|m2ApplyAutoFillLength)\\s*\\(/.test(onclick))return true;
      if(button.id==='m2AutoFillApplyButton')return true;
      if(button.classList.contains('m2-saved-type')&&Number(event?.detail)>=2)return true;
    }
    return false;
  }

  function arm(event){
    if(!event.isTrusted)return;
    if(!isRealAddControl(event.target,event))return;
    userAddIntentUntil=Date.now()+8000;
  }

  document.addEventListener('click',arm,true);

  window.rafexPauseB2B3DIfUserAdd=function(){
    if(Date.now()>userAddIntentUntil)return false;
    userAddIntentUntil=0;
    if(pauseTimer)clearTimeout(pauseTimer);
    // Run after m2RenderLayout/m2RenderReport have completed. Pausing before those
    // renders allowed the viewer to be mounted again and made the 3D appear visible.
    pauseTimer=setTimeout(function(){
      pauseTimer=0;
      if(typeof window.rafexPauseB2B3D==='function')window.rafexPauseB2B3D();
    },0);
    return true;
  };
})();</script>`;

html = html.replace(/<\/body>/i, `${runtime}</body>`);
const nextBase64 = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${nextBase64}${match[2]}`);
fs.writeFileSync(workerPath, worker, "utf8");

if (patchedCount === 0 && !html.includes('rafexPauseB2B3DIfUserAdd?.()')) {
  throw new Error("B2B 3D add hook v5: rack insertion points bulunamadi.");
}
console.log(`B2B 3D add hook v5 injected; direct insertion hooks: ${patchedCount}.`);

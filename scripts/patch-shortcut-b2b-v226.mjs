import fs from 'node:fs';
export function transform(html){
 if(html.includes('shortcut-b2b-v226'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing anchor '+a.slice(0,80));html=html.replace(a,b)};
 replace("q:'#rafexPickBlocksV145'};","q:'#rafexPickBlocksV145',b:'#m2JoinRackButton'};");
 replace("key==='s'||key==='o'||key==='q'","key==='s'||key==='o'||key==='q'||key==='b'");
 replace('b2bInstallMain3D();b2bUpdateMain3D();},delay);','b2bInstallMain3D();},delay);');
 replace('b2bRenderTunnels(); b2bApplyInputs(); b2bRefreshSummary(); b2bInstallMain3D(); m2ShowView("front");','b2bRenderTunnels(); b2bApplyInputs(); b2bInstallMain3D(); m2ShowView("front");');
 replace('      function b2bUpdateMain3D() {','      const b2bMainOptionsV226 = new WeakMap();\n      function b2bUpdateMain3D() {');
 replace('          if (!mountedOnMain && typeof viewer.mount === "function") viewer.mount(canvas, options);\n          else viewer.update?.(options);',`          const key = JSON.stringify(options), previous = b2bMainOptionsV226.get(canvas);
          if (!mountedOnMain && typeof viewer.mount === "function") {
            viewer.mount(canvas, options); b2bMainOptionsV226.set(canvas, {viewer,key});
          } else if (!previous || previous.viewer !== viewer || previous.key !== key) {
            viewer.update?.(options); b2bMainOptionsV226.set(canvas, {viewer,key});
          }`);
 replace('const mount = () => { try { window.RafexB2BViewer.mount(canvas, b2b3DOptions()); b2bUpdateMain3D();', 'const mount = () => { if (!canvas.isConnected || m2ActiveModule !== "b2b") return; try { const options=b2b3DOptions(); window.RafexB2BViewer.mount(canvas, options); b2bMainOptionsV226.set(canvas,{viewer:window.RafexB2BViewer,key:JSON.stringify(options)}); b2bUpdateMain3D();');
 // Existing canvas needs an option update, not toolbar reconstruction or resetting its view.
 replace('        const frontTab = document.querySelector(\'[data-m2-tab="front"]\');','        if (host.querySelector("#b2bMain3DCanvas")) { b2bUpdateMain3D(); return; }\n        const frontTab = document.querySelector(\'[data-m2-tab="front"]\');');
 const extra=`<style data-rafex="shortcut-b2b-v226">
 button[data-shortcut-v226]::after{content:attr(data-shortcut-v226);font-size:11px;font-weight:500;opacity:.72;margin-left:12px;white-space:nowrap}
 @media print{button[data-shortcut-v226]::after{display:none}}
 </style><script data-rafex="shortcut-b2b-v226">
 (()=>{
 const hints={'#m2SelectRackButton':'Ctrl+S','#rafexPickBlocksV145':'Ctrl+Q','#m2CustomizeRackButton':'O','#m2JoinRackButton':'Ctrl+B','#m2UndoButton':'Ctrl+Z','button[onclick="m2RotateRack()"]':'Ctrl+D','button[onclick="m2DuplicateRack()"]':'Ctrl+V','button[onclick="m2DeleteRack()"]':'Delete'};
 const selector=Object.keys(hints).join(',');
 function annotate(root){for(const el of [root,...root.querySelectorAll(selector)]){if(!(el instanceof HTMLElement))continue;for(const [s,key]of Object.entries(hints))if(el.matches(s)){if(!el.textContent.includes(key))el.dataset.shortcutV226=key;el.setAttribute('aria-keyshortcuts',key==='O'?'O':key.replace('Ctrl+','Control+'));break}}}
 annotate(document);
 new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n instanceof HTMLElement)annotate(n)}).observe(document.getElementById('page'),{childList:true,subtree:true});
 })();</script>`;
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+extra+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shortcut-b2b-v226.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

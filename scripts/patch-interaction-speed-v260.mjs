import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* interaction-speed-v260 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch: '+a.slice(0,90));html=html.replace(a,b);};
 rep('m2LayoutState.hover = m2SnapOrtho(point); m2RenderLayout();','m2LayoutState.hover = m2SnapOrtho(point); window.rafexDrawHoverV260();');
 rep('window.rafexWallAlignmentV256={snap};','window.rafexWallAlignmentV256={snap,paint};');
 rep("if(event.isTrusted&&!output&&(eventName!=='pointerdown'||event.target.closest?.('button,input,select,textarea,.rafex-placement-stage')))preparedSignature=null;","if(event.isTrusted&&!output&&!event.target.closest?.('#m2CreateOutputButton')&&(eventName!=='pointerdown'||event.target.closest?.('button,input,select,textarea,.rafex-placement-stage')))preparedSignature=null;");
 rep('var stationMapV255=window.rafexSharedFramesV255.stations(m2LayoutState.racks);',"var stationMapV255=(!targetSystem||targetSystem==='b2b')?window.rafexSharedFramesV255.stations(m2LayoutState.racks):new Map();");
 rep("  document.addEventListener('click',schedule,true);\n  document.addEventListener('change',schedule,true);\n  document.addEventListener('pointerup',schedule,true);","  // Layout changes already schedule inventory; unrelated clicks need no scan.\n  document.addEventListener('change',schedule,true);");
 const preview='html += `<line x1="${last.x}" y1="${last.y}" x2="${m2LayoutState.hover.x}" y2="${m2LayoutState.hover.y}" class="m2-floor-draft"/><text x="${(last.x + m2LayoutState.hover.x) / 2}" y="${(last.y + m2LayoutState.hover.y) / 2 - 8}" text-anchor="middle" class="m2-layout-label">${fmt(lengthMm)} mm</text>`;';
 rep(preview,preview.replace('`<line','`<g data-draw-hover-v260="" pointer-events="none"><line').replace('</text>`','</text></g>`'));
 rep("copy.querySelectorAll('[data-wall-alignment-v256]').forEach(n=>n.remove());","copy.querySelectorAll('[data-wall-alignment-v256],[data-draw-hover-v260]').forEach(n=>n.remove());");
 rep("    creating=true;depth++;window.__rafexManualOutputBuild=true;window.rafexPlanCacheV258=new WeakMap();",`    const settingsV260=()=>JSON.stringify(Array.from(p.querySelectorAll('input,select,textarea')).map(e=>[e.id,e.name,e.type,e.value,e.checked]));
    if(target&&p.dataset.rafexReadyV136===type&&!window.__rafexFreeOutputDirty&&window.rafexAreaOutputIsCurrent?.()&&target.__settingsV260===settingsV260()&&target.querySelector('svg,img,canvas')){target.scrollIntoView({block:'start'});status('Teknik çıktı güncel.');return;}
    creating=true;depth++;window.__rafexManualOutputBuild=true;window.rafexPlanCacheV258=new WeakMap();`);
 rep("      window.__rafexFreeOutputDirty=false;","      window.__rafexFreeOutputDirty=false;target.__settingsV260=settingsV260();");
 const runtime=fs.readFileSync(new URL('./interaction-speed-v260.js',import.meta.url),'utf8');
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script>'+runtime+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-interaction-speed-v260.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

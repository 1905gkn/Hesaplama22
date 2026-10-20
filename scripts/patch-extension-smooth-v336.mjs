import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* extension-smooth-v336 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('v336 missing/ambiguous anchor '+a.slice(0,100));html=html.replace(a,b);};
 rep('function obstacleClearance(source,direction){',`/* extension-smooth-v336 */
  var obstacleCacheV336={draft:null,epoch:null,entries:new Map()};
  function obstacleClearance(source,direction){
    var draft=m2AutoFillDraft,epoch=window.rafexMrClearanceEpochV336||0;
    if(!draft)return obstacleClearanceUncachedV336(source,direction);
    if(obstacleCacheV336.draft!==draft||obstacleCacheV336.epoch!==epoch){obstacleCacheV336={draft:draft,epoch:epoch,entries:new Map()};}
    var key=[source.id,direction,source.x,source.y,source.w,source.h,source.angle,m2LayoutState.scale,m2LayoutState.racks.length,m2LayoutState.points?.length,m2LayoutSymbols.length,m2LayoutState.closed].join('|'),entry=obstacleCacheV336.entries.get(key);
    if(entry&&entry.racks===m2LayoutState.racks&&entry.points===m2LayoutState.points&&entry.symbols===m2LayoutSymbols)return entry.value;
    var value=obstacleClearanceUncachedV336(source,direction);
    if(obstacleCacheV336.entries.size>8)obstacleCacheV336.entries.clear();
    obstacleCacheV336.entries.set(key,{racks:m2LayoutState.racks,points:m2LayoutState.points,symbols:m2LayoutSymbols,value:value});return value;
  }
  function obstacleClearanceUncachedV336(source,direction){`);
 const start=html.indexOf('<script data-rafex-mr-extension-controls="v70">'),a=html.indexOf('  function preview(raw){',start),b=html.indexOf('  function apply(){',a);if(start<0||a<0||b<0)throw Error('v336 legacy manual preview missing');
 html=html.slice(0,a)+`  function preview(raw){
    if(!isMr())return false;var value=Number(raw);if(!Number.isFinite(value)||value<0)return false;
    window.m2PreviewAutoFillLength(raw);sync();return true;
  }
`+html.slice(b);
 rep("if(typeof window.rafexCommitMrObstacleV40==='function')window.rafexCommitMrObstacleV40(null);else if(typeof window.m2ApplyAutoFillLength==='function')window.m2ApplyAutoFillLength();","window.m2ApplyAutoFillLength();");
 rep("if(previewOnly){paint();return;}document.getElementById('rafexAutoFillPreviewV332')?.remove();return render.apply(this,arguments);","if(previewOnly){paint();return;}window.rafexMrClearanceEpochV336=(window.rafexMrClearanceEpochV336||0)+1;document.getElementById('rafexAutoFillPreviewV332')?.remove();return render.apply(this,arguments);");
 // The window capture listener runs before the document join handler.
 rep("function start(rack,event){\n    if(!isMr(rack))return false;", "function start(rack,event){\n    if(m2JoinMode||m2LayoutState.mode==='draw'||!isMr(rack))return false;");
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-extension-smooth-v336.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v336 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v336: lightweight MR manual preview and draft-scoped clearance caching');
}


import fs from 'node:fs';
export function tunnelTypeName(rack){
 let base=String(rack?.typeName||'A').replace(/\s*-\s*Tünel(?:\s+\d+)?\s*$/i,'').replace(/\s*-\s*Özel(?:\s+\d+)?\s*$/i,'').trim();
 const block=String(rack?.blockName||'').trim();if(block&&base.endsWith(' - '+block))base=base.slice(0,-block.length-3).trim();return (base||'A')+' - Tünel';
}
export function installTunnelManual(){
 let targetId=null;
 const open=window.m2OpenCustomizeModal;
 window.m2OpenCustomizeModal=m2OpenCustomizeModal=function(){targetId=null;const modal=document.getElementById('m2CustomizeModal');if(modal)delete modal.dataset.tunnelManualNameV237;return open.apply(this,arguments);};
 window.rafexTunnelManualAppliedV237=function(rack){
  targetId=rack.id;const input=document.getElementById('m2CustomizeName'),name=rafexTunnelTypeNameV237(rack);
  if(input){input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));}
  const modal=document.getElementById('m2CustomizeModal');if(modal){modal.dataset.detailEditedV135='1';modal.dataset.tunnelManualNameV237=name;}
 };
 const commit=window.rafexCommitCustomTypeV184;
 window.rafexCommitCustomTypeV184=function(rack,entry,previous){
  if(rack.id===targetId&&document.getElementById('m2CustomizeModal')?.dataset.tunnelManualNameV237){
   const name=document.getElementById('m2CustomizeName').value.trim();entry.name=name;entry.rafexCustomNameV203=name;entry.drawing.rafexCustomNameV203=name;rack.rafexCustomNameV203=name;
  }return commit.apply(this,arguments);
 };
}
export function transform(html){
 if(html.includes('data-tunnel-manual="v237"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing tunnel manual anchor '+a.slice(0,80));html=html.replace(a,b);};
 replace("const custom=kind==='custom',rack=custom?", "const custom=kind==='custom'||kind==='tunnel',rack=custom?");
 replace("dialog.innerHTML='<h3>Manuel yükseklik</h3>","dialog.innerHTML='<h3>'+ (kind==='tunnel'?'Tünel · Katları tek tek düzenle':'Manuel yükseklik') +'</h3>");
 replace("else{mainRows=rows;syncMainHeightMode();}dialog.close();", "else{mainRows=rows;syncMainHeightMode();}if(kind==='tunnel')window.rafexTunnelManualAppliedV237?.(rack);dialog.close();");
 const input='<label>Tünel yüksekliği (mm)<input id="m2CustomizeTunnelHeight" type="number" min="500" max="20000" step="50" value="3600" disabled oninput="m2PreviewRackCustomization()"></label>';
 replace(input,'<label>Tünel yüksekliği (mm)<span class="rafex-tunnel-height-row"><input id="m2CustomizeTunnelHeight" type="number" min="500" max="20000" step="50" value="3600" disabled oninput="m2PreviewRackCustomization()"><button type="button" id="rafexTunnelManualV237" onclick="window.rafexOpenManualHeightV121(\'tunnel\')">Manuel</button></span></label>');
 replace("const name=String(rack.rafexGlobalTypeLetter||rack.typeName||'').trim();", "const fullName=String(rack.rafexGlobalTypeLetter||rack.typeName||'').trim(),name=Number(rack.b2b?.tunnelHeight)>0?fullName.replace(/\\s*-\\s*Tünel(?:\\s+\\d+)?\\s*$/i,''):fullName;");
 html=html.replaceAll('b2bTypeLetter(rack.typeName, index + 1)',"b2bTypeLetter(rack.b2b?.tunnelHeight?String(rack.typeName).replace(/\\s*-\\s*Tünel(?:\\s+\\d+)?\\s*$/i,''):rack.typeName, index + 1)").replaceAll('b2bTypeLetter(rack.typeName,index+1)',"b2bTypeLetter(rack.b2b?.tunnelHeight?String(rack.typeName).replace(/\\s*-\\s*Tünel(?:\\s+\\d+)?\\s*$/i,''):rack.typeName,index+1)");
 const at=html.lastIndexOf('</body>'),runtime='<style>.rafex-tunnel-height-row{display:flex;gap:8px;align-items:center}.rafex-tunnel-height-row input{min-width:0;flex:1}.rafex-tunnel-height-row button{padding:9px 12px;background:#173c2d;color:white;border:0;border-radius:7px;font-weight:800}#m2CustomizeModal:has(#m2CustomizeTunnel:not(:checked)) label:has(#rafexTunnelManualV237){display:none}</style><script data-tunnel-manual="v237">const rafexTunnelTypeNameV237='+tunnelTypeName.toString()+';('+installTunnelManual.toString()+')();</script>';
 return html.slice(0,at)+runtime+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-tunnel-manual-v237.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

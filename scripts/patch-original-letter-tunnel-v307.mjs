import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* original-letter-tunnel-v307 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing v307 anchor: '+a.slice(0,100));html=html.replace(a,b);};
 rep('const main=Math.min(12*ratio,height*.32,width/Math.max(.65,name.textContent.length*.65)),small=Math.min(8*ratio,main*.7,width/Math.max(.65,detail.length*.65));','/* original-letter-tunnel-v307 */ const main=12*ratio,small=Math.min(10*ratio,width/Math.max(.65,detail.length*.65));');
 rep('const gap=(main+small)*.7+Math.min(3*ratio,height*.1),top=y-gap/2/scale,bottom=y+gap/2/scale;','const gap=16*ratio,top=y-gap/2/scale,bottom=y+gap/2/scale;');
 rep('session={values:JSON.stringify(values()),rackId:m2CustomizeRackId,saved:structuredClone(m2SavedRackTypes)};', 'session={values:JSON.stringify(values()),rackId:m2CustomizeRackId,saved:structuredClone(m2SavedRackTypes),original:structuredClone(m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId))};');
 rep('session?.rackId===r.id&&JSON.stringify(values())===session.values&&Number(r.b2b?.tunnelHeight||0)!==Number(previous?.b2b?.tunnelHeight||0)',`session?.rackId===r.id&&Number(r.b2b?.tunnelHeight||0)!==Number(session.original?.b2b?.tunnelHeight||0)&&(
    JSON.stringify(values())===session.values||(
      ['palletCount','palletWidth','palletDepth','rowCount','rowGap','palletOverhang'].every(k=>Number(r.b2bLayout?.[k]||0)===Number(session.original?.b2bLayout?.[k]||0))&&
      ['levels','palletHeight','footType','footProfile'].every(k=>String(r[k]??'')===String(session.original?.[k]??''))&&
      String(document.getElementById('m2CustomizeName')?.value||'').replace(/\\s*-\\s*Tünel(?:\\s+\\d+)?\\s*$/i,'').trim()===String(session.original?.typeName||'').trim()
    ))`);
 rep("if(previous[key]===undefined)delete r[key];else r[key]=previous[key];}\n   m2SavedRackTypes=session.saved;window.rafexSelectedCatalogKey=previous.rafexCatalogKey;return;", "if(session.original[key]===undefined)delete r[key];else r[key]=session.original[key];}\n   m2SavedRackTypes=session.saved;window.rafexSelectedCatalogKey=session.original.rafexCatalogKey;return;");
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-original-letter-tunnel-v307.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
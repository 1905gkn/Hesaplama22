import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* lazy-3d-areas-v587 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v587 missing '+a.slice(0,90));html=html.replace(a,b);};
 replace('window.rafexVisitAreasV522=async visitor=>{','window.rafexVisitAreasV522=async (visitor,selectedIds587)=>{');
 replace('const records=documentState.areas.map(a=>({id:a.id,name:a.name,layout:clone(a.layout)}));',"const records=documentState.areas.filter(a=>!selectedIds587||selectedIds587.includes(String(a.id))).map(a=>({id:a.id,name:a.name,layout:clone(a.layout)}));");
 replace('if(records.length===1){await visitor({id:records[0].id,name:records[0].name});return;}','if(records.length===1&&records[0].id===active){await visitor({id:records[0].id,name:records[0].name});return;}');
 replace('  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};',`  /* lazy-3d-areas-v587 */
  window.rafexAreaIndex587=()=>{ensure();remember();return documentState?{activeAreaId:documentState.activeAreaId,areas:documentState.areas.map(a=>({id:a.id,name:a.name,rackCount:a.layout.racks?.length||0,hasRacks:!!a.layout.racks?.length}))}:null;};
  window.rafexAreaDocument=()=>{ensure();remember();return documentState?clone(documentState):null;};`);
 return html.replace(/\/(layout-3d|customer-view)\.js\?v=\d+/g,'/$1.js?v=587');
}
if(/[\\/]lazy-3d-areas-v587\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

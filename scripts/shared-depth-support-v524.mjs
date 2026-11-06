import fs from 'node:fs';
import vm from 'node:vm';
import {depthSharedSupport} from '../client/depth-shared-support.mjs';
export function transform(html){
 if(html.includes('data-depth-shared="v524"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v524 missing: '+a);html=html.replaceAll(a,b);};
 // Both native outer posts have half their width inside their rack boundary.
 replace('const distance=(first.w+adapted.w)/2,depthOffset=', 'const distance=(first.w+adapted.w)/2-(Number(first.footType)||90)*first.w/Number(first.widthMm||first.totalWidth||first.w),depthOffset=');
 replace('html+=window.rafexRenderPlanV143(savedPlanV143,', 'html+=window.rafexRenderPlanV143({...savedPlanV143,shared:window.rafexDepthSharedV524(rack)},');
 replace('const cx=p.foot/2+col*p.pitch;', "const cx=p.foot/2+col*p.pitch;\n    if(p.shared?.side===(col===0?'left':col===p.bays?'right':null)&&p.shared.intervals.some(s=>s.kind===part.kind&&Math.abs(s.start-part.y)<.1&&s.end>=part.y+part.length-.1))continue;");
 replace('if(p.hasExtra)for(let col=0;col<=p.bays;col++)out+=foot(', "if(p.hasExtra)for(let col=0;col<=p.bays;col++)if(!(p.shared?.extra&&p.shared.side===(col===0?'left':col===p.bays?'right':null)))out+=foot(");
 // Live inventory, Excel, and combined PDF use the same inventory source.
 replace("count*columnCount,(rack.footProfile", "(count*columnCount-window.rafexSharedQuantityV524(rack,'feet',length)),(rack.footProfile");
 replace("count*columnCount*(system==='mekik2'?levels:Math.ceil(levels/2)),textNumber(length)", "(count*columnCount-window.rafexSharedQuantityV524(rack,'braces',length))*(system==='mekik2'?levels:Math.ceil(levels/2)),textNumber(length)");
 replace("add('Ayak Profili',columnCount,'L '", "add('Ayak Profili',columnCount-Number(window.rafexDepthSharedV524(rack).extra),'L '");
 // Per-type report rows may aggregate joined and standalone copies of C.
 replace('count*rows*multiplier));', "(count*rows*multiplier-window.rafexSharedEntryQuantityV524(entry,'feet',length))));");
 replace('count*rows*m2MekikBraceLevelsV512(drawing,levels)*multiplier));', "(count*rows*multiplier-window.rafexSharedEntryQuantityV524(entry,'braces',length))*m2MekikBraceLevelsV512(drawing,levels)));");
 replace('add(labels.items.foot,count*rows,', "add(labels.items.foot,count*rows-window.rafexSharedQuantityV524(rack,'feet',length),");
 replace('count*rows*m2MekikBraceLevelsV512(rack,levels),', "(count*rows-window.rafexSharedQuantityV524(rack,'braces',length))*m2MekikBraceLevelsV512(rack,levels),");
 for(const [field,fn] of [['mekikCustomizationV514','rafexMekikSteppedV514'],['driveCustomizationV521','rafexDriveSteppedV521']]){
  replace(`if(drawing.${field}){window.${fn}(drawing).rows.forEach(row=>add(row.name,row.spec,row.qty*multiplier));return result;}`,`if(drawing.${field}){const placed=(entry.rackIds||[]).map(id=>m2LayoutState.racks.find(r=>r.id===id)).filter(Boolean);if(placed.length)placed.forEach(r=>window.${fn}(r).rows.forEach(row=>add(row.name,row.spec,row.qty)));else window.${fn}(drawing).rows.forEach(row=>add(row.name,row.spec,row.qty*multiplier));return result;}`);
 }
 const code=`window.rafexDepthSharedV524=r=>(${depthSharedSupport.toString()})(r,typeof m2LayoutState==='undefined'?[]:m2LayoutState.racks);
 window.rafexSharedQuantityV524=(r,kind,length)=>{const s=window.rafexDepthSharedV524(r);return s[kind].filter(i=>Math.abs(Number(r.plan[kind][i])-Number(length))<.1).length;};
 window.rafexSharedEntryQuantityV524=(entry,kind,length)=>(entry.rackIds||[]).reduce((sum,id)=>{const r=m2LayoutState.racks.find(r=>r.id===id);return sum+(r?window.rafexSharedQuantityV524(r,kind,length):0);},0);
 `;
 const at=html.lastIndexOf('</body>');html=html.slice(0,at)+'<script data-depth-shared="v524">'+code+'</script>'+html.slice(at);
 html=html.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=524');
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(/[\\/]shared-depth-support-v524\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS shared supports v524: '+file);
}

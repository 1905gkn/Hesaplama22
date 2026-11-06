import fs from 'node:fs';
import vm from 'node:vm';
import {driveStepped} from '../client/drive-stepped.mjs';
export function transform(html){
 if(html.includes('data-drive-stepped="v521"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v521 anchor missing: '+a.slice(0,110));html=html.replaceAll(a,b);};
 replace('function rafexPalletCapacity(drawing){','function rafexPalletCapacity(drawing){if(drawing?.driveCustomizationV521)return window.rafexDriveSteppedV521(drawing).capacity;');
 replace('const rack = { id, typeName, mekikCustomizationV514:', 'const rack = { id, typeName, driveCustomizationV521:source.driveCustomizationV521?structuredClone(source.driveCustomizationV521):undefined, mekikCustomizationV514:');
 replace('if(rack.mekikCustomizationV514){','if(rack.driveCustomizationV521){window.rafexDriveSteppedV521(rack).rows.forEach(row=>add(row.name,row.qty,row.spec,row.unit));return;}if(rack.mekikCustomizationV514){');
 replace('if(drawing.mekikCustomizationV514){','if(drawing.driveCustomizationV521){window.rafexDriveSteppedV521(drawing).rows.forEach(row=>add(row.name,row.spec,row.qty*multiplier));return result;}if(drawing.mekikCustomizationV514){');
 replace("if(system==='mekik2'&&rack.mekikCustomizationV514){","if(system==='drive'&&rack.driveCustomizationV521){window.rafexDriveSteppedV521(rack).rows.forEach(row=>add(row.name,row.qty,row.spec,row.unit));return;}if(system==='mekik2'&&rack.mekikCustomizationV514){");
 replace('JSON.stringify(rack?.mekikCustomizationV514||null)','JSON.stringify([rack?.mekikCustomizationV514||null,rack?.driveCustomizationV521||null])');
 replace('JSON.stringify(rack.mekikCustomizationV514||null)','JSON.stringify([rack.mekikCustomizationV514||null,rack.driveCustomizationV521||null])');
 replace('palletHeight:d.palletHeight,mekikCustomizationV514:','palletHeight:d.palletHeight,driveCustomizationV521:d.driveCustomizationV521,mekikCustomizationV514:');
 for(const name of ['drawing','m2LastDrawing','d']){
  const optional=name==='d'?'': '?';
  const old=name+optional+'.mekikCustomizationV514?window.rafexMekikSteppedV514('+name+'):null';
  if(html.includes(old))replace(old,name+optional+'.driveCustomizationV521?window.rafexDriveSteppedV521('+name+'):'+old);
 }
 replace("    return c;\n  }\n  function standalone(svg,host,language){","    if(system==='drive')c.driveStepped=window.rafexDriveSteppedV521(d);return c;\n  }\n  function standalone(svg,host,language){");
 replace('const rackH=c.firstLevelHeight+Math.max(0,c.levels-1)*c.levelSpacing+c.palletHeight+220;', 'const rackH=window.rafexDriveInUprightHeight(c);');
 const oldStyle=html.match(/<style data-mekik-stepped="v514">([\s\S]*?)<\/style>/);if(!oldStyle)throw Error('Drive customization style missing');
 const style='<style data-drive-stepped="v521">'+oldStyle[1].replaceAll('mekik-step514','drive-step521').replaceAll('mekik','drive').replaceAll('514','521')+'</style>';
 const code='window.rafexDriveSteppedV521=(function(){const mekikStepped=window.rafexMekikSteppedV514;return '+driveStepped.toString()+';})();\n'+fs.readFileSync(new URL('../client/drive-customize-v521.js',import.meta.url),'utf8')+'\n(function(){const original=window.rafexDriveInUprightHeight;window.rafexDriveInUprightHeight=c=>c.driveCustomizationV521?window.rafexDriveSteppedV521(c).height:c.driveStepped?.height||original(c);})();';
 html=html.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=521').replaceAll('finishes=v500','finishes=v521');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+style+'<script>'+code+'</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(/[\\/]drive-stepped-v521\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS drive customization v521: '+file);}

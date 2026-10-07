import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* section-capacity-v281 */'))return html;
 const rep=(from,to)=>{if(!html.includes(from))throw Error('Missing section capacity anchor: '+from.slice(0,90));html=html.replaceAll(from,to);};
 rep("entries:new Map(),cards:[]}); groups.get(key).quantity++;","entries:new Map(),cards:[],palletTotal:0}); groups.get(key).quantity++; groups.get(key).palletTotal+=rafexPalletCapacity(drawing);");
 rep("(entry.count*(Number(entry.drawing.levels)||1)*type.rows*type.quantity)+' PALET'","type.palletTotal+' PALET'");
 rep("g.rackCount+=count;","g.rackCount+=count;g.palletTotal=(g.palletTotal||0)+rafexPalletCapacity(entry.drawing||entry)*count;");
 rep("    if(group.system==='konsol')return 0;\n    if(group.system==='b2b')return (Number(d&&d.b2bLayout&&d.b2bLayout.palletCount)||0)*Math.max(0,Number(d&&d.levels)||0)*Math.max(1,Number(d&&d.b2bLayout&&d.b2bLayout.rowCount)||1)*count;\n    return Math.max(0,Number(d&&d.bays)||0)*Math.max(0,Number(d&&d.levels)||0)*Math.max(0,Number(d&&d.depth)||0)*count;", "    if(group.system==='konsol')return 0;\n    return group.palletTotal!=null?group.palletTotal:rafexPalletCapacity(d)*count;");
 return html.replace('<head>','<head><!-- /* section-capacity-v281 */ -->');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-capacity-v281.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

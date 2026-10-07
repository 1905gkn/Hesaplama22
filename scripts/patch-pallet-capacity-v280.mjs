import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* pallet-capacity-v280 */'))return html;
 const exact=[
 ['(item.b2bLayout ? (Number(item.b2bLayout.palletCount) || 0) * (Number(item.levels) || 0) * (Number(item.b2bLayout.rowCount) || 1) : (Number(item.bays) || 0) * (Number(item.levels) || 0) * (Number(item.depth) || 0))','rafexPalletCapacity(item)'],
 ['(rack.b2bLayout?(Number(rack.b2bLayout.palletCount)||0)*(Number(rack.levels)||0)*(Number(rack.b2bLayout.rowCount)||1):(Number(rack.bays)||0)*(Number(rack.levels)||0)*(Number(rack.depth)||0))','rafexPalletCapacity(rack)'],
 ['(r.b2bLayout?(Number(r.b2bLayout.palletCount)||0)*(Number(r.levels)||0)*(Number(r.b2bLayout.rowCount)||1):(Number(r.bays)||0)*(Number(r.levels)||0)*(Number(r.depth)||0))','rafexPalletCapacity(r)'],
 ['nextCount*Math.max(0,Number(drawing?.levels)||0)*Math.max(1,Number(drawing?.b2bLayout?.rowCount)||1)*Math.max(1,Number(entry.rackCount)||1)','rafexPalletCapacity(drawing)*Math.max(1,Number(entry.rackCount)||1)'],
 ['Number(entry.palletTotal)||(Number(d.b2bLayout?.palletCount)||0)*Math.max(0,Number(d.levels)||0)*Math.max(1,Number(d.b2bLayout?.rowCount)||1)*Math.max(1,Number(entry.rackCount)||1)','(entry.palletTotal!=null?Number(entry.palletTotal):rafexPalletCapacity(d)*Math.max(1,Number(entry.rackCount)||1))'],
 ['Number(entry.palletTotal)||(d.b2bLayout?(Number(d.b2bLayout.palletCount)||0)*Math.max(0,Number(d.levels)||0)*Math.max(1,Number(d.b2bLayout.rowCount)||1):Math.max(0,Number(d.bays)||0)*Math.max(0,Number(d.levels)||0)*Math.max(0,Number(d.depth)||0))*Math.max(1,Number(entry.rackCount)||1)','(entry.palletTotal!=null?Number(entry.palletTotal):rafexPalletCapacity(d)*Math.max(1,Number(entry.rackCount)||1))'],
 ['(Number(rack.bays) || 0) * (Number(rack.levels) || 0) * (Number(rack.depth) || 0), palletLabel','rafexPalletCapacity(rack), palletLabel']
 ];
 for(const [from,to]of exact){if(!html.includes(from))throw Error('Missing pallet count anchor: '+from.slice(0,60));html=html.replaceAll(from,to);}
 const runtime=fs.readFileSync(new URL('../client/pallet-capacity.js',import.meta.url),'utf8');
 return html.replace('</body>','<script>'+runtime+'</script></body>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-capacity-v280.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing embedded HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

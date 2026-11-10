import fs from 'node:fs';
export function rowLabelHeight564(rack,height){
 const rows=Number(rack?.b2bLayout?.rowCount)||1;if(!rack?.b2b||rack.b2b.mr||rows<=1)return height;
 const depth=Number(rack.depthMm)||0,pallet=Number(rack.b2bLayout.palletDepth)||Number(rack.palD)||0;
 if(depth>0&&pallet>0)return height*Math.min(1,pallet/depth);
 return height/rows;
}
export function transform(html){
 if(html.includes('/* row-label-size-v564 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('564 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('function m2RenderLayout() {','function m2RackLabelHeight564(rack,height){return ('+rowLabelHeight564.toString()+')(rack,height);}\n      function m2RenderLayout() { /* row-label-size-v564 */');
 replace('window.rafexRackLabelSizeV554?.(rack.w,rack.h,ratio)','window.rafexRackLabelSizeV554?.(rack.w,m2RackLabelHeight564(rack,rack.h),ratio)');
 return html;
}
if(/[\\/]row-label-size-v564\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}


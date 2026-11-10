import fs from 'node:fs';
export function initialPlacement558(rack){return rack?.freePlacement===true&&rack.locked!==true;}
export function transform(html){
 if(html.includes('/* initial-placement-v558 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('558 anchor missing '+a);html=html.replace(a,b);};
 replace('function m2SmoothFreeRackPosition(rack,targetX,targetY){','function m2SmoothFreeRackPosition(rack,targetX,targetY){\n        /* initial-placement-v558 */ if(rack?.freePlacement===true&&rack.locked!==true)return{x:targetX,y:targetY,exact:true};');
 replace('function m2SmoothFreeGroupTranslation(origins,targetDx,targetDy){','function m2SmoothFreeGroupTranslation(origins,targetDx,targetDy){\n        if(origins.length&&origins.every(origin=>{const member=m2LayoutState.racks.find(r=>r.id===origin.id);return member?.freePlacement===true&&member.locked!==true;}))return{dx:targetDx,dy:targetDy,exact:true};');
 return html;
}
if(/[\\/]initial-placement-v558\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}

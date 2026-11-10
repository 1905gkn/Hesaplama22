import fs from 'node:fs';
export function size562(depth){const h=Math.max(0,Number(depth)||0);return {radius:Math.min(6,h*.12),stroke:Math.min(2,h*.04),line:Math.min(3,h*.04)};}
export function transform(html){
 if(html.includes('/* autofill-size-v562 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('562 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('function m2RenderLayout() {','function m2AutoFillSize562(){const source=m2LayoutState.racks.find(r=>r.id===m2AutoFillDraft?.rackId);return ('+size562.toString()+')(source?.h||0);}\n      function m2RenderLayout() { /* autofill-size-v562 */');
 replace('class="m2-b2b-auto-guide-preview"/><circle cx="${end.x}" cy="${end.y}" r="6" class="m2-b2b-auto-guide-point"/>','class="m2-b2b-auto-guide-preview" style="stroke-width:${m2AutoFillSize562().line}"/><circle cx="${end.x}" cy="${end.y}" r="${m2AutoFillSize562().radius}" class="m2-b2b-auto-guide-point" style="stroke-width:${m2AutoFillSize562().stroke}"/>');
 replace('const [line,point,label]=group.children;for','const [line,point,label]=group.children;const sizes562=m2AutoFillSize562();point.setAttribute("r",sizes562.radius);point.style.strokeWidth=String(sizes562.stroke);line.style.strokeWidth=String(sizes562.line);for');
 return html;
}
if(/[\\/]autofill-size-v562\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}


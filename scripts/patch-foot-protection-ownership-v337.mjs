import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* foot-protection-ownership-v337 */'))return html;
 const from='[rack.x,rack.x+rack.w].forEach((x)=>exposedY.forEach((y)=>points.push(rotate(x,y))));';
 if(html.split(from).length!==2)throw Error('v337 foot point anchor missing');
 html=html.replace(from,'[rack.x,rack.x+rack.w].forEach((x)=>exposedY.forEach((y)=>points.push({...rotate(x,y),row,side:x===rack.x?"left":"right"})));');
 const start=html.indexOf('function m2CommitProtectionArea(){'),end=html.indexOf('function m2SyncAttachedProtections(){',start);if(start<0||end<0)throw Error('v337 protection commit missing');
 return html.slice(0,start)+fs.readFileSync(new URL('./foot-protection-ownership-v337.js',import.meta.url),'utf8')+'\n      '+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-foot-protection-ownership-v337.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v337 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v337: per-upright protection ownership; only explicitly shared feet deduplicated');
}


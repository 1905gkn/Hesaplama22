import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* mr-clear-span-v252 */'))return html;
 const old='planGapPx = Math.max(.2, planClearanceMm * xScale)';
 if(html.split(old).length!==2)throw Error('MR clearance anchor mismatch');
 html=html.replace(old,'planGapPx = rack.b2b?.mr ? 0 : Math.max(.2, planClearanceMm * xScale) /* mr-clear-span-v252 */');
 const edge='gap=Math.min(.8,trayW*.08),x=trayX+gap/2';
 if(html.split(edge).length!==2)throw Error('Tray edge anchor mismatch');
 return html.replace(edge,'gap=0,x=trayX+gap/2');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mr-span-v252.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

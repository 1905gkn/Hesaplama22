import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* uniform-uprights-v246 */'))return html;
 const old='upright.style.setProperty("filter","none","important")';
 const replacement='/* uniform-uprights-v246 */ upright.style.setProperty("fill",is5010?"#00679d":getComputedStyle(upright).fill,"important");upright.style.setProperty("fill-opacity","1","important");upright.style.setProperty("opacity","1","important");upright.style.setProperty("stroke","none","important");upright.style.setProperty("transform","none","important");upright.style.setProperty("filter","none","important")';
 if(!html.includes(old))throw Error('Upright paint hook missing');
 return html.replace(old,replacement);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-uniform-feet-v246.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}

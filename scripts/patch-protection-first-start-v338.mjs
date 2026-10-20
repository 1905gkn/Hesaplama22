import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* protection-first-start-v338 */'))return html;
 const from='m2ProtectionDraft={type:m2ProtectionChoice,start:null,hover:null};m2CloseProtectionDialog();';
 if(html.split(from).length!==2)throw Error('v338 protection start anchor missing');
 return html.replace(from,'/* protection-first-start-v338 */ m2ClearAllSelections("",false);'+from);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-protection-first-start-v338.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v338 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v338: protection scan starts on first press after clearing stale selections');
}


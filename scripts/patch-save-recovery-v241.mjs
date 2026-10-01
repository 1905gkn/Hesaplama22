import fs from 'node:fs';
export function transform(html){
 if(html.includes('separate-local-drafts-v241'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing: '+a.slice(0,100));html=html.replace(a,b);};
 const a=html.indexOf('      async function requestJson(url, opt = {}) {'),b=html.indexOf('      async function boot()',a);if(a<0||b<0)throw Error('requestJson missing');
 html=html.slice(0,a)+fs.readFileSync(new URL('./save-recovery-request-v241.js',import.meta.url),'utf8')+'\n'+html.slice(b);
 replace('      async function m2SaveProject() {','      async function m2SaveProject() {\n        await window.rafexDraftsV241?.backup();');
 replace("    status('Raf tipi listesi kaydediliyor…');","    await window.rafexDraftsV241?.backup();\n    status('Raf tipi listesi kaydediliyor…');");
 const script=fs.readFileSync(new URL('./save-recovery-drafts-v241.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script>'+script+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-save-recovery-v241.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* tunnel-source-letter-v309 */'))return html;
 const anchor='   m2SavedRackTypes=session.saved;window.rafexSelectedCatalogKey=session.original.rafexCatalogKey;return;';
 if(!html.includes(anchor))throw Error('Missing tunnel-only identity restore');
 return html.replace(anchor,`   /* tunnel-source-letter-v309 */
   const sourceName=String(session.original.rafexCustomNameV203||session.original.typeName||session.original.rafexGlobalTypeLetter||'').trim();
   if(sourceName){r.typeName=sourceName;r.rafexGlobalTypeLetter=sourceName;r.rafexSectionLetter=sourceName;}
`+anchor);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-tunnel-source-letter-v309.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}


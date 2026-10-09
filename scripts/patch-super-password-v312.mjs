import fs from 'node:fs';
export function transform(html){
 if(html.includes('super-password-action-v312'))return html;
 const button='<button class="small-btn" onclick="resetPass(${x.id})">Şifre Değiştir</button>';
 const pattern='x.role === "super" ? "" : `<button class="small-btn" onclick="toggleUser';
 let count=0;
 html=html.replaceAll(pattern,()=>{count++;return 'x.role === "super" ? `'+button+'` : `<button class="small-btn" onclick="toggleUser';});
 if(count!==3)throw Error('Expected three user table renderers, found '+count);
 const alert='alert("Şifre güncellendi. Kullanıcının açık oturumları kapatıldı.");';
 if(!html.includes(alert))throw Error('Password success handler missing');
 html=html.replace(alert,alert+'\n            /* super-password-action-v312 */ if(Number(id)===Number(me?.id))location.reload();');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-super-password-v312.mjs')){
 const file=process.argv[2]||'dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}

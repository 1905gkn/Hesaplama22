import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* rack-array-v243 */'))return html;
 const anchor='<button type="button" onclick="m2DuplicateRack()">Çoğalt</button>';
 if(!html.includes(anchor))throw Error('Rack tools anchor missing');
 html=html.replace(anchor,anchor+'<button type="button" id="rafexArrayButtonV243" onclick="rafexStartArrayV243()">Fonksiyon Çoğaltma</button>');
 const selection='window.rafexIndividualSelectionV184={active:()=>picking,replace:';
 if(!html.includes(selection))throw Error('Individual selection API missing');
 html=html.replace(selection,'window.rafexIndividualSelectionV184={stop:()=>{if(picking)stop();},active:()=>picking,replace:');
 const end=html.lastIndexOf('</body>'),js=fs.readFileSync(new URL('./rack-array-v243.js',import.meta.url),'utf8');
 return html.slice(0,end)+'<style data-rack-array="v243">#rafexArrayDialogV243{width:min(380px,calc(100vw - 40px));box-sizing:border-box;border:1px solid #b9cec4;border-radius:12px;padding:20px;color:#173f31}#rafexArrayDialogV243::backdrop{background:#0005}#rafexArrayDialogV243 h3{margin:0 0 10px}#rafexArrayDialogV243 label{display:grid;gap:5px;margin:12px 0;font-weight:700}#rafexArrayDialogV243 input,#rafexArrayDialogV243 select{padding:10px;width:100%;box-sizing:border-box;border:1px solid #b9cec4;border-radius:6px}#rafexArrayDialogV243 p{font-size:12px;line-height:1.5}#rafexArrayDialogV243 [data-error]{color:#ad152e}#rafexArrayDialogV243 footer{display:flex;justify-content:flex-end;gap:8px}#rafexArrayDialogV243 button{padding:9px 14px;border:1px solid #b9cec4;border-radius:6px}#rafexArrayDialogV243 button[type=submit]{background:#194a37;color:white}</style><script>'+js+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-rack-array-v243.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}

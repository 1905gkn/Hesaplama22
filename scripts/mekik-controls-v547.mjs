import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-mekik-controls="v547"'))return html;
 const style='<style data-mekik-controls="v547">#rafexLaneCustomizeV115 [data-step514] .mekik-height-row547>label{display:block;margin:8px 0}#rafexLaneCustomizeV115 .mekik-height-row547>div{display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:8px;align-items:center}#rafexLaneCustomizeV115 #mekikShowPallets514{display:block;width:100%;min-height:38px;margin:12px 0;background:#eaf3ee;color:#214f3b;border:1px solid #b5cec1;border-radius:8px;font-weight:700}#rafexLaneCustomizeV115 #mekikShowPallets514[aria-pressed="false"]{background:#f4f6f5;color:#51665c}</style>';
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');return html.slice(0,at)+style+html.slice(at);
}
if(/[\\/]mekik-controls-v547\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);
}

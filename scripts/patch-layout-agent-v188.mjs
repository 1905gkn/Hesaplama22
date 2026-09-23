import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-layout-agent="v188"'))return html;
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+`<style data-layout-agent="v188">#rafexDocumentAgent{padding:16px;border:1px solid #bdd6c8;border-radius:10px;margin:12px 0;background:#f4faf6}#rafexDocumentAgent canvas{max-width:100%;height:auto;touch-action:none;cursor:crosshair}#rafexDocumentAgent button{margin:4px}#rafexDocumentAgent td{overflow-wrap:anywhere}</style><script>${fs.readFileSync(new URL('../client/document-agent.js',import.meta.url),'utf8')}</script>`+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-agent-v188.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-layout-agent="v188"'))return html;
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+`<style data-layout-agent="v188">#rafexAgentV188{padding:12px;border:1px solid #bdd6c8;border-radius:10px;margin:10px 0;background:#f4faf6}#rafexAgentV188 textarea{display:block;width:100%;box-sizing:border-box;margin:8px 0}#rafexAgentV188 small{display:block;margin:8px 0;line-height:1.5}#rafexAgentV188 button{margin-top:8px}</style><script>${fs.readFileSync(new URL('../client/automatic-agent.js',import.meta.url),'utf8')}</script>`+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-agent-v188.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

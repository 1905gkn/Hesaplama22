import fs from 'node:fs';
export function transform(html){
 if(html.includes('compact-extension-v296'))return html;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 const style=`<style data-compact-extension-v296>
 #m2AutoFillControls .rafex-repeat-head{justify-content:flex-start}
 #m2AutoFillControls .rafex-extension-toggle{flex:0 0 auto!important;min-width:0!important;width:max-content!important;max-width:100%;justify-content:flex-start!important;gap:12px!important;white-space:nowrap}
 </style>`;
 return html.slice(0,end)+style+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-compact-extension-v296.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

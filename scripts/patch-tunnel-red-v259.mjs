import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* tunnel-red-v259 */'))return html;
 const before='class="m2-b2b-joined-mark rafex-tunnel-label-v255" style="font-size:${Math.min(6,rack.w/4)}px!important;fill:#00679d!important"';
 if(html.split(before).length!==2)throw Error('Tunnel label anchor mismatch');
 return html.replace(before,before.replace('#00679d','#d00000')).replace('</head>','<script>/* tunnel-red-v259 */</script></head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-tunnel-red-v259.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

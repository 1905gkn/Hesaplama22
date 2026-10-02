import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-rack-alignment="v249"'))return html;
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 const runtime=fs.readFileSync(new URL('./rack-alignment-v249.js',import.meta.url),'utf8');
 const style='<style data-rack-alignment="v249">[data-rafex-alignment-v249] line{stroke:#0086a8!important;stroke-width:1.5px!important;stroke-dasharray:6 4!important;fill:none!important;vector-effect:non-scaling-stroke;pointer-events:none}@media print{[data-rafex-alignment-v249]{display:none!important}}</style>';
 return html.slice(0,at)+style+'<script data-rack-alignment="v249">'+runtime+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-rack-alignment-v249.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}

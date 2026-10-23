import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./extension-priority-v376.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-extension-priority="v376"'))return html;
 const first=html.indexOf('<script');if(first<0)throw Error('v376 first script');
 return html.slice(0,first)+'<script data-extension-priority="v376">'+runtime+'</script>'+html.slice(first);
}

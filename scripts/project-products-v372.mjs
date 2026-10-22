import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./project-products-v372.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-project-products="v372"'))return html;
 const anchor='documentV133=window.rafexAttachAreas?.(documentV133)||documentV133;';
 if(html.split(anchor).length!==2)throw Error('v372 save anchor');
 html=html.replace(anchor,anchor+'\n          documentV133=window.rafexProjectProductsV372.capture(documentV133);');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v372 body');
 return html.slice(0,end)+'<script data-project-products="v372">'+runtime+'</script>'+html.slice(end);
}

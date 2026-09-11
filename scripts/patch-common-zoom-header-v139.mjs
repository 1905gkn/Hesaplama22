import fs from 'node:fs';

export function transform(html){
 if(html.includes('/* RAFEX_ZOOM_HEADER_V139 */'))return html;
 const start=html.indexOf('<script data-rafex-common-layout-zoom-crisp="v126">'),end=html.indexOf('</script>',start);
 if(start<0||end<0||!html.includes('/* RAFEX_WALL_FIT_V138 */'))throw Error('v139 requires wall-fit runtime');
 let runtime=html.slice(start,end);
 const replace=(a,b)=>{if(!runtime.includes(a)||runtime.indexOf(a)!==runtime.lastIndexOf(a))throw Error('v139 anchor missing/ambiguous: '+a);runtime=runtime.replace(a,b);};
 replace('  function clamp(next){',`  /* RAFEX_ZOOM_HEADER_V139 */
  function maxViewWidth(b){return b.w*(document.querySelector('#nav button.active[data-page]')?.dataset.page==='free'?4:1);}
  function clamp(next){`);
 replace('Math.min(b.w,Number(next.w)||b.w)','Math.min(maxViewWidth(b),Number(next.w)||b.w)');
 replace('return{x:Math.max(b.x,Math.min(b.x+b.w-w,Number(next.x)||0)),y:Math.max(b.y,Math.min(b.y+b.h-h,Number(next.y)||0)),w:w,h:h};',
 'return{x:w>b.w?b.x+(b.w-w)/2:Math.max(b.x,Math.min(b.x+b.w-w,Number(next.x)||0)),y:h>b.h?b.y+(b.h-h)/2:Math.max(b.y,Math.min(b.y+b.h-h,Number(next.y)||0)),w:w,h:h};');
 replace('Math.min(b.w,view.w*factor)','Math.min(maxViewWidth(b),view.w*factor)');
 html=html.slice(0,start)+runtime+html.slice(end);
 return html.replace('</head>','<style data-rafex-zoom-header="v139">#app .top>.top-actions{margin-left:auto!important;justify-self:end;grid-column:-2 / -1}</style>\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-zoom-header-v139.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 if(!m)throw Error('v139 HTML_BASE64 missing');
 const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
 fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
 console.log('v139: existing common zoom supports percentages below 100; header actions stay right aligned');
}

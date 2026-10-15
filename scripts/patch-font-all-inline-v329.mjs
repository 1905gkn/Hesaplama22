import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-font-all-inline="v329"'))return html;
 for(const id of ['m2DimensionFontSize','m2AnnotationFontSize']){
  const re=new RegExp('(<label class="m2-text-size-tool">[^<]*<input id="'+id+'"[^>]*><\\/label>)(<label class="m2-font-all">[\\s\\S]*?<\\/label>)');
  if(!re.test(html))throw Error('v329 font row missing '+id);html=html.replace(re,'<div class="m2-font-size-row-v329">$1$2</div>');
 }
 const style=`<style data-font-all-inline="v329">
 #page .measure-tools>.m2-font-size-row-v329{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:7px!important;width:100%!important;min-width:0!important;grid-column:1/-1!important;box-sizing:border-box}
 #page .measure-tools>.m2-font-size-row-v329:has(#m2DimensionFontSize){order:5!important}
 #page .measure-tools>.m2-font-size-row-v329:has(#m2AnnotationFontSize){order:6!important}
 #page .m2-font-size-row-v329>.m2-text-size-tool{display:flex!important;flex:1 1 auto!important;min-width:0!important;width:auto!important;align-items:center!important;justify-content:space-between!important;gap:5px!important;margin:0!important;white-space:nowrap}
 #page .m2-font-size-row-v329>.m2-text-size-tool>input{width:48px!important;min-width:0!important;box-sizing:border-box!important}
 #page .m2-font-size-row-v329>.m2-font-all{display:inline-flex!important;flex:0 0 auto!important;width:auto!important;min-height:0!important;margin:0!important;gap:4px!important;align-items:center!important;white-space:nowrap!important}
 </style>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v329 body missing');return html.slice(0,end)+style+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-font-all-inline-v329.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v329 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v329: each Hepsi checkbox stays beside its own font size input');
}


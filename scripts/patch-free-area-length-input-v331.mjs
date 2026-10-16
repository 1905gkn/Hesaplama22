import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-free-area-length-input="v331"'))return html;
 const addition=`<style data-free-area-length-input="v331">
 #page#page.rafex-area-drawing-v331 .area-tools>.m2-ortho-tools{display:flex!important;visibility:visible!important;pointer-events:auto!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important}
 #page#page.rafex-area-drawing-v331 .m2-ortho-tools .input-field{width:auto!important;flex:1 1 170px!important;min-width:0!important}
 #page#page.rafex-area-drawing-v331 #m2SegmentLength{width:100%!important;box-sizing:border-box!important}
 </style><script data-free-area-length-input="v331">(()=>{
 function sync(){document.getElementById('page')?.classList.toggle('rafex-area-drawing-v331',m2LayoutState.mode==='draw');}
 const render=m2RenderLayout;
 m2RenderLayout=window.m2RenderLayout=function(){sync();const result=render.apply(this,arguments);sync();return result;};
 sync();
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v331 body missing');return html.slice(0,end)+addition+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-free-area-length-input-v331.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v331 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v331: free-area numeric length entry is visible and focusable while drawing');
}


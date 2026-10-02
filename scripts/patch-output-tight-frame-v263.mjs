import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* output-tight-frame-v263 */'))return html;
 const start=html.indexOf('      function rafexPdfLayoutCloneV140(source,margin=0){'),end=html.indexOf('      function m2RenderA4Report()',start);if(start<0||end<0)throw Error('Missing output clone');
 let code=html.slice(start,end);
 code=code.replace('source?.id==="m2LayoutSvg"&&!document.querySelector(\'#nav button.active[data-page="free"]\')&&','source?.id==="m2LayoutSvg"&&');
 const a=code.indexOf("        if(document.querySelector('#nav button.active[data-page]')?.dataset.page==='free')return (function preservePlanFrame"),b=code.indexOf('        // Measure the drawing in world coordinates',a);
 if(a<0||b<0)throw Error('Missing frame anchor');
 code=code.slice(0,a)+`        /* output-tight-frame-v263 */
        margin=.015;
`+code.slice(b);
 code=code.replace("!node.classList.contains('m2-metre-ruler')&&getComputedStyle(node).display!=='none'","!node.matches('.m2-metre-ruler,[data-wall-alignment-v256],[data-draw-hover-v260]')&&getComputedStyle(node).display!=='none'");
 code=code.replace('        const left=Math.min(...boxes.map(b=>b.left))-4,top=',`        const rulerBox=source.querySelector('.m2-metre-ruler')?.getBBox();
        const rulerSpace=rulerBox?Math.max(0,rulerBox.height)+14:0;
        const left=Math.min(...boxes.map(b=>b.left))-4,top=`);
 code=code.replace('height=(bottom-top)/(1-2*margin);','height=(bottom-top+rulerSpace)/(1-2*margin);');
 html=html.slice(0,start)+code+html.slice(end);return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-output-tight-frame-v263.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

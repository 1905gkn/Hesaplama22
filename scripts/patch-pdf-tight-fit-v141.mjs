import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* RAFEX_PDF_TIGHT_FIT_V141 */'))return html;
 const start=html.indexOf('      function rafexPdfLayoutCloneV140('),end=html.indexOf('      function m2RenderA4Report() {',start);
 if(start<0||end<0)throw Error('v141 PDF export helper missing');
 const helper=`      function rafexPdfLayoutCloneV140(source,margin=0){
        /* RAFEX_PDF_TIGHT_FIT_V141 */
        const copy=source.cloneNode(true);
        if(document.querySelector('#nav button.active[data-page]')?.dataset.page!=='free')return copy;
        // Measure the drawing in world coordinates, excluding the fixed editor ruler.
        const inverse=source.getCTM()?.inverse(),round=n=>Math.round(n*1e6)/1e6;
        if(!inverse)return copy;
        const nodes=[...source.children].flatMap(node=>node.id==='m2LayoutContent'?[...node.children]:node.tagName.toLowerCase()==='g'?[node]:[]);
        const boxes=nodes.filter(node=>!node.classList.contains('m2-metre-ruler')&&getComputedStyle(node).display!=='none').map(node=>{
          try{
            const b=node.getBBox(),matrix=inverse.multiply(node.getCTM());
            if(!(b.width||b.height))return null;
            const points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(p=>new DOMPoint(...p).matrixTransform(matrix));
            return {left:round(Math.min(...points.map(p=>p.x))),top:round(Math.min(...points.map(p=>p.y))),right:round(Math.max(...points.map(p=>p.x))),bottom:round(Math.max(...points.map(p=>p.y)))};
          }catch(_){return null}
        }).filter(b=>b&&Number.isFinite(b.left+b.top+b.right+b.bottom));
        if(!boxes.length)return copy;
        const left=Math.min(...boxes.map(b=>b.left))-4,top=Math.min(...boxes.map(b=>b.top))-4,
          right=Math.max(...boxes.map(b=>b.right))+4,bottom=Math.max(...boxes.map(b=>b.bottom))+4,
          width=(right-left)/(1-2*margin),height=(bottom-top)/(1-2*margin);
        copy.setAttribute('viewBox',[left-width*margin,top-height*margin,width,height].join(' '));
        copy.setAttribute('preserveAspectRatio','xMidYMid meet');
        copy.setAttribute('data-rafex-pdf-margin','v141');
        copy.setAttribute('data-rafex-pdf-bounds',[left,top,right,bottom].join(' '));
        copy.style.removeProperty('aspect-ratio');
        for(const prop of ['width','height','max-width','max-height'])copy.style.setProperty(prop,'100%','important');
        copy.style.setProperty('margin','0','important');
        copy.style.setProperty('overflow','visible','important');
        [...copy.children].filter(node=>node.tagName.toLowerCase()==='rect'&&node.getAttribute('fill')==='url(#m2FloorGrid)').forEach(node=>node.remove());
        // Translate, never scale the metric ruler; its physical scale remains correct.
        const originalRuler=source.querySelector('.m2-metre-ruler'),ruler=copy.querySelector('.m2-metre-ruler');
        if(originalRuler&&ruler){
          const b=originalRuler.getBBox(),holder=document.createElementNS('http://www.w3.org/2000/svg','g');
          holder.setAttribute('data-rafex-pdf-ruler','v141');holder.setAttribute('transform','translate('+(left-b.x)+' '+(bottom+10-b.y)+')');
          holder.appendChild(ruler);copy.appendChild(holder);
        }
        return copy;
      }
`;
 html=html.slice(0,start)+helper+html.slice(end);
 // One page-level safe frame, not page padding plus a second SVG padding.
 html=html.replace('</head>','<style data-rafex-pdf-tight-fit="v141">.m2-corporate-floor:has(svg[data-rafex-pdf-margin="v141"]){inset:12.5% 10% 10%!important;display:block!important}.m2-corporate-floor>svg[data-rafex-pdf-margin="v141"]{position:absolute!important;inset:0!important;min-width:0!important;min-height:0!important}</style>\n</head>');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pdf-tight-fit-v141.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 if(!m)throw Error('v141 HTML_BASE64 missing');
 const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
 fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
 console.log('v141: center and maximize PDF drawing in the page safe frame; ruler excluded from fitting');
}

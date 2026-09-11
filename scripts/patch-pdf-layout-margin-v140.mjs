import fs from 'node:fs';
export function transform(html){
 if(html.includes('function rafexPdfLayoutCloneV140('))return html;
 const replace=(a,b)=>{if(!html.includes(a)||html.indexOf(a)!==html.lastIndexOf(a))throw Error('v140 anchor missing/ambiguous: '+a.slice(0,100));html=html.replace(a,b);};
 replace('      function m2RenderA4Report() {',`      function rafexPdfLayoutCloneV140(source,margin=.1){
        const copy=source.cloneNode(true);
        if(document.querySelector('#nav button.active[data-page]')?.dataset.page!=='free')return copy;
        // Read world geometry, not the current on-screen camera or its aspect ratio.
        const boxes=[...source.children].filter(node=>node.tagName.toLowerCase()==='g').map(node=>{
          try{return node.getBBox({fill:true,stroke:true,markers:true})}catch(_){try{return node.getBBox()}catch(_){return null}}
        }).filter(b=>b&&Number.isFinite(b.x+b.y+b.width+b.height)&&b.width>0&&b.height>0);
        if(!boxes.length)return copy;
        const left=Math.min(...boxes.map(b=>b.x))-4,top=Math.min(...boxes.map(b=>b.y))-4,
          right=Math.max(...boxes.map(b=>b.x+b.width))+4,bottom=Math.max(...boxes.map(b=>b.y+b.height))+4,
          width=(right-left)/(1-2*margin),height=(bottom-top)/(1-2*margin);
        copy.setAttribute('viewBox',[left-width*margin,top-height*margin,width,height].join(' '));
        copy.setAttribute('preserveAspectRatio','xMidYMid meet');
        copy.setAttribute('data-rafex-pdf-margin','v140');
        copy.setAttribute('data-rafex-pdf-bounds',[left,top,right,bottom].join(' '));
        copy.style.removeProperty('aspect-ratio');
        for(const prop of ['width','height','max-width','max-height'])copy.style.setProperty(prop,'100%','important');
        copy.style.setProperty('margin','0','important');
        // The editor grid is not printable geometry and must not consume the margins.
        [...copy.children].filter(node=>node.tagName.toLowerCase()==='rect'&&node.getAttribute('fill')==='url(#m2FloorGrid)').forEach(node=>node.remove());
        return copy;
      }
      function m2RenderA4Report() {`);
 // Summary plan spans two thirds of the page: 16% of that frame exceeds 10% of the page.
 replace('const copy = sourceSvg.cloneNode(true); copy.removeAttribute("id");','const copy = rafexPdfLayoutCloneV140(sourceSvg,.16); copy.removeAttribute("id");');
 replace('floorSource?floorSource.outerHTML.replace', 'floorSource?rafexPdfLayoutCloneV140(floorSource).outerHTML.replace');
 // Corporate floor gets a full-width frame, leaving enough bottom page margin too.
 html=html.replace('</head>','<style data-rafex-pdf-layout-margin="v140">.m2-corporate-floor:has(svg[data-rafex-pdf-margin="v140"]){inset:12.5% 0 2.8%!important}</style>\n</head>');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pdf-layout-margin-v140.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 if(!m)throw Error('v140 HTML_BASE64 missing');
 const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
 fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
 console.log('v140: common PDF geometry fitted independently of editor zoom with 10% minimum margins');
}

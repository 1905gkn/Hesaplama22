import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-project-font-scope="v327"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v327 anchor missing: '+from.slice(0,100));html=html.replaceAll(from,to);};
 replace('onchange="m2ChangeDimensionFontSize(this.value)"></label>','onchange="m2ChangeDimensionFontSize(this.value)"></label><label class="m2-font-all"><input type="checkbox" id="rafexAllDimensionsV327" aria-label="Bütün ölçülere uygula" onchange="document.getElementById(\'m2DimensionFontSize\').disabled=!this.checked&&!m2SelectedDimensionKey">Hepsi</label>');
 replace('onchange="m2ChangeAnnotationSize(this.value)"></label>','onchange="m2ChangeAnnotationSize(this.value)"></label><label class="m2-font-all"><input type="checkbox" id="rafexAllNotesV327" aria-label="Bütün yazılara uygula">Hepsi</label>');
 replace('disabled = m2LayoutTool !== "dimension" || !m2SelectedDimensionKey','disabled = !document.getElementById("rafexAllDimensionsV327")?.checked && (m2LayoutTool !== "dimension" || !m2SelectedDimensionKey)');
 replace('m2DimensionFontSizes[key]','(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all)');
 replace("size=Number(fonts[key]??(pair?fonts['pair-gap:'+pair[2]+':'+pair[1]]:0))||0;","size=Number(fonts[key]??(pair?fonts['pair-gap:'+pair[2]+':'+pair[1]]:undefined)??fonts.__all)||0;");
 replace("const text=node.textContent.replace(/^\\s*RAF ARASI\\s*/i,'');",`const guide=node.closest('[data-rack-gap]'),line=guide?.querySelector('line');
      if(line){const x=(Number(line.getAttribute('x1'))+Number(line.getAttribute('x2')))/2,y=(Number(line.getAttribute('y1'))+Number(line.getAttribute('y2')))/2;node.setAttribute('x',x);node.setAttribute('y',y);set(node,'text-anchor','middle');set(node,'dominant-baseline','central');node.removeAttribute('dy');const hit=guide.querySelector('.m2-measure-hit');if(hit){hit.setAttribute('x',x-Number(hit.getAttribute('width'))/2);hit.setAttribute('y',y-Number(hit.getAttribute('height'))/2);}}
      const text=node.textContent.replace(/^\\s*RAF ARASI\\s*/i,'');`);
 const runtime=`<style>.m2-font-all{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-size:11px;font-weight:800}.m2-font-all input{width:15px!important;height:15px!important;min-height:0!important;margin:0!important}</style><script data-project-font-scope="v327">(()=>{
 function applyAll(kind,size){
  const areas=window.rafexAreaDocument?.(),owner=window.rafexProjectIdentityV133?.uuid;
  const apply=layout=>{if(kind==='dimensions'){const fonts=layout.dimensionFontSizes||{};for(const key of Object.keys(fonts))fonts[key]=size;fonts.__all=size;layout.dimensionFontSizes=fonts;}else for(const note of layout.userNotes||[])note.size=size;};
  if(areas&&owner&&window.rafexReplaceAreaDocumentV319){for(const area of areas.areas)apply(area.layout);window.rafexReplaceAreaDocumentV319(areas,owner);}
  else if(kind==='dimensions'){for(const key of Object.keys(m2DimensionFontSizes))m2DimensionFontSizes[key]=size;m2DimensionFontSizes.__all=size;m2RenderLayout();}
  else{for(const note of m2UserNotes)note.size=size;m2RenderLayout();}
  const input=document.getElementById(kind==='dimensions'?'m2DimensionFontSize':'m2AnnotationFontSize');if(input){input.value=size;if(kind==='dimensions')input.disabled=false;}
  window.rafexCleanPdfPlan?.paint?.();window.__rafexFreeOutputDirty=true;
 }
 const dimension=m2ChangeDimensionFontSize,note=m2ChangeAnnotationSize;
 m2ChangeDimensionFontSize=window.m2ChangeDimensionFontSize=function(value){if(!document.getElementById('rafexAllDimensionsV327')?.checked)return dimension.apply(this,arguments);applyAll('dimensions',Math.max(6,Math.min(36,Number(value)||16)));};
 m2ChangeAnnotationSize=window.m2ChangeAnnotationSize=function(value){if(!document.getElementById('rafexAllNotesV327')?.checked)return note.apply(this,arguments);applyAll('notes',Math.max(6,Math.min(72,Number(value)||14)));};
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v327 body missing');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-font-scope-v327.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('v327 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 console.log('v327: all-project or selected font sizing and centered distance labels');
}


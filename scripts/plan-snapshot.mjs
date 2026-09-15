// Freeze the live SVG before it leaves the editor's CSS/viewport. PDF sizing
// must scale the whole drawing, including strokes that were fixed on screen.
export function freezePlanPaint(source, copy) {
  const originals=[source,...source.querySelectorAll('*')];
  const targets=[copy,...copy.querySelectorAll('*')];
  const properties=['display','visibility','fill','fill-opacity','fill-rule',
    'stroke','stroke-opacity','stroke-width','stroke-linecap','stroke-linejoin',
    'stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','filter',
    'transform','transform-origin','transform-box','vector-effect','paint-order',
    'shape-rendering','font-family','font-size','font-weight','font-style',
    'text-anchor','dominant-baseline','letter-spacing','rx','ry'];
  originals.forEach((original,index)=>{
    const target=targets[index];
    if(!target||!original.style||!target.style)return;
    const paint=getComputedStyle(original);
    // The root keeps the report's responsive sizing and viewBox. Descendant
    // transforms are copied so CSS-only geometry survives serialization.
    for(const name of properties){
      if(index===0&&name.startsWith('transform'))continue;
      const value=paint.getPropertyValue(name);
      if(value)target.style.setProperty(name,value,'important');
    }
    if(paint.getPropertyValue('vector-effect')==='non-scaling-stroke'){
      const matrix=original.getScreenCTM?.();
      const scale=matrix&&Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c));
      if(!(scale>0))throw new Error('Çizim görünür değil; serbest yerleşimi açıp çıktıyı tekrar oluşturun.');
      target.style.setProperty('stroke-width',String(parseFloat(paint.strokeWidth)/scale),'important');
      for(const name of ['stroke-dasharray','stroke-dashoffset']){
        const value=paint.getPropertyValue(name);
        if(value&&value!=='none')target.style.setProperty(name,value.replace(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?(?:px)?/gi,n=>String(parseFloat(n)/scale)),'important');
      }
      target.style.setProperty('vector-effect','none','important');
    }
  });
  copy.setAttribute('data-rafex-live-snapshot','v1');
  return copy;
}

// Use the editor's complete coordinate frame, not a bounding box around the
// objects. Fitting objects independently removes the empty space at corners.
export function preservePlanFrame(source, copy) {
  copy.setAttribute('viewBox',source.getAttribute('viewBox'));
  copy.setAttribute('preserveAspectRatio','xMidYMid meet');
  copy.setAttribute('data-rafex-pdf-margin','v141');
  copy.setAttribute('data-rafex-editor-frame','v1');
  copy.style.removeProperty('aspect-ratio');
  for(const prop of ['width','height','max-width','max-height'])copy.style.setProperty(prop,'100%','important');
  copy.style.setProperty('margin','0','important');
  copy.style.setProperty('overflow','hidden','important');
  [...copy.children].filter(node=>node.tagName.toLowerCase()==='rect'&&node.getAttribute('fill')==='url(#m2FloorGrid)').forEach(node=>node.remove());
  return copy;
}

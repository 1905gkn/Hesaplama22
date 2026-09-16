export function namespaceSvgCopy(svg,prefix) {
  const ids=new Map();
  for(const node of svg.querySelectorAll('[id]')){const old=node.getAttribute('id');ids.set(old,prefix+'-'+old);node.setAttribute('id',prefix+'-'+old);}
  for(const node of [svg,...svg.querySelectorAll('*')])for(const attribute of Array.from(node.attributes)){
    let value=attribute.value;
    value=value.replace(/url\(#([^)]*)\)/g,(whole,id)=>ids.has(id)?'url(#'+ids.get(id)+')':whole);
    if((attribute.name==='href'||attribute.name==='xlink:href')&&value.startsWith('#')&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));
    if(value!==attribute.value)node.setAttribute(attribute.name,value);
  }
  return svg;
}

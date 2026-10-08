import fs from 'node:fs';
export function transform(html) {
  if (html.includes('/* area-save-validation-v302 */')) return html;
  const before = "const validate=m2ProjectPlacementError;m2ProjectPlacementError=function(){if(!common()||!documentState)return validate.apply(this,arguments);remember();const saved=capture();try{for(const area of documentState.areas){m2LayoutState=clone(area.layout);const error=validate();if(error)return area.name+': '+error;}return '';}finally{m2LayoutState=saved;}};";
  const after = `/* area-save-validation-v302 */
  const validate=m2ProjectPlacementError;m2ProjectPlacementError=function(){
    if(!common()||!documentState)return validate.apply(this,arguments);
    remember();
    const savedLayout=m2LayoutState,savedSymbols=m2LayoutSymbols;
    try{
      for(const area of documentState.areas){
        m2LayoutState=clone(area.layout);
        m2LayoutState.drag=null;
        m2LayoutSymbols=m2LayoutState.symbols||[];
        const error=validate();
        if(error)return area.name+': '+error;
      }
      return '';
    }finally{
      m2LayoutState=savedLayout;
      m2LayoutSymbols=savedSymbols;
    }
  };`;
  if (!html.includes(before)) throw Error('Missing multi-area validation anchor');
  return html.replace(before, after);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-area-save-validation-v302.mjs')){
  const file=process.argv[2]||'dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!match)throw Error('Missing HTML');
  fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}
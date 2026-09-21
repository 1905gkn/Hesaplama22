import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* project-isolation-v170 */'))return html;
 const start=html.indexOf('  async function loadCatalog(force){'),end=html.indexOf('  const saveRequestBase=req;',start);
 if(start<0||end<0)throw Error('v170 catalog loader missing');
 html=html.slice(0,start)+`  /* project-isolation-v170 */
  async function loadCatalog(force){
    if(!isFree()||deletingSavedTypes)return catalog;
    installCatalog();return m2SavedRackTypes;
  }
`+html.slice(end);
 const source='window.rafexCatalogView(window.rafexProjectTypesV133||catalog)';
 if(!html.includes(source))throw Error('v170 catalog source missing');
 html=html.replace(source,'window.rafexCatalogView(Array.isArray(window.rafexProjectTypesV133)?window.rafexProjectTypesV133:[])');
 const a=html.indexOf('      if(window.rafexProjectTypesV133){m2SavedRackTypes='),b=html.indexOf('    };\n    window.m2RenderSavedRackTypes=m2RenderSavedRackTypes;',a);
 if(a<0||b<0)throw Error('v170 common catalog render missing');
 html=html.slice(0,a)+`      m2SavedRackTypes=window.rafexCatalogView(Array.isArray(window.rafexProjectTypesV133)?window.rafexProjectTypesV133:[]);
      if(!m2SavedRackTypes.length)m2SelectedSavedType=null;
      return renderCommonCatalogBase.apply(this,arguments);
`+html.slice(b);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-isolation-v170.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-project-catalog="v155"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v155 anchor missing: '+a.slice(0,90));html=html.replace(a,b);};
 replace('    const owner=window.rafexProjectIdentityV133?.uuid;\n    if(!force',
  '    if(Array.isArray(window.rafexProjectTypesV133)){installCatalog();return m2SavedRackTypes;}\n    const owner=window.rafexProjectIdentityV133?.uuid;\n    if(!force');
 replace('const fresh=window.rafexIndependentProjectV133({payload:{rackTypes:m2SavedRackTypes,layout:{racks:[]}}}',
  'window.rafexSelectedCatalogKey=null;\n    const fresh=window.rafexIndependentProjectV133({payload:{rackTypes:[],layout:{racks:[]}}}');
 replace("window.rafexProjectIdentityV133.displayNumber='P-'+fresh.payload.projectIdentity.uuid.replaceAll('-','').slice(0,12).toUpperCase();", "window.rafexProjectIdentityV133.displayNumber='Yeni';");
 replace("if(active&&!active.displayNumber)active.displayNumber='P-'+active.uuid.replaceAll('-','').slice(0,12).toUpperCase();", "if(active&&!/^\\d+$/.test(String(active.displayNumber||'')))active.displayNumber='Yeni';");
 replace('    const isolated=project?.payload?.projectIdentity?.independent;',
  "    if(project?.payload?.projectIdentity){project.payload.projectIdentity.displayNumber=!asCopy&&Number(project.serial_no)>0?String(project.serial_no):'Yeni';}\n    const isolated=project?.payload?.projectIdentity?.independent;");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script data-project-catalog="v155">'+fs.readFileSync(new URL('./project-catalog-v155.js',import.meta.url),'utf8')+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-catalog-v155.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

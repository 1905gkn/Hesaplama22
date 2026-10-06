import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* history-layout-v272 */'))return html;
 const old="if(next==='layout'&&screen!=='layout'){";
 if(!html.includes(old))throw Error('Workflow screen hook missing');
 html=html.replace(old,`/* history-layout-v272 */
    const loaded=window.rafexLoadedProjectV272,identity=window.rafexProjectIdentityV133;
    const restored=Boolean(loaded&&identity?.uuid&&loaded.uuid===identity.uuid);
    if(next==='layout'&&screen!=='layout'&&!restored){`);
 const save='try{saved=await window.rafexSaveDrawingCatalogV158();}';
 if(!html.includes(save))throw Error('Catalog navigation hook missing');
 html=html.replace(save,`try{saved=await window.rafexSaveDrawingCatalogV158();}
      catch(error){const status=document.getElementById('m2FloorStatus');if(status)status.textContent='Raf kataloğu kaydedilemedi: '+error.message;console.error('Raf kataloğu kaydedilemedi',error);}`);
 const end=html.lastIndexOf('</body>');
 return html.slice(0,end)+`<script data-history-layout="v272">(function(){
 const apply=m2ApplyProjectRecord;
 m2ApplyProjectRecord=function(project,asCopy){const result=apply.apply(this,arguments);const uuid=window.rafexProjectIdentityV133?.uuid;if(result!==false&&project?.payload?.layout&&uuid)window.rafexLoadedProjectV272={uuid};return result;};window.m2ApplyProjectRecord=m2ApplyProjectRecord;
})();</script>\n`+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-history-layout-v272.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

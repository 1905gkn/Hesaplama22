import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* new-project-lock-v253 */'))return html;
 function replace(a,b){if(html.split(a).length!==2)throw Error('Anchor mismatch: '+a.slice(0,70));html=html.replace(a,b);}
 replace("    nameInput.setCustomValidity('');\n    if(window.rafexProjectSavingV133",`    nameInput.setCustomValidity('');
    /* new-project-lock-v253 */
    const existingCreation=window.rafexProjectIdentityV133;
    if(existingCreation?.creationNameV253===projectName){
      if(existingCreation.drawingCatalogId)return;
      return window.rafexSaveNewProjectV157();
    }
    if(window.rafexProjectSavingV133`);
 replace("    window.rafexProjectIdentityV133.displayNumber='Yeni';","    window.rafexProjectIdentityV133.displayNumber='Yeni';\n    window.rafexProjectIdentityV133.creationNameV253=projectName;");
 replace('if(button)button.disabled=false;pending=null;owner=null;','if(button)button.disabled=Boolean(identity.drawingCatalogId&&identity.creationNameV253===String(document.getElementById(\'rafexAuthorityProjectName\')?.value||\'\').trim());pending=null;owner=null;');
 const at=html.lastIndexOf('</body>');
 html=html.slice(0,at)+`<script data-new-project-lock="v253">
(()=>{const sync=()=>{const b=document.getElementById('rafexNewProjectV133'),i=window.rafexProjectIdentityV133,n=String(document.getElementById('rafexAuthorityProjectName')?.value||'').trim();if(b)b.disabled=Boolean(window.rafexProjectSavingV133||(i?.drawingCatalogId&&i.creationNameV253===n));};document.addEventListener('input',e=>{if(e.target?.id==='rafexAuthorityProjectName')sync();});document.addEventListener('click',()=>requestAnimationFrame(sync));sync();})();
</script>`+html.slice(at);return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-new-project-lock-v253.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

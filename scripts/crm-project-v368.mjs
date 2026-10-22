import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./crm-project-v368.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-crm-project="v368"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v368 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 replace('payload: { version: 1, ...(commonLayoutSaveV106?','payload: { version: 1, crm:window.rafexProjectCrmV368?.snapshot()||null, ...(commonLayoutSaveV106?');
 replace("payload:{version:1,module:'ortak',rafexCommonDrawing:true,drawing:clone(drawing||null)","payload:{version:1,crm:window.rafexProjectCrmV368?.snapshot()||null,module:'ortak',rafexCommonDrawing:true,drawing:clone(drawing||null)");
 replace('const payload = project?.payload; if (!payload) return false;','const payload = project?.payload; if (!payload) return false;window.rafexProjectCrmV368?.restore(payload.crm||null);');
 replace('window.rafexProjectIdentityV133=fresh.payload.projectIdentity;','window.rafexProjectIdentityV133=fresh.payload.projectIdentity;window.rafexProjectCrmV368?.prepareNew();');
 replace('const result = await req("/api/projects", { method: "POST", body: JSON.stringify(documentV133) });','const result = await req("/api/projects", { method: "POST", body: JSON.stringify(documentV133) });window.rafexProjectCrmV368?.markSaved();');
 // The project-name setter used to write every input in the header. CRM is
 // an independent input; only the two project-name fields belong to it.
 replace('projectNode.querySelectorAll("input")','projectNode.querySelectorAll("#rafexAuthorityProjectName,#rafexCommonProjectName")');
 replace('window.rafexStartNewProjectV133=async function(){','window.rafexStartNewProjectV133=async function(){if(window.rafexProjectCrmV368?.isLocked())return;');
 replace('if(b)b.disabled=Boolean(window.rafexProjectSavingV133||','if(b)b.disabled=Boolean(window.rafexProjectCrmV368?.isLocked()||window.rafexProjectSavingV133||');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v368 body');
 const css=`#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap{flex-wrap:wrap!important;align-items:flex-start!important;gap:8px!important;height:auto!important;max-height:none!important;overflow:visible!important}
 #page[data-rafex-authority-mode="common"] .rafex-common-project-name-field{flex:1 1 220px!important;width:auto!important;min-width:180px}
 #page[data-rafex-authority-mode="common"] .rafex-common-project-name-field,#page .rafex-crm-field-v368{display:flex!important;flex-direction:column!important;gap:4px!important;height:auto!important;min-height:0!important;padding:0!important;margin:0!important;align-self:flex-start!important}
 #page[data-rafex-authority-mode="common"] .rafex-common-project-name-field>span,#page .rafex-crm-field-v368>label{display:block!important;height:12px!important;line-height:12px!important;margin:0!important;padding:0!important;font-size:10px!important;font-weight:800;color:#305447}
 #page .rafex-crm-field-v368{flex:0 0 190px;font-size:10px;color:#305447}
 #page .rafex-crm-controls-v369{display:flex;gap:6px;height:34px;align-items:stretch}
 #page[data-rafex-authority-mode="common"] #rafexAuthorityProjectName,#page #rafexCrmNumberV368{height:34px!important;min-height:34px!important;max-height:34px!important;margin:0!important;box-sizing:border-box;padding:6px 9px!important;border:1px solid #adc8b8;border-radius:7px;background:white;color:#173f31;font-size:13px!important;line-height:20px!important}
 #page #rafexCrmNumberV368{flex:1;min-width:0;width:100%}
 #page #rafexCrmConfirmV369{flex:0 0 auto;height:34px;min-height:34px;padding:6px 10px;border:1px solid #214f3b;border-radius:7px;background:#214f3b;color:white;font-size:12px;font-weight:800;white-space:nowrap}
 #page #rafexCrmConfirmV369:disabled,#page #rafexNewProjectV133[data-crm-locked="true"]{opacity:.55;cursor:not-allowed}
 #page #rafexAuthorityProjectName[data-crm-locked="true"]{background:#eef2ef;color:#607065}
 #page #rafexCrmStatusV368{flex:1 0 100%;font-size:11px;color:#5f3028}#page #rafexCrmStatusV368:empty{display:none}#page #rafexCrmStatusV368[data-busy="true"]{color:#315b48}
 #page #rafexCrmDetailsV368{flex:1 0 100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:8px 0 0;border-top:1px solid #cbdcd2}#page #rafexCrmDetailsV368[hidden]{display:none}#page #rafexCrmDetailsV368 small{display:block;color:#607a6c;font-size:10px}#page #rafexCrmDetailsV368 strong{display:block;margin-top:3px;color:#173f31;font-size:12px;overflow-wrap:anywhere}@media(max-width:640px){#page #rafexCrmDetailsV368{grid-template-columns:1fr}}`;
 return html.slice(0,end)+'<style data-crm-project="v368">'+css+'</style><script data-crm-project="v368">'+runtime+'</script>'+html.slice(end);
}

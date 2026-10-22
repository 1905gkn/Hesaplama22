export function transform(html){
 if(html.includes('data-crm-start="v370"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v370 anchor '+a.slice(0,95));html=html.replace(a,b);};
 replace('window.rafexStartNewProjectV133=async function(){if(window.rafexProjectCrmV368?.isLocked())return;',"window.rafexStartNewProjectV133=async function(crmStartV370){const crmV370=crmStartV370===true?window.rafexProjectCrmV368?.snapshot():null;if(window.rafexProjectCrmV368?.isLocked()&&!crmV370?.confirmed)return;");
 replace('if(existingCreation?.creationNameV253===projectName){\n      if(existingCreation.drawingCatalogId)return;',"if(crmV370?existingCreation?.crmNumberV370===crmV370.number:existingCreation?.creationNameV253===projectName){\n      if(existingCreation.drawingCatalogId){if(crmV370){existingCreation.creationNameV253=projectName;window.rafexActivateProjectV134?.(existingCreation);window.rafexSyncProjectGateV134?.();}return true;}");
 replace('window.rafexProjectIdentityV133=fresh.payload.projectIdentity;window.rafexProjectCrmV368?.prepareNew();','window.rafexProjectIdentityV133=fresh.payload.projectIdentity;if(crmV370)window.rafexProjectIdentityV133.crmNumberV370=crmV370.number;window.rafexProjectCrmV368?.prepareNew();');
 replace('await window.rafexSaveNewProjectV157();\n  };','return await window.rafexSaveNewProjectV157();\n  };');
 replace('const unlocked=()=>Boolean(active&&active.uuid===window.rafexProjectIdentityV133?.uuid);','const unlocked=()=>Boolean(active&&active.uuid===window.rafexProjectIdentityV133?.uuid&&(!active.crmNumberV370||Number.isSafeInteger(active.drawingCatalogId)));');
 replace('  function sync() {\n    frame = null;\n    if(window.rafexDragUiV153?.defer(sync))return;',"  window.rafexOpenLayoutScreenV370=async()=>{await switchScreen('layout');return screen==='layout';};\n  function sync() {\n    frame = null;\n    if(window.rafexDragUiV153?.defer(sync))return;");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v370 body');return html.slice(0,end)+'<meta data-crm-start="v370">'+html.slice(end);
}

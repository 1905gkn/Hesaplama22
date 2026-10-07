/* report-project-name-v282 */
function rafexReportProjectNameV282(language='tr'){
 const common=document.querySelector('#page[data-rafex-authority-mode="common"]')||document.getElementById('rafexAuthorityProjectName');
 const ids=common?['rafexAuthorityProjectName','rafexCommonProjectName','m2ProjectName']:['m2ProjectName','b2bProjectName','mrProjectName'];
 for(const id of ids){const value=String(document.getElementById(id)?.value||'').trim();if(value)return value;}
 const saved=common?String(window.rafexProjectIdentityV133?.creationNameV253||'').trim():'';if(saved)return saved;
 const racks=typeof m2LayoutState!=='undefined'?m2LayoutState.racks||[]:[];
 const systems=[...new Set(racks.map(r=>r.rafexSystem||(r.b2b?.mr?'mr':r.b2bLayout||r.b2b?'b2b':r.systemType==='drive'?'drive':'mekik2')))];
 const system=systems.length===1?systems[0]:'common';
 const labels={tr:{b2b:'B2B RAF PROJESİ',mr:'MR RAF PROJESİ',drive:'DRIVE-IN RAF PROJESİ',konsol:'KONSOL KOLLU RAF PROJESİ',mekik2:'MEKİK RAF PROJESİ',common:'RAF YERLEŞİM PROJESİ'},en:{b2b:'B2B RACK PROJECT',mr:'MR RACK PROJECT',drive:'DRIVE-IN RACK PROJECT',konsol:'CANTILEVER RACK PROJECT',mekik2:'SHUTTLE RACK PROJECT',common:'RACK LAYOUT PROJECT'},fr:{b2b:'PROJET DE RAYONNAGE B2B',mr:'PROJET DE RAYONNAGE MR',drive:'PROJET DE RAYONNAGE DRIVE-IN',konsol:'PROJET DE RAYONNAGE CANTILEVER',mekik2:'PROJET DE RAYONNAGE NAVETTE',common:'PROJET D’IMPLANTATION DE RAYONNAGES'}};
 return (labels[language]||labels.tr)[system]||(labels[language]||labels.tr).common;
}

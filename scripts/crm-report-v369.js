/* crm-report-v369 */
(()=>{
 const base=window.rafexReportMetadataV324;
 function decorate(target){
  if(!target)return;
  const saved=window.rafexProjectCrmV368?.snapshot(),crm=saved?.confirmed===true?saved:null;
  for(const cover of target.querySelectorAll('.m2-corporate-cover')){
   cover.querySelectorAll('.rafex-report-customer-v369,.rafex-report-crm-row-v369').forEach(node=>node.remove());
   if(!crm)continue;
   const content=cover.querySelector('.m2-corporate-cover-content'),heading=content?.querySelector('h1');
   if(heading&&(crm.companyName||crm.contactName)){
    const recipient=document.createElement('div');recipient.className='rafex-report-customer-v369';
    if(crm.companyName){const company=document.createElement('div');company.className='rafex-report-company-v369';company.textContent=crm.companyName;if(crm.companyName.length>80)company.style.fontSize=crm.companyName.length>150?'18px':'22px';recipient.append(company);}
    if(crm.contactName){const contact=document.createElement('p');contact.className='rafex-report-contact-v369';contact.textContent='Sayın '+crm.contactName;if(crm.contactName.length>80)contact.style.fontSize='15px';recipient.append(contact);}
    heading.before(recipient);
   }
   const metadata=cover.querySelector('.rafex-report-metadata');
   if(metadata){const row=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');row.className='rafex-report-crm-row-v369';label.textContent='CRM NO';value.textContent=String(crm.number);row.append(label,value);metadata.append(row);}
  }
 }
 window.rafexReportMetadataV324=function(target){base?.(target);decorate(target);};
 window.rafexCrmReportV369={decorate};
})();

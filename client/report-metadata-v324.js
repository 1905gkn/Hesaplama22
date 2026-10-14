/* report-metadata-v324 */
window.rafexReportMetadataV324=function(target){
  if(!target)return;
  const pages=[...target.querySelectorAll('.m2-corporate-page')];
  const name=document.getElementById('who')?.textContent.trim()||'—';
  const projectNode=document.getElementById('rafexProjectNumberV134');
  const number=projectNode?.textContent.match(/\d+/)?.[0]||'—';
  const date=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).replace(',','');
  target.querySelectorAll('.m2-corporate-cut-note').forEach(note=>note.remove());
  pages.forEach((page,index)=>{
    let footer=page.querySelector(':scope>.m2-corporate-page-footer');
    if(!footer){footer=document.createElement('footer');footer.className='m2-corporate-page-footer';page.appendChild(footer);}
    footer.textContent=(index+1)+' / '+pages.length+' · CREATED BY G.K';
  });
  for(const cover of target.querySelectorAll('.m2-corporate-cover')){
    cover.querySelectorAll('.rafex-report-metadata').forEach(node=>node.remove());
    const banner=document.createElement('div');banner.className='rafex-report-metadata';
    for(const [label,value] of [['HAZIRLAYAN',name],['HAZIRLANMA TARİHİ',date],['PROJE NO',number]]){
      const cell=document.createElement('div'),title=document.createElement('span'),text=document.createElement('strong');title.textContent=label;text.textContent=String(value).toLocaleUpperCase('tr-TR');cell.append(title,text);banner.appendChild(cell);
    }
    cover.appendChild(banner);
  }
};


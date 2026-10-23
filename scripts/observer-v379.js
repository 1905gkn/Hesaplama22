(()=>{
let records=[],loading=null,epoch=0;
const e=id=>document.getElementById(id),safe=value=>esc(String(value??''));
async function list(){
 if(loading)return loading;
 loading=(async()=>{let before=null,next=[],seen=new Set();do{
  const data=await req('/api/projects?summary=1'+(before?'&before='+before:''));
  for(const p of data.projects||[])if(!seen.has(p.id)){seen.add(p.id);next.push(p)}
  const cursor=data.nextBefore;if(cursor&&before&&cursor>=before)throw Error('Proje sayfası ilerlemedi.');before=cursor;
 }while(before);records=next;return next})();
 try{return await loading}finally{loading=null}
}
function rows(){
 const host=e('observerRowsV379');if(!host)return;
 const query=(e('observerSearchV379')?.value||'').trim().toLocaleLowerCase('tr');
 const filtered=records.filter(p=>[p.serial_no,p.project_name,p.username,p.module].join(' ').toLocaleLowerCase('tr').includes(query));
 e('observerCountV379').textContent=filtered.length+' / '+records.length+' proje';
 host.innerHTML=filtered.length?filtered.map(p=>'<tr><td>'+safe(p.serial_no)+'</td><td>'+safe(p.project_name)+'</td><td>'+safe(p.username)+'</td><td>'+safe(historyModuleName(p.module))+'</td><td><button type="button" class="small-btn" data-observer-project="'+Number(p.id)+'">Görüntüle</button></td></tr>').join(''):'<tr><td colspan="5">Kayıt bulunamadı.</td></tr>';
}
async function detail(id){
 const token=++epoch,host=e('observerDetailV379');if(!host)return;
 host.textContent='Proje yükleniyor…';
 try{
  const {project:p}=await req('/api/projects/'+Number(id));if(token!==epoch||!host.isConnected)return;
  const x=p.payload||{};
  host.innerHTML='<h3>'+safe(p.serial_no)+' · '+safe(p.project_name)+'</h3><p>Kaydeden: '+safe(p.username)+' · Salt okunur kayıt</p>'+historyProjectBody(p,x,x.inputs||{})+'<div data-observer-products>Ürün dökümü yükleniyor…</div><details><summary>Kayıtlı tüm proje verileri</summary><pre style="max-height:400px;overflow:auto;white-space:pre-wrap"></pre></details>';
  host.querySelector('pre').textContent=JSON.stringify(x,null,2);
  const productsHost=host.querySelector('[data-observer-products]');
  try{
   const data=await req('/api/projects/by-number/'+Number(p.serial_no)+'/products');if(token!==epoch||!host.isConnected)return;
   productsHost.innerHTML='<h4>Ürün kodları ve adetleri</h4><p>'+(data.crmNo?'CRM No: '+safe(data.crmNo):'Proje adı: '+safe(data.projectName))+'</p><div style="overflow:auto"><table class="users"><thead><tr><th>Kod</th><th>Ürün</th><th>Adet</th><th>Birim</th></tr></thead><tbody>'+data.products.map(r=>'<tr><td>'+safe(r.code||'—')+'</td><td>'+safe(r.name)+'<small style="display:block">'+safe(r.description)+'</small></td><td>'+safe(r.quantity)+'</td><td>'+safe(r.unit)+'</td></tr>').join('')+'</tbody></table></div>';
  }catch(error){productsHost.textContent=error.message}
 }catch(error){if(token===epoch&&host.isConnected)host.textContent=error.message}
}
async function render(){
 document.body.classList.add('rafex-observer-v379');
 e('pageTitle').textContent='Gözlemci · Tüm Projeler';
 e('page').classList.remove('b2b-mode','mr-mode');e('page').oninput=null;e('page').onclick=null;
 e('page').innerHTML='<section class="card"><div class="card-title"><h3>Tüm Projeler · Salt Okunur</h3><span id="observerCountV379"></span></div><p>Projeleri ve ürün dökümlerini görüntüleyebilirsiniz. Kayıt oluşturma, değiştirme ve silme yetkiniz yoktur.</p><label class="field">Proje no, adı veya kullanıcı ile ara<input id="observerSearchV379" type="search" placeholder="Proje ara"></label><button type="button" id="observerRefreshV379" class="small-btn">Listeyi Yenile</button><p id="observerMessageV379" role="status">Projeler yükleniyor…</p><div style="overflow:auto"><table class="users"><thead><tr><th>Proje No</th><th>Proje Adı</th><th>Kaydeden</th><th>Sistem</th><th>Detay</th></tr></thead><tbody id="observerRowsV379"></tbody></table></div></section><section class="card" id="observerDetailV379" aria-live="polite">Bir proje seçin.</section>';
 const host=e('observerRowsV379');
 e('observerSearchV379').oninput=rows;
 host.onclick=event=>{const button=event.target.closest('[data-observer-project]');if(button)detail(button.dataset.observerProject)};
 const refresh=async()=>{try{await list();if(host.isConnected){rows();e('observerMessageV379').textContent=''}}catch(error){if(host.isConnected)e('observerMessageV379').textContent=error.message}};
 e('observerRefreshV379').onclick=refresh;await refresh();
}
const history=openHistory;openHistory=window.openHistory=function(){if(me?.role==='observer')return render();return history.apply(this,arguments)};
window.rafexObserverV379={render};
const style=document.createElement('style');style.textContent='.rafex-observer-v379 #nav button:not([data-page="home"]),.rafex-observer-v379 #mobileTabs,.rafex-observer-v379 #rafexDraftsButtonV241{display:none!important}.rafex-observer-v379 #observerDetailV379{margin-top:18px}.rafex-observer-v379 #page table{width:100%}';document.head.appendChild(style);
})();

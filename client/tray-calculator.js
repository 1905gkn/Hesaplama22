(function(){
  const data=__TRAY_DATA__;
  const calculate=__TRAY_CALCULATE__;
  const fmt=x=>Number(x).toLocaleString('tr-TR',{maximumFractionDigits:2});
  let kind='MR';
  const values={width:200,depth:1050,load:500,span:2700};
  function render(){
    const page=document.getElementById('page');
    page.innerHTML='<section class="tray-calc"><h2>Tava Hesabı</h2><div class="tray-tabs" role="tablist"><button type="button" role="tab" data-tray-kind="MR">MR Toplama Katı</button><button type="button" role="tab" data-tray-kind="HR">HR Tava</button></div><form id="trayForm"><div class="tray-fields"><label>Tava genişliği (mm)<select name="width"><option>200</option><option>250</option><option>300</option></select></label><label>Tava derinliği (mm)<input name="depth" type="number" min="400" max="1200" step="any" required></label><label>Kattaki toplam ağırlık (kg)<input name="load" type="number" min="0.01" step="any" required></label><label>Kat genişliği (mm)<input name="span" type="number" min="1" step="any" required></label></div><button class="primary" type="submit">Hesapla</button></form><div id="trayResult" aria-live="polite"></div><p class="tray-note">Toplam yükün tam tavalar arasında eşit dağıldığı kabul edilir. Kalan genişlik taşıma hesabına katılmaz. Ara derinliklerde bir üst tablo sütunu kullanılır.</p></section>';
    const form=document.getElementById('trayForm');
    for(const [key,value] of Object.entries(values))form.elements.namedItem(key).value=value;
    function update(){
      for(const key of Object.keys(values))values[key]=Number(form.elements.namedItem(key).value);
      page.querySelectorAll('[data-tray-kind]').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.trayKind===kind));});
      const r=calculate(data,kind,values.width,values.depth,values.load,values.span),out=document.getElementById('trayResult');
      if(r.error){out.innerHTML='<p class="tray-error">'+r.error+'</p>';return;}
      const rec=r.recommended;
      out.innerHTML='<div class="tray-metrics"><div>Tava sayısı<b>'+r.count+' adet</b></div><div>Tava başına yük<b>'+fmt(r.perTray)+' kg</b></div><div>Kalan genişlik<b>'+fmt(r.remainder)+' mm</b></div><div>Tablo derinliği<b>'+r.tableDepth+' mm</b></div></div><div class="tray-recommendation"><small>EN İNCE UYGUN TAVA</small><h3>'+(rec?kind+' '+values.width+' × '+r.tableDepth+' × '+fmt(rec.thickness)+' mm':'Tabloda yeterli kalınlık yok')+'</h3>'+(rec?'<p>Bir tava: '+fmt(rec.capacity)+' kg · '+r.count+' tava: '+fmt(rec.capacity*r.count)+' kg</p>':'')+'</div><p>'+fmt(values.span)+' ÷ '+values.width+' → '+r.count+' tam tava · '+fmt(values.load)+' ÷ '+r.count+' = '+fmt(r.perTray)+' kg/tava</p><div class="tray-table-wrap"><table><thead><tr><th>Kalınlık</th><th>Tek tava kapasitesi</th><th>'+r.count+' tava kapasitesi</th><th>Sonuç</th></tr></thead><tbody>'+r.options.map(o=>'<tr'+(o===rec?' class="recommended"':'')+'><td>'+fmt(o.thickness)+' mm</td><td>'+fmt(o.capacity)+' kg</td><td>'+fmt(o.capacity*r.count)+' kg</td><td>'+(o===rec?'Önerilen':o.suitable?'Yeterli':'Yetersiz')+'</td></tr>').join('')+'</tbody></table></div><p class="tray-note">Kaynak: '+kind+' TAVA.pdf · B/h/t: genişlik / 20 mm kenar yüksekliği / kalınlık. Sonuç yalnız tava kapasitesidir.</p>';
    }
    form.onsubmit=e=>{e.preventDefault();update();};form.oninput=update;
    page.querySelectorAll('[data-tray-kind]').forEach(button=>{button.onclick=()=>{kind=button.dataset.trayKind;update();};});update();
  }
  // Use the existing calculation permission, including its server persistence.
  const canView=canViewModule;
  canViewModule=function(name){return name==='tava'?canView('travers'):canView(name);};
  const module=RAFEX_MODULES.find(x=>x.key==='travers');if(module)module.label='Travers ve Tava Hesabı';
  const nav=document.getElementById('nav'),anchor=nav?.querySelector('[data-page="travers"]');
  if(nav&&!nav.querySelector('[data-page="tava"]')){
    const button=document.createElement('button');button.type='button';button.dataset.page='tava';button.textContent='Tava Hesabı';
    if(anchor)anchor.after(button);else nav.appendChild(button);applyModuleVisibility();
  }
  const previous=showPage;
  showPage=function(name){
    if(name!=='tava')return previous.apply(this,arguments);
    previous.call(this,'home');if(!canViewModule('tava'))return;
    document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='tava'));
    document.getElementById('pageTitle').textContent='Tava Hesabı';render();
  };window.showPage=showPage;
})();

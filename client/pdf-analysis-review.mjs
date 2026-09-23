export function reviewAnswers(audit,answers){
 const beams=Number(answers.beams),stack=Number(answers.stack),gap=Number(answers.gap);
 if(!Number.isInteger(beams)||beams<1||beams>20)throw Error('Travers katı sayısını 1–20 arasında belirt.');
 if(![1,2].includes(stack))throw Error('Zeminde tek palet mi, üst üste iki palet mi olduğunu seç.');
 if(answers.gap===''||!Number.isFinite(gap)||gap<0||gap>1000)throw Error('Çift sıra net arasını mm olarak belirt (0–1000).');
 if(!answers.reviewed)throw Error('Sayımı, kat düzenini ve yaklaşık konum uyarısını onayla.');
 const quantities=audit.quantities.map(q=>{
  const r=audit.schedule.find(r=>r.name===q.name);
  const calculated=q.detected*(r.palletsPerBay/r.palletLevels)*(beams+stack);
  return {...q,calculated,difference:calculated-q.capacity};
 });
 return {beams,stack,gap,quantities,capacity:quantities.reduce((s,q)=>s+q.calculated,0)};
}

export function renderReview(box,item,onReady){
 const audit=item.audit,answers=item.answers??={beams:'',stack:'',gap:'',reviewed:false};
 box.replaceChildren();
 const h=document.createElement('h3');h.textContent='Analiz kontrolü · eksikleri tamamla';box.append(h);
 const info=document.createElement('p');info.textContent='PDF’den okundu: raf tipleri, göz sayıları, kesit ve palet ölçüleri. Kullanıcı onayı gerekiyor: kat düzeni, zemindeki palet sayısı ve çift sıra arası. Konumlar çizimden ölçeklenmiştir; NTS nedeniyle yaklaşık, depo sınırı doğrulanmamıştır.';box.append(info);
 const table=document.createElement('table'),head=table.insertRow();for(const value of ['Kaynak tip','Tablo göz','Sayılan göz','PDF palet','Onayına göre palet','Fark']){const th=document.createElement('th');th.textContent=value;head.append(th);}box.append(table);
 const rows=audit.quantities.map(q=>{const row=table.insertRow();for(const v of [q.name,q.declared,q.detected,q.capacity,'—','—'])row.insertCell().textContent=v;return row;});
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),colors=['#2563eb','#16a34a','#b45309','#9333ea'];
 const minX=Math.min(...audit.bays.map(b=>b.cx-b.depth/audit.scale/2)),minY=Math.min(...audit.bays.map(b=>b.top)),maxX=Math.max(...audit.bays.map(b=>b.cx+b.depth/audit.scale/2)),maxY=Math.max(...audit.bays.map(b=>b.bottom));
 svg.setAttribute('viewBox',`${minX-2} ${minY-2} ${maxX-minX+4} ${maxY-minY+4}`);svg.setAttribute('aria-label','Kaynak vektör koordinatlarında tip bazlı raf sayımı');svg.style.height='360px';
 for(const [i,b] of audit.bays.entries()){const rect=document.createElementNS(ns,'rect');for(const [key,value] of Object.entries({x:b.cx-b.depth/audit.scale/2,y:b.top,width:b.depth/audit.scale,height:b.bottom-b.top,fill:colors[audit.quantities.findIndex(q=>q.name===b.type)%colors.length],stroke:'white','stroke-width':.12}))rect.setAttribute(key,value);const title=document.createElementNS(ns,'title');title.textContent=`S${i+1} · ${b.type}`;rect.append(title);svg.append(rect);}box.append(svg);
 const legend=document.createElement('p');audit.quantities.forEach((q,i)=>{const span=document.createElement('span');span.style.cssText=`color:${colors[i%colors.length]};margin-right:20px;font-weight:bold`;span.textContent=q.name+' · '+q.detected+' göz';legend.append(span);});box.append(legend);
 const form=document.createElement('div'),message=document.createElement('p');message.setAttribute('role','status');
 function update(){try{const result=reviewAnswers(audit,{...answers,reviewed:true});rows.forEach((row,i)=>{row.cells[4].textContent=result.quantities[i].calculated;row.cells[5].textContent=result.quantities[i].difference;});message.textContent='Hesaplanan kapasite: '+result.capacity+' palet. '+(result.quantities.some(q=>q.difference)?'PDF kapasitesiyle fark var; kat düzenini kontrol et.':'PDF kapasitesiyle eşleşiyor.');}catch(e){message.textContent=e.message;}answers.reviewed=false;check.checked=false;}
 for(const [key,label,options] of [['beams','Zeminin üstünde kaç travers katı var?'],['stack','Zeminde palet düzeni',[['','Seç…'],['1','Tek palet'],['2','Üst üste 2 palet']]],['gap','Çift sıra arası net mesafe (mm)']]){
  const wrapper=document.createElement('label');wrapper.textContent=label+' · Kullanıcı onayı';const input=document.createElement(options?'select':'input');input.dataset.analysisAnswer=key;
  if(options)for(const [value,text] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=text;input.append(opt);}else{input.type='number';input.min=key==='beams'?'1':'0';input.max=key==='beams'?'20':'1000';}
  input.value=answers[key];input.addEventListener('input',()=>{answers[key]=input.value;update();});wrapper.append(input);form.append(wrapper);
 }
 const accept=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.dataset.analysisReviewed='';check.checked=answers.reviewed;check.addEventListener('change',()=>answers.reviewed=check.checked);accept.append(check,document.createTextNode(' Sayımı, kat düzenini ve yaklaşık konum uyarısını kontrol ettim.'));
 const ready=document.createElement('button');ready.type='button';ready.dataset.selectivePrepare='review';ready.textContent='Cevapları doğrula ve tipleri hazırla';ready.onclick=()=>{try{onReady(reviewAnswers(audit,answers));}catch(e){message.textContent=e.message;}};
 box.append(form,message,accept,ready);
}

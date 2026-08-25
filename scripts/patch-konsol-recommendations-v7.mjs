import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol recommendations v7');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-recommendations="v7">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-recommendations="v7">[\s\S]*?<\/script>/g,'');

const oldSetPlan="  function setPlan(count){var n=Math.max(2,Math.round(Number(count)||2)),out=[];while(n>0){if(n===2){out.push(2);break}if(n===3){out.push(3);break}if(n===4){out.push(2,2);break}if(n%3===1){out.push(2,2);n-=4}else if(n%3===2){out.push(2);n-=2}else{out.push(3);n-=3}}return out}";
const newSetPlan="  function setPlan(count){var n=Math.max(2,Math.round(Number(count)||2)),out=[];while(n>0){if(n<=5){out.push(n);break}if(n===6){out.push(3,3);break}if(n===7){out.push(4,3);break}if(n===8){out.push(5,3);break}if(n===9){out.push(5,4);break}out.push(5);n-=5}return out}";
if(html.includes(oldSetPlan)) html=html.replace(oldSetPlan,newSetPlan);
else if(!html.includes('if(n<=5){out.push(n);break}')) throw new Error('Konsol v7 setPlan fonksiyonu bulunamadı.');

const sectionRe=/  function updateSectionSvg\(s\)\{[\s\S]*?\n  function refresh\(\)\{/;
if(sectionRe.test(html)){
  const newSection=`  function updateSectionSvg(s){var host=el('konsolSectionSvg');if(!host)return;var w=760,h=230,pad=45,span=w-pad*2,count=s.uprightCount,dx=count>1?span/(count-1):0,top=36,bottom=190,lines='';function ln(x1,y1,x2,y2,color,width){lines+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"/>'}for(var i=0;i<count;i++){var x=pad+i*dx;ln(x,top,x,bottom,'#005387',8);for(var l=1;l<=s.levels;l++){var y=bottom-(bottom-top)*(l/(s.levels+1));ln(x,y,x+Math.min(55,s.armLength/25),y,'#d9ae17',7)}}var rowCount=s.height<=3500?3:(s.height<=4500?4:5),rows=[];for(var r=0;r<rowCount;r++)rows.push(bottom-(bottom-top)*(r/Math.max(1,rowCount-1)));var mid=rows[Math.floor(rows.length/2)],cursor=0;function braceSet(size){var actual=Math.min(size,count-cursor);if(actual<2)return;var xs=[];for(var q=0;q<actual;q++)xs.push(pad+(cursor+q)*dx);for(var b=0;b<actual-1;b++)rows.forEach(function(y){ln(xs[b],y,xs[b+1],y,'#d5443f',3)});var low=rows[0],high=rows[rows.length-1];if(actual===2){ln(xs[0],high,xs[1],mid,'#d5443f',3);ln(xs[0],low,xs[1],mid,'#d5443f',3)}else if(actual===3||actual===4){ln(xs[0],high,xs[1],mid,'#d5443f',3);ln(xs[0],low,xs[1],mid,'#d5443f',3);ln(xs[1],mid,xs[2],high,'#d5443f',3);ln(xs[1],mid,xs[2],low,'#d5443f',3)}else{var c=2;ln(xs[c-1],high,xs[c],mid,'#d5443f',3);ln(xs[c-1],low,xs[c],mid,'#d5443f',3);ln(xs[c],mid,xs[c+1],high,'#d5443f',3);ln(xs[c],mid,xs[c+1],low,'#d5443f',3)}cursor+=actual}s.setPlan.forEach(braceSet);host.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Konsol kollu kesit önizleme"><rect width="'+w+'" height="'+h+'" fill="#fff"/><g>'+lines+'</g><text x="'+(w/2)+'" y="218" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#536058">KESİT AÇISI · '+Math.round(s.angle)+'°</text></svg>'}\n  function refresh(){`;
  html=html.replace(sectionRe,newSection);
}else if(!html.includes("rowCount=s.height<=3500?3:(s.height<=4500?4:5)")){
  throw new Error('Konsol v7 kesit SVG fonksiyonu bulunamadı.');
}

const runtime=String.raw`
<style data-rafex-konsol-recommendations="v7">
#page .konsol-rec-wrap{grid-column:1/-1;display:grid;gap:8px;margin-top:2px}
#page .konsol-rec-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;font-weight:900;color:#315846;letter-spacing:.03em}
#page .konsol-rec-title small{font-size:9px;color:#758078;font-weight:700;letter-spacing:0}
#page .konsol-rec-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#page .konsol-rec-card{border:1px solid #dce6df;border-radius:10px;padding:10px;background:#f8fbf9;display:grid;gap:7px}
#page .konsol-rec-card.is-primary{border-color:#90b8a2;background:#eff7f2}
#page .konsol-rec-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
#page .konsol-rec-no{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#315846;color:#fff;font-size:12px;font-weight:900}
#page .konsol-rec-tag{font-size:9px;font-weight:900;color:#315846}
#page .konsol-rec-profiles{font-size:12px;line-height:1.45;color:#26352e}
#page .konsol-rec-profiles b{color:#173d2c}
#page .konsol-rec-meta{font-size:9px;color:#6d786f;line-height:1.4}
#page .konsol-rec-card button{padding:8px 9px;border-radius:7px;background:#315846;color:#fff;font-size:10px;font-weight:900}
#page .konsol-rec-manual{font-size:9px;color:#7a4d00;background:#fff4d8;border-radius:7px;padding:7px 8px;display:none}
#page .konsol-rec-manual.show{display:block}
@media(max-width:700px){#page .konsol-rec-grid{grid-template-columns:1fr}}
</style>
<script data-rafex-konsol-recommendations="v7">
(function(){
 if(window.__rafexKonsolRecommendationsV7)return;window.__rafexKonsolRecommendationsV7=true;
 var U=[
  {key:'ipe180',label:'IPE 180',kg:18.8,A:23.9,W:166.4,iz:2.0},
  {key:'ipe200',label:'IPE 200',kg:22.4,A:28.5,W:220.6,iz:2.2},
  {key:'ipe220',label:'IPE 220',kg:26.2,A:33.4,W:285.4,iz:2.4},
  {key:'ipe240',label:'IPE 240',kg:30.7,A:39.1,W:366.6,iz:2.6},
  {key:'ipe270',label:'IPE 270',kg:36.1,A:45.9,W:483.9,iz:3.0},
  {key:'ipe300',label:'IPE 300',kg:42.2,A:53.8,W:628.3,iz:3.3}
 ];
 var A=[
  {key:'npi80',label:'NPI 80',kg:5.9,Iy:77.8,W:22.8},
  {key:'npi100',label:'NPI 100',kg:8.3,Iy:171,W:39.8},
  {key:'npi120',label:'NPI 120',kg:11.1,Iy:328,W:63.6},
  {key:'npi140',label:'NPI 140',kg:14.3,Iy:573,W:95.4},
  {key:'npi160',label:'NPI 160',kg:17.9,Iy:935,W:136},
  {key:'npi180',label:'NPI 180',kg:21.9,Iy:1450,W:187},
  {key:'npi200',label:'NPI 200',kg:26.2,Iy:2140,W:250},
  {key:'npi220',label:'NPI 220',kg:31.1,Iy:3060,W:324}
 ];
 var FY=355,E=210000,GQ=1.5,ALPHA=.34,DEF=200;
 var applying=false,manual=false,lastOptions=[];
 function e(id){return document.getElementById(id)}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function braceRows(h){return h<=3500?3:(h<=4500?4:5)}
 function armCap(p,L){L=Math.max(250,L);var mpl=p.W*FY/1000;var strength=2*mpl/(L/1000)/GQ/9.81*1000;var deflection=8*E*(p.Iy*10000)/(DEF*L*L)/9.81;return Math.max(0,Math.min(strength,deflection))}
 function uprightCap(p,count,levels,h,arm){var area=p.A*100,iz=p.iz*10,lcr=Math.max(1,h/Math.max(1,braceRows(h)-1));var ncr=Math.PI*Math.PI*E*area*iz*iz/(lcr*lcr)/1000;var lambda=Math.sqrt((area*FY)/(Math.max(.001,ncr)*1000));var phi=.5*(1+ALPHA*(lambda-.2)+lambda*lambda);var root=Math.sqrt(Math.max(0,phi*phi-lambda*lambda));var chi=Math.min(1,1/Math.max(.0001,phi+root));var nb=chi*area*FY/1000;var mpl=p.W*FY/1000;var denom=1/Math.max(.001,nb)+(arm/1000)/Math.max(.001,mpl);return (count/Math.max(1,levels))/denom/GQ/9.81*1000}
 function current(){return{count:Math.max(2,n('konsolUprightCount',5)),levels:Math.max(1,n('konsolLevels',4)),h:Math.max(1000,n('konsolHeight',4500)),arm:Math.max(250,n('konsolArmLength',1200)),base:Math.max(250,n('konsolBaseDepth',1200)),load:Math.max(0,n('konsolLevelLoad',500)),side:e('konsolSide')&&e('konsolSide').value==='double'?2:1}}
 function candidate(u,a,s){var ac=armCap(a,s.arm)*s.count,uc=uprightCap(u,s.count,s.levels,s.h,s.arm),cap=Math.min(ac,uc);var weight=u.kg*s.count*((s.h/1000)+(s.base/1000)*s.side)+a.kg*s.count*s.levels*(s.arm/1000)*s.side;return{u:u,a:a,armCap:ac,uprightCap:uc,cap:cap,weight:weight,safe:s.load<=cap,usage:cap>0?s.load/cap:99}}
 function compute(){var s=current(),all=[];U.forEach(function(u){A.forEach(function(a){all.push(candidate(u,a,s))})});all.sort(function(x,y){return x.weight-y.weight||x.cap-y.cap});var safe=all.filter(function(x){return x.safe});var one=safe[0]||all.slice().sort(function(x,y){return y.cap-x.cap})[0];var ui=U.indexOf(one.u),ai=A.indexOf(one.a);var stronger=safe.filter(function(x){return U.indexOf(x.u)>=ui&&A.indexOf(x.a)>=ai&&(x.u!==one.u||x.a!==one.a)}).sort(function(x,y){return x.weight-y.weight||x.cap-y.cap})[0];var two=stronger||safe[1]||all.slice().sort(function(x,y){return y.cap-x.cap})[1]||one;return[safe.length?one:Object.assign({},one,{safe:false}),safe.length?two:Object.assign({},two,{safe:false})]}
 function fmt(v){return Math.round(v).toLocaleString('tr-TR')}
 function renderCard(card,opt,index){var tag=index===0?'EN EKONOMİK UYGUN':'BİR ÜST GÜVENLİ';if(!opt.safe)tag='TABLODA AŞIM';card.classList.toggle('is-primary',index===0);card.querySelector('.konsol-rec-tag').textContent=tag;card.querySelector('.konsol-rec-profiles').innerHTML='<b>Ayak:</b> '+opt.u.label+'<br><b>Kol:</b> '+opt.a.label;card.querySelector('.konsol-rec-meta').textContent='Ön kapasite '+fmt(opt.cap)+' kg/kat · kullanım %'+Math.round(opt.usage*100)+' · yaklaşık profil ağırlığı '+fmt(opt.weight)+' kg';card.querySelector('button').textContent=(index+1)+'. seçeneği uygula'}
 function syncManual(){var box=e('konsolRecManual');if(box)box.classList.toggle('show',manual)}
 function applyOption(index){var opt=lastOptions[index];if(!opt)return;applying=true;var up=e('konsolUprightProfile'),ap=e('konsolArmProfile');if(up){up.value=opt.u.key;up.dispatchEvent(new Event('change',{bubbles:true}))}if(ap){ap.value=opt.a.key;ap.dispatchEvent(new Event('change',{bubbles:true}))}applying=false;manual=false;syncManual()}
 function updateRecommendations(){var host=e('konsolRecommendationV7');if(!host)return;lastOptions=compute();var cards=host.querySelectorAll('.konsol-rec-card');renderCard(cards[0],lastOptions[0],0);renderCard(cards[1],lastOptions[1],1);if(!manual&&!host.dataset.initialApplied){host.dataset.initialApplied='1';applyOption(0)}}
 function enhance(){var profileRow=document.querySelector('#page .konsol-profile-row');if(!profileRow||e('konsolRecommendationV7'))return;var wrap=document.createElement('div');wrap.id='konsolRecommendationV7';wrap.className='konsol-rec-wrap';wrap.innerHTML='<div class="konsol-rec-title"><span>ÖNERİLEN PROFİL SEÇENEKLERİ</span><small>1. tabloya göre ön seçim</small></div><div class="konsol-rec-grid"><div class="konsol-rec-card"><div class="konsol-rec-head"><span class="konsol-rec-no">1</span><span class="konsol-rec-tag"></span></div><div class="konsol-rec-profiles"></div><div class="konsol-rec-meta"></div><button type="button" data-rec="0"></button></div><div class="konsol-rec-card"><div class="konsol-rec-head"><span class="konsol-rec-no">2</span><span class="konsol-rec-tag"></span></div><div class="konsol-rec-profiles"></div><div class="konsol-rec-meta"></div><button type="button" data-rec="1"></button></div></div><div id="konsolRecManual" class="konsol-rec-manual">Manuel profil seçimi aktif. Öneriler güncellenir ama seçtiğin IPE/NPI profilleri otomatik değiştirilmez.</div>';profileRow.insertAdjacentElement('afterend',wrap);wrap.querySelectorAll('[data-rec]').forEach(function(btn){btn.addEventListener('click',function(){applyOption(Number(btn.dataset.rec));updateRecommendations()})});['konsolLevelLoad','konsolArmLength','konsolBaseDepth','konsolHeight','konsolLevels','konsolUprightCount','konsolSpacing','konsolSide'].forEach(function(id){var node=e(id);if(node){node.addEventListener('input',updateRecommendations);node.addEventListener('change',updateRecommendations)}});['konsolUprightProfile','konsolArmProfile'].forEach(function(id){var node=e(id);if(node)node.addEventListener('change',function(){if(!applying){manual=true;syncManual()}})});updateRecommendations()}
 var previousRender=window.renderKonsol;window.renderKonsol=function(){if(typeof previousRender==='function')previousRender();setTimeout(enhance,0)};setTimeout(enhance,0);
})();
</script>`;

const bodyClose=html.lastIndexOf('</body>');
if(bodyClose<0)throw new Error('Konsol recommendations v7 body kapanışı bulunamadı.');
html=html.slice(0,bodyClose)+runtime+'\n'+html.slice(bodyClose);
for(const required of ['data-rafex-konsol-recommendations="v7"','ÖNERİLEN PROFİL SEÇENEKLERİ','EN EKONOMİK UYGUN','BİR ÜST GÜVENLİ','konsolRecommendationV7','if(n<=5){out.push(n);break}','rowCount=s.height<=3500?3:(s.height<=4500?4:5)']){
 if(!html.includes(required))throw new Error('Konsol recommendations v7 doğrulaması eksik: '+required);
}
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v7: iki profil önerisi, manuel değiştirme ve 2/3/4/5 ayak referans çapraz kesiti aktif.');

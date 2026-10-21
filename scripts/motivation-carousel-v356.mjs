import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./motivation-carousel-v356.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-motivation-carousel="v356"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v356 anchor '+a.slice(0,85));html=html.replace(a,b);};
 replace(' function forDay(serial){',` const proverbs=['Bir elin nesi var, iki elin sesi var.','Damlaya damlaya göl olur.','Birlikten kuvvet doğar.','İşleyen demir ışıldar.','Yalnız taş duvar olmaz.','Emek olmadan yemek olmaz.','Baş başa vermeyince taş yerinden kalkmaz.','Bakarsan bağ olur, bakmazsan dağ olur.','Bir el bir eli yıkar, iki el yüzü yıkar.','Akan su yosun tutmaz.','El el ile, değirmen yel ile.','Sabreden derviş muradına ermiş.'];
 function forDay(serial){`);
 replace('selected.push(pool.find(s=>!selected.includes(s)));','selected.push({text:proverbs[((serial%12)+12)%12],theme:2});');
 replace('root.dataset.day=String(serial);','root.dataset.day=String(serial);window.rafexMotivationCarouselV356?.sync(root);');
 const css='.rafex-daily-motivation-v355{min-height:150px}.rafex-daily-motivation-v355 ol{display:block;padding:0;list-style:none;min-height:90px}.rafex-daily-motivation-v355 li{display:none;padding:0;font:600 clamp(20px,1.6vw,28px)/1.5 Arial,sans-serif;letter-spacing:0}.rafex-daily-motivation-v355 li.active{display:block;animation:rafex-motivation-in-v356 .35s ease-out}.rafex-motivation-controls-v356{display:flex;align-items:center;gap:12px;margin-top:14px;color:#c5d9ce;font:12px Arial,sans-serif}.rafex-motivation-controls-v356 button{background:transparent;border:1px solid #ffffff40;border-radius:6px;padding:5px 10px;color:#edf5f0;cursor:pointer;font:12px Arial,sans-serif}@keyframes rafex-motivation-in-v356{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.rafex-daily-motivation-v355 li.active{animation:none}}';
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<style data-motivation-carousel="v356">'+css+'</style><script data-motivation-carousel="v356">'+runtime+'</script>'+html.slice(end);
}


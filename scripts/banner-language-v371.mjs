export function transform(html){
 if(html.includes('data-banner-language="v371"'))return html;
 const pattern=/<script data-rafex-uniform-system-banner="v95">([\s\S]*?)<\/script>/g;
 let found=0;
 html=html.replace(pattern,(tag,source)=>{
  found++;
  const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v371 banner anchor '+a.slice(0,90));source=source.replace(a,b);};
  replace("var label=common?'ORTAK ÇİZİM':(labels[key]||'ORTAK ÇİZİM');","var language=document.getElementById('programLanguage')?.value||document.documentElement.lang||'tr';\n    var commonTitles={tr:'ORTAK ÇİZİM',en:'COMBINED LAYOUT',fr:'IMPLANTATION COMBINÉE'};\n    var label=common?(commonTitles[language]||commonTitles.tr):(labels[key]||commonTitles.tr);");
  replace("    var clean=title&&hero.children.length===1&&title.textContent===label;", "    var bannerKey=common?'common':(key||'common');\n    if(hero.dataset.rafexSystemBanner!==bannerKey)hero.dataset.rafexSystemBanner=bannerKey;\n    if(title&&title.getAttribute('data-no-translate')!=='banner-v371')title.setAttribute('data-no-translate','banner-v371');\n    var clean=title&&hero.children.length===1&&title.textContent===label;");
  replace("    hero.innerHTML='<h2 data-rafex-system-banner-title>'+label+'</h2>';\n    hero.dataset.rafexSystemBanner=key||'common';", "    if(!title){title=document.createElement('h2');title.setAttribute('data-rafex-system-banner-title','');title.setAttribute('data-no-translate','banner-v371');}\n    if(title.textContent!==label)title.textContent=label;\n    if(hero.children.length!==1||hero.firstElementChild!==title)hero.replaceChildren(title);");
  replace("event.target.matches('input[name=\"rafexUnifiedSystem\"]')","(event.target.id==='programLanguage'||event.target.matches('input[name=\"rafexUnifiedSystem\"]'))");
  replace('  sync();setTimeout(sync,100);setTimeout(sync,500);',"  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});\n  sync();setTimeout(sync,100);setTimeout(sync,500);");
  return '<script data-rafex-uniform-system-banner="v95" data-banner-language="v371">'+source+'</script>';
 });
 if(found!==1)throw Error('v371 banner runtime count '+found);
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v371 body');
 return html.slice(0,end)+'<style data-banner-language="v371">#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"] h2{max-width:100%;white-space:normal;overflow-wrap:anywhere}@media(max-width:720px){#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"]{padding:14px 18px!important}}</style>'+html.slice(end);
}

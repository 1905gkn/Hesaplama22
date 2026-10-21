import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./daily-motivation-v355.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-daily-motivation="v355"'))return html;
 const before='<section class="welcome-hero"><p>RAFEX HESAPLAMA PORTALI</p><h2 translate="no">${esc(translatedUiText("Merhaba, " + name))}</h2><div class="welcome-date" translate="no">${esc(today)}</div></section>';
 if(html.split(before).length!==2)throw Error('v355 welcome anchor');
 html=html.replace(before,'<section class="welcome-hero"><div class="rafex-welcome-greeting-v355"><p>RAFEX HESAPLAMA PORTALI</p><h2 translate="no">${esc(translatedUiText("Merhaba, " + name))}</h2><div class="welcome-date" translate="no">${esc(today)}</div></div><aside class="rafex-daily-motivation-v355" translate="no" aria-labelledby="rafexMotivationTitleV355"><h3 id="rafexMotivationTitleV355">Günün motivasyonu</h3><ol></ol></aside></section>');
 const start=html.indexOf('async function renderHome() {'),end=html.indexOf('\n        try {',start);if(start<0||end<0)throw Error('v355 home render');
 html=html.slice(0,end)+'\n        window.rafexDailyMotivationV355?.refresh();'+html.slice(end);
 const css='.welcome-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:28px}.rafex-welcome-greeting-v355{min-width:0}.rafex-daily-motivation-v355{min-width:0;border-left:1px solid #ffffff30;padding-left:28px}.rafex-daily-motivation-v355 h3{margin:0 0 12px;color:#f4d445;font:800 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.rafex-daily-motivation-v355 ol{margin:0;padding-left:20px;display:grid;gap:8px}.rafex-daily-motivation-v355 li{padding-left:4px;color:#f2f7f4;font:400 13px/1.5 Arial,sans-serif}.rafex-daily-motivation-v355 li::marker{color:#f4d445;font-weight:700}@media(max-width:850px){.welcome-hero{grid-template-columns:1fr;gap:22px}.rafex-daily-motivation-v355{border-left:0;border-top:1px solid #ffffff30;padding:20px 0 0}}';
 const body=html.lastIndexOf('</body>');if(body<0)throw Error('v355 body');
 return html.slice(0,body)+'<style data-daily-motivation="v355">'+css+'</style><script data-daily-motivation="v355">'+runtime+'</script>'+html.slice(body);
}


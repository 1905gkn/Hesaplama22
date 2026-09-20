import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-drawing-catalog="v158"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v158 anchor missing: '+from.slice(0,90));html=html.replace(from,to);};
 for(const marker of ['project-records="v156"','project-start="v157"']){
  const re=new RegExp('<script data-'+marker+'>[\\s\\S]*?<\\/script>');
  if(!re.test(html))throw Error('Missing runtime '+marker);html=html.replace(re,'');
 }
 replace("const result=await req('/api/projects',{cache:'no-store'});","const response=await req('/api/drawing-projects',{cache:'no-store'}); const result={projects:response.projects.map(p=>({id:p.id,serial_no:p.id,project_name:p.name,payload:{rackTypes:p.rackTypes}}))};");
 replace('function switchScreen(next) {',`let switching=false;
  async function switchScreen(next) {
    if(switching)return;
    if(next==='layout'&&screen!=='layout'){
      switching=true;
      const button=document.getElementById('rafexOpenLayoutScreen');if(button)button.disabled=true;
      let saved=false;
      try{saved=await window.rafexSaveDrawingCatalogV158();}
      finally{switching=false;if(button)button.disabled=false;}
      if(!saved)return;
    }`);
 html=html.replaceAll('Kayıtlı projelerini Proje Geçmişi düğmesinden açabilirsin.','Önceki raf tiplerini proje no ve adına göre Eski projeden raf tipi kopyala bölümünden seçebilirsin.');
 html=html.replaceAll('Raf tipini kaydeder. Yerleşimdeki raflar ve çizim, “Projeyi Kaydet” ile kaydedilir.','Raf tipini kaydeder. Serbest Yerleşim Alanı’na geçerken tipler proje numarana otomatik kaydedilir.');
 const end=html.lastIndexOf('</body>');
 return html.slice(0,end)+'<script data-drawing-catalog="v158">'+fs.readFileSync(new URL('./drawing-catalog-v158.js',import.meta.url),'utf8')+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-drawing-catalog-v158.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

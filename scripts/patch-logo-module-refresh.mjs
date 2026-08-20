import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'data-rafex-module-refresh="v1"';
if (!html.includes(marker)) {
  const patch = `<style ${marker}>
.rafex-module-refresh{width:100%;padding:0;background:transparent;color:#fff;border:0;border-radius:11px;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer}
.rafex-module-refresh .side-logo{pointer-events:none}
.rafex-module-refresh-label{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:7px 9px;border-radius:8px;background:#ffffff12;color:#d7e1da;font-size:10px;font-weight:800;letter-spacing:.03em;transition:background .16s ease,color .16s ease}
.rafex-module-refresh:hover .rafex-module-refresh-label,.rafex-module-refresh:focus-visible .rafex-module-refresh-label{background:#ffffff20;color:var(--y)}
.rafex-module-refresh:focus-visible{outline:2px solid var(--y);outline-offset:3px}
.mobile-app-logo.rafex-module-refresh-mobile{cursor:pointer}
</style>
<script ${marker}>
(function(){
  function reloadModule(){
    window.location.reload();
  }
  function activateModuleRefresh(){
    const brand=document.querySelector('.side-brand');
    const logo=brand?.querySelector('.side-logo');
    if(brand&&logo&&!brand.querySelector('.rafex-module-refresh')){
      const button=document.createElement('button');
      button.type='button';
      button.className='rafex-module-refresh';
      button.title='Modülü Yenile';
      button.setAttribute('aria-label','Modülü Yenile');
      brand.insertBefore(button,logo);
      button.appendChild(logo);
      const label=document.createElement('span');
      label.className='rafex-module-refresh-label';
      label.textContent='↻ Modülü Yenile';
      button.appendChild(label);
      button.addEventListener('click',reloadModule);
    }

    const mobileLogo=document.querySelector('.mobile-app-logo');
    if(mobileLogo&&!mobileLogo.dataset.rafexModuleRefresh){
      mobileLogo.dataset.rafexModuleRefresh='1';
      mobileLogo.classList.add('rafex-module-refresh-mobile');
      mobileLogo.title='Modülü Yenile';
      mobileLogo.setAttribute('aria-label','Modülü Yenile');
      mobileLogo.setAttribute('role','button');
      mobileLogo.tabIndex=0;
      mobileLogo.addEventListener('click',reloadModule);
      mobileLogo.addEventListener('keydown',(event)=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          reloadModule();
        }
      });
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',activateModuleRefresh,{once:true});
  else activateModuleRefresh();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + patch + html.slice(bodyEnd);
}

if (!html.includes(marker) || !html.includes('Modülü Yenile')) {
  throw new Error("Rafex logo Modülü Yenile kontrolü eklenemedi.");
}

fs.writeFileSync(portalPath, html);
console.log("Rafex logosu yeniden Modülü Yenile kontrolü olarak etkinleştirildi.");

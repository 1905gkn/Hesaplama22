import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html
  .replace(/<style data-rafex-system-input-shell="v23">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-system-input-shell="v23">[\s\S]*?<\/script>/g, '');

const css = String.raw`
<style data-rafex-system-input-shell="v23">
#page.rafex-system-input-shell{
  --rafex-shell-form:420px;
  --rafex-shell-gap:16px;
  --rafex-shell-green:#173f31;
  --rafex-shell-yellow:#f6c900;
}
#page.rafex-system-input-shell .rafex-system-workspace{
  width:min(1500px,calc(100% - 24px));
  margin:12px auto 0;
  display:grid!important;
  grid-template-columns:minmax(360px,var(--rafex-shell-form)) minmax(0,1fr)!important;
  gap:var(--rafex-shell-gap)!important;
  align-items:start;
}
#page.rafex-system-input-shell .rafex-system-form-card,
#page.rafex-system-input-shell .rafex-system-visual-card{
  min-width:0;
  width:100%!important;
  margin:0!important;
  border:1px solid #d7dfda;
  border-radius:14px;
  background:#fff;
  overflow:hidden;
  box-sizing:border-box;
}
#page.rafex-system-input-shell .b2b-input-head,
#page.rafex-system-input-shell .mr-panel-head,
#page.rafex-system-input-shell .rafex-system-card-head{
  padding:14px 16px!important;
  background:linear-gradient(135deg,#5b0d18,#431018)!important;
  color:#fff!important;
  border:0!important;
}
#page.rafex-system-input-shell .b2b-input-body,
#page.rafex-system-input-shell .mr-form,
#page.rafex-system-input-shell .rafex-system-card-body{
  padding:14px!important;
  display:grid;
  gap:11px;
}
#page.rafex-system-input-shell .b2b-field-row,
#page.rafex-system-input-shell .mr-form-row,
#page.rafex-system-input-shell .m2-form-row{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:10px!important;
}
#page.rafex-system-input-shell input,
#page.rafex-system-input-shell select{
  max-width:100%;
  min-height:42px;
  box-sizing:border-box;
}

/* B2B: Serbest Cizim'in global display:block kuralindan sonra da iki kolon. */
#page.rafex-system-input-shell.b2b-mode .m2-layout{
  display:grid!important;
  grid-template-columns:minmax(360px,var(--rafex-shell-form)) minmax(0,1fr)!important;
}
#page.rafex-system-input-shell.b2b-mode .b2b-input-card{grid-column:1;display:block!important}
#page.rafex-system-input-shell.b2b-mode .m2-config-card{
  grid-column:2;display:block!important;position:relative!important;top:auto!important;
}
#page.rafex-system-input-shell.b2b-mode .m2-config-card>.card-title,
#page.rafex-system-input-shell.b2b-mode .m2-config-card>.m2-form,
#page.rafex-system-input-shell.b2b-mode .m2-config-card>.m2-metrics,
#page.rafex-system-input-shell.b2b-mode .m2-config-card>.m2-plan,
#page.rafex-system-input-shell.b2b-mode .m2-config-card>.m2-glb-parts{display:none!important}
#page.rafex-system-input-shell.b2b-mode .m2-config-card .m2-view-tabs,
#page.rafex-system-input-shell.b2b-mode .m2-config-card .m2-export{display:flex!important}
#page.rafex-system-input-shell.b2b-mode .m2-config-card .m2-view{min-height:620px}
#page.rafex-system-input-shell.b2b-mode .m2-config-card .b2b-main-3d-viewer{display:block!important}

/* MR: ayni kolon ve panel olculeri, MR'ye ait alanlar korunur. */
#page.rafex-system-input-shell.mr-mode .mr-workspace,
#page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-workspace{
  grid-template-columns:minmax(360px,var(--rafex-shell-form)) minmax(0,1fr)!important;
  grid-template-rows:auto auto;
}
#page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-panel{grid-column:1;grid-row:1}
#page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-view-card{grid-column:2;grid-row:1 / span 2;min-height:680px}
#page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-parts-panel{grid-column:1;grid-row:2}

/* Mekik: mevcut form ve cizimleri ayni ortak kabukta iki panele ayirir. */
#page.rafex-system-input-shell .rafex-mekik-shell{
  grid-column:1 / -1;
  display:grid!important;
  grid-template-columns:minmax(360px,var(--rafex-shell-form)) minmax(0,1fr)!important;
  gap:var(--rafex-shell-gap)!important;
  border:0!important;
  background:transparent!important;
  overflow:visible!important;
}
#page.rafex-system-input-shell .rafex-mekik-form-card{grid-column:1}
#page.rafex-system-input-shell .rafex-mekik-visual-card{grid-column:2;min-height:680px}
#page.rafex-system-input-shell .rafex-mekik-visual-card>.m2-view{min-height:520px}

#page.rafex-system-input-shell .rafex-system-savebar{
  width:min(1500px,calc(100% - 24px));margin:14px auto 18px;
}
#page.rafex-system-input-shell .rafex-system-savebar button{
  width:100%!important;min-height:62px!important;margin:0!important;border-radius:12px!important;
  background:var(--rafex-shell-yellow)!important;color:#121212!important;
  font-size:17px!important;font-weight:900!important;border:1px solid #d3ad00!important;
}
@media(max-width:1100px){
  #page.rafex-system-input-shell .rafex-system-workspace,
  #page.rafex-system-input-shell.b2b-mode .m2-layout,
  #page.rafex-system-input-shell.mr-mode .mr-workspace,
  #page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-workspace,
  #page.rafex-system-input-shell .rafex-mekik-shell{grid-template-columns:1fr!important}
  #page.rafex-system-input-shell .rafex-system-form-card,
  #page.rafex-system-input-shell .rafex-system-visual-card,
  #page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-panel,
  #page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-view-card,
  #page.rafex-system-input-shell[data-rafex-system-shell="mr"] .mr-parts-panel{grid-column:1!important;grid-row:auto!important}
}
@media(max-width:650px){
  #page.rafex-system-input-shell .b2b-field-row,
  #page.rafex-system-input-shell .mr-form-row,
  #page.rafex-system-input-shell .m2-form-row{grid-template-columns:1fr!important}
}
</style>`;

const js = String.raw`
<script data-rafex-system-input-shell="v23">
(()=>{
  const page=()=>document.getElementById('page');
  const systemOf=p=>{
    if(p.classList.contains('mr-mode')||p.querySelector('#mrCanvas'))return 'mr';
    if(p.classList.contains('b2b-mode')||p.dataset.freeSystem==='b2b'||p.querySelector('#b2bMain3DCanvas'))return 'b2b';
    if(p.querySelector('#m2Top')&&p.querySelector('#m2Front'))return 'mekik';
    return '';
  };
  const moveAll=(nodes,target)=>nodes.forEach(n=>n&&target.appendChild(n));
  const saveBar=(p,system,workspace)=>{
    const button=p.querySelector(system==='mr'?'#mrSaveRackButton':'#m2SaveRackButton');
    if(!button)return;
    let bar=p.querySelector('.rafex-system-savebar');
    if(!bar){bar=document.createElement('div');bar.className='rafex-system-savebar';(workspace||p.lastElementChild)?.after(bar)}
    if(button.parentElement!==bar)bar.appendChild(button);
  };
  const b2b=p=>{
    const work=p.querySelector('.m2-layout'),form=p.querySelector('.b2b-input-card'),visual=p.querySelector('.m2-config-card');
    if(!work||!form||!visual)return;
    work.classList.add('rafex-system-workspace');form.classList.add('rafex-system-form-card');
    visual.classList.add('rafex-system-visual-card');visual.hidden=false;
    saveBar(p,'b2b',work);
  };
  const mekik=p=>{
    const work=p.querySelector('.m2-layout'),card=work?.querySelector(':scope > .card:not(.b2b-input-card)');
    if(!work||!card)return;
    work.classList.add('rafex-system-workspace');card.classList.add('rafex-mekik-shell');
    let left=card.querySelector(':scope > .rafex-mekik-form-card');
    if(!left){
      left=document.createElement('section');left.className='rafex-system-form-card rafex-mekik-form-card';
      const head=document.createElement('div');head.className='rafex-system-card-head';head.innerHTML='<strong>Mekik Hesap Girdileri</strong>';
      const body=document.createElement('div');body.className='rafex-system-card-body';left.append(head,body);card.prepend(left);
      moveAll([...card.children].filter(n=>n!==left&&n.matches('.card-title,.m2-form,.m2-metrics,.m2-plan')),body);
    }
    let right=card.querySelector(':scope > .rafex-mekik-visual-card');
    if(!right){right=document.createElement('section');right.className='rafex-system-visual-card rafex-mekik-visual-card';card.append(right)}
    moveAll([...card.children].filter(n=>n!==left&&n!==right&&n.matches('.m2-export,.m2-view-tabs,.m2-view,.m2-glb-parts')),right);
    saveBar(p,'mekik',work);
  };
  const mr=p=>{
    const work=p.querySelector('.mr-workspace'),form=p.querySelector('.mr-panel'),visual=p.querySelector('.mr-view-card');
    if(!work||!form||!visual)return;
    work.classList.add('rafex-system-workspace');form.classList.add('rafex-system-form-card');visual.classList.add('rafex-system-visual-card');
    const formBody=form.querySelector('.mr-form')||form;
    ['.mr-accessory-area','.mr-block-panel'].forEach(s=>{const n=p.querySelector(s);if(n&&!form.contains(n))formBody.append(n)});
    saveBar(p,'mr',work);
  };
  let queued=false;
  const adapters={b2b,mekik,mr};
  const apply=()=>{
    queued=false;const p=page();if(!p)return;const system=systemOf(p);
    if(!system)return p.classList.remove('rafex-system-input-shell');
    p.classList.add('rafex-system-input-shell');p.dataset.rafexSystemShell=system;
    adapters[system](p);
  };
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(apply)}};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',schedule,true);document.addEventListener('change',schedule,true);
  window.rafexApplyUnifiedSystemShell=schedule;
  window.rafexRegisterSystemShell=(name,handler)=>{if(name&&typeof handler==='function')adapters[name]=handler;schedule()};
  schedule();
})();
</script>`;

html = html.replace('</body>', `${css}${js}</body>`);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Applied unified B2B/MR/Mekik system input shell v23');

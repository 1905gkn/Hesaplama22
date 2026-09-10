(function(){
  let active=null,scheduled=0;
  const lockedNodes=new Set();
  const common=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
  const unlocked=()=>Boolean(active&&active.uuid===window.rafexProjectIdentityV133?.uuid);
  window.rafexCanEditProjectV134=()=>!common()||unlocked();
  window.rafexActivateProjectV134=function(identity){
    active=identity||null;
    if(active&&!active.displayNumber)active.displayNumber='P-'+active.uuid.replaceAll('-','').slice(0,12).toUpperCase();
    schedule();
  };
  window.rafexOpenHistoryProjectV134=function(id){
    const project=projects.find(item=>Number(item.id)===Number(id));
    if(!project?.payload?.layout)return;
    document.getElementById('historyModal')?.classList.remove('open');
    m2OpeningProjectFromHistory=true;
    try{showPage('free');m2ApplyProjectRecord(project,false);}finally{m2OpeningProjectFromHistory=false;}
    schedule();
  };
  const style=document.createElement('style');style.textContent=`
    [data-rafex-project-locked="1"]{opacity:.55;pointer-events:none!important;user-select:none}
    #rafexProjectNumberV134{flex:0 0 auto;display:grid;gap:3px;align-self:center;padding:5px 9px;border:1px solid #b3c8ba;border-radius:7px;background:#fff;color:#214f3b;font:800 12px Arial;white-space:nowrap}
    #rafexProjectNumberV134 small{font-size:9px;color:#68796e}
    #rafexProjectGateHintV134{margin:0 0 12px;padding:10px 12px;border:1px solid #d5ba6e;border-radius:8px;background:#fff8e3;color:#665017;font:600 12px Arial}
    #rafexProjectGateHintV134[hidden]{display:none}
    @media(max-width:720px){#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap{height:auto!important;max-height:none!important;flex-wrap:wrap}#page .rafex-common-project-name-field{flex-basis:100%}}
  `;document.head.appendChild(style);
  function mark(node,locked){
    if(locked){if(!lockedNodes.has(node)){lockedNodes.add(node);node.inert=true;node.dataset.rafexProjectLocked='1';}}
    else if(lockedNodes.delete(node)){node.inert=false;delete node.dataset.rafexProjectLocked;}
  }
  function sync(){
    scheduled=0;
    const page=document.getElementById('page'),isCommon=common();
    for(const node of lockedNodes)if(!node.isConnected||!isCommon)mark(node,false);
    if(!page||!isCommon)return;
    const wrap=page.querySelector('.rafex-common-project-name-wrap'),button=document.getElementById('rafexNewProjectV133'),name=document.getElementById('rafexAuthorityProjectName');
    if(wrap&&button){
      let badge=document.getElementById('rafexProjectNumberV134');
      if(!badge){badge=document.createElement('div');badge.id='rafexProjectNumberV134';badge.innerHTML='<small>PROJE NO</small><span></span>';}
      if(button.previousElementSibling!==badge)button.insertAdjacentElement('beforebegin',badge);
      const number=unlocked()?active.displayNumber:'—';
      if(badge.lastElementChild.textContent!==number)badge.lastElementChild.textContent=number;
      badge.title=unlocked()?active.uuid:'Proje henüz açılmadı';
      let hint=document.getElementById('rafexProjectGateHintV134');
      if(!hint){hint=document.createElement('p');hint.id='rafexProjectGateHintV134';hint.textContent='Başlamak için proje adını yazıp Yeni proje aç düğmesine bas. Kayıtlı bir projeyi Proje Geçmişi veya aşağıdaki Kayıtlı Projeler listesinden açabilirsin.';}
      if(wrap.nextElementSibling!==hint)wrap.insertAdjacentElement('afterend',hint);
      hint.hidden=unlocked();
      if(name){name.required=true;if(!name.dataset.rafexNameValidationV134){name.dataset.rafexNameValidationV134='1';name.addEventListener('input',()=>name.setCustomValidity(''));}}
    }
    const allowed=[wrap,document.getElementById('rafexProjectGateHintV134'),document.getElementById('m2ProjectList')].filter(Boolean);
    function visit(node){
      if(allowed.some(item=>item===node)){mark(node,false);return;}
      if(allowed.some(item=>node.contains(item))){mark(node,false);for(const child of node.children)visit(child);return;}
      // Keep headings readable; only interactive portions need inert/disabled visuals.
      if(node.matches('button,input,select,textarea,svg')||node.querySelector('button,input,select,textarea,svg'))mark(node,!unlocked());
    }
    for(const child of page.children)visit(child);
    if(unlocked())for(const node of lockedNodes)mark(node,false);
  }
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(sync);}
  window.rafexSyncProjectGateV134=sync;
  function allowedTarget(target){return target?.closest?.('.rafex-common-project-name-wrap,#m2ProjectList,#rafexProjectGateHintV134,#historyModal');}
  // Capture also covers shortcuts and the short interval before a rebuilt
  // editor has received inert attributes. No global registry writes are made.
  for(const type of ['click','pointerdown','keydown','change','input','drop'])document.addEventListener(type,event=>{
    if(!common()||unlocked())return;
    const target=event.target;
    if(allowedTarget(target))return;
    const inPage=target?.closest?.('#page');
    const shortcut=type==='keydown'&&!target?.closest?.('#nav')&&(event.ctrlKey||event.metaKey||['o','O','Delete','Backspace'].includes(event.key));
    if(inPage||shortcut){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  // Leaving Common ends its editing authorization; opening a saved record
  // explicitly activates that record again through m2ApplyProjectRecord.
  document.addEventListener('click',event=>{
    const nav=event.target.closest?.('#nav button[data-page]');
    if(nav&&nav.dataset.page!=='free'&&common()){active=null;window.rafexProjectIdentityV133=null;window.rafexProjectTypesV133=null;}
    if(nav||event.target.closest?.('.rafex-system-option,#rafexUnifiedContinue')){schedule();setTimeout(schedule,250);setTimeout(schedule,1000);}
  },true);
  const render=m2RenderLayout;
  m2RenderLayout=function(){const result=render.apply(this,arguments);schedule();return result;};window.m2RenderLayout=m2RenderLayout;
  const navigate=showPage;
  showPage=function(name){
    if((name!=='free'&&common())||(name==='free'&&!common())){active=null;window.rafexProjectIdentityV133=null;window.rafexProjectTypesV133=null;}
    const result=navigate.apply(this,arguments);schedule();return result;
  };window.showPage=showPage;
  // Observe editor replacement only, not thousands of SVG descendants.
  const page=document.getElementById('page');if(page)new MutationObserver(schedule).observe(page,{childList:true});
  window.addEventListener('rafex-authority-state',schedule);
  schedule();
})();

import fs from 'node:fs';

const marker='data-rafex-phone-readability="v441"';
function phoneRuntime(){
 const phone=matchMedia('(max-width:760px)');
 function install(){
  if(!phone.matches)return;
  const tabs=document.getElementById('mobileTabs');if(!tabs||tabs.querySelector('[data-phone-notes]'))return;
  const button=document.createElement('button');button.type='button';button.dataset.phoneNotes='1';button.innerHTML='<b aria-hidden="true">▤</b><span>Notlar</span>';button.setAttribute('aria-label','Notlarıma git');
  button.onclick=()=>{if(typeof showPage==='function')showPage('home');if(typeof closeMobileMenu==='function')closeMobileMenu();requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelector('.todo-card')?.scrollIntoView({behavior:'smooth',block:'start'})))};
  tabs.insertBefore(button,tabs.lastElementChild);
 }
 install();phone.addEventListener('change',install);
}
export function transform(html){
 if(html.includes(marker))return html;
 // v30 only affected touch devices. Desktop viewport and layout are retained.
 html=html.replace(/<script\s+data-rafex-mobile-desktop-view="v30"[^>]*>[\s\S]*?<\/script>/g,'').replace(/<style\s+data-rafex-mobile-desktop-style="v30"[^>]*>[\s\S]*?<\/style>/g,'');
 const css=`<style ${marker}>
@media screen and (max-width:760px){
 html,body{min-width:0!important;width:100%!important;max-width:100%!important;overflow-x:clip!important;overflow-y:visible!important;-webkit-text-size-adjust:100%;text-size-adjust:100%}
 body{font-size:15px;line-height:1.5;padding-bottom:calc(76px + env(safe-area-inset-bottom))!important}
 .shell{display:block!important;min-width:0!important;grid-template-columns:minmax(0,1fr)!important}
 .content{width:100%!important;min-width:0!important;max-width:100%!important;overflow-x:clip!important}
 .page{padding:14px 12px 24px!important;min-width:0!important;max-width:100%!important}
 button{min-height:44px;font-size:14px;line-height:1.3}
 button:focus-visible,a:focus-visible{outline:3px solid #c69a16;outline-offset:3px}
 input:not([type=checkbox]):not([type=radio]),select,textarea{font-size:16px!important;line-height:1.4;min-height:46px;max-width:100%;border-radius:10px}
 input[type=checkbox],input[type=radio]{width:20px;height:20px;flex-shrink:0;accent-color:#214f3b}
 .field,.input-field,#page .b2b-field{font-size:13px!important;line-height:1.45}
 html body .shell>.side{position:fixed!important;inset:0 auto 0 0!important;z-index:1200!important;width:min(320px,88vw)!important;max-width:min(320px,88vw)!important;height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;display:block!important;transform:translateX(-110%)!important;padding:20px 14px calc(24px + env(safe-area-inset-bottom))!important;box-shadow:8px 0 35px #17201b30}
 html body .shell>.side.mobile-open{transform:translateX(0)!important}
 .side .side-brand img{width:140px!important;max-height:60px!important;object-fit:contain}
 .side.mobile-open{transform:translateX(0)!important}
 .side .nav{display:grid!important;gap:5px;overflow:visible!important;margin-top:16px}
 .side .nav button{width:100%!important;min-width:0!important;min-height:48px!important;padding:12px!important;font-size:15px!important;white-space:normal;text-align:left}
 .side .userbox{position:static!important;display:block!important;margin-top:18px;padding:14px!important;font-size:14px}
 .side .userbox .logout{width:100%!important;margin-top:12px;min-height:44px}
 .mobile-scrim{position:fixed!important;inset:0!important;z-index:1190!important;background:#10251db3!important;display:none!important}
 .side.mobile-open ~ .mobile-scrim{display:block!important}
 .top{position:sticky!important;top:0!important;z-index:950!important;min-height:58px!important;height:auto!important;padding:10px 12px!important;gap:8px!important;flex-wrap:wrap!important;background:#fff!important;box-shadow:0 2px 12px #173c2d0d}
 .top h1{font-size:19px!important;line-height:1.25!important;flex:1;min-width:0;white-space:normal}
 .top-actions{display:flex!important;flex-flow:row wrap!important;max-width:100%!important;gap:7px!important;overflow:visible!important;align-items:center!important}
 .top-actions button{min-height:42px!important;padding:9px 11px!important;font-size:12px!important;white-space:normal}
 html body .shell .content>.top{display:grid!important;grid-template-columns:32px minmax(0,1fr)!important;grid-template-rows:32px auto!important;min-height:0!important;height:auto!important;max-height:none!important;align-items:center!important;flex-wrap:wrap!important}
 html body .top>img{grid-column:1;grid-row:1;width:32px!important;height:32px!important;object-fit:contain}
 html body .top h1{grid-column:2;grid-row:1;max-width:none!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important}
 html body .top .top-actions{grid-column:1/-1!important;grid-row:2!important;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(95px,1fr))!important;width:100%!important;min-width:0!important;max-width:100%!important;flex:none!important;overflow:visible!important}
 html body .top .top-actions button{width:100%!important;min-width:0!important;max-width:100%!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important}
 #installAppButton{position:static!important;inset:auto!important;transform:none!important;box-shadow:none!important;margin:0!important}
 #rafexVersionInfoCard{display:none!important}
 #mobileTabs{position:fixed!important;inset:auto 0 0!important;z-index:1100!important;display:flex!important;gap:2px!important;align-items:stretch!important;padding:6px 6px calc(6px + env(safe-area-inset-bottom))!important;background:#fff!important;border-top:1px solid #dbe5df;box-shadow:0 -4px 18px #173c2d0b}
 #mobileTabs button{flex:1 1 0;min-width:0!important;min-height:54px!important;padding:5px 2px!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11px!important;border-radius:10px;color:#365448;background:transparent}
 #mobileTabs button[hidden]{display:none!important}
 #mobileTabs button b{font-size:21px;line-height:1.1}
 #mobileTabs button span{font-size:11px!important;line-height:1.2;white-space:normal}
 #mobileTabs button.active{background:#e9f2ec;color:#173c2d}
 .hero{padding:20px 16px!important;border-radius:16px!important}
 .hero h2{font-size:24px!important;line-height:1.25}
 .hero>p{font-size:11px!important;line-height:1.5;letter-spacing:.08em}
 .card,.todo-card,.world-card{min-width:0!important;border-radius:14px!important;padding:16px!important}
 .dashboard-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-top:14px!important}
 .dashboard-grid>article,.dashboard-grid>.dashboard-card{min-width:0!important;min-height:0!important;padding:14px!important;border-radius:14px!important}
 .dashboard-grid>article:first-child,.dashboard-grid>.dashboard-card:first-child{grid-column:1/-1}
 .dashboard-grid small{font-size:11px!important}
 .dashboard-grid .metric{font-size:28px!important;line-height:1.2!important;margin:10px 0!important}
 .dashboard-grid p{font-size:13px!important;line-height:1.5!important;margin:6px 0 0!important}
 .dashboard-grid .dashboard-meta{font-size:12px!important;line-height:1.5!important}
 .calc-grid,.admin-grid,#page .m2-layout,#page.b2b-mode .m2-layout{grid-template-columns:minmax(0,1fr)!important;gap:14px!important}
 .form-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
 .summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
 .summary div{min-width:0;padding:12px 8px!important}
 .summary small{font-size:11px!important;white-space:normal}
 .summary b{font-size:21px!important}
 .todo-card{margin-top:16px!important;scroll-margin-top:125px}
 .todo-head{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:10px!important;padding-bottom:12px!important}
 .todo-head h3{font-size:21px!important;line-height:1.25!important;margin:5px 0!important}
 .todo-head small{font-size:10px!important;letter-spacing:.1em!important}
 #todoCount{font-size:13px!important}
 .note-summary-v412{width:100%!important;min-width:100%!important;flex:1 0 100%!important;display:flex!important;flex-wrap:wrap!important;gap:10px!important;align-items:center!important}
 #noteCountersV412{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;width:100%!important}
 #noteCountersV412>span{min-width:0!important;white-space:normal!important;display:flex!important;gap:8px!important;align-items:center!important;padding:10px!important}
 #noteCountersV412 strong{font-size:24px!important}
 #noteCountersV412>span>span{font-size:12px!important;line-height:1.4!important}
 #closedTodoToggle{font-size:12px!important;min-height:42px!important;max-width:100%}
 #rafexPushSettings{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;padding:14px 0!important}
 #rafexPushToggle{min-height:46px!important;width:100%;background:#eaf3ed;color:#173c2d;border:1px solid #c4d8cc;font-size:14px!important}
 #rafexPushStatus{font-size:13px!important;line-height:1.5;color:#53665b}
 .todo-form{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:9px!important}
 .note-compose-label{font-size:14px!important}
 #todoInput{width:100%!important;min-height:112px!important;padding:12px!important;font-size:16px!important}
 html body #app #page .todo-card form.todo-form .note-compose-footer{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important;align-items:stretch!important}
 html body #app #page .todo-card form.todo-form .note-compose-footer>*{grid-area:auto!important;grid-column:1/-1!important;min-width:0!important}
 .note-compose-footer>button{width:100%!important;min-height:48px!important;background:#214f3b;color:#fff;font-size:15px!important}
 .note-file-picker{min-width:0!important;max-width:100%!important;min-height:44px;gap:8px;flex-wrap:wrap;font-size:13px!important}
 .note-file-picker input[type=file]{min-width:0!important;width:100%!important;max-width:100%!important;min-height:36px;font-size:13px!important}
 .note-row-v405{padding:14px!important;gap:12px!important}
 .note-row-v405 header{display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important}
 .note-row-v405 .note-owner{font-size:13px!important;overflow-wrap:anywhere}
 .note-row-v405 .note-body{font-size:16px!important;line-height:1.6!important;overflow-wrap:anywhere}
 .note-row-v405 .note-state,.note-row-v405 .note-new-badge{font-size:12px!important;padding:5px 9px!important}
 .note-header-actions-v410{width:100%!important;gap:8px!important}
 .note-date-row-v410{display:flex!important;flex-wrap:wrap!important;gap:8px!important}
 .note-row-v405 header button{min-height:42px!important;font-size:13px!important}
 .note-row-v405 time{font-size:12px!important;line-height:1.5!important}
 .note-assignees,.note-owner-state,.note-completed{font-size:13px!important;line-height:1.6!important;overflow-wrap:anywhere}
 .note-row-v405 footer{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 .note-row-v405 footer button{min-width:0!important;min-height:44px!important;font-size:13px!important;white-space:normal}
 .note-row-v405 .note-file-actions-v410{display:contents!important}
 .note-row-v405 footer .note-file-picker,.note-shared-hint{grid-column:1/-1}
 .note-file{max-width:100%;overflow-wrap:anywhere}
 #rafexNoteDialogV405,.modal-card{width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important;max-height:calc(100dvh - 32px)!important;border-radius:16px!important;padding:16px!important;overflow:auto}
 #rafexNoteDialogV405 textarea{width:100%;font-size:16px!important;min-height:140px}
 #rafexNoteDialogV405 .note-users label{min-height:48px!important;font-size:14px!important;padding:10px!important}
 .world-head h3{font-size:20px!important}
 .world-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
 .world-clock{padding:14px!important;min-width:0}
 .world-clock small{font-size:11px!important}.world-clock b{font-size:23px!important}.world-clock span{font-size:11px!important}
 #page .b2b-input-card,#page .m2-input-card{position:static!important;max-height:none!important;min-width:0!important;width:100%!important}
 #page .b2b-input-body{max-height:none!important;overflow:visible!important;padding:14px!important}
 #page .b2b-field{min-width:0!important;margin-bottom:10px!important}
 #page .b2b-field button{min-height:44px!important;font-size:13px!important}
 #page .b2b-mode-row{grid-template-columns:130px minmax(0,1fr)!important;gap:8px!important}
 #page #b2bFootHeight:disabled{font-size:12px!important;padding:8px!important}
 #page .b2b-input-card small{font-size:11px!important;line-height:1.45!important}
 .m2-view,.m2-views,.b2b-viewer-card{min-width:0!important;max-width:100%!important}
 .m2-floor-tools,.m2-export-actions,.m2-view-header-tools{flex-wrap:wrap!important;gap:8px!important}
 .m2-floor-tools button,.m2-export-actions button{min-height:44px!important;font-size:13px!important}
 .m2-customize-dialog{width:calc(100vw - 16px)!important;max-height:calc(100dvh - 16px)!important;grid-template-columns:minmax(0,1fr)!important}
 .m2-customize-dialog label{font-size:13px!important}
 .m2-customize-dialog aside{padding:16px!important}
 .table,.admin-grid .card{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
}
@media screen and (max-width:360px){.form-grid{grid-template-columns:minmax(0,1fr)!important}.top-actions button{font-size:11px!important;padding:8px!important}}
@media screen and (min-width:761px){[data-phone-notes]{display:none!important}}
</style>`;
 const head=html.indexOf('</head>');if(head<0)throw Error('Missing document head');html=html.slice(0,head)+css+html.slice(head);
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing document body');
 return html.slice(0,end)+'<script data-rafex-phone-navigation="v441">('+phoneRuntime.toString()+')();</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/mobile-readability-v441.mjs')){
 const file='dist/index.html';fs.writeFileSync(file,transform(fs.readFileSync(file,'utf8')));console.log('Phone readability: responsive viewport, readable forms/notes and touch navigation; desktop styles retained.');
}

import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'data-rafex-mobile-responsive="v1"';
html = html.replace(/<style\s+data-rafex-mobile-responsive=["'][^"']+["'][^>]*>[\s\S]*?<\/style>/gi, "");

const style = `<style ${marker}>
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;width:100%;max-width:100%;overflow-x:hidden}
body{width:100%;max-width:100%;overflow-x:hidden;min-height:100dvh}
img,svg,canvas{max-width:100%}

@media(max-width:760px){
  html,body{overscroll-behavior-x:none}
  body{font-size:13px;padding-bottom:env(safe-area-inset-bottom)}
  button,a,input,select,textarea{touch-action:manipulation}
  input,select,textarea{font-size:16px!important}
  button{min-height:42px}

  .auth{min-height:100dvh;grid-template-columns:1fr!important}
  .auth-brand{display:none!important}
  .auth-side{min-height:100dvh;padding:max(16px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));align-items:center}
  .auth-card{width:100%;max-width:430px;padding:22px 18px;border-radius:14px}
  .auth-card h2{font-size:22px}
  .auth-card>p{margin-bottom:18px}
  .field{margin-top:11px}
  .field input,.language-field select{min-height:46px}
  .primary{min-height:48px;margin-top:16px}

  .shell{display:block!important;min-width:0;min-height:100dvh}
  .side{position:relative!important;top:auto!important;height:auto!important;min-height:0!important;padding:10px 10px 8px;padding-top:max(10px,env(safe-area-inset-top));overflow:visible!important}
  .side-brand{padding:2px 4px 8px}
  .side-logo{width:132px;max-height:48px;object-fit:contain}
  .nav{display:flex!important;gap:5px;margin-top:7px;padding-bottom:5px;overflow-x:auto!important;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
  .nav button{flex:0 0 auto;min-width:max-content!important;width:auto!important;margin:0!important;padding:9px 11px!important;white-space:nowrap;font-size:11px}
  .nav i{width:auto!important}
  .userbox{position:static!important;margin-top:5px;padding:8px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 8px;align-items:center}
  .userbox .program-language{grid-column:1/-1;margin:0;padding:0 0 6px;border-bottom:1px solid #ffffff1c}
  .userbox .logout{width:auto;margin:0;padding:8px 10px;min-height:38px}

  .content{min-width:0;width:100%;overflow-x:hidden}
  .top{position:sticky;top:0;z-index:900;height:auto!important;min-height:56px;padding:7px 10px!important;gap:8px;box-shadow:0 2px 8px #17201b12}
  .top h1{min-width:0;font-size:15px;line-height:1.15}
  .top-actions{max-width:58vw;display:flex;gap:5px;overflow-x:auto;-webkit-overflow-scrolling:touch}
  .top-actions button{flex:0 0 auto;min-height:38px;padding:7px 9px;font-size:10px;white-space:nowrap}
  .page{padding:10px!important;min-width:0}
  .hero{display:block;padding:16px;border-radius:12px}
  .hero h2{font-size:22px}
  .capacity{margin-top:12px;padding:10px 12px}
  .capacity b{font-size:22px}
  .calc-grid,.admin-grid,.dashboard-grid,.form-grid{grid-template-columns:1fr!important}
  .card{min-width:0;padding:12px;border-radius:11px}
  .card-title{align-items:flex-start;gap:8px}
  .summary{grid-template-columns:1fr!important}
  .summary div{padding:10px 12px;border-top:1px solid #ffffff20}
  .summary div:first-child{border-top:0}
  .dynrow{grid-template-columns:26px minmax(0,1fr) minmax(0,1fr) 32px;gap:5px;padding:7px}
  .table,.foot-system,.admin-grid .card{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
  .trow{min-width:320px}
  .foot-option{grid-template-columns:minmax(95px,1fr) auto!important;min-width:0}
  .foot-option>*{min-width:0}
  .foot-option>b:last-child{display:none}

  .m2-layout,#page.b2b-mode .m2-layout{grid-template-columns:1fr!important;gap:10px!important}
  .m2-input-card,.b2b-input-card{position:static!important;max-height:none!important;width:100%!important;min-width:0!important}
  .b2b-model-grid{grid-template-columns:1fr 1fr!important;gap:7px!important}
  .b2b-viewer-card{grid-template-columns:1fr!important;min-width:0!important}
  .m2-view-tabs{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .m2-view-tabs button{min-width:max-content;white-space:nowrap}
  .m2-views{height:auto!important;min-width:0!important}
  .m2-view{height:auto!important;min-height:560px!important;grid-template-rows:auto minmax(430px,1fr)!important}
  .m2-view header{height:auto!important;min-height:0!important;flex-wrap:wrap;padding:8px!important}
  .m2-view-header-tools,.m2-side-view-actions,.m2-shared-spacing-actions{width:100%;justify-content:flex-start!important;align-items:center!important;flex-wrap:wrap!important}
  .m2-canvas{height:430px!important;min-height:430px!important;touch-action:pan-x pan-y pinch-zoom}
  #page.b2b-mode [data-m2-view="front"]{min-height:520px!important}
  #page.b2b-mode .b2b-main-3d-canvas,.b2b-main-3d-viewer,.b2b-3d-loading{min-height:390px!important}
  .m2-export{grid-template-columns:1fr!important;gap:7px!important}
  .m2-export #m2SaveRackButton{grid-row:auto!important;grid-column:auto!important;width:100%!important}
  .m2-export-actions{grid-column:auto!important;display:grid!important;grid-template-columns:1fr 1fr;gap:6px}
  .m2-export-actions button{width:100%}

  .m2-layout-modal{padding:6px!important;align-items:stretch!important;overflow:hidden!important}
  .m2-customize-dialog{grid-template-columns:1fr!important;width:calc(100vw - 12px)!important;max-width:none!important;height:calc(100dvh - 12px)!important;max-height:none!important;border-radius:12px!important;overflow:auto!important;-webkit-overflow-scrolling:touch}
  .m2-customize-preview{min-height:250px!important;height:34dvh!important;max-height:310px!important;flex:0 0 auto}
  .m2-customize-dialog aside{display:block!important;max-height:none!important;overflow:visible!important;padding:12px!important;padding-bottom:max(20px,env(safe-area-inset-bottom))!important}
  .m2-customize-head,.m2-symbol-head{position:sticky;top:0;z-index:5;margin:-12px -12px 10px;padding:10px 12px;background:#fff;border-bottom:1px solid #e5ebe7}
  .m2-customize-head button,.m2-symbol-head button{min-width:42px;min-height:42px}
  #m2CustomizeAccessories,[data-rafex-customize-accessories="1"]{width:100%!important;margin:8px 0 12px!important;padding:10px!important}
  #m2CustomizeAccessories .m2-customize-accessory-head,[data-rafex-customize-accessories="1"] .m2-accessory-head{align-items:flex-start!important;flex-direction:column!important}
  #m2CustomizeAccessories .m2-customize-accessory-head>button,[data-rafex-customize-accessories="1"] .m2-accessory-head>button{width:100%!important;min-height:44px!important}
  #m2CustomizeAccessories .m2-customize-accessory-picker{grid-template-columns:1fr!important}
  #m2CustomizeAccessories .m2-customize-accessory-picker button{min-height:44px;font-size:11px!important}
  #m2CustomizeAccessories .m2-customize-accessory-levels{gap:6px!important}
  #m2CustomizeAccessories .m2-customize-accessory-levels button{min-width:42px!important;min-height:42px!important;padding:7px!important;font-size:10px!important}
  #m2CustomizeAccessories .m2-customize-accessory-tray{flex-wrap:wrap!important}
  #m2CustomizeAccessories .m2-customize-accessory-tray button{min-height:40px!important}
  .m2-accessory-row{grid-template-columns:1fr!important}
  .m2-accessory-row button{width:100%!important;min-height:42px!important}
  .m2-symbol-choices{grid-template-columns:1fr 1fr!important}
  .m2-spacing-sections,.m2-glb-part-grid{grid-template-columns:1fr!important}
  .m2-ortho-tools{align-items:stretch!important}
  .m2-ortho-tools .input-field{width:100%!important}
}

@media(max-width:430px){
  .top-actions{max-width:52vw}
  .hero h2{font-size:20px}
  .b2b-model-grid{grid-template-columns:1fr!important}
  .dynrow{grid-template-columns:24px minmax(0,1fr) 30px}
  .dynrow .input-field:nth-of-type(2){grid-column:2/3}
  .m2-export-actions{grid-template-columns:1fr}
  .m2-view{min-height:520px!important;grid-template-rows:auto minmax(380px,1fr)!important}
  .m2-canvas{height:390px!important;min-height:390px!important}
  .m2-customize-preview{height:30dvh!important;min-height:210px!important}
}
</style>`;

const headEnd = html.indexOf("</head>");
if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
html = html.slice(0, headEnd) + style + html.slice(headEnd);

fs.writeFileSync(portalPath, html);
console.log("Telefon görünümü optimize edildi.");

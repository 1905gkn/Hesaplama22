import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'data-rafex-mobile-desktop-view="v30"';
if (html.includes(marker)) {
  console.log("v30: Mobil masaustu gorunumu zaten mevcut.");
  process.exit(0);
}

const viewportRx = /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/i;
const viewport = '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=yes" />';
if (!viewportRx.test(html)) throw new Error("v30: viewport meta bulunamadi.");
html = html.replace(viewportRx, viewport);

const script = `<script ${marker}>
(function(){
  var DESKTOP_WIDTH=1366;
  var mq=window.matchMedia&&window.matchMedia('(pointer:coarse) and (max-device-width: 900px)');
  var isMobile=!!(mq&&mq.matches);
  if(!isMobile)return;
  var meta=document.querySelector('meta[name="viewport"]');
  if(!meta)return;
  function applyDesktopViewport(){
    var sw=Math.max(320,Math.min(screen.width||window.innerWidth||390,screen.height||window.innerHeight||844));
    if(window.matchMedia&&window.matchMedia('(orientation: landscape)').matches){
      sw=Math.max(screen.width||window.innerWidth||844,screen.height||window.innerHeight||390);
    }
    var scale=Math.max(0.2,Math.min(1,sw/DESKTOP_WIDTH));
    meta.setAttribute('content','width='+DESKTOP_WIDTH+',initial-scale='+scale+',minimum-scale=0.2,maximum-scale=3,user-scalable=yes,viewport-fit=cover');
    document.documentElement.setAttribute('data-rafex-mobile-desktop','1');
  }
  applyDesktopViewport();
  window.addEventListener('orientationchange',function(){setTimeout(applyDesktopViewport,120);},{passive:true});
})();
</script>`;

const headEnd = html.indexOf("</head>");
if (headEnd < 0) throw new Error("v30: </head> bulunamadi.");
html = html.slice(0, headEnd) + script + html.slice(headEnd);

const style = `<style data-rafex-mobile-desktop-style="v30">
html[data-rafex-mobile-desktop="1"],html[data-rafex-mobile-desktop="1"] body{min-width:1366px!important;overflow-x:auto!important;-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}
html[data-rafex-mobile-desktop="1"] .shell{min-width:1366px!important}
html[data-rafex-mobile-desktop="1"] .content{min-width:1126px!important;overflow:visible!important}
html[data-rafex-mobile-desktop="1"] img,html[data-rafex-mobile-desktop="1"] svg,html[data-rafex-mobile-desktop="1"] canvas{max-width:none}
html[data-rafex-mobile-desktop="1"] #m2LayoutSvg{touch-action:none}
</style>`;
html = html.replace("</head>", style + "</head>");

if(!html.includes(marker)||!html.includes('data-rafex-mobile-desktop-style="v30"')) throw new Error("v30: mobil masaustu gorunumu dogrulanamadi.");
fs.writeFileSync(portalPath, html);
console.log("v30: Telefonda masaustu web gorunumu aktif: 1366px desktop viewport, ekrana sigan baslangic olcegi ve pinch zoom korunuyor.");

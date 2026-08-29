import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Mekik GLB front v94: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<script\s+data-rafex-mekik-main-front="v93">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-glb-front="v94">[\s\S]*?<\/script>\s*/g, "");

const mainParts = [["brace",1541.4,1571.4,-134.8,-94.8],["brace",1541.4,1571.4,-5534.8,-5494.8],["brace",1541.4,1571.4,-5984.8,-5944.8],["brace",91.4,121.4,-5984.8,-5944.8],["brace",91.4,121.4,-5534.8,-5494.8],["brace",91.4,121.4,-134.8,-94.8],["bracket",1273.4,1408.4,-2294.8,-2044.8],["bracket",1273.4,1408.4,-3794.8,-3544.8],["bracket",1273.4,1408.4,-5294.8,-5044.8],["bracket",1273.4,1408.4,-794.8,-544.8],["tube",1511.4,1570.4,-5972.8,-5956.8],["tube",61.4,120.4,-5972.8,-5956.8],["rail",1269.4,1391.4,-2300.8,-2110.6],["rail",1269.4,1391.4,-3800.8,-3610.6],["rail",1269.4,1391.4,-5300.8,-5110.6],["rail",1269.4,1391.4,-800.8,-610.6],["bracket",224.4,359.4,-2294.8,-2044.8],["bracket",224.4,359.4,-3794.8,-3544.8],["bracket",224.4,359.4,-5294.8,-5044.8],["bracket",224.4,359.4,-794.8,-544.8],["upright",1491.4,1591.3,-6036.8,-36.8],["upright",41.4,141.3,-6036.8,-36.8],["tube",1511.4,1570.4,-5522.8,-5506.8],["tube",1511.4,1570.4,-122.8,-106.8],["tube",61.4,120.4,-122.8,-106.8],["tube",61.4,120.4,-5522.8,-5506.8],["upright",1470.9,1611.9,-90.8,-30.8],["upright",20.9,161.9,-90.8,-30.8],["traverse",103.4,145.4,-2271.8,-2031.8],["traverse",1487.4,1529.4,-2271.8,-2031.8],["traverse",145.4,1487.4,-2086.8,-2036.8],["traverse",103.4,145.4,-3771.8,-3531.8],["traverse",1487.4,1529.4,-3771.8,-3531.8],["traverse",145.4,1487.4,-3586.8,-3536.8],["traverse",103.4,145.4,-5271.8,-5031.8],["traverse",1487.4,1529.4,-5271.8,-5031.8],["traverse",145.4,1487.4,-5086.8,-5036.8],["traverse",1487.4,1529.4,-771.8,-531.8],["traverse",103.4,145.4,-771.8,-531.8],["traverse",145.4,1487.4,-586.8,-536.8],["rail",241.4,363.4,-2300.8,-2110.6],["rail",241.4,363.4,-3800.8,-3610.6],["rail",241.4,363.4,-5300.8,-5110.6],["rail",241.4,363.4,-800.8,-610.6],["brace",1511.4,1541.4,-742.3,-87.2],["brace",1541.4,1571.4,-1342.4,-687.2],["brace",1541.4,1571.4,-2542.4,-1887.2],["brace",1541.4,1571.4,-3742.4,-3087.2],["brace",1541.4,1571.4,-4942.4,-4287.2],["brace",1511.4,1541.4,-1942.3,-1287.2],["brace",1511.4,1541.4,-3142.3,-2487.2],["brace",1511.4,1541.4,-4342.3,-3687.2],["brace",1511.4,1541.4,-5542.3,-4887.2],["brace",91.4,121.4,-1342.4,-687.2],["brace",61.4,91.4,-742.3,-87.2],["brace",61.4,91.4,-3142.3,-2487.2],["brace",91.4,121.4,-2542.4,-1887.2],["brace",91.4,121.4,-3742.4,-3087.2],["brace",91.4,121.4,-4942.4,-4287.2],["brace",61.4,91.4,-1942.3,-1287.2],["brace",61.4,91.4,-5542.3,-4887.2],["brace",61.4,91.4,-4342.3,-3687.2],["box",247.4,1047.4,-4781.3,-3981.2],["box",247.4,1047.4,-3273.1,-2473.0],["box",247.4,1047.4,-1783.6,-983.4],["box",247.4,1047.4,-6277.1,-5476.9],["pallet",247.4,1047.4,-2460.7,-2294.5],["pallet",247.4,1047.4,-3968.9,-3802.7],["pallet",247.4,1047.4,-5464.6,-5298.4],["pallet",247.4,1047.4,-965.0,-798.8]];
const traversParts = [["bracket",1273.4,1408.4,-3794.8,-3544.8],["bracket",224.4,359.4,-3794.8,-3544.8],["traverse",1487.4,1529.4,-3771.8,-3531.8],["traverse",103.4,145.4,-3771.8,-3531.8],["traverse",145.4,1487.4,-3586.8,-3536.8]];

const runtime = `<script data-rafex-mekik-glb-front="v94">(function(){
  if(window.__rafexMekikGlbFrontV94)return;
  window.__rafexMekikGlbFrontV94=true;
  var MAIN=${JSON.stringify(mainParts)};
  var TRAV=${JSON.stringify(traversParts)};
  function n(v,f){v=Number(v);return Number.isFinite(v)?v:f}
  function fmt(v){try{return Math.round(n(v,0)).toLocaleString('tr-TR')}catch(e){return String(Math.round(n(v,0)))}}
  function partShape(part,sx,sy,ox,oy,cls){
    var c=part[0],x1=ox+part[1]*sx,x2=ox+part[2]*sx,y1=oy-part[4]*sy,y2=oy-part[3]*sy;
    var x=Math.min(x1,x2),y=Math.min(y1,y2),w=Math.max(1,Math.abs(x2-x1)),h=Math.max(1,Math.abs(y2-y1));
    if(c==='brace'){
      var flip=((Math.round(part[1]+part[3]))&1)===0;
      return '<line class="'+cls+' rf94-brace" x1="'+(flip?x:x+w)+'" y1="'+y+'" x2="'+(flip?x+w:x)+'" y2="'+(y+h)+'"/>';
    }
    if(c==='tube') return '<rect class="'+cls+' rf94-tube" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1"/>';
    return '<rect class="'+cls+' rf94-'+c+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(c==='pallet'||c==='box'?2:1)+'"/>';
  }
  function drawBay(x0,y0,bw,bh){
    var minX=20,maxX=1612,minZ=-6278,maxZ=-30, sx=bw/(maxX-minX),sy=bh/(maxZ-minZ),ox=x0-minX*sx,oy=y0+maxZ*sy;
    var order={brace:0,tube:1,upright:2,traverse:3,bracket:4,rail:5,pallet:6,box:7};
    var parts=MAIN.slice().sort(function(a,b){return (order[a[0]]||0)-(order[b[0]]||0)});
    return parts.map(function(p){return partShape(p,sx,sy,ox,oy,'rf94-part')}).join('');
  }
  function drawTravers(x0,y0,bw,bh){
    var minX=103,maxX=1530,minZ=-3795,maxZ=-3531,sx=bw/(maxX-minX),sy=bh/(maxZ-minZ),ox=x0-minX*sx,oy=y0+maxZ*sy;
    return TRAV.map(function(p){return partShape(p,sx,sy,ox,oy,'rf94-travers-source')}).join('');
  }
  function render(){
    var host=document.getElementById('m2Front'); if(!host)return;
    var d=(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)||{};
    var bays=Math.max(1,Math.min(12,Math.round(n(d.bays,1)))), levels=Math.max(1,Math.min(15,Math.round(n(d.levels,4))));
    var palW=Math.max(600,n(d.palW,1200)), totalW=Math.max(1,n(d.totalWidth,bays*(palW+150)+90));
    var rackH=Math.max(1000,n(d.totalRackHeight,n(d.sideUprightHeight,6000)));
    var canvasW=760,canvasH=500,left=76,right=724,top=58,bottom=438,drawW=right-left,drawH=bottom-top;
    var gap=6,bayW=(drawW-gap*(bays-1))/bays,body='';
    for(var i=0;i<bays;i++) body+=drawBay(left+i*(bayW+gap),top,bayW,drawH);
    var first=Math.max(0,n(d.firstRailHeight,430)),levelH=Math.max(380,n(d.levelH,1580)), dims='';
    for(var l=0;l<levels;l++){
      var z=l===0?first:first+l*levelH, yy=bottom-(z/rackH)*drawH;
      dims+='<line class="rf94-level-guide" x1="54" y1="'+yy+'" x2="'+left+'" y2="'+yy+'"/><text class="rf94-dim" x="50" y="'+(yy+4)+'" text-anchor="end">'+(l===0?'ZEMİN '+fmt(first):'K'+l+' '+fmt(levelH))+' mm</text>';
    }
    var traversSample=drawTravers(286,18,188,34);
    host.innerHTML='<svg data-rafex-mekik-glb-front="v94" viewBox="0 0 '+canvasW+' '+canvasH+'" role="img" aria-label="MEKIK SON HALI ve MEKIKTRAVERS GLB ön projeksiyonu"><defs><style>.rf94-upright{fill:#aeb7ba;stroke:#566168;stroke-width:1.3}.rf94-traverse,.rf94-travers-source{fill:#f2c500;stroke:#8b7300;stroke-width:1.1}.rf94-bracket{fill:#f2c500;stroke:#8b7300;stroke-width:.9}.rf94-rail{fill:#e0b600;stroke:#786100;stroke-width:.8}.rf94-brace{stroke:#9aa5a8;stroke-width:1.6;fill:none}.rf94-tube{fill:#b8c1c3;stroke:#667176;stroke-width:.6}.rf94-pallet{fill:#c58a42;stroke:#70471d;stroke-width:.8}.rf94-box{fill:#d7a65d;fill-opacity:.68;stroke:#8b5b25;stroke-width:.7}.rf94-level-guide{stroke:#d6ad00;stroke-width:1;stroke-dasharray:4 4}.rf94-dim{font:800 9px Arial;fill:#173c2d}.rf94-title{font:900 13px Arial;fill:#173c2d}.rf94-sub{font:800 9px Arial;fill:#5d6b64}</style></defs><rect width="760" height="500" fill="#fff"/><text class="rf94-title" x="380" y="15" text-anchor="middle">MEKİK · ÖNDEN GÖRÜNÜŞ</text><text class="rf94-sub" x="380" y="29" text-anchor="middle">MEKIK SON HALI.glb + MEKIKTRAVERS.glb kaynak projeksiyonu</text><g>'+traversSample+'</g>'+dims+'<g>'+body+'</g><line x1="'+left+'" y1="'+bottom+'" x2="'+right+'" y2="'+bottom+'" stroke="#26313b" stroke-width="1.5"/><text class="rf94-dim" x="380" y="474" text-anchor="middle">'+fmt(totalW)+' mm · '+bays+' GÖZ</text><text class="rf94-dim" x="735" y="250" transform="rotate(-90 735 250)" text-anchor="middle">AYAK '+fmt(rackH)+' mm</text></svg>';
    try{if(typeof m2ApplyViewZoom==='function')requestAnimationFrame(function(){m2ApplyViewZoom('front')})}catch(e){}
  }
  var native=window.drawMekik2;
  if(typeof native==='function'&&!native.__rafexGlbFrontV94){
    var wrapped=function(){var r=native.apply(this,arguments);try{render()}catch(e){console.error('Mekik GLB front v94',e)}return r};
    wrapped.__rafexGlbFrontV94=true;window.drawMekik2=wrapped;
  }
  window.rafexRenderMekikGlbFrontV94=render;
  if(document.getElementById('m2Front')) requestAnimationFrame(render);
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("Mekik GLB front v94: body sonu bulunamadi");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-mekik-glb-front="v94"',
  'MEKIK SON HALI.glb + MEKIKTRAVERS.glb',
  'window.rafexRenderMekikGlbFrontV94=render',
  'var native=window.drawMekik2'
]) if (!html.includes(required)) throw new Error("Mekik GLB front v94 doğrulama eksigi: " + required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v94: Kullanıcının MEKIK SON HALI.glb ve MEKIKTRAVERS.glb dosyalarından çıkarılan gerçek ön projeksiyon #m2Front alanına bağlandı; yan görünüş kullanılmıyor.");

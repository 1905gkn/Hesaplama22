import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
if (!html.includes('data-rafex-cantilever="v1"')) throw new Error('Cantilever v1 must run before v2');

const replaceOnce = (needle, replacement, label) => {
  if (!html.includes(needle)) throw new Error(`Cantilever v2 patch target missing: ${label}`);
  html = html.replace(needle, replacement);
};

replaceOnce(
  "const defaults={project:'',side:'single',spacing:1500,height:5000,levels:4,armLength:1200,modules:4,load:500,areaW:50000,areaH:30000};",
  "const defaults={project:'',side:'single',spacing:1500,heightMode:'auto',height:5000,levels:4,armLength:1200,baseDepth:1400,modules:4,load:500,legColor:'ral5010',armColor:'ral1007',areaW:50000,areaH:30000};",
  'defaults'
);

replaceOnce(
  "const currentSpec=()=>({side:state.side,spacing:clamp(state.spacing,1000,2000),height:clamp(state.height,1500,12000),levels:clamp(state.levels,1,12),armLength:clamp(state.armLength,300,2500),modules:clamp(state.modules,1,20),load:clamp(state.load,0,5000)});\n  const footprint=(spec)=>({w:Math.max(80,(Math.max(1,spec.modules)-1)*spec.spacing+80),h:(spec.side==='double'?spec.armLength*2:spec.armLength)+120});",
  "const autoHeight=()=>Math.max(1500,Math.round(((Math.max(1,Number(state.levels)||1)*1000)+1000)/100)*100);\n  const currentSpec=()=>({side:state.side,spacing:clamp(state.spacing,1000,2000),heightMode:state.heightMode==='manual'?'manual':'auto',height:state.heightMode==='manual'?clamp(state.height,1500,12000):autoHeight(),levels:clamp(state.levels,1,12),armLength:clamp(state.armLength,300,2500),baseDepth:clamp(state.baseDepth,300,3000),modules:clamp(state.modules,1,20),load:clamp(state.load,0,50000),legColor:'ral5010',armColor:state.armColor==='ral2004'?'ral2004':'ral1007'});\n  const footprint=(spec)=>{const d=Math.max(spec.armLength,spec.baseDepth);return{w:Math.max(80,(Math.max(1,spec.modules)-1)*spec.spacing+80),h:(spec.side==='double'?d*2:d)+120}};",
  'currentSpec and footprint'
);

replaceOnce(
  "const count=Math.max(1,s.modules), usable=right-left, step=count>1?usable/(count-1):0, armPx=Math.max(45,Math.min(125,s.armLength/12));\n    let uprights='',arms='',dims='';",
  "const count=Math.max(1,s.modules), usable=right-left, step=count>1?usable/(count-1):0, armPx=Math.max(45,Math.min(125,s.armLength/12)), basePx=Math.max(48,Math.min(150,s.baseDepth/12));\n    const legFill='#005387',armFill=s.armColor==='ral2004'?'#E25303':'#E1A100';\n    let uprights='',arms='',dims='';",
  'preview sizing/colors'
);

replaceOnce(
  "uprights+='<rect x=\"'+(x-5)+'\" y=\"'+top+'\" width=\"10\" height=\"'+(bottom-top)+'\" rx=\"2\" fill=\"#87978f\"/>';\n      if(s.side==='double')uprights+='<rect x=\"'+(x-armPx)+'\" y=\"'+(bottom-8)+'\" width=\"'+(armPx*2)+'\" height=\"8\" rx=\"2\" fill=\"#87978f\"/>';\n      else uprights+='<rect x=\"'+x+'\" y=\"'+(bottom-8)+'\" width=\"'+armPx+'\" height=\"8\" rx=\"2\" fill=\"#87978f\"/>';\n      ys.forEach((y)=>{if(s.side==='double')arms+='<rect x=\"'+(x-armPx)+'\" y=\"'+(y-4)+'\" width=\"'+(armPx*2)+'\" height=\"8\" rx=\"2\" fill=\"#d6aa22\"/>';else arms+='<rect x=\"'+x+'\" y=\"'+(y-4)+'\" width=\"'+armPx+'\" height=\"8\" rx=\"2\" fill=\"#d6aa22\"/>';});",
  "uprights+='<rect x=\"'+(x-5)+'\" y=\"'+top+'\" width=\"10\" height=\"'+(bottom-top)+'\" rx=\"2\" fill=\"'+legFill+'\"/>';\n      if(s.side==='double')uprights+='<rect x=\"'+(x-basePx)+'\" y=\"'+(bottom-8)+'\" width=\"'+(basePx*2)+'\" height=\"8\" rx=\"2\" fill=\"'+legFill+'\"/>';\n      else uprights+='<rect x=\"'+x+'\" y=\"'+(bottom-8)+'\" width=\"'+basePx+'\" height=\"8\" rx=\"2\" fill=\"'+legFill+'\"/>';\n      ys.forEach((y)=>{if(s.side==='double')arms+='<rect x=\"'+(x-armPx)+'\" y=\"'+(y-4)+'\" width=\"'+(armPx*2)+'\" height=\"8\" rx=\"2\" fill=\"'+armFill+'\"/>';else arms+='<rect x=\"'+x+'\" y=\"'+(y-4)+'\" width=\"'+armPx+'\" height=\"8\" rx=\"2\" fill=\"'+armFill+'\"/>';});",
  'preview geometry'
);

replaceOnce(
  "<label class=\"k-field\">Ayak yüksekliği (mm)<input id=\"kHeight\" type=\"number\" min=\"1500\" max=\"12000\" step=\"100\" value=\"'+state.height+'\"></label>'+\n      '<label class=\"k-field\">Kol seviyesi<input id=\"kLevels\" type=\"number\" min=\"1\" max=\"12\" value=\"'+state.levels+'\"></label>'+\n      '<label class=\"k-field\">Kol uzunluğu (mm)<input id=\"kArmLength\" type=\"number\" min=\"300\" max=\"2500\" step=\"50\" value=\"'+state.armLength+'\"></label>'+\n      '<label class=\"k-field\">Ayak hattı adedi<input id=\"kModules\" type=\"number\" min=\"1\" max=\"20\" value=\"'+state.modules+'\"></label>'+\n      '<label class=\"k-field wide\">Birim kol yükü (kg)<input id=\"kLoad\" type=\"number\" min=\"0\" max=\"5000\" step=\"50\" value=\"'+state.load+'\"></label></div>'+'",
  "<label class=\"k-field\">Ayak yüksekliği<select id=\"kHeightMode\"><option value=\"auto\"'+(state.heightMode==='manual'?'':' selected')+'>Otomatik</option><option value=\"manual\"'+(state.heightMode==='manual'?' selected':'')+'>Manuel</option></select></label>'+\n      '<label class=\"k-field\">Ayak yüksekliği (mm)<input id=\"kHeight\" type=\"number\" min=\"1500\" max=\"12000\" step=\"100\" value=\"'+(state.heightMode==='manual'?state.height:autoHeight())+'\"'+(state.heightMode==='manual'?'':' disabled')+'></label>'+\n      '<label class=\"k-field\">Kol seviyesi<input id=\"kLevels\" type=\"number\" min=\"1\" max=\"12\" value=\"'+state.levels+'\"></label>'+\n      '<label class=\"k-field\">Kat derinliği (mm)<input id=\"kArmLength\" type=\"number\" min=\"300\" max=\"2500\" step=\"50\" value=\"'+state.armLength+'\"></label>'+\n      '<label class=\"k-field\">Taban Kat derinliği (mm)<input id=\"kBaseDepth\" type=\"number\" min=\"300\" max=\"3000\" step=\"50\" value=\"'+state.baseDepth+'\"></label>'+\n      '<label class=\"k-field\">Ayak hattı adedi<input id=\"kModules\" type=\"number\" min=\"1\" max=\"20\" value=\"'+state.modules+'\"></label>'+\n      '<label class=\"k-field\">Ayak rengi<select id=\"kLegColor\" disabled><option value=\"ral5010\" selected>RAL-5010</option></select></label>'+\n      '<label class=\"k-field\">Kol rengi<select id=\"kArmColor\"><option value=\"ral1007\"'+(state.armColor==='ral2004'?'':' selected')+'>RAL-1007</option><option value=\"ral2004\"'+(state.armColor==='ral2004'?' selected':'')+'>RAL-2004</option></select></label>'+\n      '<label class=\"k-field wide\">Kattaki ağırlık (kg)<input id=\"kLoad\" type=\"number\" min=\"0\" max=\"50000\" step=\"50\" value=\"'+state.load+'\"></label></div>'+'",
  'form fields'
);

replaceOnce(
  "['kProject','kSide','kSpacing','kHeight','kLevels','kArmLength','kModules','kLoad','kAreaW','kAreaH']",
  "['kProject','kSide','kSpacing','kHeightMode','kHeight','kLevels','kArmLength','kBaseDepth','kModules','kArmColor','kLoad','kAreaW','kAreaH']",
  'bind fields'
);

replaceOnce(
  "state.project=g('kProject')?.value||'';state.side=g('kSide')?.value==='double'?'double':'single';state.spacing=Number(g('kSpacing')?.value)||1500;state.height=Number(g('kHeight')?.value)||5000;state.levels=Number(g('kLevels')?.value)||4;state.armLength=Number(g('kArmLength')?.value)||1200;state.modules=Number(g('kModules')?.value)||4;state.load=Number(g('kLoad')?.value)||0;state.areaW=Math.max(5000,Number(g('kAreaW')?.value)||50000);state.areaH=Math.max(5000,Number(g('kAreaH')?.value)||30000);save();",
  "state.project=g('kProject')?.value||'';state.side=g('kSide')?.value==='double'?'double':'single';state.spacing=Number(g('kSpacing')?.value)||1500;state.heightMode=g('kHeightMode')?.value==='manual'?'manual':'auto';state.levels=Number(g('kLevels')?.value)||4;state.height=state.heightMode==='manual'?(Number(g('kHeight')?.value)||5000):autoHeight();state.armLength=Number(g('kArmLength')?.value)||1200;state.baseDepth=Number(g('kBaseDepth')?.value)||1400;state.modules=Number(g('kModules')?.value)||4;state.legColor='ral5010';state.armColor=g('kArmColor')?.value==='ral2004'?'ral2004':'ral1007';state.load=Number(g('kLoad')?.value)||0;state.areaW=Math.max(5000,Number(g('kAreaW')?.value)||50000);state.areaH=Math.max(5000,Number(g('kAreaH')?.value)||30000);save();",
  'readForm'
);

replaceOnce(
  "function updatePreview(){readForm();const v=document.getElementById('kVisual');if(v)v.innerHTML=previewSvg();const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t};set('kHeroSpacing',fmt(state.spacing)+' mm');set('kSumSide',state.side==='double'?'Çift taraflı':'Tek taraflı');set('kSumSpacing',fmt(state.spacing)+' mm');set('kSumArm',fmt(state.armLength)+' mm');set('kSumHeight',fmt(state.height)+' mm');const svg=document.getElementById('kLayoutSvg');if(svg)svg.setAttribute('viewBox','0 0 '+state.areaW+' '+state.areaH);drawLayout();}",
  "function updatePreview(){readForm();const h=document.getElementById('kHeight');if(h){h.disabled=state.heightMode!=='manual';if(state.heightMode!=='manual')h.value=autoHeight()}const v=document.getElementById('kVisual');if(v)v.innerHTML=previewSvg();const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t};set('kHeroSpacing',fmt(state.spacing)+' mm');set('kSumSide',state.side==='double'?'Çift taraflı':'Tek taraflı');set('kSumSpacing',fmt(state.spacing)+' mm');set('kSumArm',fmt(state.armLength)+' mm');set('kSumHeight',fmt(currentSpec().height)+' mm');const svg=document.getElementById('kLayoutSvg');if(svg)svg.setAttribute('viewBox','0 0 '+state.areaW+' '+state.areaH);drawLayout();}",
  'updatePreview'
);

replaceOnce(
  "<div><small>KOL</small><b id=\"kSumArm\">'+fmt(state.armLength)+' mm</b></div><div><small>YÜKSEKLİK</small><b id=\"kSumHeight\">'+fmt(state.height)+' mm</b></div>",
  "<div><small>KAT DERİNLİĞİ</small><b id=\"kSumArm\">'+fmt(state.armLength)+' mm</b></div><div><small>YÜKSEKLİK</small><b id=\"kSumHeight\">'+fmt(currentSpec().height)+' mm</b></div>",
  'summary labels'
);

replaceOnce(
  "<div><small>Ayak arası</small><b>'+fmt(s.spacing)+' mm</b></div><div><small>Ayak yüksekliği</small><b>'+fmt(s.height)+' mm</b></div><div><small>Kol uzunluğu</small><b>'+fmt(s.armLength)+' mm</b></div><div><small>Kol seviyesi</small><b>'+fmt(s.levels)+'</b></div><div><small>Ayak hattı</small><b>'+fmt(s.modules)+'</b></div><div><small>Birim kol yükü</small><b>'+fmt(s.load)+' kg</b></div><div><small>Ayak profili</small><b>Ayağın devamı · aynı renk</b></div>",
  "<div><small>Ayak arası</small><b>'+fmt(s.spacing)+' mm</b></div><div><small>Ayak yüksekliği</small><b>'+fmt(s.height)+' mm · '+(s.heightMode==='manual'?'Manuel':'Otomatik')+'</b></div><div><small>Kat derinliği</small><b>'+fmt(s.armLength)+' mm</b></div><div><small>Taban Kat derinliği</small><b>'+fmt(s.baseDepth)+' mm</b></div><div><small>Kol seviyesi</small><b>'+fmt(s.levels)+'</b></div><div><small>Ayak hattı</small><b>'+fmt(s.modules)+'</b></div><div><small>Kattaki ağırlık</small><b>'+fmt(s.load)+' kg</b></div><div><small>Ayak rengi</small><b>RAL-5010</b></div><div><small>Kol rengi</small><b>'+(s.armColor==='ral2004'?'RAL-2004':'RAL-1007')+'</b></div><div><small>Ayak profili</small><b>Ayağın devamı · aynı renk</b></div>",
  'print specs'
);

html = html.replace('</body>', '<script data-rafex-cantilever="v2">window.__rafexCantileverV2=true;<\/script></body>');

for (const required of ['data-rafex-cantilever="v2"','Kattaki ağırlık','Kat derinliği','Taban Kat derinliği','RAL-5010','RAL-1007','RAL-2004','kHeightMode']) {
  if (!html.includes(required)) throw new Error(`Cantilever v2 verification missing: ${required}`);
}

const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol Kollu v2: agirlik, kat/taban derinligi, renkler ve otomatik-manuel ayak yuksekligi eklendi.');

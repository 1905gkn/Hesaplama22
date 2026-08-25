import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match) throw new Error('HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
if(!html.includes('data-rafex-cantilever="v1"')) throw new Error('cantilever runtime missing');

const must=(from,to,label)=>{if(!html.includes(from))throw new Error('Cantilever level-gap target missing: '+label);html=html.replace(from,to)};

must(
"const defaults={project:'',side:'single',spacing:1500,heightMode:'auto',height:5000,levels:4,armLength:1200,baseDepth:1400,modules:4,load:500,legColor:'ral5010',armColor:'ral1007',areaW:50000,areaH:30000};",
"const defaults={project:'',side:'single',spacing:1500,heightMode:'auto',height:5000,levels:4,levelGap:1000,armLength:1200,baseDepth:1400,modules:4,load:500,legColor:'ral5010',armColor:'ral1007',areaW:50000,areaH:30000};",
'defaults');

must(
"const autoHeight=()=>Math.max(1500,Math.round(((Math.max(1,Number(state.levels)||1)*1000)+1000)/100)*100);",
"const autoHeight=()=>{const gap=Math.max(100,Number(state.levelGap)||1000);return Math.max(1500,Math.round((((Math.max(1,Number(state.levels)||1)+1)*gap))/100)*100)};",
'autoHeight');

must(
"levels:clamp(state.levels,1,12),armLength:clamp(state.armLength,300,2500)",
"levels:clamp(state.levels,1,12),levelGap:clamp(state.levelGap,100,3000),armLength:clamp(state.armLength,300,2500)",
'currentSpec');

must(
"'<label class=\"k-field\">Kol seviyesi<input id=\"kLevels\" type=\"number\" min=\"1\" max=\"12\" value=\"'+state.levels+'\"></label>'+\n      '<label class=\"k-field\">Kat derinliği (mm)<input id=\"kArmLength\"",
"'<label class=\"k-field\">Kol seviyesi<input id=\"kLevels\" type=\"number\" min=\"1\" max=\"12\" value=\"'+state.levels+'\"></label>'+\n      '<label class=\"k-field\">Kat arası mesafe (mm)<input id=\"kLevelGap\" type=\"number\" min=\"100\" max=\"3000\" step=\"50\" value=\"'+(state.levelGap||1000)+'\"></label>'+\n      '<label class=\"k-field\">Kat derinliği (mm)<input id=\"kArmLength\"",
'form field');

must(
"['kProject','kSide','kSpacing','kHeightMode','kHeight','kLevels','kArmLength','kBaseDepth','kModules','kArmColor','kLoad','kAreaW','kAreaH']",
"['kProject','kSide','kSpacing','kHeightMode','kHeight','kLevels','kLevelGap','kArmLength','kBaseDepth','kModules','kArmColor','kLoad','kAreaW','kAreaH']",
'bind list');

must(
"state.levels=Number(g('kLevels')?.value)||4;state.height=state.heightMode==='manual'?(Number(g('kHeight')?.value)||5000):autoHeight();state.armLength=Number(g('kArmLength')?.value)||1200;",
"state.levels=Number(g('kLevels')?.value)||4;state.levelGap=Math.max(100,Number(g('kLevelGap')?.value)||1000);state.height=state.heightMode==='manual'?(Number(g('kHeight')?.value)||5000):autoHeight();state.armLength=Number(g('kArmLength')?.value)||1200;",
'readForm');

must(
"<div><small>Ayak yüksekliği</small><b>'+fmt(s.height)+' mm · '+(s.heightMode==='manual'?'Manuel':'Otomatik')+'</b></div><div><small>Kat derinliği</small><b>'+fmt(s.armLength)+' mm</b></div>",
"<div><small>Ayak yüksekliği</small><b>'+fmt(s.height)+' mm · '+(s.heightMode==='manual'?'Manuel':'Otomatik')+'</b></div><div><small>Kat arası</small><b>'+fmt(s.levelGap)+' mm</b></div><div><small>Kat derinliği</small><b>'+fmt(s.armLength)+' mm</b></div>",
'print summary');

const encoded=Buffer.from(html).toString('base64');
source=source.replace(match[0],`const HTML_BASE64 = "${encoded}"`);
fs.writeFileSync(file,source);
console.log('Konsol v4: Kat arasi mesafe alani geri getirildi ve otomatik ayak boyuna baglandi.');

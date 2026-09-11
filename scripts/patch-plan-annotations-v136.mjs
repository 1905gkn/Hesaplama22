import fs from 'node:fs';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
let html=Buffer.from(m[2],'base64').toString();
const replace=(a,b)=>{if(!html.includes(a))throw Error('Plan annotations anchor missing: '+a.slice(0,90));html=html.replace(a,b)};
replace('const flowFont = Math.max(18, Math.min(34, cellW * .35, palletRowH * .65)), flowH = Math.max(20, Math.min(38, palletRowH * .72));', `const areaPointsV136=m2LayoutState.points||[],areaSpanV136=areaPointsV136.length?Math.max(Math.max(...areaPointsV136.map(p=>p.x))-Math.min(...areaPointsV136.map(p=>p.x)),Math.max(...areaPointsV136.map(p=>p.y))-Math.min(...areaPointsV136.map(p=>p.y)))/Math.max(.000001,m2LayoutState.scale):50000,arrowLimitV136=1+.5*Math.max(0,Math.min(1,(areaSpanV136-50000)/50000)),flowFont=Math.min(cellW*.62,palletRowH*.62)*arrowLimitV136,flowH=flowFont*1.25;`);
replace('topMarkerY = rack.y + 5, bottomMarkerY = rack.y + rack.h - flowH - 5;', 'topMarkerY = rack.y + palletRowH*.08, bottomMarkerY = rack.y + rack.h - flowH - palletRowH*.08;');
// Replace only the two block palettes; physical pallet/traverse colors stay physical.
replace('"#e07a18", "#087f8c", "#b43f8d", "#65731f"', '"#4056a1", "#087f8c", "#b43f8d", "#6b416f"');
replace("'#e07a18','#087f8c','#b43f8d','#65731f'", "'#4056a1','#087f8c','#b43f8d','#6b416f'");
replace('typeColor = rack.typeColor || m2TypeColor(rack.typeName);', 'typeColor = m2TypeColor(rack.typeName);');
replace('function decorateRack(group,screenScaleV133){', `function compactNameplateV136(group){
    const plate=group.querySelector('.m2-rack-nameplate');if(!plate)return;
    const texts=Array.from(group.querySelectorAll('.m2-rack-name,.m2-rack-pallet-count')).filter(t=>getComputedStyle(t).display!=='none'&&t.textContent.trim());
    if(!texts.length)return;const boxes=texts.map(t=>t.getBBox()),font=parseFloat(getComputedStyle(texts[0]).fontSize)||5,pad=font*.22,x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y)),right=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height));
    for(const [key,value] of Object.entries({x:x-pad,y:y-pad,width:right-x+2*pad,height:bottom-y+2*pad,rx:font*.2}))plate.setAttribute(key,String(value));
  }
  function decorateRack(group,screenScaleV133){`);
replace('label.style.display=selected&&shortPx>=78?"":"none"});', 'label.style.display=selected&&shortPx>=78?"":"none"});compactNameplateV136(group);');
// Selection-only updates must also resize the plate when pallet-count text appears.
replace('paint(layer.querySelector(\'[data-rack="\'+rackId+\'"]\'),true);', 'paint(layer.querySelector(\'[data-rack="\'+rackId+\'"]\'),true);window.rafexFitNameplatesV136?.();');
replace('window.rafexCommonDrawingMoveSelectedV50=moveSelected;', 'window.rafexFitNameplatesV136=()=>{svg()?.querySelectorAll("[data-rack]").forEach(compactNameplateV136)};window.rafexCommonDrawingMoveSelectedV50=moveSelected;');
const css='<style data-plan-annotations="v136">.m2-lane-flow-marker{stroke-width:.10em!important}</style>';
const bodyEnd=html.lastIndexOf('</body>');
if(bodyEnd<0)throw Error('Main document body missing');
html=html.slice(0,bodyEnd)+css+html.slice(bodyEnd);
fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
console.log('v136: pallet-relative flow arrows, text-fitted nameplates and distinct block colors.');

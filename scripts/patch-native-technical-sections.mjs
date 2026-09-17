import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-rafex-native-technical-sections'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Native sections anchor missing: '+a.slice(0,80));html=html.replace(a,b);};
 replace('    try{drawMekik2()}catch{scheduleFront()}','    scheduleFront();');
 replace('$("m2Top").innerHTML = top;', 'const topHost=$("m2Top");if(topHost.__rafexTopMarkup!==top||!topHost.querySelector("svg")){topHost.innerHTML=top;topHost.__rafexTopMarkup=top;}');
 replace("      const svg=window.rafexTechnicalSectionSvg?.(seed?.drawing,type.system);\n      return svg?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg):null;", "      return await window.rafexCaptureTechnicalViews(seed.drawing,type.system);");
 replace('    if (!card || !src) return;', '    if (!card || !src) return;\n    if(src.front&&src.side){window.rafexApplyTechnicalViews(card,src);return;}');
 // Editor previews use the same front/side image pair as the report.
 replace('    if (image.src !== src) image.src = src;', '    if (image.src !== (src.front||src)) image.src = src.front||src;');
 replace('  function renderDimensions(host,c,layout){','  window.rafexDriveDimensions=renderDimensions;\n  function renderDimensions(host,c,layout){');
 const portal=fs.readFileSync('portal.html','utf8'),start=portal.indexOf('        const elevation = (mode) => {'),end=portal.indexOf('        if (renderAuxiliaryViews)',start);
 if(start<0||end<0)throw Error('Native side renderer missing');
 const elevation=portal.slice(start,end),dimLine=portal.split('\n').find(line=>line.includes('const dimLine = (x1, y1, x2, y2) =>'));
 const side=`window.rafexNativeSideSection=function(d){
 const m2LastDrawing=d,bays=d.bays,depth=d.depth,levels=d.levels,railLength=d.railLength,totalWidth=d.totalWidth,footType=d.footType,palletHeight=d.palletHeight,sideUprightHeight=d.sideUprightHeight,totalRackHeight=d.totalRackHeight,visibleDepth=Math.min(depth,10),visibleBays=Math.min(bays,10),firstRailHeight=d.firstRailHeight,levelH=d.levelH,clearance=d.clearance;
 ${dimLine}
 const palletLayout=m2PalletDepthLayout(depth,d.palD,d.systemType,d.firstPalletGap??200,d.palletGap??50);
 ${elevation} return elevation('side');};`;
 const css='<style data-rafex-native-technical-sections>html .rafex-v19-type-card.rafex-two-native-views{grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important}html .rafex-two-native-views>[data-rafex-native-view="front"]{grid-row:2!important}html .rafex-two-native-views>[data-rafex-native-view="side"]{grid-row:3!important}</style>';
 const bodyEnd=html.lastIndexOf('</body>');return html.slice(0,bodyEnd)+css+'<script>'+side+fs.readFileSync(new URL('./native-technical-sections.js',import.meta.url),'utf8')+'</script>'+html.slice(bodyEnd);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-native-technical-sections.mjs')){
 const path='dist/server/index.js',raw=fs.readFileSync(path,'utf8'),m=raw.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);fs.writeFileSync(path,raw.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

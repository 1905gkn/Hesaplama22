import fs from 'node:fs';
export function sourceTransform(s){
 if(s.includes('/* net-clearance-v527 */'))return s;
 s=s.replace('konsolLevelGeometry(o.levelRows,o.levelGap)','konsolLevelGeometry(o.levelRows,o.levelGap,armSection.h,uprightSection.h)');
 s=s.replace('function konsolLevelGeometry(rows,extension){','function konsolLevelGeometry(rows,extension,arm=0,base=0){').replace('let top=0;','let top=base;').replace('top+=Number(r.distance);','top+=Number(r.distance)+arm;');
 s=s.replace('this.root,konsolDimensions(o,rows,','this.root,konsolDimensions({...o,armThickness:armSection.h},rows,');
 s=s.replace('(levelGeometry[level]?.distance??o.levelGap)-armSection.h-o.liftClearance','(levelGeometry[level]?.distance??o.levelGap)-o.liftClearance');
 s=s.replace('const radius = Math.max(size.x, size.y, size.z, 1000) * 1.35;', 'const radius = Math.max(size.x, size.y, size.z, 1000) * 1.65 * Math.max(1,1/this.camera.aspect);').replace('const radius = Math.max(size.x, size.y, size.z, 1000) * 1.55;', 'const radius = Math.max(size.x, size.y, size.z, 1000) * 1.65 * Math.max(1,1/this.camera.aspect);');
 return '/* net-clearance-v527 */\n'+s;
}
export function transform(html){
 if(html.includes('data-consistent-preview="v527"'))return html;
 html=html.replaceAll('İlk katın zeminden yüksekliği (mm)','Taban–ilk kol net mesafesi (mm)');
 html=html.replace("window.__rafexKonsolLoadType=allowed.indexOf(saved)>=0?saved:'profile';","window.__rafexKonsolLoadType='profile';");
 html=html.replace('sync(box);window.RafexKonsolViewer?.setLoadType(window.__rafexKonsolLoadType);fireGeometry();','window.RafexKonsolViewer?.setLoadType(window.__rafexKonsolLoadType);sync(box);fireGeometry();');
 html=html.replace('function sync(box){',"function sync(box){var actual=window.RafexKonsolViewer?.getSavedDetail()?.loadType;if(allowed.indexOf(actual)>=0)window.__rafexKonsolLoadType=actual;");
 html=html.replaceAll('function konsolLevelGeometry(rows,extension){','function konsolLevelGeometry(rows,extension,arm=0,base=0){').replaceAll('let top=0;\n return rows.map((r,i)=>{top+=Number(r.distance);','let top=base;\n return rows.map((r,i)=>{top+=Number(r.distance)+arm;');
 html=html.replaceAll('konsolLevelGeometry(s.levelRows,s.gap)','konsolLevelGeometry(s.levelRows,s.gap,a.heightMm,u.heightMm)');
 const anchor='computed=rows?rows.reduce((sum,r)=>sum+r.distance,0)+Number(gap.value):';
 if(!html.includes(anchor))throw Error('v527 height anchor');
 html=html.replace(anchor,"computed=rows?rows.reduce((sum,r)=>sum+r.distance,0)+rows.length*(Number(el('konsolArmProfile')?.value.match(/\\d+/)?.[0])||80)+(Number(el('konsolUprightProfile')?.value.match(/\\d+/)?.[0])||160)+Number(gap.value):");
 const css=`#page#page[data-rafex-common-active="1"] :is(#m2Front,.mr-canvas-wrap,#konsolCanvas){height:clamp(660px,calc(100vh - 276px),1100px)!important;min-height:clamp(660px,calc(100vh - 276px),1100px)!important;max-height:clamp(660px,calc(100vh - 276px),1100px)!important;box-sizing:border-box!important}
 #page#page[data-rafex-common-active="1"] #m2Front canvas{height:100%!important;min-height:0!important;max-height:100%!important}
 #page#page[data-rafex-common-active="1"] .mr-view-card{height:auto!important;align-self:start!important;grid-template-rows:auto clamp(660px,calc(100vh - 276px),1100px)!important}
 @media(max-width:600px){#page#page[data-rafex-common-active="1"] :is(#m2Front,.mr-canvas-wrap,#konsolCanvas){height:660px!important;min-height:660px!important;max-height:660px!important}#page#page[data-rafex-common-active="1"] .mr-view-card{grid-template-rows:auto 660px!important}}`;
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<style data-consistent-preview="v527">'+css+'</style>'+html.slice(end);
}
if(process.argv[2]==='source'){
 const p='client/konsol-viewer.entry.js';fs.writeFileSync(p,sourceTransform(fs.readFileSync(p,'utf8')));
 const mr='client/mr-viewer.entry.js';fs.writeFileSync(mr,fs.readFileSync(mr,'utf8').replaceAll('rgba(5,40,72,.96)','rgba(173,216,245,.58)').replaceAll('#3e8fb2','rgba(90,155,195,.55)').replaceAll('context.fillStyle = "#fff"','context.fillStyle = "#123e5a"').replaceAll("context.fillStyle = '#fff'","context.fillStyle = '#123e5a'"));
}else if(process.argv[1]?.endsWith('consistent-preview-v527.mjs'))for(const p of ['dist/index.html','dist/server/index.js']){
 let s=fs.readFileSync(p,'utf8');if(p.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(p,s);
}

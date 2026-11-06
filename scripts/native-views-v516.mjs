import fs from 'node:fs';import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-native-views="v516"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v516 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('const minimum=Math.max(1,Math.ceil(Number(lastPalletElevation)||0))','const minimum=Math.max(50,Math.ceil((Number(lastPalletElevation)||0)/50)*50)');
 replace("requested=Number(raw),manual=mode==='manual'", "requested=Math.ceil(Number(raw)/50)*50,manual=mode==='manual'");
 replace('automatic:Number(automatic),minimum','automatic:Math.ceil(Number(automatic)/50)*50,minimum');
 replace('height:manual&&valid?requested:Number(automatic)','height:manual&&valid?requested:Math.ceil(Number(automatic)/50)*50');
 replace('function m2MekikSetProjection(mode, drawing = m2LastDrawing, x = 0, y = 0, width = 200, height = 112) {', 'function m2MekikSetProjection(mode, drawing = m2LastDrawing, x = 0, y = 0, width = 200, height = 112) {const stepped=drawing?.mekikCustomizationV514?window.rafexMekikSteppedV514(drawing):null;');
 replace('rackHeight = Math.max(firstRail + (levels - 1) * levelHeight + loadHeight / 2,Number(drawing?.sideUprightHeight)||0)', 'rackHeight = stepped?.height||Math.ceil(Math.max(firstRail+(levels-1)*levelHeight,Number(drawing?.sideUprightHeight)||firstRail+(levels-1)*levelHeight+loadHeight/2)/50)*50');
 replace('rackHeightMm = Math.max(topRailHeightMm + loadHeightMm / 2,Number(drawing?.sideUprightHeight)||0)', 'rackHeightMm = stepped?.height||Math.ceil(Math.max(topRailHeightMm,Number(drawing?.sideUprightHeight)||topRailHeightMm+loadHeightMm/2)/50)*50');
 replace('const lastFrame = frames[frames.length - 1];', 'if(stepped){frames.splice(0,frames.length,...stepped.frames.map(f=>({...f,length:f.depth})));}\n        const lastFrame = frames[frames.length - 1];');
 replace('const innerStart = frame.start + uprightWidthMm * .35,', 'const frameTopZ=frame.height||rackHeightMm,braceBottomZ=Math.max(80,frameTopZ-80),innerStart = frame.start + uprightWidthMm * .35,');
 replace('if (m2ShowSidePallets) for (let level = 0; level < levelCount; level++) {', 'if (drawing?.showPallets!==false&&m2ShowSidePallets) for (let level = 0; level < levelCount; level++) {');
 replace('palletLayout.positions.forEach((palletPosition, palletIndex) => {', '(stepped?.floors[level]?.positions||palletLayout.positions).forEach((palletPosition, palletIndex) => {');
 replace('rails += `<g class="m2-side-level"', 'const runs=stepped?.floors[level]?.runs||[{start:0,end:railLengthMm}];for(const run of runs)rails += `<g transform="translate(${run.start} 0)" class="m2-side-level"');
 // These anchors occur only in the native side rail geometry.
 replace('width="${railLengthMm}" height="${railHeightMm}"', 'width="${run.end-run.start}" height="${railHeightMm}"');
 html=html.replaceAll('x2="${railLengthMm - 8}" y2="${railY + railHeightMm', 'x2="${run.end-run.start-8}" y2="${railY + railHeightMm');
 replace('uprightPositions.forEach((position) => {', 'uprightPositions.forEach((position) => {const postHeight=stepped?Math.max(...stepped.frames.filter(f=>Math.abs(f.start-position)<1||Math.abs(f.end-position)<1).map(f=>f.height),0):rackHeightMm;');
 replace('y="0" width="${uprightWidthMm}" height="${rackHeightMm}"', 'y="${sy(postHeight)}" width="${uprightWidthMm}" height="${postHeight}"');
 replace('y1="18" x2="${position - uprightWidthMm * .22}"', 'y1="${sy(postHeight)+18}" x2="${position - uprightWidthMm * .22}"');
 // Read the source drawing instead of a stale previously captured side view.
 replace('if(storedV135&&!representativeFront&&', 'if(storedV135&&!drawing?.mekikCustomizationV514&&!representativeFront&&');
 replace('Math.max(c.firstLevelHeight+(c.levels-1)*c.levelSpacing,Number(d.sideUprightHeight)||c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2)', 'Math.ceil(Math.max(c.firstLevelHeight+(c.levels-1)*c.levelSpacing,Number(d.sideUprightHeight)||c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2)/50)*50');
 html=html.replaceAll('channels=v514','channels=v516').replaceAll('/layout-3d.js?v=515','/layout-3d.js?v=516');
 replace('const c={bays:Number(d.bays)||1,levels:Number(d.levels)||4,','const c={showPallets:d.showPallets!==false,bays:Number(d.bays)||1,levels:Number(d.levels)||4,');
 const driveOld='return (Number.isFinite(first)&&first>=0?first:430)+Math.max(0,Math.round(positive(c.levels,4))-1)*positive(c.levelSpacing??c.levelH,1580)+positive(c.palletHeight,1200)+220;';
 const driveNew='return Math.ceil(((Number.isFinite(first)&&first>=0?first:430)+Math.max(0,Math.round(positive(c.levels,4))-1)*positive(c.levelSpacing??c.levelH,1580)+positive(c.palletHeight,1200)+220)/50)*50;';if(html.includes(driveOld))replace(driveOld,driveNew);else if(!html.includes(driveNew))throw Error('v516 shared Drive height missing');
 const at=html.lastIndexOf('</body>');html=html.slice(0,at)+'<script data-native-views="v516">document.addEventListener("change",function(e){if(e.target.matches("#m2UprightHeightV421,#mrHeight")&&Number(e.target.value)>0){e.target.step="50";e.target.value=Math.ceil(Number(e.target.value)/50)*50;}},true);</script>'+html.slice(at);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]native-views-v516\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing server HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS native views v516: '+file);}

export function transformFront(source){
 const a='this.root.add(y);let E=this.models.pallet.root.clone(!0);',b='this.root.add(y);if(e.showPallets===false)continue;let E=this.models.pallet.root.clone(!0);';
 if(source.includes(b))return source;if(!source.includes(a))throw Error('v516 native GLB pallet anchor missing');
 return source.replace(a,b).replace('Math.max(150,m+(c-1)*T,Number(i?.sideUprightHeight)||m+(c-1)*T+p/2)','Math.ceil(Math.max(150,m+(c-1)*T,Number(i?.sideUprightHeight)||m+(c-1)*T+p/2)/50)*50');
}
if(/[\\/]native-views-v516\.mjs$/.test(process.argv[1]||'')){
 const file='dist/mekik-front-viewer.js';if(fs.existsSync(file)){const code=transformFront(fs.readFileSync(file,'utf8'));fs.writeFileSync(file,code);const serverFile='dist/server/index.js';if(fs.existsSync(serverFile)){let server=fs.readFileSync(serverFile,'utf8');server=server.replace(/(const RAFEX_MEKIK_FRONT_VIEWER_BASE64 = ["'])([A-Za-z0-9+/=]+)(["'])/,(_,a,b,c)=>a+Buffer.from(code).toString('base64')+c);fs.writeFileSync(serverFile,server);}}
}

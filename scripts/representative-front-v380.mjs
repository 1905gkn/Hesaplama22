export function transform(html){
 if(html.includes('data-representative-front="v380"'))return transformElevationHeightV422(html);
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v380 HTML anchor '+a.slice(0,95));html=html.replace(a,b)};
 replace('function m2ReportElevationSvg(drawing, mode) {const storedV135=window.rafexReadRackDetailV135?.(drawing,mode);if(storedV135)return storedV135;',`function m2ReportElevationSvg(drawing, mode) {const storedV135=window.rafexReadRackDetailV135?.(drawing,mode);const representativeFront=mode==='front'&&!drawing?.b2b&&!drawing?.b2bLayout&&!drawing?.plan?.mr&&!drawing?.konsol&&drawing?.spec?.system!=='konsol'&&!['mr','b2b','konsol','cantilever'].includes(drawing?.rafexSystem);if(storedV135&&!representativeFront)return storedV135;`);
 replace('const bays = Math.max(1, Number(drawing?.bays) || 1),','const bays = 5, /* five representative bays; actual dimensions remain on drawing */');
 replace('${fmt(front ? drawing.totalWidth : drawing.railLength)} mm','${front ? `TOPLAM UZUNLUK · ${new Intl.NumberFormat("tr-TR",{maximumFractionDigits:3}).format(Number(drawing.totalWidth||drawing.widthMm||0)/1000)} m · 5 temsili blok` : `${fmt(drawing.railLength)} mm`}');
 const oldWidth='${fmt(fullWidth)} mm · ${fmt(fullColumns)} göz';if(html.split(oldWidth).length!==3)throw Error('v380 two native front labels');
 html=html.replaceAll(oldWidth,'TOPLAM UZUNLUK · ${new Intl.NumberFormat("tr-TR",{maximumFractionDigits:3}).format(fullWidth/1000)} m · 5 temsili blok');
 replace("    bays:Math.max(1,number('m2Bays',1)),",`    bays:Math.max(1,number('m2Bays',1)),
    totalWidth:Number(m2LastDrawing?.totalWidth||m2LastDrawing?.widthMm)||0,`);
 replace("c.totalWidth=c.bays*c.bayPitch+c.footType;","c.totalWidth=Number(d.totalWidth||d.widthMm)||c.bays*c.bayPitch+c.footType;");
 replace("    svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.innerHTML=out;",`    const totalWidth=Number(layout.totalWidth||c.totalWidth)||c.bays*(c.palletWidth+240)+90;
    const lengthY=Math.min(h-46,ground+30),metres=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:3}).format(totalWidth/1000);
    out+='<g class="rafex-front-total-v380" data-display-bays="5" data-total-mm="'+totalWidth+'"><line class="dim-line dim-main" x1="'+left+'" y1="'+lengthY+'" x2="'+right+'" y2="'+lengthY+'"/><path class="dim-line dim-main" d="M'+left+' '+(lengthY-4)+'v8M'+right+' '+(lengthY-4)+'v8"/><text x="'+((left+right)/2)+'" y="'+(lengthY+18)+'" text-anchor="middle" style="font:800 18px Arial">TOPLAM UZUNLUK · '+metres+' m</text><text x="'+((left+right)/2)+'" y="'+(lengthY+34)+'" text-anchor="middle" style="font:12px Arial">5 temsili blok</text></g>';
    svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.innerHTML=out;`);
 replace("const signature=JSON.stringify({ reportLanguage:document.getElementById('m2ReportLanguage')?.value||'tr',system:type.system,drawing:seed.drawing});","const signature=JSON.stringify({frontRepresentation:'five-bays-v380',reportLanguage:document.getElementById('m2ReportLanguage')?.value||'tr',system:type.system,drawing:seed.drawing});");
 return transformElevationHeightV422(html.replace('</head>','<meta data-representative-front="v380"></head>'));
}

export function transformElevationHeightV422(html){
 if(html.includes('data-elevation-height="v422"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v422 anchor '+a.slice(0,95));html=html.split(a).join(b);};
 replace('rackHeight = firstRail + (levels - 1) * levelHeight + loadHeight / 2,','rackHeight = Math.max(firstRail + (levels - 1) * levelHeight + loadHeight / 2,Number(drawing?.sideUprightHeight)||0),');
 replace('rackHeightMm = topRailHeightMm + loadHeightMm / 2,','rackHeightMm = Math.max(topRailHeightMm + loadHeightMm / 2,Number(drawing?.sideUprightHeight)||0),');
 const sharedHeight="c.uprightHeight=system==='drive'?window.rafexDriveInUprightHeight(d):c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2;";
 if(html.includes(sharedHeight))replace(sharedHeight,"c.uprightHeight=system==='drive'?window.rafexDriveInUprightHeight(d):Math.max(c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2,Number(d.sideUprightHeight)||0);");else replace('c.uprightHeight=c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2;', 'c.uprightHeight=Math.max(c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2,Number(d.sideUprightHeight)||0);');
 replace('if(storedV135&&!representativeFront)return storedV135;',"if(storedV135&&!representativeFront&&!(drawing?.rafexSystem==='mekik2'&&drawing?.mekikUprightMode==='manual'))return storedV135;");
 // A longer upright does not move the pallets or change their top elevation.
 replace('topLoadHeight = totalRackHeight,','topLoadHeight = firstRailHeight+(levels-1)*levelH+palletHeight,',2);
 replace('topLoadY = modelTopPadding + Math.max(0, (maxProjectionHeight - topLoadHeight * drawingScale) / 2),','topLoadY = modelTopPadding + Math.max(0,(maxProjectionHeight-sideContentHeightMm*drawingScale)/2)+(sideContentHeightMm-topLoadHeight)*drawingScale,',2);
 replace('y0 = topLoadY - sideMarginTop * drawingScale,','y0 = topLoadY-(sideContentHeightMm-topLoadHeight)*drawingScale-sideMarginTop*drawingScale,',2);
 replace('modelBottom = topLoadY + sideContentHeightMm * drawingScale,','modelBottom = topLoadY + topLoadHeight * drawingScale,',2);
 html=html.replace('</head>','<meta data-elevation-height="v422"></head>');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v422 body');
 return html.slice(0,end)+'<script data-mekik-input-order="v422">('+arrangeMekikInputsV422.toString()+')();</script>'+html.slice(end);
}

export function arrangeMekikInputsV422(){
 const arrange=()=>{
  if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mekik2')return;
  const get=id=>document.getElementById(id),field=id=>get(id)?.closest('.input-field');
  const foot=field('m2FootProfile'),height=get('m2UprightWrapV421'),extra=field('m2Extra');
  const pair=(first,second,id)=>{
   if(!first||!second)return;
   let wrap=get(id);
   if(!wrap){wrap=document.createElement('div');wrap.id=id;wrap.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;grid-column:1/-1;align-items:start';first.before(wrap);}
   for(const node of [first,second]){if(node.style.getPropertyValue('grid-column')!=='auto'||node.style.getPropertyPriority('grid-column')!=='important')node.style.setProperty('grid-column','auto','important');if(node.style.getPropertyValue('min-width')!=='0px')node.style.setProperty('min-width','0px','important');if(node.parentElement!==wrap)wrap.appendChild(node);}
   const choice=first.querySelector('.m2-foot-choice-row');
   if(choice&&choice.style.display!=='grid'){choice.style.setProperty('display','grid','important');choice.style.setProperty('grid-template-columns','minmax(0,1fr)','important');}
  };
  pair(field('m2RailThickness'),field('m2RailHeight'),'m2RailPairV422');
  pair(field('m2PalletWeight'),field('m2LevelH'),'m2PalletPairV422');
  pair(field('m2PalW'),field('m2PalD'),'m2PalletSizePairV423');
  const count=field('m2Depth'),sizes=get('m2PalletSizePairV423'),loads=get('m2PalletPairV422'),other=get('m2OtherDepthWrap');
  let countRow=get('m2DepthRowV423');
  if(count&&!countRow){countRow=document.createElement('div');countRow.id='m2DepthRowV423';countRow.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;grid-column:1/-1';count.before(countRow);countRow.appendChild(count);}
  if(count&&count.style.getPropertyValue('grid-column')!=='auto')count.style.setProperty('grid-column','auto','important');
  if(countRow&&sizes&&countRow.nextElementSibling!==sizes)countRow.after(sizes);
  if(sizes&&loads&&sizes.nextElementSibling!==loads)sizes.after(loads);
  if(sizes&&other&&other.parentElement!==sizes)sizes.appendChild(other);
  if(other&&other.style.getPropertyValue('grid-column')!=='2')other.style.setProperty('grid-column','2','important');
  if(other&&(other.style.getPropertyValue('display')!=='none'||other.style.getPropertyPriority('display')!=='important'))other.style.setProperty('display','none','important');

  if(foot&&height&&height.previousElementSibling!==foot)foot.after(height);
  if(height&&extra&&extra.previousElementSibling!==height)height.after(extra);
  if(extra&&extra.style.getPropertyValue('grid-column')!=='1 / -1')extra.style.setProperty('grid-column','1 / -1');
 };
 window.rafexObserveUIV321?.(arrange);arrange();
}


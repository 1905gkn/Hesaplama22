export function transform(html){
 if(html.includes('data-representative-front="v380"'))return html;
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
 return html.replace('</head>','<meta data-representative-front="v380"></head>');
}

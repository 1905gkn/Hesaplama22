export function manualPalletWeightsV398(rows,count){
  const divisor=Math.max(1,Number(count)||1);
  return (rows||[]).map(row=>{
    const value=row?.palletWeight!=null?Number(row.palletWeight):row?.weight!=null?Number(row.weight)/divisor:NaN;
    return Number.isFinite(value)&&value>=0?value:null;
  });
}

export function namePalletVariantsV398(rows){
  const groups=new Map();
  for(const row of rows){
    const d=row.drawing||row,name=String(row.name||d.typeName||'').trim(),key=JSON.stringify([row.rafexSystem||d.rafexSystem||'',name.toLocaleUpperCase('tr-TR')]);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(row);
  }
  return [...groups.values()].flatMap(group=>group.map((entry,index)=>group.length>1?{...entry,name:String(entry.name||entry.drawing?.typeName||'').trim()+(index+1)}:entry));
}

export function transform(html){
  if(html.includes('data-manual-pallet-weight="v398"'))return transformVisibleWeightsV400(transformPerPalletInputV399(html));
  const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v398 HTML anchor '+a.slice(0,100));html=html.replace(a,b);};
  const helper='<script data-manual-pallet-weight="v398">window.rafexManualPalletWeightsV398='+manualPalletWeightsV398.toString()+';window.rafexNamePalletVariantsV398='+namePalletVariantsV398.toString()+';</script>';
  html=html.replace('</head>',helper+'</head>');
  replace('return {...o,traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[],','return {...o,palletWeights:[],traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[],');
  replace('const selected=rows.slice(0,o.levels);','const selected=rows.slice(0,o.levels);\n  o.palletWeights=window.rafexManualPalletWeightsV398(selected,o.palletCount);');
  replace('function normalizeRackPreviewV233(options,d){','function normalizeRackPreviewV233(options,d){\n   options={...options,palletWeights:window.rafexManualPalletWeightsV398(d.b2b?.manualLevelSpecs?.length?d.b2b.manualLevelSpecs:d.b2b?.customLevels||[],options.palletCount)};');
  replace('if(stored)return window.rafexEndFrameOptions?window.rafexEndFrameOptions(rack,stored):stored;','if(stored){stored.palletWeights=window.rafexManualPalletWeightsV398(rack.b2b?.manualLevelSpecs?.length?rack.b2b.manualLevelSpecs:rack.b2b?.customLevels||[],stored.palletCount);return window.rafexEndFrameOptions?window.rafexEndFrameOptions(rack,stored):stored;}');
  replace('const o = {...options};\n  o.dimensionLabelScale','const o = {...options,palletWeights:window.rafexManualPalletWeightsV398(state.manualLevelSpecs?.length?state.manualLevelSpecs:state.customLevels||[],options.palletCount)};\n  o.dimensionLabelScale');
  replace('types=window.rafexPalletRowsV395(types);','types=window.rafexNamePalletVariantsV398(window.rafexPalletRowsV395(types));');
  replace("const storedV135=window.rafexCopiedDetailV135?.('b2b');if(storedV135)return storedV135;", "const storedV135=window.rafexCopiedDetailV135?.('b2b');if(storedV135){const state=window.b2bReadInputState();return {...storedV135,palletWeights:window.rafexManualPalletWeightsV398(state.manualLevelSpecs?.length?state.manualLevelSpecs:state.customLevels||[],storedV135.palletCount)};}");
  return transformVisibleWeightsV400(transformPerPalletInputV399(html));
}

export function transformVisibleWeightsV400(html){
  if(html.includes('data-visible-pallet-weight="v400"'))return html;
  const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v400 weight anchor '+a.slice(0,90));html=html.replace(a,b);};
  replace('moduleCount:1,moduleOptions:null,sectionWidth:Number(l.sectionWidth||saved.sectionWidth)', 'moduleCount:1,moduleOptions:null,palletWeight:Number(d.palletWeight??b.palletWeight??saved.palletWeight??0),sectionWidth:Number(l.sectionWidth||saved.sectionWidth)');
  replace('options={...options,palletWeights:', 'options={...options,palletWeight:Number(d.palletWeight??d.b2b?.palletWeight??options.palletWeight??0),palletWeights:');
  replace('const o = {...options,palletWeights:', 'const o = {...options,palletWeight:Number(state.palletWeight??options.palletWeight??0),palletWeights:');
  replace('if(stored){stored.palletWeights=', 'if(stored){stored.palletWeight=Number(rack.palletWeight??rack.b2b?.palletWeight??stored.palletWeight??0);stored.palletWeights=');
  replace('return {...storedV135,palletWeights:', 'return {...storedV135,palletWeight:Number(state.palletWeight??storedV135.palletWeight??0),palletWeights:');
  return html.replace('</head>','<meta data-visible-pallet-weight="v400" name="rafex-pallet-weight-labels" content="all-previews"></head>');
}

export function transformPerPalletInputV399(html){
  if(html.includes('data-per-pallet-input="v399"'))return html;
  const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v399 input anchor '+a.slice(0,100));html=html.replace(a,b);};
  replace("setLabel(weight,level(i)+' ağırlığı (kg)')","setLabel(weight,level(i)+' palet ağırlığı (kg/palet)')");
  replace("(rack?.palletWeight||rack?.b2b?.palletWeight||1000)*o.palletCount:value('b2bPalletWeight',1000)*o.palletCount", "(rack?.palletWeight??rack?.b2b?.palletWeight??1000):value('b2bPalletWeight',1000)");
  replace(" dialog.innerHTML='<h3>'+ (kind==='tunnel'", " dialog.dataset.palletCount=String(o.palletCount);\n dialog.innerHTML='<h3>'+ (kind==='tunnel'");
  replace('Kat ağırlığı bir sıradaki katın toplam yüküdür.','Her kata palet başına ağırlık girin (kg/palet).');
  replace("+levelName+' ağırlığı (kg)<input data-weight", "+levelName+' palet ağırlığı (kg/palet)<input data-weight");
  replace("(r.weight??weight)","(r.palletWeight??(r.weight!=null?Number(r.weight)/Math.max(1,Number(o.palletCount)||1):weight))");
  const from="weight:Number(row.querySelector('[data-weight]').value),palletHeight:",to="weight:Number(row.querySelector('[data-weight]').value)*Math.max(1,Number(o.palletCount)||1),palletHeight:";
  if(html.split(from).length!==3)throw Error('v399 manual collectors must include save and height preview');html=html.replaceAll(from,to);
  replace("load=Number(loadRow?.querySelector('[data-weight]')?.value)||0;const found=choices('normal',width,load)","load=(Number(loadRow?.querySelector('[data-weight]')?.value)||0)*Math.max(1,Number(dialog.dataset.palletCount)||1);const found=choices('normal',width,load)");
  return html.replace('</head>','<meta data-per-pallet-input="v399" name="rafex-manual-weight-unit" content="kg/palet"></head>');
}

export function transformViewerSource(source){
  if(source.includes('/* manual-pallet-weight-v398 */'))return visibleViewerWeightsV400(source);
  const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v398 viewer anchor '+a.slice(0,100));source=source.replace(a,b);};
  replace('      palletCount: count,','      palletCount: count,\n      palletWeights:Array.isArray(next.palletWeights)?next.palletWeights.slice(0,25).map(value=>value!==null&&Number.isFinite(Number(value))&&Number(value)>=0?Number(value):null):[],');
  replace('        section.add(load);','        section.add(load);\n        const kg=this.options.palletWeights[level];\n        if(kg!=null)this.addPalletWeightV398(section,x+palletWidth/2,-this.options.frontPalletGap-8,-loadBottom-levelPalletHeight/2,kg,palletWidth);');
  replace('  applyUserPalletMaterials(root) {',`  addPalletWeightV398(section,x,y,z,kg,width){
    this.palletWeightTexturesV398??=new Map();
    let map=this.palletWeightTexturesV398.get(kg);
    const text=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(kg)+' kg';
    if(!map){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(255,255,255,.84)';ctx.beginPath();ctx.roundRect(8,8,496,112,14);ctx.fill();
    ctx.font='700 84px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#123e5a';
    ctx.fillText(text,256,64,470);
    map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;this.palletWeightTexturesV398.set(kg,map);
    }
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:true,depthWrite:false}));
    label.name='Palet ağırlığı · '+text;label.userData.palletWeight=kg;
    label.position.set(x,y,z);const span=Math.min(width*.78,650)*1.3;label.scale.set(span,span/4,1);section.add(label);
  }
  applyUserPalletMaterials(root) {`);
  replace('let active = null;',`const destroyPalletWeightsV398=B2BViewer.prototype.destroy;
 B2BViewer.prototype.destroy=function(){this.palletWeightTexturesV398?.forEach(texture=>texture.dispose());this.palletWeightTexturesV398?.clear();return destroyPalletWeightsV398.apply(this,arguments);};
 let active = null;`);
  replace('    while(this.content.children.length)this.content.remove(this.content.children[0]);','    this.content.traverse(object=>{if(object.userData.palletWeight!=null)object.material?.dispose();});\n    while(this.content.children.length)this.content.remove(this.content.children[0]);');
  return visibleViewerWeightsV400('/* manual-pallet-weight-v398 */\n'+source);
}

export function visibleViewerWeightsV400(source){
 if(source.includes('/* visible-pallet-weight-v400 */'))return surfaceWeightsV401(source);
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v400 viewer '+a.slice(0,90));source=source.replace(a,b);};
 replace('      palletCount: count,','      palletCount: count,\n      palletWeight:next.palletWeight!=null&&Number.isFinite(Number(next.palletWeight))?Math.max(0,Number(next.palletWeight)):null,');
 replace('const kg=this.options.palletWeights[level];','const kg=this.options.palletWeights[level]??this.options.palletWeight;');
 replace('-this.options.frontPalletGap-8,-loadBottom-levelPalletHeight/2,kg,palletWidth','palletDepth/2-this.options.frontPalletGap,-loadBottom-levelPalletHeight/2,kg,palletWidth');
 replace('map,transparent:true,depthTest:true,depthWrite:false','map,transparent:true,depthTest:false,depthWrite:false');
 replace("label.name='Palet ağırlığı · '+text;","label.renderOrder=90;label.name='Palet ağırlığı · '+text;");
 return surfaceWeightsV401('/* visible-pallet-weight-v400 */\n'+source);
}

export function surfaceWeightsV401(source){
 if(source.includes('/* surface-pallet-weight-v401 */'))return doubleFaceWeightsV404(source);
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v401 surface '+a.slice(0,90));source=source.replace(a,b);};
 replace('kg,palletWidth);','kg,palletWidth,load);');
 replace('addPalletWeightV398(section,x,y,z,kg,width){','addPalletWeightV398(section,x,y,z,kg,width,load){');
 replace("    ctx.fillStyle='rgba(255,255,255,.84)';ctx.beginPath();ctx.roundRect(8,8,496,112,14);ctx.fill();",'    ctx.clearRect(0,0,512,128);');
 replace('const label=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false,depthWrite:false}));',`this.palletWeightGeometryV401??=new THREE.PlaneGeometry(1,1);
    const label=new THREE.Mesh(this.palletWeightGeometryV401,new THREE.MeshBasicMaterial({map,transparent:true,depthTest:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
    label.rotation.x=-Math.PI/2;
    if(load){load.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(load);if(!box.isEmpty()){x=(box.min.x+box.max.x)/2;y=box.max.y+1;z=(box.min.z+box.max.z)/2;}}`);
 replace('this.palletWeightTexturesV398?.clear();return destroyPalletWeightsV398.apply(this,arguments);','this.palletWeightTexturesV398?.clear();this.palletWeightGeometryV401?.dispose();return destroyPalletWeightsV398.apply(this,arguments);');
 return doubleFaceWeightsV404('/* surface-pallet-weight-v401 */\n'+source);
}

export function doubleFaceWeightsV404(source){
 if(source.includes('/* double-face-pallet-weight-v404 */'))return readableWeightFacesV420(source);
 const from='label.scale.set(span,span/4,1);section.add(label);';
 if(source.split(from).length!==2)throw Error('v404 pallet face anchor');
 source=source.replace(from,`label.scale.set(span,span/4,1);section.add(label);
    if(load){const box=new THREE.Box3().setFromObject(load);if(!box.isEmpty()){
      const outside=label.clone();outside.material=label.material.clone();outside.name=label.name+' · Karşı yüz';outside.position.y=box.min.y-1;outside.rotation.set(Math.PI/2,0,Math.PI);section.add(outside);
    }}`);
 return readableWeightFacesV420('/* double-face-pallet-weight-v404 */\n'+source);
}

export function readableWeightFacesV420(source){
 if(source.includes('/* readable-pallet-weight-v420 */'))return source;
 const anchor='section.position.x=positions[moduleIndex];row.add(section);';
 if(source.split(anchor).length!==2)throw Error('v420 row attachment anchor');
 source=source.replace(anchor,anchor+`
        // The second row reflects Y. Compensate the text's horizontal axis
        // once, without mirroring the pallet mesh or its weight texture.
        section.traverse(part=>{
          if(part.userData.palletWeight==null)return;
          if(rowIndex===1)part.scale.x=-Math.abs(part.scale.x);
          part.material.side=THREE.FrontSide;
        });`);
 return '/* readable-pallet-weight-v420 */\n'+source;
}

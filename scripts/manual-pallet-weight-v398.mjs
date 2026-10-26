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
  if(html.includes('data-manual-pallet-weight="v398"'))return html;
  const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v398 HTML anchor '+a.slice(0,100));html=html.replace(a,b);};
  const helper='<script data-manual-pallet-weight="v398">window.rafexManualPalletWeightsV398='+manualPalletWeightsV398.toString()+';window.rafexNamePalletVariantsV398='+namePalletVariantsV398.toString()+';</script>';
  html=html.replace('</head>',helper+'</head>');
  replace('return {...o,traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[],','return {...o,palletWeights:[],traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[],');
  replace('const selected=rows.slice(0,o.levels);','const selected=rows.slice(0,o.levels);\n  o.palletWeights=window.rafexManualPalletWeightsV398(selected,o.palletCount);');
  replace('function normalizeRackPreviewV233(options,d){','function normalizeRackPreviewV233(options,d){\n   options={...options,palletWeights:window.rafexManualPalletWeightsV398(d.b2b?.manualLevelSpecs?.length?d.b2b.manualLevelSpecs:d.b2b?.customLevels||[],options.palletCount)};');
  replace('if(stored)return window.rafexEndFrameOptions?window.rafexEndFrameOptions(rack,stored):stored;','if(stored){stored.palletWeights=window.rafexManualPalletWeightsV398(rack.b2b?.manualLevelSpecs?.length?rack.b2b.manualLevelSpecs:rack.b2b?.customLevels||[],stored.palletCount);return window.rafexEndFrameOptions?window.rafexEndFrameOptions(rack,stored):stored;}');
  replace('const o = {...options};\n  o.dimensionLabelScale','const o = {...options,palletWeights:window.rafexManualPalletWeightsV398(state.manualLevelSpecs?.length?state.manualLevelSpecs:state.customLevels||[],options.palletCount)};\n  o.dimensionLabelScale');
  replace('types=window.rafexPalletRowsV395(types);','types=window.rafexNamePalletVariantsV398(window.rafexPalletRowsV395(types));');
  return html;
}

export function transformViewerSource(source){
  if(source.includes('/* manual-pallet-weight-v398 */'))return source;
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
    ctx.font='700 70px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#123e5a';
    ctx.fillText(text,256,64,470);
    map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;this.palletWeightTexturesV398.set(kg,map);
    }
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:true,depthWrite:false}));
    label.name='Palet ağırlığı · '+text;label.userData.palletWeight=kg;
    label.position.set(x,y,z);const span=Math.min(width*.78,650);label.scale.set(span,span/4,1);section.add(label);
  }
  applyUserPalletMaterials(root) {`);
  replace('    this.controls.dispose();','    this.palletWeightTexturesV398?.forEach(texture=>texture.dispose());\n    this.palletWeightTexturesV398?.clear();\n    this.controls.dispose();');
  replace('    while(this.content.children.length)this.content.remove(this.content.children[0]);','    this.content.traverse(object=>{if(object.userData.palletWeight!=null)object.material?.dispose();});\n    while(this.content.children.length)this.content.remove(this.content.children[0]);');
  return '/* manual-pallet-weight-v398 */\n'+source;
}

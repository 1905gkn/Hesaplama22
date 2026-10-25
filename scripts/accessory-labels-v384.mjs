export function transformViewerSource(source){
 if(source.includes('/* accessory-labels-v384 */'))return source;
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v384 viewer anchor '+a.slice(0,90));source=source.replace(a,b)};
 const helper=String.raw`function b2bAccessoryNotesV384(options,from,traverseTop){
 if(options.dimensions?.accessories===false)return [];
 const tunnel=Number(options.tunnelHeight)||0;if(from<tunnel-.5)return [];
 const count=options.firstPalletPosition==='traverse'?options.levels:Math.max(0,options.levels-1);
 let level=-1;for(let i=0;i<count;i++)if(Math.abs(traverseTop(i)-from)<1&&traverseTop(i)>tunnel)level=i;
 const notes=[];
 for(const [type,label] of [['tray','Tavalı'],['hTraverse','H travers'],['palletStop','Palet dayama']]){
  if(level>=0&&(options.accessories||[]).some(item=>item.type===type&&(item.levels||[]).some(value=>Number(value)===level+1)))notes.push(label);
 }
 if((options.collectionFloors||[]).some(floor=>Number(floor.bottom)>=tunnel&&Math.abs(Number(floor.bottom)+(Number(floor.zsHeight)||0)-from)<1))notes.push('Toplama katı');
 return notes;
}
/* end-accessory-notes-v384 */
`;
 source=helper+source;
 replace('traverseIncluded: next.dimensions?.traverseIncluded === true,','accessories: next.dimensions?.accessories !== false,\n        traverseIncluded: next.dimensions?.traverseIncluded === true,');
 replace('  addVerticalDimension(layer, x, y, from, to, label, witnessX) {',`  addVerticalDimension(layer, x, y, from, to, label, witnessX) {
    const notes=b2bAccessoryNotesV384(this.options,from,index=>this.traverseTop(index));
    if(notes.length)label+='\\n'+notes.join('\\n');`);
 const start=source.indexOf('  addDimensionLabelAt(layer, x, y, z, text, width = 800) {'),end=source.indexOf('\n  uprightHeight()',start);
 if(start<0||end<0)throw Error('v384 label method');
 source=source.slice(0,start)+String.raw`  addDimensionLabelAt(layer, x, y, z, text, width = 800) {
    const lines=String(text).split('\n'),canvas=document.createElement('canvas'),scale=4,labelWidth=width*1.5,labelHeight=157.5+Math.max(0,lines.length-1)*76;
    canvas.width=labelWidth*scale;canvas.height=labelHeight*scale;
    const context=canvas.getContext('2d');context.scale(scale,scale);
    const language=()=>this.reportLanguage||this.options.language||document.documentElement.lang;
    const paint=()=>{
      context.clearRect(0,0,labelWidth,labelHeight);context.fillStyle='rgba(5,40,72,.98)';context.beginPath();context.roundRect(0,0,labelWidth,labelHeight,18);context.fill();context.strokeStyle='#3e8fb2';context.lineWidth=4;context.stroke();
      context.textAlign='center';context.textBaseline='middle';
      lines.forEach((line,index)=>{context.font=(index?'600 62':'900 84')+'px Arial';context.fillStyle=index?'#d8edf7':'#fff';context.fillText(window.rafexDimensionText?.(line,language())||line,labelWidth/2,index?157.5+(index-.5)*76:78.75,labelWidth-36);});
    };paint();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(16,this.renderer.capabilities.getMaxAnisotropy());
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
    let previous=language();sprite.onBeforeRender=()=>{if(previous!==language()){previous=language();paint();texture.needsUpdate=true;}};
    const userScale=this.options.dimensionLabelScale||1;
    sprite.position.set(x,y,z);sprite.scale.set(width*1.85*userScale,220*userScale*labelHeight/157.5,1);sprite.userData.dimensionLabel=true;sprite.userData.baseScale=sprite.scale.clone();sprite.renderOrder=101;this.dimensionLabels.push(sprite);layer.add(sprite);
  }
`+source.slice(end);
 replace('dimensions: { traverseIncluded: options.dimensions?.traverseIncluded === true, ...dimensions }','dimensions: { traverseIncluded: options.dimensions?.traverseIncluded === true, ...dimensions, accessories: options.dimensions?.accessories !== false }');
 return '/* accessory-labels-v384 */\n'+source;
}

export function transform(html){
 if(html.includes('data-accessory-labels="v384"'))return html;
 html=html.replaceAll('traverseIncluded:false,levels:true,markers:true,eye:true,width:false,depth:true','accessories:true,traverseIncluded:false,levels:true,markers:true,eye:true,width:false,depth:true');
 html=html.replace('let b2bDimensionVisibility = { traverseIncluded:false, levels:true','let b2bDimensionVisibility = { accessories:true, traverseIncluded:false, levels:true');
 html=html.replace('const DIMENSION_DEFAULTS = { traverseIncluded: false, levels: true','const DIMENSION_DEFAULTS = { accessories:true, traverseIncluded: false, levels: true');
 const anchor='<label><input id="b2bDimension-levels"';if(html.split(anchor).length!==2)throw Error('v384 dialog');
 html=html.replace(anchor,'<label><input id="b2bDimension-accessories" type="checkbox"> Aksesuarları göster / gizle</label>'+anchor);
 html=html.replace('dimensions:{traverseIncluded:b.dimensionVisibility?.traverseIncluded??saved.dimensions?.traverseIncluded??false,levels:true','dimensions:{accessories:b.dimensionVisibility?.accessories??saved.dimensions?.accessories??true,traverseIncluded:b.dimensionVisibility?.traverseIncluded??saved.dimensions?.traverseIncluded??false,levels:true');
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script data-accessory-labels="v384">window.rafexAccessoryLabelsVersion="v384";</script>'+html.slice(end);
}


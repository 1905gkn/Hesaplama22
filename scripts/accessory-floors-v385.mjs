export function transformViewerSource(source){
 if(source.includes('/* accessory-floors-v385 */'))return source;
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v385 anchor '+a.slice(0,95));source=source.replace(a,b)};
 replace('level >= 1 && level <= 25','level >= (item.type === "palletStop" ? 0 : 1) && level <= 25');
 replace('levels.forEach((humanLevel) => {','levels.forEach((humanLevel) => {\n        if(Number(humanLevel)===0)return; // Ground stops retain their existing separate geometry.');
 replace(' const notes=[];',' const notes=[];\n if(Math.abs(from)<1&&options.firstPalletPosition!==\'traverse\'&&!tunnel&&(options.accessories||[]).some(item=>item.type===\'palletStop\'&&(item.levels||[]).some(value=>Number(value)===0)))notes.push(\'Palet dayama\');');
 replace('    const layer = new THREE.Group();\n    layer.name = "B2B 3D Ölçüler";','    const layer = new THREE.Group();\n    this.accessoryLabelledV385=new Set();\n    layer.name = "B2B 3D Ölçüler";');
 replace('    const notes=b2bAccessoryNotesV384(this.options,from,index=>this.traverseTop(index));',`    const support=from===0&&this.options.firstPalletPosition==='traverse'&&!(this.options.tunnelHeight>0)?this.traverseTop(0):from;
    const key=Math.round(support),seen=this.accessoryLabelledV385?.has(key);
    this.accessoryLabelledV385?.add(key);
    const notes=seen?[]:b2bAccessoryNotesV384(this.options,support,index=>this.traverseTop(index));`);
 replace('    const topPallet = this.loadBottom(this.options.levels - 1) + this.palletHeightAt(this.options.levels - 1);',`    this.addUnmeasuredAccessoryLabelsV385(levelsLayer,lineX,frontY);
    const topPallet = this.loadBottom(this.options.levels - 1) + this.palletHeightAt(this.options.levels - 1);`);
 const at=source.indexOf('  addVerticalDimension(layer,');if(at<0)throw Error('v385 dimension method');
 const method=String.raw`  addUnmeasuredAccessoryLabelsV385(layer,x,y){
    if(this.options.dimensions?.accessories===false)return;
    const floors=[],tunnel=Number(this.options.tunnelHeight)||0;
    if(this.options.firstPalletPosition==='ground'&&!tunnel)floors.push({height:0,title:'ZEMİN'});
    const count=this.options.firstPalletPosition==='traverse'?this.options.levels:Math.max(0,this.options.levels-1);
    for(let i=0;i<count;i++)if(this.traverseBottom(i)>=tunnel)floors.push({height:this.traverseTop(i),title:'K'+(i+1)});
    for(const floor of this.options.collectionFloors||[])if(Number(floor.bottom)>=tunnel)floors.push({height:Number(floor.bottom)+(Number(floor.zsHeight)||0),title:'TOPLAMA '+(Number(floor.index||0)+1)});
    for(const floor of floors){
      const key=Math.round(floor.height);if(this.accessoryLabelledV385?.has(key))continue;
      this.accessoryLabelledV385?.add(key);
      const notes=b2bAccessoryNotesV384(this.options,floor.height,index=>this.traverseTop(index));
      this.addDimensionLabel(layer,x-380,y,floor.height,floor.title+'\n'+(notes.length?notes.join('\n'):'Aksesuar yok'),700);
    }
  }

`;
 source=source.slice(0,at)+method+source.slice(at);
 return '/* accessory-floors-v385 */\n'+source;
}
export function transform(html){
 if(html.includes('data-accessory-floors="v385"'))return html;
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script data-accessory-floors="v385">window.rafexAccessoryFloorsVersion="v385";</script>'+html.slice(end);
}


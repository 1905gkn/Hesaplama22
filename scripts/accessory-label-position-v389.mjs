export function transformViewerSource(source){
 if(source.includes('/* accessory-label-position-v389 */'))return source;
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v389 anchor '+a.slice(0,95));source=source.replace(a,b)};
 replace("floors.push({height:this.traverseTop(i),title:'K'+(i+1)})","floors.push({height:this.traverseTop(i),labelHeight:this.loadBottom(this.options.firstPalletPosition==='traverse'?i:i+1)+this.palletHeightAt(this.options.firstPalletPosition==='traverse'?i:i+1)/2,title:'K'+(i+1)})");
 replace("this.addDimensionLabel(layer,x-380,y,floor.height,floor.title+", "this.addDimensionLabel(layer,x-380,y,floor.labelHeight??floor.height,floor.title+");
 return '/* accessory-label-position-v389 */\n'+source;
}


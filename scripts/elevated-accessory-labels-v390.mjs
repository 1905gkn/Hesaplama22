export function transformViewerSource(source){
 if(source.includes('/* elevated-accessory-labels-v390 */'))return source;
 const from="const support=from===0&&this.options.firstPalletPosition==='traverse'&&!(this.options.tunnelHeight>0)&&!this.options.collectionFloors?.length?this.traverseTop(0):from;";
 const to="const support=from;\n    const floorGap=from===0&&this.options.firstPalletPosition==='traverse'&&!/TOPLAMA/.test(label);";
 if(source.split(from).length!==2)throw Error('v390 support anchor');source=source.replace(from,to);
 const notes='const notes=seen||(from===0&&/TOPLAMA/.test(label))?[]:';
 if(source.split(notes).length!==2)throw Error('v390 gap anchor');source=source.replace(notes,'const notes=floorGap||seen||(from===0&&/TOPLAMA/.test(label))?[]:');
 return '/* elevated-accessory-labels-v390 */\n'+source;
}


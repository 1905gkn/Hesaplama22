export function transformViewerSource(source){
 if(source.includes('/* collection-accessory-isolation-v387 */'))return source;
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v387 viewer '+a.slice(0,95));source=source.replace(a,b)};
 replace(' const count=options.firstPalletPosition===\'traverse\'?options.levels:Math.max(0,options.levels-1);',` const collection=(options.collectionFloors||[]).some(floor=>Number(floor.bottom)>=tunnel&&Math.abs(Number(floor.bottom)+(Number(floor.zsHeight)||0)-from)<1);
 if(collection)return ['Toplama katı'];
 const count=options.firstPalletPosition==='traverse'?options.levels:Math.max(0,options.levels-1);`);
 replace("const support=from===0&&this.options.firstPalletPosition==='traverse'&&!(this.options.tunnelHeight>0)?this.traverseTop(0):from;","const support=from===0&&this.options.firstPalletPosition==='traverse'&&!(this.options.tunnelHeight>0)&&!this.options.collectionFloors?.length?this.traverseTop(0):from;");
 replace('const notes=seen?[]:b2bAccessoryNotesV384(this.options,support,index=>this.traverseTop(index));',"const notes=seen?[]:/TOPLAMA/.test(label)&&this.options.dimensions?.accessories!==false?['Toplama katı']:b2bAccessoryNotesV384(this.options,support,index=>this.traverseTop(index));");
 return '/* collection-accessory-isolation-v387 */\n'+source;
}
export function transform(html){
 if(html.includes('data-collection-accessory-isolation="v387"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v387 UI '+a.slice(0,95));html=html.replace(a,b)};
 replace("const groundV151=()=>document.getElementById('b2bFirstPalletPosition')?.value!=='traverse';","const groundV151=()=>(typeof appliedCollection==='undefined'||appliedCollection.enabled!==true)&&document.getElementById('b2bFirstPalletPosition')?.value!=='traverse';");
 replace("const validLevels=()=>window.rafexAccessoryLevelsV121?.()||Array.from({length:levelCount()},(_,i)=>i+1);","const validLevels=()=>(window.rafexAccessoryLevelsV121?.()||Array.from({length:levelCount()},(_,i)=>i+1)).filter(level=>Number.isInteger(Number(level))&&Number(level)>=1&&Number(level)<=levelCount());");
 replace("return String(rack?.b2b?.firstPalletPosition||'ground')!=='traverse'","return rack?.b2b?.collectionLevels?.enabled!==true&&String(rack?.b2b?.firstPalletPosition||'ground')!=='traverse'");
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script data-collection-accessory-isolation="v387">window.rafexCollectionAccessoryIsolation="v387";</script>'+html.slice(end);
}


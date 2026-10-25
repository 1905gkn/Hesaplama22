export function katWirePlan(length,customWidth){
 const span=Number(length),custom=Number(customWidth),tolerance=50;
 const fit=width=>{const count=Math.floor((span+1e-7)/width),covered=count*width,gap=span-covered;return {width,count,covered,gap,valid:count>0&&gap>=-1e-6&&gap<=tolerance+1e-6};};
 if(!(span>0&&Number.isFinite(span)))return {valid:false,count:0,width:0,covered:0,gap:0,standardFit:false,reason:'Travers boyu bulunamadı.'};
 const standards=[fit(890),fit(1100)],standard=standards.find(p=>p.valid);
 if(standard)return {...standard,standardFit:true,custom:false};
 const closest=standards.filter(p=>p.count>0).sort((a,b)=>a.gap-b.gap||a.width-b.width)[0]||standards[0];
 if(customWidth!==null&&customWidth!==undefined&&String(customWidth).trim()!==''){
  if(!(custom>0&&custom<=1200&&Number.isFinite(custom)))return {...closest,valid:false,standardFit:false,custom:true,reason:'Özel genişlik 0 mm’den büyük ve en fazla 1200 mm olmalı.'};
  const p=fit(custom);return {...p,standardFit:false,custom:true,reason:p.valid?'':p.count<1?'Özel genişlik travers boyunu aşıyor.':'Özel ölçüde de kalan boşluk en fazla 50 mm olmalı.'};
 }
 return {...closest,valid:false,standardFit:false,custom:false,reason:'890 ve 1100 mm standartları 50 mm toleransa uymuyor.'};
}

export function tunnelCoverItems(items,cover,first){
 const out=(items||[]).filter(item=>!item.tunnelCover).map(item=>({...item,levels:[...(item.levels||[])]}));
 if(first==null)return out;
 const type=cover?.type==='katWire'?'katWire':'tray';
 if(!out.some(item=>item.type===type&&item.levels.includes(first)))out.push({type,levels:[first],tunnelCover:true,...(type==='tray'?{width:300}:{customWidth:cover?.customWidth??null})});
 return out;
}

function runtime(){
 const api=window.rafexKatWireV392;
 let wireOriginal=null;
 const normalFields=()=>['m2CustomizeBlockName','m2CustomizeName','m2CustomizePalletCount','m2CustomizeLevels','m2CustomizePalletHeight','m2CustomizeRowType','m2CustomizeRowGap','m2CustomizeManualLevels'].map(id=>{const field=document.getElementById(id);return [id,field?.type==='checkbox'?field.checked:field?.value];});
 const accessoriesSignature=items=>JSON.stringify((items||[]).filter(item=>!item.tunnelCover&&item.levels?.length).map(item=>({...item,levels:[...new Set(item.levels.map(Number))].sort((a,b)=>a-b)})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
 const manual=()=>window.rafexManualCustomizeRowsV178?.()||[];
 const collectionSignature=value=>value?.enabled?JSON.stringify(value):'';
 api.begin=rack=>{wireOriginal={id:rack.id,signature:accessoriesSignature(api.editable(rack.b2b?.accessories)),fields:JSON.stringify(normalFields()),manual:JSON.stringify(manual()),pallets:window.m2CustomizePalletsVisible?.(),collection:collectionSignature(rack.b2b?.collectionLevels)};};
 api.requiresNewType=rack=>{
  if(wireOriginal?.id!==rack.id)return false;
  const collection=window.rafexCollectCustomizeCollectionV119?.(rack.id)||rack.b2b?.collectionLevels||{enabled:false,groundGap:500,floors:[]};
  return wireOriginal.signature!==accessoriesSignature(window.m2CollectCustomizeRackAccessories?.()||rack.b2b?.accessories)||wireOriginal.fields!==JSON.stringify(normalFields())||wireOriginal.manual!==JSON.stringify(manual())||wireOriginal.pallets!==window.m2CustomizePalletsVisible?.()||(!document.getElementById('m2CustomizeTunnel')?.checked&&wireOriginal.collection!==collectionSignature(collection));
 };
 api.cover=()=>({type:document.getElementById('m2CustomizeTunnelCover')?.value==='katWire'?'katWire':'tray',customWidth:document.getElementById('m2CustomizeTunnelWireWidth')?.value?Number(document.getElementById('m2CustomizeTunnelWireWidth').value):null});
 api.renderCover=()=>{const host=document.getElementById('m2CustomizeTunnelWireControls');if(!host)return;const active=document.getElementById('m2CustomizeTunnel')?.checked===true;document.getElementById('m2CustomizeTunnelCover').disabled=!active;host.innerHTML=active&&api.cover().type==='katWire'?api.controls(api.customSpan(),api.cover(),'event.stopPropagation();document.getElementById(\'m2CustomizeTunnelWireWidth\').value=this.value;m2PreviewRackCustomization();rafexKatWireV392.renderCover();'):'';};
 api.editable=items=>{
  let out=(items||[]).filter(item=>!item.tunnelCover);
  try{const rack=m2LayoutState.racks.find(r=>Number(r.id)===Number(m2CustomizeRackId));if(rack?.b2b?.tunnelHeight>0&&!rack.b2b.tunnelCover){const o=window.rafexB2BDetailOptionsV117(rack),first=window.rafexPhysicalLevelsV121(o).find(f=>f.bottom>=o.tunnelHeight)?.level;out=out.map(item=>item.type==='tray'?{...item,levels:(item.levels||[]).filter(n=>n!==first)}:item).filter(item=>item.levels?.length);}}catch{}
  return out;
 };
 const fmt=n=>Number(n).toLocaleString('tr-TR',{maximumFractionDigits:2});
 api.controls=(span,item,handler)=>{
  const standard=api.plan(span),p=api.plan(span,item.customWidth);
  let text=p.count>0?`${fmt(span)} mm travers: ${p.count} × ${fmt(p.width)} = ${fmt(p.covered)} mm · kalan ${fmt(p.gap)} mm.`:`${fmt(span)} mm travers için uygun kat teli ölçüsü girin.`;
  const warning=!standard.valid?`<div role="alert" style="color:#9d2539;margin:8px 0">${standard.reason} ${standard.count>0?`${standard.count} × ${fmt(standard.width)} = ${fmt(standard.covered)} mm; kalan ${fmt(standard.gap)} mm.`:''}</div><label>Özel kat teli genişliği (mm, en fazla 1200)<input type="number" min="1" max="1200" step="1" value="${Number(item.customWidth)>0?Number(item.customWidth):''}" onchange="${handler}"></label>`:'';
  return `<div class="kat-wire-controls-v392" style="font-size:12px;line-height:1.5;margin:10px 0">${warning}<div role="status" style="color:${p.valid?'#245a41':'#9d2539'}">${text}${p.reason?' '+p.reason:''}</div><small>Tamamlama parçası kullanılmaz. Tolerans: 0–50 mm. Derinlik, ayak derinliğidir.</small></div>`;
 };
 api.customSpan=()=>{
  try{const rack=m2LayoutState.racks.find(r=>String(r.id)===String(m2CustomizeRackId));if(!rack)return 0;const input=document.getElementById('m2CustomizePalletCount'),count=Number(input?.value)||rack.b2b?.palletCount;return b2bPalletGeometry({...rack.b2b,palletCount:count}).sectionWidth||rack.b2bLayout?.sectionWidth||0;}catch{return 0;}
 };
 api.inventory=(rack,item)=>{
  const state=rack.b2b||{},layout=rack.b2bLayout||{},p=api.plan(layout.sectionWidth,item.customWidth);if(!p.valid)return [];
  let options;try{options=window.rafexB2BDetailOptionsV117(rack);}catch{}
  const maximum=options?(options.firstPalletPosition==='traverse'?options.levels:options.levels-1):(state.firstPalletPosition==='traverse'?rack.levels:rack.levels-1);
  const physical=options&&window.rafexPhysicalLevelsV121?window.rafexPhysicalLevelsV121(options):null;
  const levels=[...new Set((item.levels||[]).map(Number))].filter(level=>level>=1&&level<=maximum&&(!physical||physical.some(f=>f.level===level&&!(options.tunnelHeight>0&&f.bottom<options.tunnelHeight))));
  const rows=Math.max(1,Number(layout.rowCount)||(state.rowType==='double'?2:1)),depth=Number(layout.frameDepth)||Math.max(0,Number(layout.palletDepth||rack.palD)-2*Number(state.palletOverhang??50));
  return levels.length?[{name:'Kat Teli',qty:p.count*levels.length*rows,spec:fmt(p.width)+' × '+fmt(depth)+' mm'+(p.custom?' · Özel ölçü':''),unit:'adet'}]:[];
 };
}

export function transform(html){
 if(html.includes('data-kat-wire="v392"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v392 HTML anchor '+a.slice(0,100));html=html.replace(a,b)};
 replace("if(sys==='b2b'){window.rafexLoadCustomizeCollectionV119?.(rack);", "if(sys==='b2b'){window.rafexLoadCustomizeCollectionV119?.(rack);window.rafexKatWireV392.begin(rack);");
 replace('if(session?.rackId===r.id&&!session.nonTunnelEdited&&','if(session?.rackId===r.id&&!window.rafexKatWireV392.requiresNewType(r)&&!session.nonTunnelEdited&&');
 replace('  if(old&&entry.name===previous.typeName&&unchanged){entry=old;reused=true;}',`  const wireTypeChanged=window.rafexKatWireV392.requiresNewType(rack);
  if(wireTypeChanged){
   const used=new Set([...catalog,...m2SavedRackTypes].map(t=>String(t.name||'').trim().toLocaleUpperCase('tr-TR')));
   let n=0,name;const letter=value=>{let out='';for(;value;value=Math.floor((value-1)/26))out=String.fromCharCode(65+(value-1)%26)+out;return out;};
   do{name=letter(++n)}while(used.has(name));
   entry={...entry,id:-Math.max(Date.now(),...catalog.map(t=>Math.abs(Number(t.id)||0)+1)),name};
  }
  else if(old&&entry.name===previous.typeName&&unchanged){entry=old;reused=true;}`);
 replace("  const key=system+':'+entry.id,name=entry.name;", "  const key=system+':'+entry.id,name=entry.name;\n  if(wireTypeChanged){entry.rafexCustomNameV203=name;rack.rafexCustomNameV203=name;entry.drawing.rafexCustomNameV203=name;}");
 replace('</span></label></div><div class="m2-customize-actions">','</span></label><label style="grid-column:1/-1">Tünel kaplaması<select id="m2CustomizeTunnelCover" onchange="rafexKatWireV392.renderCover();m2PreviewRackCustomization()"><option value="tray">Tava</option><option value="katWire">Kat Teli</option></select></label><input id="m2CustomizeTunnelWireWidth" type="hidden"><div id="m2CustomizeTunnelWireControls" style="grid-column:1/-1"></div></div><div class="m2-customize-actions">');
 replace('m2ToggleCustomizeTunnel();m2RenderCustomizeLevelRows();',`$("m2CustomizeTunnelCover").value=rack.b2b?.tunnelCover?.type==='katWire'?'katWire':'tray';$("m2CustomizeTunnelWireWidth").value=rack.b2b?.tunnelCover?.customWidth??'';m2ToggleCustomizeTunnel();m2RenderCustomizeLevelRows();window.rafexKatWireV392.renderCover();`);
 replace('function m2ToggleCustomizeTunnel(){const active=',`function m2ToggleCustomizeTunnel(){window.rafexKatWireV392.renderCover();const active=`);
 replace('showPallets:palletsVisible,accessories:clone(draft)','showPallets:palletsVisible,accessories:window.m2CollectCustomizeRackAccessories()');
 replace('window.m2LoadCustomizeRackAccessories=(items)=>{draft=clone(items);','window.m2LoadCustomizeRackAccessories=(items)=>{draft=clone(window.rafexKatWireV392.editable(items));');
 const autoCollect="if(document.getElementById('m2CustomizeTunnel')?.checked){let tray=items.find(i=>i.type==='tray');if(!tray){tray={type:'tray',width:300,levels:[]};items.push(tray)}const first=window.rafexFirstTunnelLevelV121?.();if(first!=null)tray.levels=[first]}return items;";
 replace(autoCollect,"return window.rafexKatWireV392.tunnelItems(items,window.rafexKatWireV392.cover(),document.getElementById('m2CustomizeTunnel')?.checked?window.rafexFirstTunnelLevelV121?.():null);");
 replace("    if(document.getElementById('m2CustomizeTunnel')?.checked){let tray=itemFor('tray');if(!tray){tray={type:'tray',width:300,levels:[]};draft.push(tray)}const first=window.rafexFirstTunnelLevelV121?.();if(first!=null)tray.levels=[first]}",'');
 const normalizeStart=html.indexOf('  function normalizeTunnelTray(){'),normalizeEnd=html.indexOf('  window.m2EnsureTunnelTray=normalizeTunnelTray;',normalizeStart);
 if(normalizeStart<0||normalizeEnd<0)throw Error('Tunnel synchronization anchor');
 html=html.slice(0,normalizeStart)+"  function normalizeTunnelTray(){if(byId('m2CustomizeTunnel')?.checked)preview();}\n"+html.slice(normalizeEnd);
 replace("  if(visible.length){let tray=o.accessories.find(a=>a.type==='tray');if(!tray){tray={type:'tray',width:300,levels:[]};o.accessories.push(tray)}tray.levels=[visible[0].level]}","  o.accessories=window.rafexKatWireV392.tunnelItems(o.accessories,o.tunnelCover,visible[0]?.level);");
 replace(' function applyTunnelV120(options,rack){',' function applyTunnelV120(options,rack){\n   options.tunnelCover=window.rafexKatWireV392.cover();');
 replace('collectionLevels:clone(o.collectionLevels),accessories:clone(o.accessories)','collectionLevels:clone(o.collectionLevels),tunnelCover:clone(o.tunnelCover),accessories:clone(o.accessories)');
 replace('o.accessories=copy(d.b2b?.accessories||[]);','o.tunnelCover=copy(d.b2b?.tunnelCover||{type:\'tray\'});o.accessories=copy(d.b2b?.accessories||[]);');
 replace('if(typeof m2CollectCustomizeRackAccessories==="function")rack.b2b.accessories=m2CollectCustomizeRackAccessories();','rack.b2b.tunnelCover=window.rafexKatWireV392.cover();if(typeof m2CollectCustomizeRackAccessories==="function")rack.b2b.accessories=m2CollectCustomizeRackAccessories();');
 replace("    const p=profileData(text);",`    if(name==='kat teli'){
      const size=text.match(/^([\\d.,]+)\\s*×\\s*([\\d.,]+)\\s*mm/);
      const mm=value=>Number(value.replaceAll('.','').replace(',','.'));
      if(!size)return '';
      const width=mm(size[1]),depth=mm(size[2]);
      return width>0&&depth>0?'KT'+String(depth).padStart(4,'0')+String(width).padStart(4,'0')+'30D':'';
    }
    const p=profileData(text);`);
 replace('|DAB90\\d+))','|DAB90\\d+|KT\\d{8}30D))');
 replace("const TYPES={palletStop:'Palet Dayama',hTraverse:'H Travers',tray:'Tava'};","const TYPES={palletStop:'Palet Dayama',hTraverse:'H Travers',tray:'Tava',katWire:'Kat Teli'};");
 replace("    tray: { label: 'Tava' },","    tray: { label: 'Tava' },\n    katWire: { label: 'Kat Teli' },");
 replace("    levels: [...new Set((item.levels || []).map(Number).filter(Number.isFinite))].sort((a,b) => a-b),","    levels: [...new Set((item.levels || []).map(Number).filter(Number.isFinite))].sort((a,b) => a-b),\n    ...(item.type==='katWire'?{customWidth:item.customWidth??null}:{}),");
 replace("map((item)=>({type:item.type,levels:Array.isArray(item.levels)?", "map((item)=>({type:item.type,...(item.type==='katWire'?{customWidth:item.customWidth??null}:{}),levels:Array.isArray(item.levels)?");
 replace("map((item) => ({ type:item.type, levels:Array.isArray(item.levels)?", "map((item) => ({ type:item.type, ...(item.type==='katWire'?{customWidth:item.customWidth??null}:{}), levels:Array.isArray(item.levels)?");
 replace("<button type=\"button\" onclick=\"rafexAccessoryAdd('tray')\">Tava</button>","<button type=\"button\" onclick=\"rafexAccessoryAdd('tray')\">Tava</button><button type=\"button\" onclick=\"rafexAccessoryAdd('katWire')\">Kat Teli</button>");
 replace("      let trayControls = '';","      let trayControls = item.type==='katWire'?window.rafexKatWireV392.controls(clear,item,`event.stopPropagation();rafexKatWireSetWidthV392(${index},this.value)`):'';");
 replace("  window.rafexAccessoryState = () => cloneState();","  window.rafexKatWireSetWidthV392=(index,value)=>{const item=accessories[index];if(item?.type!=='katWire')return;item.customWidth=value===''?null:Number(value);render();notify();};\n  window.rafexAccessoryState = () => cloneState();");
 replace("    const set = new Set(item.levels || []); set.has(level)","    if(item.type==='katWire'&&!window.rafexKatWireV392.plan(sectionWidth(),item.customWidth).valid){render();return;}\n    const set = new Set(item.levels || []); set.has(level)");
 replace("    const all=levelValuesV151(item.type),selected=", "    if(item.type==='katWire'&&!window.rafexKatWireV392.plan(sectionWidth(),item.customWidth).valid){render();return;}\n    const all=levelValuesV151(item.type),selected=");
 replace("        body=tray+'<div class=\"m2-customize-accessory-level-title\">", "        const wire=type==='katWire'?window.rafexKatWireV392.controls(window.rafexKatWireV392.customSpan(),item,`event.stopPropagation();m2SetCustomizeKatWireWidthV392(this.value)`):'';\n        body=wire+tray+'<div class=\"m2-customize-accessory-level-title\">");
 replace("  window.m2SetCustomizeRackTrayWidth=", "  window.m2SetCustomizeKatWireWidthV392=value=>{const item=itemFor('katWire');if(!item)return;item.customWidth=value===''?null:Number(value);window.m2RenderCustomizeRackAccessories();preview();};\n  window.m2SetCustomizeRackTrayWidth=");
 replace("window.m2ToggleCustomizeRackAccessoryLevel=(type,level)=>{const item=itemFor(type);if(!item)return;","window.m2ToggleCustomizeRackAccessoryLevel=(type,level)=>{const item=itemFor(type);if(!item)return;if(type==='katWire'&&!window.rafexKatWireV392.plan(window.rafexKatWireV392.customSpan(),item.customWidth).valid)return;");
 replace("window.m2AllCustomizeRackAccessoryLevels=(type)=>{const item=itemFor(type);if(!item)return;","window.m2AllCustomizeRackAccessoryLevels=(type)=>{const item=itemFor(type);if(!item)return;if(type==='katWire'&&!window.rafexKatWireV392.plan(window.rafexKatWireV392.customSpan(),item.customWidth).valid)return;");
 replace("      var levels=new Set((Array.isArray(item&&item.levels)?", "      if(item.type==='katWire'){out.push(...window.rafexKatWireV392.inventory(rack,item));return;}\n      var levels=new Set((Array.isArray(item&&item.levels)?");
 replace(`    viewer.addAccessories = function (section, sectionScale, depthScale) {
      const items = Array.isArray(this.options.accessories) ? this.options.accessories : [];`, `    const nativeWireAddV392=viewer.addAccessories;
    viewer.addAccessories = function (section, sectionScale, depthScale) {
      const allItems=Array.isArray(this.options.accessories)?this.options.accessories:[],wireItems=allItems.filter(item=>item.type==='katWire');
      if(wireItems.length){const previous=this.options;try{this.options={...previous,accessories:wireItems,collectionFloors:[]};nativeWireAddV392.call(this,section,sectionScale,depthScale);}finally{this.options=previous;}}
      const items=allItems.filter(item=>item.type!=='katWire');`);
 replace('if(isB2B&&!b2bValidateHeightV109(b2b3DOptions(),b2bReadInputState()))return;',`if(isB2B&&!b2bValidateHeightV109(b2b3DOptions(),b2bReadInputState()))return;
        if(isB2B&&(window.rafexAccessoryState?.()||[]).some(item=>item.type==='katWire'&&item.levels?.length&&!window.rafexKatWireV392.plan(b2bPalletGeometry().sectionWidth,item.customWidth).valid)){alert('Kat teli ölçüsü uygun değil. Uyarının altından toleransa uygun özel genişlik girin.');return;}`);
 replace('function m2ApplyRackCustomization() {',`function m2ApplyRackCustomization() {
        if((window.m2CollectCustomizeRackAccessories?.()||[]).some(item=>item.type==='katWire'&&item.levels?.length&&!window.rafexKatWireV392.plan(window.rafexKatWireV392.customSpan(),item.customWidth).valid)){alert('Kat teli ölçüsü uygun değil. Uyarının altından toleransa uygun özel genişlik girin.');return;}`);
 const first=html.indexOf('<script'),early='<script data-kat-wire="v392">window.rafexKatWireV392={plan:'+katWirePlan.toString()+',tunnelItems:'+tunnelCoverItems.toString()+'};('+runtime.toString()+')();</script>';
 return html.slice(0,first)+early+html.slice(first);
}

export function transformViewerSource(source){
 if(source.includes('/* kat-wire-v392 */'))return source;
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('v392 viewer anchor '+a.slice(0,95));source=source.replace(a,b)};
 replace('["palletStop", "hTraverse", "tray"].includes(item.type)','["palletStop", "hTraverse", "tray", "katWire"].includes(item.type)');
 replace('          type: item.type,','          type: item.type,\n          ...(item.type === "katWire" ? {customWidth:item.customWidth??null} : {}),');
 replace("['palletStop','Palet dayama']]","['palletStop','Palet dayama'],['katWire','Kat teli']]");
 replace('      this.update(this.options, true);','      if(katWireNeededV392(this.options))this.models.katWire=await loadKatWireV392();\n      this.update(this.options, true);');
 replace('    if(!this.models)return;',`    if(!this.models)return;
    if(katWireNeededV392(this.options)&&!this.models.katWire){if(!this.katWireLoadingV392){this.katWireLoadingV392=true;loadKatWireV392().then(model=>{if(this.destroyed)return;this.models.katWire=model;this.katWireLoadingV392=false;this.update(this.options);}).catch(error=>{this.katWireLoadingV392=false;this.emit('b2b-viewer-error',{message:error.message});});}return;}`);
 replace('  addAccessories(section, sectionScale, depthScale) {',`  makeKatWireV392(width,depth){
    const root=new THREE.Group(),normalized=new THREE.Group(),oriented=new THREE.Group(),raw=this.models.katWire.clone(true);
    raw.traverse(part=>{if(part.isMesh){part.castShadow=true;part.receiveShadow=true;}});
    oriented.add(raw);oriented.rotation.z=-Math.PI/2;normalized.add(oriented);normalized.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(normalized),size=bounds.getSize(new THREE.Vector3());oriented.position.sub(bounds.min);
    normalized.scale.set(width/size.x,depth/size.y,48.2/size.z);normalized.updateMatrixWorld(true);
    const finalBounds=new THREE.Box3().setFromObject(normalized);normalized.position.x-=finalBounds.min.x;normalized.position.y-=finalBounds.min.y;normalized.position.z-=finalBounds.max.z;
    root.add(normalized);return root;
  }
  addAccessories(section, sectionScale, depthScale) {`);
 const anchor='        if (accessory.type === "palletStop" && this.models.palletStop) {';
 replace(anchor,`        if(accessory.type==='katWire'&&this.models.katWire){
          const plan=katWirePlanV392(clearWidth,accessory.customWidth);if(!plan.valid||this.options.tunnelHeight>0&&this.traverseBottom(level)<this.options.tunnelHeight)return;
          section.updateMatrixWorld(true);
          const uprightBounds=new THREE.Box3(),inverse=new THREE.Matrix4().copy(section.matrixWorld).invert();
          section.traverse(part=>{if(!part.isMesh||!/AYAK|HRTD|UPRIGHT/i.test(part.name||''))return;const box=new THREE.Box3().setFromObject(part).applyMatrix4(inverse);if(box.max.z-box.min.z>this.uprightHeight()*.5)uprightBounds.union(box);});
          const front=uprightBounds.isEmpty()?116.41129302978516*depthScale:uprightBounds.min.y;
          const rear=uprightBounds.isEmpty()?1167.1944580078125*depthScale:uprightBounds.max.y;
          for(let i=0;i<plan.count;i++){
            const wire=this.makeKatWireV392(plan.width,rear-front);
            wire.name='Kat Teli K'+humanLevel+'-'+(i+1)+' · '+plan.width+' × '+frameDepth+' mm';
            wire.position.set(clearLeft+plan.gap/2+i*plan.width,front,-this.traverseTop(level)+35);section.add(wire);
          }return;
        }
`+anchor);
 return '/* kat-wire-v392 */\nconst katWirePlanV392='+katWirePlan.toString()+`;\nfunction katWireNeededV392(options){return (options?.accessories||[]).some(item=>item.type==='katWire')||(options?.moduleOptions||[]).some(katWireNeededV392);}\nlet katWireModelPromiseV392=null;function loadKatWireV392(){if(!katWireModelPromiseV392){const draco=new DRACOLoader();draco.setDecoderPath('/draco/');draco.setDecoderConfig({type:'wasm'});const loader=new GLTFLoader();loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);katWireModelPromiseV392=loader.loadAsync('/kat-teli.glb?v=v392').then(gltf=>gltf.scene).catch(error=>{katWireModelPromiseV392=null;throw error;}).finally(()=>draco.dispose());}return katWireModelPromiseV392;}\n`+source;
}


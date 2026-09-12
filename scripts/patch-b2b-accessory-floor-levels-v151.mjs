import fs from 'node:fs';

export function transform(html){
  if(html.includes('/* b2b-accessory-floor-levels-v151 */'))return html;
  const replace=(from,to,count=1)=>{
    const hits=html.split(from).length-1;
    if(hits!==count)throw Error(`v151 anchor count ${hits}/${count}: ${from.slice(0,100)}`);
    html=html.split(from).join(to);
  };

  // The accessory selectors use structural beam indexes internally. On a ground-pallet rack,
  // index 0 is the ground pallet stop and beam index 1 is displayed as K2. Therefore K1..Kn
  // still describe exactly n pallet levels without inventing an extra "ZEMIN + K1..Kn" level.
  replace(
    "  const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(document.getElementById('m2CustomizeLevels')?.value)||1)));",
    `  /* b2b-accessory-floor-levels-v151 */
  const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(document.getElementById('m2CustomizeLevels')?.value)||1)));
  const groundRackV151=()=>{try{const id=Number(typeof m2CustomizeRackId!=='undefined'?m2CustomizeRackId:0),rack=(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks:[]).find(item=>Number(item?.id)===id);return String(rack?.b2b?.firstPalletPosition||'ground')!=='traverse'}catch{return true}};
  const levelValuesV151=(type)=>{const count=levelCount(),ground=groundRackV151(),base=validLevels();if(!ground)return base;return type==='palletStop'?[0,...base.filter(level=>level<count)]:base.filter(level=>level<count)};
  const levelLabelV151=(type,level)=>'K'+(groundRackV151()?Number(level)+1:Number(level));`
  );
  replace(
    "window.m2CollectCustomizeRackAccessories=()=>{const items=clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>validLevels().includes(level))}));",
    "window.m2CollectCustomizeRackAccessories=()=>{const items=clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>levelValuesV151(item.type).includes(level))}));"
  );
  replace(
    "const all=(item.type==='palletStop'&&rafexGroundPalletStopAllowed()?[0]:[]).concat(validLevels());",
    "const all=levelValuesV151(item.type);"
  );
  replace(
    "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>(validLevels().includes(level))||(level===0&&item.type==='palletStop'&&rafexGroundPalletStopAllowed()))}));",
    "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>levelValuesV151(item.type).includes(level))}));"
  );
  replace(
    "const groundButton=type==='palletStop'&&rafexGroundPalletStopAllowed()?'<button type=\"button\" data-level=\"0\" class=\"'+(selected.has(0)?'active':'')+'\">ZEMİN</button>':'';\n        const levels=validLevels().map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');",
    "const groundButton='';\n        const levels=levelValuesV151(type).map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">'+levelLabelV151(type,level)+'</button>').join('');"
  );

  replace(
    "  const levelCount = () => Math.max(1, Math.min(15, Math.round(Number(document.getElementById('b2bLevels')?.value) || 1)));",
    `  const levelCount = () => Math.max(1, Math.min(15, Math.round(Number(document.getElementById('b2bLevels')?.value) || 1)));
  const groundV151=()=>document.getElementById('b2bFirstPalletPosition')?.value!=='traverse';
  const levelValuesV151=(type,count=levelCount())=>{const values=Array.from({length:count},(_,i)=>i+1);if(!groundV151())return values;if(type==='palletStop')return [0,...values.filter(level=>level<count)];return values.filter(level=>level<count)};
  const levelLabelV151=(type,level)=>'K'+(groundV151()?Number(level)+1:Number(level));`
  );
  replace(
    "accessories = accessories.map((item) => ({ ...item, levels: (item.levels || []).filter((level) => (item.type === 'palletStop' && level === 0) || (level >= 1 && level <= levels)) }));",
    "accessories = accessories.map((item) => ({ ...item, levels: (item.levels || []).filter((level) => levelValuesV151(item.type,levels).includes(level)) }));"
  );
  replace(
    "const levelValues = (item.type === 'palletStop' ? [0] : []).concat(Array.from({ length: levels }, (_, i) => i + 1));\n      const levelButtons = levelValues.map((level) => `<button type=\"button\" class=\"${selected.has(level) ? 'active' : ''}\" onclick=\"rafexAccessoryToggleLevel(${index},${level})\">${level === 0 ? 'ZEMİN' : `K${level}`}</button>`).join('');",
    "const levelValues = levelValuesV151(item.type,levels);\n      const levelButtons = levelValues.map((level) => `<button type=\"button\" class=\"${selected.has(level) ? 'active' : ''}\" onclick=\"rafexAccessoryToggleLevel(${index},${level})\">${levelLabelV151(item.type,level)}</button>`).join('');"
  );
  replace(
    "const count = levelCount(), ground = item.type === 'palletStop' && (item.levels || []).includes(0), k = (item.levels || []).filter((level) => level >= 1 && level <= count); item.levels = k.length === count ? (ground ? [0] : []) : (ground ? [0] : []).concat(Array.from({length:count},(_,i)=>i+1)); render(); notify();",
    "const all=levelValuesV151(item.type),selected=(item.levels||[]).filter(level=>all.includes(level));item.levels=selected.length===all.length?[]:all;render();notify();"
  );

  // One pallet stop is installed at K1 on the floor. Upper selections and H traverses keep
  // using their actual supporting beam index; their visible name follows the pallet level.
  replace(
    "[0, 250].forEach((baseHeight, groundIndex) => {\n              const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);\n              stop.name = groundIndex === 0 ? 'Palet Dayama ZEMIN' : 'Palet Dayama ZEMIN +250';\n              stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -(baseHeight + 45));\n              section.add(stop);\n            });",
    "const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);\n            stop.name = 'Palet Dayama K1';\n            stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -45);\n            section.add(stop);"
  );
  replace(
    "stop.name = `Palet Dayama K${humanLevel}`;",
    "stop.name = `Palet Dayama K${this.options.firstPalletPosition==='traverse'?humanLevel:Number(humanLevel)+1}`;"
  );
  replace(
    "const level = Math.max(0, Math.min(14, Math.round(Number(humanLevel) || 1) - 1));",
    "if(this.options.firstPalletPosition!=='traverse'&&(accessory.type==='palletStop'||accessory.type==='hTraverse'||accessory.type==='tray')&&numericLevel>=this.options.levels)return;\n          const level = Math.max(0, Math.min(14, Math.round(Number(humanLevel) || 1) - 1));"
  );
  replace(
    "h.name = `H Travers K${humanLevel}`;",
    "h.name = `H Travers K${this.options.firstPalletPosition==='traverse'?humanLevel:Number(humanLevel)+1}`;"
  );
  replace(
    "tray.name = `Tava K${humanLevel}-${pieceIndex + 1} · ${pieceWidth} mm`;",
    "tray.name = `Tava K${this.options.firstPalletPosition==='traverse'?humanLevel:Number(humanLevel)+1}-${pieceIndex + 1} · ${pieceWidth} mm`;"
  );
  replace(
    "if(tunnel<=0){valid.push({human:0,height:0});valid.push({human:0,height:250});}",
    "if(tunnel<=0){valid.push({human:0,height:0});}"
  );
  replace(
    "else {if(0>=tunnel)valid.push({human:0,height:0});if(250>=tunnel)valid.push({human:0,height:250});}",
    "else {if(0>=tunnel)valid.push({human:0,height:0});}"
  );
  replace(
    "if(human<1||human>Math.max(1,Number(b.levels)||Number(d?.levels)||1))return;",
    "const count=Math.max(1,Number(b.levels)||Number(d?.levels)||1),ground=String(b?.firstPalletPosition)!=='traverse';if(human<1||human>count||(ground&&(item.type==='palletStop'||item.type==='hTraverse'||item.type==='tray')&&human>=count))return;"
  );
  return html;
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-b2b-accessory-floor-levels-v151.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!m)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
  console.log('v151: K1 is the ground pallet level; pallet stops and H traverses expose only physical levels.');
}

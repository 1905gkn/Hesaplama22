import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* output-array-v301 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing v301 anchor: '+a.slice(0,120));html=html.replace(a,b);};
 rep('||a.rows-b.rows||Number(a.entries.keys().next().value)-Number(b.entries.keys().next().value);','||Number(b.entries.keys().next().value)-Number(a.entries.keys().next().value)||a.rows-b.rows;');
 const measureStart=html.indexOf('<script>/* output-performance-measures-v286 */'),measureEnd=html.indexOf('</script>',measureStart);
 if(measureStart<0||measureEnd<0)throw Error('Missing automatic PDF measure pass');
 html=html.slice(0,measureStart)+'<script>/* output-array-v301 */ window.rafexOutputPerfV286=true;</script>'+html.slice(measureEnd+9);
 rep('let scanning=false,sourceIds=[],sourceList=null;','let scanning=false,sourceIds=[],sourceSymbolIds=[],sourceList=null,sourceSymbolList=null;');
 rep("function reset(){scanning=false;sourceIds=[];sourceList=null;el('rafexArrayButtonV243')?.classList.remove('active');}","function reset(){scanning=false;sourceIds=[];sourceSymbolIds=[];sourceList=null;sourceSymbolList=null;el('rafexArrayButtonV243')?.classList.remove('active');}");
 rep("if(!m2LayoutState.racks.length){status('Çoğaltmak için önce serbest alana raf ekleyin.');return;}",`if(!m2LayoutState.racks.length&&!m2LayoutSymbols.length){status('Çoğaltmak için önce serbest alana bir öğe ekleyin.');return;}
  const chosenRacks=new Set(m2MultiSelect.rackIds||[]),chosenSymbols=new Set(m2MultiSelect.symbolIds||[]);
  if(!chosenRacks.size&&m2LayoutState.selected!=null)chosenRacks.add(m2LayoutState.selected);
  if(!chosenSymbols.size&&m2SelectedSymbolId!=null)chosenSymbols.add(m2SelectedSymbolId);
  for(const r of m2LayoutState.racks)if(chosenRacks.has(r.id)&&r.joinGroup)for(const member of m2JoinedRackMembers(r))chosenRacks.add(member.id);
  if(chosenRacks.size||chosenSymbols.size){
   const rackIds=[...chosenRacks],symbolIds=[...chosenSymbols];m2ClearAllSelections();
   sourceIds=rackIds;sourceSymbolIds=symbolIds;sourceList=m2LayoutState.racks;sourceSymbolList=m2LayoutSymbols;show();return;
  }`);
 rep("scanning=true;sourceList=m2LayoutState.racks;el('rafexArrayButtonV243')", "scanning=true;sourceList=m2LayoutState.racks;sourceSymbolList=m2LayoutSymbols;el('rafexArrayButtonV243')");
 rep('Fonksiyon Çoğaltma: rafları fareyle tarayarak seçin.', 'Fonksiyon Çoğaltma: rafları ve sembolleri fareyle tarayarak seçin.');
 rep("sourceIds.length+' raf seçildi. Seçilen rafların kendi aralarındaki düzen korunur.'", "sourceIds.length+' raf ve '+sourceSymbolIds.length+' sembol seçildi. Seçilen öğelerin kendi aralarındaki düzen korunur.'");
 rep("document.body.append(dialog);dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.addEventListener('close',reset);", "document.body.append(dialog);dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(!dialog.open)reset();});");
 rep('function plan(sources,direction,gap,count,scale,allRacks,allSymbols){','function plan(sources,direction,gap,count,scale,allRacks,allSymbols,selectedSymbols=[]){');
 rep("||!(scale>0)||!sources.length)throw Error", "||!(scale>0)||(!sources.length&&!selectedSymbols.length))throw Error");
 rep("if(sources.length*count>2000)throw Error('Tek işlemde en fazla 2.000 yeni raf eklenebilir. Tekrar sayısını azaltın.');", `const selected=new Set(sources.map(r=>r.id)),symbolIds=new Set(selectedSymbols.map(s=>s.id));
  const symbols=allSymbols.filter(s=>selected.has(s.rackId)||symbolIds.has(s.id));
  if((sources.length+symbols.length)*count>2000)throw Error('Tek işlemde en fazla 2.000 yeni öğe eklenebilir. Tekrar sayısını azaltın.');`);
 rep('const boxes=sources.map(r=>m2RackBounds(r)),width=', 'const boxes=[...sources.map(r=>m2RackBounds(r)),...symbols.map(s=>m2SymbolBounds(s))],width=');
 rep("throw Error('Seçilen rafların ölçüleri geçersiz.');", "throw Error('Seçilen öğelerin ölçüleri geçersiz.');");
 rep('const selected=new Set(sources.map(r=>r.id)),symbols=allSymbols.filter(s=>selected.has(s.rackId)),racks=[],copies=[];', 'const racks=[],copies=[];');
 rep('c.rackId=idMap.get(s.rackId);','c.rackId=idMap.get(s.rackId)??null;');
 rep("if(sourceList!==m2LayoutState.racks||sources.length!==sourceIds.length)throw Error", "const selectedSymbols=m2LayoutSymbols.filter(s=>sourceSymbolIds.includes(s.id));\n  if(sourceList!==m2LayoutState.racks||sourceSymbolList!==m2LayoutSymbols||sources.length!==sourceIds.length||selectedSymbols.length!==sourceSymbolIds.length)throw Error");
 rep('m2LayoutState.scale,m2LayoutState.racks,m2LayoutSymbols);','m2LayoutState.scale,m2LayoutState.racks,m2LayoutSymbols,selectedSymbols);');
 rep("m2PushUndo('Fonksiyon çoğaltma');m2LayoutState.racks.push(...result.racks);",`const originalRacks=m2LayoutState.racks,originalSymbols=m2LayoutSymbols;
  try{
   m2LayoutState.racks=originalRacks.concat(result.racks);m2LayoutSymbols=originalSymbols.concat(result.symbols);
   if(result.symbols.some(s=>!window.rafexColumnV204.valid(s)))throw Error('Yeni sembol raf, kolon veya başka engelle çakışıyor. Hiçbir kopya eklenmedi.');
  }finally{m2LayoutState.racks=originalRacks;m2LayoutSymbols=originalSymbols;}
  m2PushUndo('Fonksiyon çoğaltma');m2LayoutState.racks.push(...result.racks);`);
 rep('m2LayoutState.selected=result.racks[0].id;m2SelectedSymbolId=null;', 'm2LayoutState.selected=result.racks[0]?.id??null;m2SelectedSymbolId=result.racks.length?null:result.symbols[0]?.id??null;');
 rep("result.racks.length+' yeni raf eklendi.", "result.racks.length+' yeni raf ve '+result.symbols.length+' yeni sembol eklendi.");
 rep("sourceIds=[...m2MultiSelect.rackIds];", "sourceIds=[...m2MultiSelect.rackIds];sourceSymbolIds=[...m2MultiSelect.symbolIds];");
 rep("if(!sourceIds.length){reset();status('Tarama alanında raf bulunamadı.", "if(!sourceIds.length&&!sourceSymbolIds.length){reset();status('Tarama alanında öğe bulunamadı.");
 // Text annotations are independently movable layout items as well.
 rep('sourceSymbolList=null;','sourceSymbolList=null,sourceNoteIds=[],sourceNoteList=null;');
 rep("sourceSymbolList=null;el('rafexArrayButtonV243')", "sourceSymbolList=null;sourceNoteIds=[];sourceNoteList=null;el('rafexArrayButtonV243')");
 rep('if(!m2LayoutState.racks.length&&!m2LayoutSymbols.length)', 'if(!m2LayoutState.racks.length&&!m2LayoutSymbols.length&&!m2UserNotes.length)');
 rep('if(chosenRacks.size||chosenSymbols.size){', 'const chosenNotes=m2SelectedNoteId!=null?[m2SelectedNoteId]:[];\n  if(chosenRacks.size||chosenSymbols.size||chosenNotes.length){');
 rep('sourceIds=rackIds;sourceSymbolIds=symbolIds;sourceList=', 'sourceIds=rackIds;sourceSymbolIds=symbolIds;sourceNoteIds=chosenNotes;sourceNoteList=m2UserNotes;sourceList=');
 rep('scanning=true;sourceList=m2LayoutState.racks;', 'scanning=true;sourceNoteList=m2UserNotes;sourceList=m2LayoutState.racks;');
 rep("sourceSymbolIds.length+' sembol seçildi.", "sourceSymbolIds.length+' sembol ve '+sourceNoteIds.length+' yazı seçildi.");
 rep('allSymbols,selectedSymbols=[]){', 'allSymbols,selectedSymbols=[],selectedNotes=[],allNotes=[]){');
 rep('(!sources.length&&!selectedSymbols.length)', '(!sources.length&&!selectedSymbols.length&&!selectedNotes.length)');
 rep('(sources.length+symbols.length)*count>2000', '(sources.length+symbols.length+selectedNotes.length)*count>2000');
 rep('...symbols.map(s=>m2SymbolBounds(s))],width=', '...symbols.map(s=>m2SymbolBounds(s)),...selectedNotes.map(n=>{const node=document.querySelector(\'[data-user-note="\'+n.id+\'"]\');const b=node?.getBBox?.();return b?{left:b.x,right:b.x+b.width,top:b.y,bottom:b.y+b.height}:{left:n.x-String(n.text||\'\').length*(n.size||14)*.3,right:n.x+String(n.text||\'\').length*(n.size||14)*.3,top:n.y-(n.size||14)/2,bottom:n.y+(n.size||14)/2};})],width=');
 rep('for(const r of [...allRacks,...allSymbols])', 'for(const r of [...allRacks,...allSymbols,...allNotes])');
 rep('const racks=[],copies=[];', 'const racks=[],copies=[],notes=[];');
 rep('copies.push(c);}\n  }\n  return {racks,symbols:copies,step};', 'copies.push(c);}\n   for(const n of selectedNotes)notes.push({...clone(n),id:next++,x:Number(n.x)+dx,y:Number(n.y)+dy});\n  }\n  return {racks,symbols:copies,notes,step};');
 rep('const selectedSymbols=m2LayoutSymbols.filter(s=>sourceSymbolIds.includes(s.id));', 'const selectedSymbols=m2LayoutSymbols.filter(s=>sourceSymbolIds.includes(s.id)),selectedNotes=m2UserNotes.filter(n=>sourceNoteIds.includes(n.id));');
 rep('sourceList!==m2LayoutState.racks||sourceSymbolList!==m2LayoutSymbols||', 'sourceList!==m2LayoutState.racks||sourceSymbolList!==m2LayoutSymbols||sourceNoteList!==m2UserNotes||selectedNotes.length!==sourceNoteIds.length||');
 rep('m2LayoutSymbols,selectedSymbols);', 'm2LayoutSymbols,selectedSymbols,selectedNotes,m2UserNotes);');
 rep('m2LayoutSymbols.push(...result.symbols);', 'm2LayoutSymbols.push(...result.symbols);m2UserNotes.push(...result.notes);');
 rep('m2SelectedSymbolId=result.racks.length?null:result.symbols[0]?.id??null;', 'm2SelectedSymbolId=result.racks.length?null:result.symbols[0]?.id??null;m2SelectedNoteId=result.racks.length||result.symbols.length?null:result.notes[0]?.id??null;');
 rep("result.symbols.length+' yeni sembol eklendi.", "result.symbols.length+' yeni sembol ve '+result.notes.length+' yeni yazı eklendi.");
 rep('const result=commit.apply(this,arguments);if(!requested)return result;', 'const start=m2MultiSelect.start,end=m2MultiSelect.hover;const noteIds=requested?m2UserNotes.filter(n=>n.x>=Math.min(start.x,end.x)&&n.x<=Math.max(start.x,end.x)&&n.y>=Math.min(start.y,end.y)&&n.y<=Math.max(start.y,end.y)).map(n=>n.id):[];\n  const result=commit.apply(this,arguments);if(!requested)return result;sourceNoteIds=noteIds;');
 rep('if(!sourceIds.length&&!sourceSymbolIds.length){', 'if(!sourceIds.length&&!sourceSymbolIds.length&&!sourceNoteIds.length){');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-output-array-v301.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}


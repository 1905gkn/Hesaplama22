import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-column-collision="v204"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing column anchor '+a.slice(0,90));html=html.replace(a,b);};
 replace('symbol.x=Math.max(0,Math.min(1000-symbol.w,point.x-m2SymbolDrag.dx));symbol.y=Math.max(0,Math.min(650-symbol.h,point.y-m2SymbolDrag.dy));','window.rafexColumnV204.move(symbol,Math.max(0,Math.min(1000-symbol.w,point.x-m2SymbolDrag.dx)),Math.max(0,Math.min(650-symbol.h,point.y-m2SymbolDrag.dy)));');
 const oldShape=html.match(/if\(symbol.type==="column"\)shape=`[^\n]+?`;/)?.[0];if(!oldShape)throw Error('Missing column shape');replace(oldShape,'if(symbol.type==="column")shape=window.rafexColumnV204.shape(symbol,selected);');
 replace('m2PushUndo("Sembol ekleme");m2LayoutSymbols.push({id,type:m2SymbolChoice,x:500-w/2,y:325-h/2,w,h,widthMm:dims[0],depthMm:dims[1],blocking:m2SymbolChoice==="column",showDetails:Boolean($("m2SymbolShowDetails")?.checked)});','const newSymbol={id,type:m2SymbolChoice,x:500-w/2,y:325-h/2,w,h,widthMm:dims[0],depthMm:dims[1],blocking:m2SymbolChoice==="column",showDetails:Boolean($("m2SymbolShowDetails")?.checked)};if(newSymbol.type==="column"&&!window.rafexColumnV204.place(newSymbol)){alert("Kolon için raflarla çakışmayan boş yer bulunamadı.");return;}m2PushUndo("Sembol ekleme");m2LayoutSymbols.push(newSymbol);');
 replace('m2LayoutSymbols.push(copy);m2SelectedSymbolId=copy.id;','if(copy.type==="column"&&!window.rafexColumnV204.place(copy)){m2DiscardUndo?.();$("m2FloorStatus").textContent="Kolon için raflarla çakışmayan boş yer bulunamadı.";return;}m2LayoutSymbols.push(copy);m2SelectedSymbolId=copy.id;');
 replace('`${m2SymbolChoice==="column"?"Kolon":"Sembol"} çizimin ortasına eklendi; sürükleyerek yerleştirebilirsin.`','m2SymbolChoice==="column"?"Kolon çakışmayan bir konuma eklendi; sürükleyerek yerleştirebilirsin.":"Sembol çizimin ortasına eklendi; sürükleyerek yerleştirebilirsin."');
 replace('m2PushUndo("Sembol döndürme");symbol.angle=((Number(symbol.angle)||0)+90)%360;','const nextAngle=((Number(symbol.angle)||0)+90)%360;if(symbol.type==="column"&&!window.rafexColumnV204.valid({...symbol,angle:nextAngle})){ $("m2FloorStatus").textContent="Kolon döndürülmedi: raf veya başka kolon ile çakışıyor.";return;}m2PushUndo("Sembol döndürme");symbol.angle=nextAngle;');
 // Legacy/imported columns are physical obstacles even if blocking was absent in their record.
 html=html.replaceAll('s.blocking||/^(uaks|uakz|barrier)$/', 's.type==="column"||s.blocking||/^(uaks|uakz|barrier)$/');
 replace('blocking=all.filter((s)=>s.blocking)', 'blocking=all.filter((s)=>s.type==="column"||s.blocking)');
 replace('symbol[axis]+=sign*(desired-current)*m2LayoutState.scale;m2RenderLayout();', 'const target={x:symbol.x,y:symbol.y};target[axis]+=sign*(desired-current)*m2LayoutState.scale;if(!window.rafexColumnV204.move(symbol,target.x,target.y)){m2RenderLayout();$("m2FloorStatus").textContent="Kolon raf yüzeyinde durduruldu; girilen konum çakışıyor.";return;}m2RenderLayout();');
 // Column-to-rack dimension is face-to-face, not the unrelated closest axis.
 replace('data-dimension-key="symbol-gap:${symbol.id}:${key}" data-dimension-axis="${vertical?"vertical":"horizontal"}"${edit}>${fmt(value)} mm', 'data-dimension-key="symbol-gap:${symbol.id}:${key}" data-dimension-axis="${vertical?"vertical":"horizontal"}" data-symbol-gap-mm="${value}"${edit}>${symbol.type==="column"&&key==="rack"?"NET ":""}${fmt(value)} mm');
 const code=fs.readFileSync(new URL('./column-collision-v204.js',import.meta.url),'utf8'),at=html.lastIndexOf('</body>');
 return html.slice(0,at)+'<script data-column-collision="v204">'+code+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-column-collision-v204.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

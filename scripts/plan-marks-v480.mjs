import fs from 'node:fs';

export function planMarkGeometry(type,a,b){
 if(![a?.x,a?.y,b?.x,b?.y].every(Number.isFinite))return null;
 const dx=b.x-a.x,dy=b.y-a.y;
 if(type==='mark-circle'){const radius=Math.hypot(dx,dy);return radius>.1?{x:a.x-radius,y:a.y-radius,w:radius*2,h:radius*2,ax:.5,ay:.5,bx:1,by:.5}:null;}
 if(!['mark-arrow','mark-rect'].includes(type)||Math.hypot(dx,dy)<=.1)return null;
 const w=Math.abs(dx),h=Math.abs(dy);if(type==='mark-rect'&&(w<=.1||h<=.1))return null;
 return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w,h,ax:dx<0?1:0,ay:dy<0?1:0,bx:dx<0?0:1,by:dy<0?0:1};
}
export function planMarkLabelSize(s,override){
 const manual=Number(override);if(Number.isFinite(manual)&&manual>0)return Math.max(1,Math.min(72,manual));
 const w=Math.max(0,Number(s.w)||0),h=Math.max(0,Number(s.h)||0),span=s.type==='mark-arrow'?Math.hypot(w,h):s.type==='mark-circle'?Math.max(w,h):Math.sqrt(w*h);
 return Math.max(1,Math.min(72,Math.round(span*.08*10)/10));
}
export function planMarkSvg(s,offset={},fontSize){
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const color=/^#[0-9a-f]{6}$/i.test(s.color)?s.color:'#d34b23',stroke=Math.max(.5,Math.min(12,Number(s.stroke)||2)),size=planMarkLabelSize(s,fontSize);
 const x=Number(s.x),y=Number(s.y),w=Number(s.w),h=Number(s.h);if(![x,y,w,h].every(Number.isFinite)||w<0||h<0)return '';
 const attrs=' fill="none" stroke="'+color+'" stroke-width="'+stroke+'" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"';
 let shape='';
 if(s.type==='mark-circle')shape='<ellipse cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" rx="'+w/2+'" ry="'+h/2+'"'+attrs+'/>';
 else if(s.type==='mark-rect')shape='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"'+attrs+'/>';
 else if(s.type==='mark-arrow'){
  const a={x:x+w*s.ax,y:y+h*s.ay},b={x:x+w*s.bx,y:y+h*s.by},angle=Math.atan2(b.y-a.y,b.x-a.x),length=Math.hypot(b.x-a.x,b.y-a.y),head=Math.min(length*.28,Math.max(5,stroke*3+3)),spread=.48;
  const p={x:b.x-head*Math.cos(angle-spread),y:b.y-head*Math.sin(angle-spread)},q={x:b.x-head*Math.cos(angle+spread),y:b.y-head*Math.sin(angle+spread)};
  shape='<path d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'M'+p.x+' '+p.y+'L'+b.x+' '+b.y+'L'+q.x+' '+q.y+'"'+attrs+'/>';
 }else return '';
 const key='mark-label:'+s.id,cx=x+w/2,cy=y+h/2,tx=cx+(Number(offset.x)||0),ty=y+h+(Number(s.labelSize)||size)*1.2+(Number(offset.y)||0);
 const text=String(s.text||''),lines=text.split(/\r?\n/).slice(0,12);
 const label=text?'<text x="'+tx+'" y="'+ty+'" class="rafex-plan-mark-label m2-dimension-movable" data-dimension-key="'+escape(key)+'" data-dimension-axis="free" text-anchor="middle" style="fill:'+color+';stroke:none;font-size:'+size+'px!important;font-weight:700;paint-order:normal">'+lines.map((line,i)=>'<tspan x="'+tx+'" dy="'+(i?size*1.2:0)+'">'+escape(line)+'</tspan>').join('')+'</text>':'';
 return '<g class="rafex-plan-mark" data-layout-symbol="'+escape(s.id)+'" transform="rotate('+(Number(s.angle)||0)+' '+cx+' '+cy+')">'+shape+'</g>'+label;
}

export function installPlanMarks(geometry,svgMarkup,labelSize){
 if(window.rafexPlanMarksV480)return;
 let draft=null,tap=null,settings={color:'#d34b23',stroke:2,text:''};
 const $=id=>document.getElementById(id),isMark=s=>/^mark-(arrow|circle|rect)$/.test(s?.type||''),status=text=>{if($('m2FloorStatus'))$('m2FloorStatus').textContent=text;};
 const stop=event=>{event.preventDefault();event.stopImmediatePropagation();};
 function preview(){
  const layer=$('m2LayoutContent');if(!layer)return;
  layer.querySelector('[data-mark-preview]')?.remove();
  if(!draft?.start||!draft.hover)return;
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('data-mark-preview','1');group.style.pointerEvents='none';group.style.opacity='.75';
  if(draft.labelId!=null){
   const s=m2LayoutSymbols.find(s=>s.id===draft.labelId);if(!s)return;
   group.innerHTML=svgMarkup(s,{x:draft.hover.x-(s.x+s.w/2),y:draft.hover.y-(s.y+s.h+s.labelSize*1.2)});
   group.querySelector('.rafex-plan-mark')?.remove();
  }else{
   const box=geometry(draft.type,draft.start,draft.hover);if(!box)return;
   group.innerHTML=svgMarkup({...box,...draft,id:'preview',text:''});
  }
  group.querySelectorAll('*').forEach(node=>node.style.pointerEvents='none');layer.append(group);
 }
 function cancel(){draft=null;tap=null;$('m2LayoutSvg')?.classList.remove('rafex-plan-mark-drawing');$('m2LayoutContent')?.querySelector('[data-mark-preview]')?.remove();}
 function syncDialog(){
  const modal=$('m2SymbolModal');if(!modal)return;
  const choices=modal.querySelector('.m2-symbol-choices');if(!choices)return;
  if(!modal.querySelector('[data-mark-settings]')){
   for(const [type,name,icon] of [['mark-arrow','Ok','↗'],['mark-circle','Daire','◯'],['mark-rect','Kare / Dikdörtgen','□']]){
    const button=document.createElement('button');button.type='button';button.dataset.symbolChoice=type;button.innerHTML=icon+'<span>'+name+'</span>';button.onclick=()=>m2ChooseSymbol(type);choices.append(button);
   }
   const form=document.createElement('div');form.dataset.markSettings='1';form.className='rafex-mark-settings';
   form.innerHTML='<label>Renk<input id="rafexMarkColor480" type="color" aria-label="Sembol rengi"></label><label>Çizgi kalınlığı (px)<input id="rafexMarkStroke480" type="number" min="0.5" max="12" step="0.5" aria-label="Sembol çizgi kalınlığı"></label><label class="rafex-mark-text">Sembol yazısı (isteğe bağlı)<textarea id="rafexMarkText480" rows="2" maxlength="500" placeholder="Şeklin altına yazılacak açıklama"></textarea></label><small>Ok: başlangıç → uç · Daire: merkez → kenar · Kare/dikdörtgen: karşılıklı iki köşe. Kare için Shift tuşunu basılı tutun. Şekilden sonra yazının yerini tıklayın.</small>';
   const sizes=$('m2SymbolSizes');sizes.before(form);
   $('rafexMarkColor480').value=settings.color;$('rafexMarkStroke480').value=settings.stroke;$('rafexMarkText480').value=settings.text;
  }
  const mark=isMark({type:m2SymbolChoice});modal.querySelector('[data-mark-settings]').hidden=!mark;
  if(mark)$('m2SymbolSizes').hidden=true;
  const visibility=modal.querySelector('.m2-symbol-visibility');if(visibility)visibility.hidden=mark;
  const create=modal.querySelector('[onclick="m2CreateSymbol()"]');if(create)create.textContent=mark?'Çizime Başla':'Kaydet ve Ekle';
 }
 const open=m2OpenSymbolDialog;m2OpenSymbolDialog=function(){cancel();const result=open.apply(this,arguments);syncDialog();return result;};
 const choose=m2ChooseSymbol;m2ChooseSymbol=function(type){const result=choose.apply(this,arguments);syncDialog();return result;};
 const create=m2CreateSymbol;m2CreateSymbol=function(){
  if(!isMark({type:m2SymbolChoice}))return create.apply(this,arguments);
  settings={color:$('rafexMarkColor480').value,stroke:Math.max(.5,Math.min(12,Number($('rafexMarkStroke480').value)||2)),text:$('rafexMarkText480').value.trim()};
  m2ClearAllSelections('');m2LayoutState.mode='idle';m2LayoutState.areaEditMode=false;m2LayoutState.drag=null;m2SymbolDrag=null;m2NoteDrag=null;m2DimensionDrag=null;m2ProtectionDraft=null;m2SeismicDraft=null;m2AutoFillDraft=null;m2SetLayoutTool(null);
  draft={type:m2SymbolChoice,...settings,labelSize:Math.max(1,Number($('m2AnnotationFontSize')?.value)||14),start:null,hover:null,labelId:null};
  m2CloseSymbolDialog();$('m2LayoutSvg')?.classList.add('rafex-plan-mark-drawing');status(draft.type==='mark-circle'?'Dairenin merkezini tıklayın.':draft.type==='mark-arrow'?'Okun başlayacağı noktayı tıklayın.':'İlk köşeyi tıklayın.');m2RenderLayout();
 };
 function point(event){const p=m2SvgPoint(event);if(draft?.type==='mark-rect'&&draft.labelId==null&&draft.start&&event.shiftKey){const dx=p.x-draft.start.x,dy=p.y-draft.start.y,l=Math.max(Math.abs(dx),Math.abs(dy));return{x:draft.start.x+(dx<0?-l:l),y:draft.start.y+(dy<0?-l:l)};}return p;}
 document.addEventListener('pointerdown',event=>{
  if(!draft||event.button!==0||!event.target.closest?.('#m2LayoutSvg'))return;
  stop(event);if(tap){tap=null;return;}tap={id:event.pointerId,x:event.clientX,y:event.clientY};$('m2LayoutSvg')?.setPointerCapture?.(event.pointerId);
 },true);
 document.addEventListener('pointermove',event=>{if(!draft||!event.target.closest?.('#m2LayoutSvg'))return;stop(event);if(draft.start){draft.hover=point(event);preview();}},true);
 document.addEventListener('pointerup',event=>{
  if(!draft||!tap||event.pointerId!==tap.id)return;
  stop(event);const old=tap;tap=null;$('m2LayoutSvg')?.releasePointerCapture?.(event.pointerId);
  if(Math.hypot(event.clientX-old.x,event.clientY-old.y)>7)return;
  const p=point(event);
  if(draft.labelId!=null){const s=m2LayoutSymbols.find(s=>s.id===draft.labelId);if(s)m2DimensionOffsets['mark-label:'+s.id]={x:p.x-(s.x+s.w/2),y:p.y-(s.y+s.h+s.labelSize*1.2)};cancel();m2RenderLayout();status('Sembol ve yazısı eklendi. Yazıyı Ölçü Yeri Düzenle ile taşıyabilirsiniz.');return;}
  if(!draft.start){draft.start=p;draft.hover=p;status(draft.type==='mark-circle'?'Dairenin kenarını tıklayın.':draft.type==='mark-arrow'?'Okun biteceği noktayı tıklayın.':'Karşı köşeyi tıklayın.');return;}
  const box=geometry(draft.type,draft.start,p);if(!box){status('Şekil için farklı bir bitiş noktası seçin.');return;}
  m2PushUndo('Açıklama sembolü ekle');const symbol={...box,type:draft.type,color:draft.color,stroke:draft.stroke,text:draft.text,labelSize:labelSize({...box,type:draft.type}),id:Date.now()+Math.random(),blocking:false,angle:0};
  m2LayoutSymbols.push(symbol);m2SelectedSymbolId=symbol.id;
  if(symbol.text){draft.labelId=symbol.id;draft.hover=p;status('Şekil tamamlandı. Yazının yerini tıklayın. Sonradan Ölçü Yeri Düzenle ile taşıyabilirsiniz.');}
  else{cancel();status('Sembol eklendi.');}
  m2RenderLayout();preview();
 },true);
 document.addEventListener('pointercancel',()=>{tap=null;},true);
 document.addEventListener('keydown',event=>{if(draft&&event.key==='Escape'){stop(event);cancel();m2RenderLayout();status('Sembol çizimi bitirildi.');}},true);
 const setTool=m2SetLayoutTool;m2SetLayoutTool=function(){cancel();return setTool.apply(this,arguments);};
 const init=m2InitLayoutEditor;m2InitLayoutEditor=function(){cancel();return init.apply(this,arguments);};
 window.rafexPlanMarksV480={isMark,cancel,fontForKey(key){
  if(!String(key).startsWith('mark-label:'))return;
  const s=m2LayoutSymbols.find(s=>'mark-label:'+s.id===key);if(s)return labelSize(s,m2DimensionFontSizes[key]??m2DimensionFontSizes.__all);
 },svg(symbols){
  return (symbols||[]).filter(isMark).map(s=>svgMarkup(draft?.labelId===s.id?{...s,text:''}:s,m2DimensionOffsets['mark-label:'+s.id],m2DimensionFontSizes['mark-label:'+s.id]??m2DimensionFontSizes.__all)).join('');
 }};
}

export function transform(html){
 if(html.includes('data-rafex-plan-marks="v480"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v480 anchor missing or ambiguous: '+a);html=html.replace(a,b);};
 replace('m2LayoutSymbols.forEach((symbol)=>{\n          const selected=', 'm2LayoutSymbols.forEach((symbol)=>{\n          if(window.rafexPlanMarksV480?.isMark(symbol))return;\n          const selected=');
 replace('html += m2UserNotes.map((note) =>', 'html += window.rafexPlanMarksV480?.svg(m2LayoutSymbols)||"";\n        html += m2UserNotes.map((note) =>');
 // Annotation shapes have no physical footprint or distance guides.
 replace('function m2SymbolDistanceGuides(symbol){','function m2SymbolDistanceGuides(symbol){if(window.rafexPlanMarksV480?.isMark(symbol))return "";');
 replace('size = (m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??12);','size = key.startsWith("mark-label:")?(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all):(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??12);');
 html=html.replaceAll('font.value=(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all)||12;', 'font.value=window.rafexPlanMarksV480?.fontForKey(key)??((m2DimensionFontSizes[key]??m2DimensionFontSizes.__all)||12);');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 const css='<style data-rafex-plan-marks="v480">#m2SymbolModal .m2-symbol-choices{grid-template-columns:repeat(auto-fit,minmax(90px,1fr))}#m2SymbolModal .rafex-mark-settings{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0}#m2SymbolModal .rafex-mark-settings[hidden]{display:none}#m2SymbolModal .rafex-mark-settings label{display:grid;gap:6px;font-weight:700}#m2SymbolModal .rafex-mark-settings input,#m2SymbolModal .rafex-mark-settings textarea{width:100%;min-width:0;box-sizing:border-box;padding:8px;border:1px solid #a4bdb1;border-radius:6px}#m2SymbolModal .rafex-mark-settings input[type=color]{height:42px;padding:3px}#m2SymbolModal .rafex-mark-text,#m2SymbolModal .rafex-mark-settings small{grid-column:1/-1}#m2SymbolModal .rafex-mark-settings small{line-height:1.5;color:#52685e}#m2LayoutSvg.rafex-plan-mark-drawing{cursor:crosshair!important;touch-action:none}#m2LayoutSvg .rafex-plan-mark{pointer-events:stroke;cursor:move}#m2LayoutSvg .rafex-plan-mark-label{cursor:default;pointer-events:visiblePainted}</style>';
 return html.slice(0,at)+css+'<script>'+planMarkLabelSize.toString()+';('+installPlanMarks.toString()+')('+planMarkGeometry.toString()+','+planMarkSvg.toString()+',planMarkLabelSize);</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/plan-marks-v480.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 console.log('v480: two-click arrow, center-radius circle and corner rectangle annotations, color/stroke/text setup and independent movable labels.');
}

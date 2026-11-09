import fs from 'node:fs';
export function wallEdges555(state){
 const out=[],p=state.points||[],breaks=new Set(state.pathBreaks||[]);
 for(let i=0;i<(state.closed?p.length:p.length-1);i++)if(!breaks.has(i)&&p[i]&&p[(i+1)%p.length])out.push({kind:'point',index:i,a:p[i],b:p[(i+1)%p.length]});
 (state.cadElements||[]).forEach((e,element)=>{if(e.type!=='wall')return;const p=e.points||[];for(let i=0;i<(e.closed?p.length:p.length-1);i++)out.push({kind:'cad',element,index:i,a:p[i],b:p[(i+1)%p.length]});});return out;
}
export function nearestEndpoint555(point,edges,tolerance,exclude){let best=null,distance=tolerance;for(const edge of edges)for(const p of [edge.a,edge.b]){if(exclude&&Math.hypot(p.x-exclude.x,p.y-exclude.y)<1e-8)continue;const d=Math.hypot(p.x-point.x,p.y-point.y);if(d<=distance){distance=d;best={x:p.x,y:p.y};}}return best;}
export function deleteWall555(state,edge){
 if(state.areaEditMode!==true)return false;
 if(!wallEdges555(state).some(e=>e.kind===edge.kind&&e.index===edge.index&&e.element===edge.element&&e.a.x===edge.a.x&&e.a.y===edge.a.y&&e.b.x===edge.b.x&&e.b.y===edge.b.y))return false;
 if(edge.kind==='point'){if(state.closed){state.points=[...state.points,{...state.points[0]}];state.closed=false;}state.pathBreaks=[...new Set([...(state.pathBreaks||[]),edge.index])];state.edgeDimensions ||= [];state.edgeDimensions[edge.index]=false;}
 else{const old=state.cadElements[edge.element],replacement=wallEdges555({cadElements:[old]}).filter(e=>e.index!==edge.index).map(e=>({...old,id:String(old.id||'wall')+'-part-'+e.index,closed:false,points:[{...e.a},{...e.b}]}));state.cadElements.splice(edge.element,1,...replacement);}
 state.openFinished=true;state.hover=null;state.drawFromIndex=null;state.branchSourceIndex=null;return true;
}
function runtime555(){
 let selected=null;
 const state=()=>m2LayoutState,svg=()=>document.getElementById('m2LayoutSvg'),scale=()=>Math.max(.0001,Math.hypot(svg()?.getScreenCTM()?.a||1,svg()?.getScreenCTM()?.b||0));
 const status=s=>{const el=document.getElementById('m2FloorStatus');if(el)el.textContent=s;};
 const oldSnap=m2SnapOrtho;
 m2SnapOrtho=function(p){if(state().mode!=='draw')return oldSnap(p);const snap=nearestEndpoint555(p,wallEdges555(state()),10/scale(),m2CurrentDrawPoint());return snap||oldSnap(p);};
 function paint(){const root=document.getElementById('m2LayoutContent');if(!root)return;root.querySelector('[data-wall-selection555]')?.remove();if(state().areaEditMode!==true){selected=null;return;}if(!selected||selected.state!==state()||state().mode==='draw')return;const edge=wallEdges555(state()).find(e=>e.kind===selected.edge.kind&&e.index===selected.edge.index&&e.element===selected.edge.element);if(!edge){selected=null;return;}const line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const[k,v]of Object.entries({x1:edge.a.x,y1:edge.a.y,x2:edge.b.x,y2:edge.b.y,stroke:'#e39b16','stroke-width':2,'vector-effect':'non-scaling-stroke','pointer-events':'none','data-wall-selection555':'','data-draw-hover-v260':''}))line.setAttribute(k,v);root.appendChild(line);}
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=render.apply(this,arguments);paint();return result;};
 window.rafexSelectWall555=function(event,point){
  if(state().areaEditMode!==true){selected=null;return false;}
  if(event.button!==0||m2LayoutTool||m2AutoFillDraft||m2MultiSelect.active||m2SeismicDraft||m2ProtectionDraft)return false;
  if(window.rafexRackNodeAtV551?.(event)||event.target.closest?.('[data-rack],[data-layout-symbol],[data-user-note],[data-dimension-key],[data-resume-point]')){selected=null;return false;}
  if(state().mode==='draw'&&(state().freeWallStartV509||nearestEndpoint555(point,wallEdges555(state()),10/scale())))return false;
  let found=null,distance=6/scale();for(const e of wallEdges555(state())){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,len=dx*dx+dy*dy;if(!len)continue;const t=Math.max(0,Math.min(1,((point.x-e.a.x)*dx+(point.y-e.a.y)*dy)/len)),d=Math.hypot(point.x-e.a.x-t*dx,point.y-e.a.y-t*dy);if(d<distance){distance=d;found=e;}}
  if(!found){selected=null;return false;}event.preventDefault();if(state().mode==='draw')m2PauseFreeArea();m2LayoutState.selected=null;m2SelectedSymbolId=null;m2ClearMultiSelection();selected={state:state(),edge:structuredClone(found)};m2RenderLayout();status('Çizgi seçildi. Delete ile silebilirsiniz.');return true;
 };
 window.addEventListener('keydown',event=>{if(event.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;if(state().areaEditMode!==true){selected=null;return;}if(event.key==='Escape'){selected=null;paint();return;}if(!['Delete','Backspace'].includes(event.key)||!selected||selected.state!==state()||!svg()?.getClientRects().length)return;event.preventDefault();event.stopImmediatePropagation();m2PushUndo('Duvar çizgisi silme');if(deleteWall555(state(),selected.edge)){window.__rafexFreeOutputDirty=true;status('Seçilen çizgi silindi. Ctrl+Z ile geri alabilirsiniz.');}selected=null;m2RenderLayout();},true);
}
export function transform(html){if(html.includes('data-wall-edit="v555"'))return html;
 const anchor='const point = m2SvgPoint(event), rackNode =';if(html.split(anchor).length!==2)throw Error('v555 pointer anchor');
 html=html.replace(anchor,'const wallPoint555=m2SvgPoint(event);if(window.rafexSelectWall555?.(event,wallPoint555))return;\n          '+anchor);
 const crmFrom="const opened=await window.rafexOpenLayoutScreenV370?.();";if(!html.includes(crmFrom))throw Error('v555 CRM anchor');html=html.replace(crmFrom,"const opened=await window.rafexOpenTypesScreenV555?.();").replace('kaydedildi; serbest alan açılamadı. Onayla ile yeniden deneyin.','kaydedildi; raf tipi ekranı açılamadı. Onayla ile yeniden deneyin.').replace('kaydedildi. Serbest Yerleşim Alanı hazır.','oluşturuldu. Raf tipi oluşturmaya başlayabilirsiniz.');
 const screen="window.rafexOpenLayoutScreenV370=async()=>{await switchScreen('layout');return screen==='layout';};";if(!html.includes(screen))throw Error('v555 screen anchor');html=html.replace(screen,screen+"\n  window.rafexOpenTypesScreenV555=async()=>{await switchScreen('types');return screen==='types';};");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v555 body missing');return html.slice(0,end)+'<script data-wall-edit="v555">'+[wallEdges555,nearestEndpoint555,deleteWall555].map(f=>f.toString()).join('\n')+'\n('+runtime555.toString()+')();</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/free-wall-edit-v555.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');source=source.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,source);console.log('PASS wall edit v555: '+file);}

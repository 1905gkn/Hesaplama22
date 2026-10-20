(()=>{
  const frame=()=>m2LayoutState.rackGapBasis==='frame';
  function sync(){
    const pan=document.getElementById('m2PanV168');if(!pan)return;
    let button=document.getElementById('rafexRackGapBasisV346');
    if(!button){button=document.createElement('button');button.id='rafexRackGapBasisV346';button.type='button';button.textContent='Raftan Rafa Ölçü';button.onclick=toggle;pan.after(button);}
    button.classList.toggle('active',frame());button.setAttribute('aria-pressed',String(frame()));button.title='Arası mesafeler: '+(frame()?'raftan rafa':'paletten palete')+'. Ölçü türünü değiştirmek için tıkla.';
  }
  function apply(areas,owner){window.rafexReplaceAreaDocumentV319(areas,owner);window.__rafexFreeOutputDirty=true;m2RenderLayout();}
  function toggle(){
    if(window.rafexCanEditProjectV134?.()===false)return;
    const owner=window.rafexProjectIdentityV133?.uuid,old=window.rafexAreaDocument?.(),next=frame()?'pallet':'frame';
    if(!old||!window.rafexReplaceAreaDocumentV319){m2PushUndo('Arası ölçü türü');m2LayoutState.rackGapBasis=next;window.__rafexFreeOutputDirty=true;m2RenderLayout();return;}
    const areas=JSON.parse(JSON.stringify(old)),history=m2UndoHistory.slice(),selected=m2LayoutState.selected;
    for(const area of areas.areas)area.layout.rackGapBasis=next;
    apply(areas,owner);if(m2LayoutState.racks.some(r=>r.id===selected))m2LayoutState.selected=selected;
    m2UndoHistory=[...history,{label:'Arası ölçü türü',gapBasisV346:{owner,areas:old}}].slice(-30);m2UpdateUndoButton();m2RenderLayout();
    const status=document.getElementById('m2FloorStatus');if(status)status.textContent='Arası mesafeler '+(next==='frame'?'raftan rafa':'paletten palete')+' ölçülüyor.';
  }
  const undo=m2UndoLastAction;m2UndoLastAction=window.m2UndoLastAction=function(...args){const saved=m2UndoHistory.at(-1)?.gapBasisV346;if(!saved)return undo.apply(this,args);if(saved.owner!==window.rafexProjectIdentityV133?.uuid)return;const history=m2UndoHistory.slice(0,-1);apply(saved.areas,saved.owner);m2UndoHistory=history;m2UpdateUndoButton();};
  window.rafexGapBasisLabelV346=()=>{
    const lang=document.getElementById('m2ReportLanguage')?.value||'tr';
    return lang==='en'?'Gap measurements: '+(frame()?'rack to rack.':'pallet to pallet.'):lang==='fr'?'Mesures des espaces : '+(frame()?'rayonnage à rayonnage.':'palette à palette.'):'Arası mesafeler: '+(frame()?'Raftan rafa.':'Paletten palete.');
  };
  const clone=rafexPdfLayoutCloneV140;rafexPdfLayoutCloneV140=window.rafexPdfLayoutCloneV140=function(...args){
    const svg=clone.apply(this,args);if(!svg||svg.querySelector('[data-gap-basis-note]'))return svg;
    const view=(svg.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number);if(view.length!==4||!view.every(Number.isFinite)||view[2]<=0||view[3]<=0)return svg;
    const font=view[2]/140,extra=font*2.8,note=document.createElementNS('http://www.w3.org/2000/svg','text');note.setAttribute('data-gap-basis-note','v346');note.setAttribute('x',view[0]+view[2]/2);note.setAttribute('y',view[1]+view[3]+font*1.7);note.setAttribute('text-anchor','middle');note.setAttribute('font-family','Arial');note.setAttribute('font-size',font);note.setAttribute('fill','#475569');note.textContent=window.rafexGapBasisLabelV346();svg.appendChild(note);svg.setAttribute('viewBox',[view[0],view[1],view[2],view[3]+extra].join(' '));return svg;
  };
  window.rafexInstallGapBasisV346=sync;
  const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(...args){const result=render.apply(this,args);sync();return result;};sync();
})();


/* toolbar-rules-v325 */
window.rafexEdgeIndicesV325=function(state){
 const points=state.points||[],breaks=new Set(state.pathBreaks||[]);
 const count=state.closed?points.length:Math.max(0,points.length-1);
 return Array.from({length:count},(_,i)=>i).filter(i=>!breaks.has(i));
};
window.rafexToolbarMetaV325=function(entry){
 const d=entry.drawing||entry,system=String(entry.__rafexSystem||entry.rafexSystem||d.rafexSystem||(d.b2bLayout?'b2b':entry.system||'')).toLowerCase();
 let height=Number(d.sideUprightHeight||d.totalRackHeight||d.footHeight||d.height)||0,depth=Number(d.b2bLayout?.frameDepth||d.depthMm||d.railLength||d.depth)||0;
 if(d.b2bLayout){try{height=Number(m2B2BEffectiveFootHeight(d))||height;depth=Number(m2B2BFootDepth(d))||depth;}catch{}}
 const double=Number(d.b2bLayout?.rowCount)===2||d.b2b?.rowType==='double'||d.rowType==='double';
 const levels=Math.max(0,Number(d.levels||d.b2b?.levels)||0),ground=!!d.b2bLayout&&(d.b2b?.firstPalletPosition||d.firstPalletPosition||'ground')==='ground';
 const name=({b2b:'B2B',mr:'MR',mekik2:'Mekik',drive:'Drive-In',konsol:'Konsol'})[system]||entry.__rafexSystemLabel||system.toUpperCase();
 return [name,'H: '+Math.round(height),'D: '+Math.round(depth),double?'Çift':'Tek',ground?'Z+'+Math.max(0,levels-1):levels+' KAT'].join(' · ');
};


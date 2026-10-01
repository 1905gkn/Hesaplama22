  function renderSharedFeet(state,svg){
    /* shared-feet-cache-v146 */
    var cache=svg.__sharedFeetV146;
    if(!cache||cache.layer.parentNode!==svg){
      svg.querySelectorAll(':scope > .rafex-shared-foot-layer-v60').forEach(function(n){n.remove()});
      var layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('class','rafex-shared-foot-layer-v60');layer.setAttribute('pointer-events','none');
      cache=svg.__sharedFeetV146={layer:layer,entries:new Map()};
    }
    var racks=new Map(state.racks.map(function(r){return[Number(r.id),r]})),groups=new Map(Array.from(svg.querySelectorAll('[data-rack]')).map(function(g){return[Number(g.dataset.rack),g]})),keep=new Set();
    state.racks.forEach(function(rack){
      if(!rack||!rack.sharedFootWith||!rack.sharedFootSide)return;
      var anchor=racks.get(Number(rack.sharedFootWith)),group=anchor&&groups.get(Number(anchor.id));if(!group)return;
      var key=anchor.id+':'+rack.id,side=rack.sharedFootSide==='left'?'right':'left',signature=[side,anchor.x,anchor.y,anchor.w,anchor.h,anchor.angle,group.__uprightSignatureV133,group.getAttribute('transform')].join('|'),entry=cache.entries.get(key);
      if(entry&&entry.source===group&&entry.signature===signature&&entry.holder.parentNode===cache.layer){keep.add(key);return;}
      var uprights=Array.from(group.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)'));if(!uprights.length)return;
      var xs=uprights.map(function(n){return Number(n.getAttribute('x'))||0}),edge=side==='left'?Math.min.apply(null,xs):Math.max.apply(null,xs),shared=uprights.filter(function(n){return Math.abs((Number(n.getAttribute('x'))||0)-edge)<.01});if(!shared.length)return;
      var holder=document.createElementNS('http://www.w3.org/2000/svg','g'),tr=group.getAttribute('transform');if(tr)holder.setAttribute('transform',tr);holder.setAttribute('data-shared-foot',key);holder.setAttribute('data-shared-side',side);
      shared.forEach(function(source){var clone=source.cloneNode(true);clone.classList.add('rafex-shared-upright-v60');clone.removeAttribute('id');clone.style.setProperty('display','inline','important');clone.style.setProperty('fill',getComputedStyle(source).fill,'important');clone.style.setProperty('fill-opacity','1','important');clone.style.setProperty('opacity','1','important');clone.style.setProperty('stroke','none','important');clone.style.setProperty('transform','none','important');clone.style.setProperty('filter','none','important');holder.appendChild(clone)});
      if(entry&&entry.holder.parentNode===cache.layer)entry.holder.replaceWith(holder);else cache.layer.appendChild(holder);
      cache.entries.set(key,{source:group,signature:signature,holder:holder});keep.add(key);
    });
    cache.entries.forEach(function(entry,key){if(!keep.has(key)){entry.holder.remove();cache.entries.delete(key)}});
    if(cache.entries.size&&cache.layer.parentNode!==svg)svg.appendChild(cache.layer);else if(!cache.entries.size&&cache.layer.parentNode)cache.layer.remove();
  }

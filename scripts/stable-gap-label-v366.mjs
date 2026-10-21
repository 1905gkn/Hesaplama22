import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./stable-gap-label-v366.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-stable-gap-label="v366"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v366 anchor '+a.slice(0,110));html=html.split(a).join(b);};
 const fn=(name,next,body)=>{const a=html.indexOf('function '+name+'('),b=html.indexOf('function '+next+'(',a+10);if(a<0||b<a)throw Error('v366 '+name);html=html.slice(0,a)+body+'\n      '+html.slice(b);};
 // All render paths use the same key and saved offset. Unlike the generic
 // dimension helper, pair positions are not clamped to the old 1000x650 canvas.
 replace('key=`gap:${owner.id}:${nearest.other?.id??index}`,label=m2DimensionPosition(key,mx,my-8)','key=window.rafexStableGapLabelV366.key(owner.id,nearest.other?.id??index),label=window.rafexStableGapLabelV366.position(key,mx,my)');
 replace('key="gap:"+rack.id,label=m2DimensionPosition(key,mx,my-8)','key=window.rafexStableGapLabelV366.key(rack.id,nearest.other.id),label=window.rafexStableGapLabelV366.position(key,mx,my)');
 replace("key='pair-gap:'+pair.a.id+':'+pair.b.id,label=m2DimensionPosition(key,mx,my-8)","key=window.rafexStableGapLabelV366.key(pair.a.id,pair.b.id),label=window.rafexStableGapLabelV366.position(key,mx,my)");
 replace('class="m2-rack-distance-label m2-dimension-movable"','class="m2-rack-distance-label m2-dimension-movable" dominant-baseline="central"',3);
 fn('m2ClearRackGapLine','m2RackGapLineBlocked',`function m2ClearRackGapLine(rack,other,direction,from,to,laneStart,laneEnd){
        const horizontal=direction==='left'||direction==='right',lane=(laneStart+laneEnd)/2,ax=horizontal?from:lane,ay=horizontal?lane:from,bx=horizontal?to:lane,by=horizontal?lane:to;
        if(m2RackGapLineBlocked(ax,ay,bx,by,rack.id,other.id))return null;
        return{direction,distance:Math.abs(to-from),ax,ay,bx,by};
      }`);
 fn('m2PerfLiveGapCandidate','m2PerfLiveRackDistanceGuide',`function m2PerfLiveGapCandidate(rack,other,a,b){
        if(!other||Number(other.id)===Number(rack.id)||rack.joinGroup&&other.joinGroup===rack.joinGroup||other.staged||other.freePlacement)return null;
        const y1=Math.max(a.top,b.top),y2=Math.min(a.bottom,b.bottom),x1=Math.max(a.left,b.left),x2=Math.min(a.right,b.right),candidates=[];
        const add=(direction,from,to,start,end)=>{const line=m2ClearRackGapLine(rack,other,direction,from,to,start,end);if(line)candidates.push(line);};
        if(y2-y1>.01){if(a.right<=b.left)add('right',a.right,b.left,y1,y2);if(b.right<=a.left)add('left',a.left,b.right,y1,y2);}
        if(x2-x1>.01){if(a.bottom<=b.top)add('bottom',a.bottom,b.top,x1,x2);if(b.bottom<=a.top)add('top',a.top,b.bottom,x1,x2);}
        candidates.sort((p,q)=>p.distance-q.distance||String(p.direction).localeCompare(String(q.direction)));const best=candidates[0];return best?{...best,other,clearanceMm:m2RackClearanceMm(rack,other,best.direction)}:null;
      }`);
 fn('m2PerfLiveNearestRackGap','m2PerfDistancePrepareBaseV104',`function m2PerfLiveNearestRackGap(rack){
        const a=m2GapBoundsV346(rack),drag=m2LayoutState.drag; m2PerfDistancePrepare();let best=null,previous=null;
        if(drag&&drag.liveGapOtherId==null){const seed=window.rafexRackGapRelationsV46?.(rack)?.[0];if(seed){drag.liveGapOtherId=seed.other.id;drag.liveGapDirectionV366=seed.direction;}}
        for(const other of m2DragGapCandidatesV104(a)){const candidate=m2PerfLiveGapCandidate(rack,other,a,m2GapBoundsV346(other));if(!candidate)continue;if(!best||candidate.distance<best.distance||candidate.distance===best.distance&&Number(other.id)<Number(best.other.id))best=candidate;if(drag?.liveGapOtherId!=null&&Number(other.id)===Number(drag.liveGapOtherId)&&(!drag.liveGapDirectionV366||candidate.direction===drag.liveGapDirectionV366))previous=candidate;}
        // Keep the same physical pair while its clear, aligned gap exists.
        // Reacquire only after alignment is lost or an obstacle blocks it.
        best=previous||best;if(drag){drag.liveGapOtherId=best?.other.id??null;drag.liveGapDirectionV366=best?.direction??null;}return best;
      }
      window.rafexDragDistanceV104=m2DragDistanceV104.stats;`);
 const first=html.indexOf('<script');if(first<0)throw Error('v366 script');return html.slice(0,first)+'<script data-stable-gap-label="v366">'+runtime+'</script>'+html.slice(first);
}


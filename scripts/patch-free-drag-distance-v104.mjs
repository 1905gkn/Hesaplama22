import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const helpers = String.raw`
      const m2GroupMotionV105=new WeakMap();
      function m2GroupMotionContextV105(origins){
        const drag=m2LayoutState.drag;if(!drag)return null;
        let ctx=m2GroupMotionV105.get(origins);
        if(!ctx||ctx.drag!==drag||ctx.list!==m2LayoutState.racks||ctx.count!==m2LayoutState.racks.length){
          const byId=new Map(m2LayoutState.racks.map(r=>[Number(r.id),r]));
          ctx={drag,list:m2LayoutState.racks,count:m2LayoutState.racks.length,ids:new Set(origins.map(o=>Number(o.id))),members:origins.map(origin=>({origin,rack:byId.get(Number(origin.id))})),bounds:new Map()};
          m2GroupMotionV105.set(origins,ctx);
        }
        return ctx;
      }
      function m2GroupTranslationValid(origins,dx,dy){
        const ctx=m2GroupMotionContextV105(origins);
        if(!ctx)return m2GroupTranslationValidBaseV105(origins,dx,dy);
        for(const {origin,rack} of ctx.members){
          if(!rack)return false;
          const x=origin.x+dx,y=origin.y+dy;
          if(!m2RackInsideArea(rack,x,y,rack.angle)||m2RackOverlapsBlockingSymbol(rack,x,y,rack.angle))return false;
          const a=m2RackBounds(rack,x,y,rack.angle);
          for(const other of m2PerfCollisionCandidates(a)){
            const id=Number(other.id);if(ctx.ids.has(id))continue;
            let b=ctx.bounds.get(id);if(!b){b=m2RackBounds(other);ctx.bounds.set(id,b);}
            if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)return false;
          }
        }
        return true;
      }
      function m2ApplyGroupTranslation(origins,dx,dy){
        const ctx=m2GroupMotionContextV105(origins);
        if(!ctx)return m2ApplyGroupTranslationBaseV105(origins,dx,dy);
        for(const {origin,rack} of ctx.members)if(rack){rack.x=origin.x+dx;rack.y=origin.y+dy;rack.staged=false;}
      }
      function m2PerfDragMembers(drag,rack){
        if(Array.isArray(drag?.groupMembers)&&drag.groupMembers.length){
          const ctx=m2GroupMotionContextV105(drag.groupMembers);
          if(ctx)return ctx.members.filter(item=>item.rack);
        }
        return m2PerfDragMembersBaseV105(drag,rack);
      }
      const m2DragDistanceV104={drag:null,rows:new Map(),cols:new Map(),members:[],byId:new Map(),size:25,stats:{builds:0,updates:0,candidates:0,queries:0}};
      function m2DragBucketsV104(map,lo,hi,id,add){
        for(let i=Math.floor(lo/25);i<=Math.floor(hi/25);i++){
          if(add){if(!map.has(i))map.set(i,new Set());map.get(i).add(id);}
          else {const bucket=map.get(i);if(bucket){bucket.delete(id);if(!bucket.size)map.delete(i);}}
        }
      }
      function m2DragIndexBoxV104(table,id,b,add){
        const d=m2DragDistanceV104;
        m2DragBucketsV104(d.rows,b.top,b.bottom,id,add);m2DragBucketsV104(d.cols,b.left,b.right,id,add);
        const cell=table.cellSize;
        for(let x=Math.floor((b.left-.001)/cell);x<=Math.floor((b.right+.001)/cell);x++)for(let y=Math.floor((b.top-.001)/cell);y<=Math.floor((b.bottom+.001)/cell);y++){
          const key=m2PerfDistanceCellKey(x,y),items=table.grid.get(key);
          if(add){if(!items)table.grid.set(key,[id]);else if(!items.includes(id))items.push(id);}
          else if(items){const next=items.filter(value=>value!==id);if(next.length)table.grid.set(key,next);else table.grid.delete(key);}
        }
      }
      function m2PerfDistancePrepare(){
        const table=m2PerfDistanceIndex,d=m2DragDistanceV104,drag=m2LayoutState.drag;
        if(table.activeComputes>0)return table;
        // Moving symbols can change column geometry: retain the full established path.
        if(!drag||drag.symbolMembers?.length){d.drag=null;return m2PerfDistancePrepareBaseV104();}
        if(d.drag!==drag||d.racks!==m2LayoutState.racks||d.count!==m2LayoutState.racks.length){
          m2PerfDistancePrepareBaseV104();d.drag=drag;d.racks=m2LayoutState.racks;d.count=d.racks.length;
          d.rows.clear();d.cols.clear();d.byId=new Map(d.racks.map(r=>[Number(r.id),r]));
          const ids=new Set([Number(drag.id),...(drag.groupMembers||[]).map(r=>Number(r.id))]);
          d.members=Array.from(ids).map(id=>d.byId.get(id)).filter(Boolean);
          table.bounds.forEach((b,id)=>{m2DragBucketsV104(d.rows,b.top,b.bottom,id,true);m2DragBucketsV104(d.cols,b.left,b.right,id,true);});d.stats.builds++;
        }
        let changed=false;
        for(const rack of d.members){
          const id=Number(rack.id),old=table.bounds.get(id),box=m2RackBounds(rack);
          if(old&&old.left===box.left&&old.right===box.right&&old.top===box.top&&old.bottom===box.bottom)continue;
          if(old)m2DragIndexBoxV104(table,id,old,false);
          table.bounds.set(id,box);m2DragIndexBoxV104(table,id,box,true);changed=true;d.stats.updates++;
        }
        if(changed){table.signature='';table.nearest.clear();table.columnNearest.clear();table.wallMeasurements.clear();}
        return table;
      }
      function m2DragGapCandidatesV104(a){
        const table=m2PerfDistancePrepare(),d=m2DragDistanceV104;
        if(!d.drag)return table.racks;
        const ids=new Set();
        for(let y=Math.floor(a.top/25);y<=Math.floor(a.bottom/25);y++)for(const id of d.rows.get(y)||[])ids.add(id);
        for(let x=Math.floor(a.left/25);x<=Math.floor(a.right/25);x++)for(const id of d.cols.get(x)||[])ids.add(id);
        d.stats.queries++;d.stats.candidates+=ids.size;
        return Array.from(ids,id=>d.byId.get(id)).filter(Boolean);
      }
      function m2PerfLiveNearestRackGap(rack){
        const a=m2CombinedRackBounds(rack),drag=m2LayoutState.drag,table=m2PerfDistancePrepare();let best=null,previous=null;
        for(const other of m2DragGapCandidatesV104(a)){
          const b=table.bounds.get(Number(other.id))||m2RackBounds(other),candidate=m2PerfLiveGapCandidate(rack,other,a,b);
          if(!candidate)continue;
          if(!best||candidate.distance<best.distance||(candidate.distance===best.distance&&Number(candidate.other.id)<Number(best.other.id)))best=candidate;
          if(drag?.liveGapOtherId!=null&&Number(candidate.other.id)===Number(drag.liveGapOtherId))previous=candidate;
        }
        const tolerance=Math.max(.5,100*Math.max(.000001,Number(m2LayoutState.scale)||0));
        if(best&&previous&&previous.distance<=best.distance+tolerance)best=previous;
        if(drag)drag.liveGapOtherId=best?.other?.id??null;return best;
      }
      window.rafexDragDistanceV104=m2DragDistanceV104.stats;
`;

export function transform(html){
  if(html.includes('const m2DragDistanceV104='))return html;
  const start=html.indexOf('      function m2PerfLiveNearestRackGap(rack){');
  const end=html.indexOf('      function m2PerfLiveRackDistanceGuide(rack)',start);
  if(start<0||end<start)throw new Error('v104: live distance source missing');
  html=html.slice(0,start)+html.slice(end);
  const anchor='      function m2PerfDistancePrepare(){';
  if(!html.includes(anchor))throw new Error('v104: distance index source missing');
  html=html.replace(anchor,helpers+'\n      function m2PerfDistancePrepareBaseV104(){');
  for(const name of ['m2GroupTranslationValid','m2ApplyGroupTranslation']){
    const signature='      function '+name+'(origins, ';
    if(!html.includes(signature))throw new Error('v105: group motion source missing '+name);
    html=html.replace(signature,'      function '+name+'BaseV105(origins, ');
  }
  const memberAnchor='      function m2PerfDragMembers(drag,rack){';
  // The helper was prepended above; rename the last (original) declaration only.
  const memberAt=html.lastIndexOf(memberAnchor);
  if(memberAt<0)throw new Error('v105: drag members missing');
  html=html.slice(0,memberAt)+html.slice(memberAt).replace(memberAnchor,'      function m2PerfDragMembersBaseV105(drag,rack){');
  const guideAnchor='        const overlay=m2PerfEnsureDragOverlay(layer,rack.id),showGap=!drag.selectionGroup,guideHtml=';
  if(!html.includes(guideAnchor))throw new Error('v104: drag guide renderer missing');
  html=html.replace(guideAnchor,`        // Rack transforms and collision checks run every frame; textual guides need not.
        const guideNow=performance.now();
        if(drag.rafexGuidePaintAt!=null&&guideNow-drag.rafexGuidePaintAt<80)return true;
        drag.rafexGuidePaintAt=guideNow;
${guideAnchor}`);
  // Compile every changed script before publishing any output.
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].includes('const m2DragDistanceV104='))new vm.Script(match[1]);
  return html;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8');
  const match=source.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
  if(!match)throw new Error('v104: HTML missing');
  const html=transform(Buffer.from(match[3],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(match[0],match[1]+match[2]+Buffer.from(html).toString('base64')+match[2]));
  console.log('v104: drag distance index updates only moving racks; exact aligned candidate lookup.');
}

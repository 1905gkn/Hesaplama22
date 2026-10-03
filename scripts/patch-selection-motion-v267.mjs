import fs from 'node:fs';
export const motion=`      /* selection-motion-v267 */
      function m2MovementMembersV267(rack){
        if(!rack)return [];
        const selected=new Set(Array.from(m2MultiSelect.rackIds,Number));
        const roots=selected.has(Number(rack.id))?m2LayoutState.racks.filter(r=>selected.has(Number(r.id))):[rack];
        const members=new Map();
        for(const root of roots)for(const member of m2JoinedRackMembers(root))members.set(Number(member.id),member);
        return [...members.values()];
      }
      function m2MoveRackOrJoinedGroup(rack,nextX,nextY){
        const members=m2MovementMembersV267(rack),origins=members.map(r=>({id:r.id,x:r.x,y:r.y})),dx=nextX-rack.x,dy=nextY-rack.y;
        if(!Number.isFinite(dx+dy)||!m2GroupTranslationValid(origins,dx,dy))return false;
        m2ApplyGroupTranslation(origins,dx,dy);return true;
      }
`;
export function transform(html){
 if(html.includes('/* selection-motion-v267 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Unique anchor missing: '+a.slice(0,90));html=html.replace(a,b);};
 const start=html.indexOf('      function m2MoveRackOrJoinedGroup('),end=html.indexOf('      function m2ZoomLayout(',start);if(start<0||end<0)throw Error('Movement anchor');html=html.slice(0,start)+motion+html.slice(end);
 replace('selectionGroup ? m2LayoutState.racks.filter((item)=>m2MultiSelect.rackIds.has(item.id)).map((item)=>({id:item.id,x:item.x,y:item.y}))','selectionGroup ? m2MovementMembersV267(rack).map((item)=>({id:item.id,x:item.x,y:item.y}))');
 replace("    var pair=pairCandidate(a,b);if(!pair)return;",`    var pair=pairCandidate(a,b);if(!pair)return;
    const motionIdsV267=new Set(m2MovementMembersV267(Number(moveId)===Number(a.id)?a:b).map(r=>Number(r.id)));
    if(motionIdsV267.has(Number(a.id))&&motionIdsV267.has(Number(b.id))){status('İki raf da aynı hareket grubunda. Grup içi aralık korunur; mesafe için grubun dışındaki bir rafı veya duvarı seç.');return;}`);
 replace('  let picking=false,ids=new Set(),batch=null,scheduled=false;','  let picking=false,ids=new Set(),batch=null,scheduled=false,pickPressV267=null;');
 replace("    event.preventDefault();event.stopImmediatePropagation();\n    const node=event.target.closest('[data-rack]')", "    const node=event.target.closest('[data-rack]')");
 replace('    if(ids.has(id))ids.delete(id);else ids.add(id);',`    if(ids.has(id)){pickPressV267={id,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false};return;}
    event.preventDefault();event.stopImmediatePropagation();ids.add(id);`);
 const anchor="  document.addEventListener('click',event=>{\n    if(!common())return;\n    if(event.target.closest?.('#m2CustomizeRackButton')){";
 replace(anchor,`  window.addEventListener('pointermove',event=>{if(pickPressV267&&event.pointerId===pickPressV267.pointerId&&Math.hypot(event.clientX-pickPressV267.x,event.clientY-pickPressV267.y)>=3)pickPressV267.moved=true;},true);
  window.addEventListener('pointercancel',()=>{pickPressV267=null;},true);
  window.addEventListener('pointerup',event=>{
    const press=pickPressV267;if(!press||event.pointerId!==press.pointerId)return;pickPressV267=null;
    if(picking&&!press.moved&&Math.hypot(event.clientX-press.x,event.clientY-press.y)<3){ids.delete(press.id);render();status(ids.size+' blok seçili. Seçili bloktan tutarak birlikte sürükleyebilirsin.');}
  });
`+anchor);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-selection-motion-v267.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

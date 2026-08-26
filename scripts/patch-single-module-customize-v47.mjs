import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for single module customize v47');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html
 .replace(/<style data-rafex-single-module-customize="v47">[\s\S]*?<\/style>/g,'')
 .replace(/<script data-rafex-single-module-customize="v47">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<style data-rafex-single-module-customize="v47">
#m2CustomizeModal .rafex-single-module-note{padding:9px 11px;border:1px solid #82b59f;border-left:5px solid #18734f;border-radius:9px;background:#eef8f3;color:#285743;font-size:9px;font-weight:850;line-height:1.45}
</style>
<script data-rafex-single-module-customize="v47">
(function(){
 if(window.__rafexSingleModuleCustomizeV47)return;window.__rafexSingleModuleCustomizeV47=true;
 var context=null,baseOpen=window.m2OpenCustomizeModal,baseApply=window.m2ApplyRackCustomization,baseCopy=window.m2B2BCopyRack;
 function clone(value){if(value==null)return value;try{return structuredClone(value)}catch(_){return JSON.parse(JSON.stringify(value))}}
 function racks(){try{return Array.isArray(window.m2LayoutState&&window.m2LayoutState.racks)?window.m2LayoutState.racks:m2LayoutState.racks}catch(_){return[]}}
 function mutableCopy(rack){
   if(!rack)return rack;
   rack.plan=clone(rack.plan||{feet:[],braces:[]});
   rack.b2bLayout=clone(rack.b2bLayout||null);
   rack.b2b=clone(rack.b2b||null);
   rack.palletPositions=clone(rack.palletPositions||[]);
   rack.palletGaps=clone(rack.palletGaps||[]);
   rack.topVBraceBays=clone(rack.topVBraceBays||[]);
   rack.seismicBraces=clone(rack.seismicBraces||[]);
   rack.individualSpec=true;
   return rack
 }
 if(typeof baseCopy==='function')window.m2B2BCopyRack=function(){
   var copy=baseCopy.apply(this,arguments);return mutableCopy(copy)
 };
 function snapshotGroup(rack){
   var members=rack.joinGroup?racks().filter(function(item){return item.joinGroup===rack.joinGroup}):[rack];
   var ux=Math.cos((Number(rack.angle)||0)*Math.PI/180),uy=Math.sin((Number(rack.angle)||0)*Math.PI/180),nx=-uy,ny=ux;
   var snaps=members.map(function(item){return clone(item)}),order=snaps.slice().sort(function(a,b){var ac=(a.x+a.w/2)*ux+(a.y+a.h/2)*uy,bc=(b.x+b.w/2)*ux+(b.y+b.h/2)*uy;return ac-bc}).map(function(item){return item.id});
   var min=Infinity,max=-Infinity;snaps.forEach(function(item){var cp=(item.x+item.w/2)*ux+(item.y+item.h/2)*uy;min=Math.min(min,cp-item.w/2);max=Math.max(max,cp+item.w/2)});
   return{id:rack.id,group:rack.joinGroup||null,snapshots:snaps,order:order,axis:{ux:ux,uy:uy,nx:nx,ny:ny,mid:(min+max)/2}}
 }
 function restoreOthers(ctx){
   ctx.snapshots.forEach(function(saved){if(saved.id===ctx.id)return;var live=racks().find(function(item){return Number(item.id)===Number(saved.id)});if(live){Object.keys(live).forEach(function(key){delete live[key]});Object.assign(live,clone(saved))}})
 }
 function reflow(ctx){
   if(!ctx.group||ctx.order.length<2)return true;
   var list=ctx.order.map(function(id){return racks().find(function(item){return Number(item.id)===Number(id)})}).filter(Boolean);if(list.length<2)return true;
   var scale=1,footMm=60;try{scale=Number(window.m2LayoutState&&window.m2LayoutState.scale||m2LayoutState.scale)||1}catch(_){}
   try{footMm=Number(m2B2BFootWidth(list[0]))||60}catch(_){}
   var shared=footMm*scale,total=list.reduce(function(sum,item){return sum+item.w},0)-shared*(list.length-1),cursor=ctx.axis.mid-total/2;
   list.forEach(function(item,index){var saved=ctx.snapshots.find(function(row){return Number(row.id)===Number(item.id)})||item,perp=(saved.x+saved.w/2)*ctx.axis.nx+(saved.y+saved.h/2)*ctx.axis.ny,along=cursor+item.w/2,cx=along*ctx.axis.ux+perp*ctx.axis.nx,cy=along*ctx.axis.uy+perp*ctx.axis.ny;item.x=cx-item.w/2;item.y=cy-item.h/2;cursor+=item.w-(index<list.length-1?shared:0)});
   var ids=list.map(function(item){return item.id}),bad=list.some(function(item){var outside=false,overlap=false;try{outside=!m2RackInsideArea(item);overlap=m2RackOverlapsExcept(item,item.x,item.y,item.angle,ids)}catch(_){}item.freePlacement=outside||overlap;item.staged=outside||overlap;item.locked=!(outside||overlap);return outside||overlap});
   return!bad
 }
 window.m2OpenCustomizeModal=function(rackId){
   var rack=racks().find(function(item){return Number(item.id)===Number(rackId)});if(!rack)return;
   context=snapshotGroup(rack);mutableCopy(rack);
   if(typeof baseOpen==='function')baseOpen.apply(this,arguments);
   var aside=document.querySelector('#m2CustomizeModal .m2-customize-dialog aside');if(aside&&!aside.querySelector('.rafex-single-module-note')){var note=document.createElement('div');note.className='rafex-single-module-note';note.textContent=rack.joinGroup?'Yalnız tıkladığın modül özelleştirilir. Birleşik grubun diğer modülleri ve ortak ayak düzeni korunur.':'Yalnız seçili modül özelleştirilir.';aside.insertBefore(note,aside.children[1]||null)}
 };
 window.m2ApplyRackCustomization=function(){
   var ctx=context,targetId=ctx&&ctx.id;
   if(typeof baseApply==='function')baseApply.apply(this,arguments);
   if(!ctx)return;
   restoreOthers(ctx);var target=racks().find(function(item){return Number(item.id)===Number(targetId)});if(target)mutableCopy(target);
   var valid=reflow(ctx);try{if(ctx.group)m2NormalizeJoinComponents(ctx.group)}catch(_){}
   try{if(window.m2LayoutState)window.m2LayoutState.selected=targetId;else m2LayoutState.selected=targetId}catch(_){}
   var status=document.getElementById('m2FloorStatus');if(status)status.textContent=valid?'Yalnız seçilen modül özelleştirildi; birleşik grubun diğer modülleri değişmedi.':'Yalnız seçilen modül özelleştirildi. Yeni ölçü nedeniyle grup uygun konuma taşınmalı.';
   try{m2RenderSavedRackTypes();m2RenderLayout()}catch(_){}
   context=null
 };
 window.rafexCustomizeSingleModuleV47=function(id){window.m2OpenCustomizeModal(id)};
})();
</script>`;
const close=html.lastIndexOf('</body>');if(close<0)throw new Error('body close missing for single module customize v47');
html=html.slice(0,close)+runtime+'\n'+html.slice(close);
for(const required of ['data-rafex-single-module-customize="v47"','individualSpec','Yalnız tıkladığın modül özelleştirilir','rafexCustomizeSingleModuleV47'])if(!html.includes(required))throw new Error('single module customize v47 missing: '+required);
const encoded=Buffer.from(html).toString('base64');source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);fs.writeFileSync(file,source);
console.log('v47: birleşik blokta yalnız tıklanan modül derin kopya ile özelleştiriliyor.');

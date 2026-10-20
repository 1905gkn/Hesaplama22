import fs from 'node:fs';
const bounds=fs.readFileSync(new URL('./rack-gap-bounds-v346.js',import.meta.url),'utf8'),runtime=fs.readFileSync(new URL('./rack-gap-basis-v346.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-rack-gap-basis="v346"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length-1!==n)throw Error('v346 anchor '+a.slice(0,80));html=html.split(a).join(b);};
 replace('function m2RackBounds(rack, x = rack.x, y = rack.y, angle = rack.angle) {',bounds+'\nfunction m2RackBounds(rack, x = rack.x, y = rack.y, angle = rack.angle) {');
 const adapt=name=>{const start=html.indexOf('function '+name+'('),end=html.indexOf('\n      function ',start+15);if(start<0||end<0)throw Error('v346 '+name);let part=html.slice(start,end);part=part.replaceAll('table.bounds.get(Number(other.id))||m2RackBounds(other)','m2GapBoundsV346(other)').replaceAll('m2RackBounds(','m2GapBoundsV346(');html=html.slice(0,start)+part+html.slice(end);};
 adapt('m2PerfLiveNearestRackGap');adapt('m2NearestRackGap');
 replace("try{return rackGapSearchV148(owner,m2RackBounds(owner),table.racks,other=>table.bounds.get(Number(other.id))||m2RackBounds(other),m2ClearRackGapLine,m2RackClearanceMm,true)}","try{return rackGapSearchV148(owner,m2GapBoundsV346(owner),table.racks,m2GapBoundsV346,m2ClearRackGapLine,m2RackClearanceMm,true)}");
 replace('var A=m2RackBounds(a),B=m2RackBounds(b),candidates=[];','var A=m2GapBoundsV346(a),B=m2GapBoundsV346(b),candidates=[];');
 replace('return rackPart+"#"+wallPart+"#"+columnPart;','return rackPart+"#"+wallPart+"#"+columnPart+"#"+(m2LayoutState.rackGapBasis||"pallet")+"#"+(m2LayoutState.racks||[]).map(r=>JSON.stringify(r.b2bLayout||{})).join("|");');
 replace('const bounds=(r)=>{try{return m2CombinedRackBounds(r)}catch{try{return m2RackBounds(r)}catch{return{left:r.x,right:r.x+r.w,top:r.y,bottom:r.y+r.h,cx:r.x+r.w/2,cy:r.y+r.h/2}}}};','const bounds=(r)=>m2CombinedGapBoundsV346(r);');
 replace("focus.insertAdjacentElement('afterend',button)}","focus.insertAdjacentElement('afterend',button);window.rafexInstallGapBasisV346?.()}");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v346 body');return html.slice(0,end)+'<style data-rack-gap-basis="v346">#page #rafexRackGapBasisV346{width:auto!important;padding:0 10px!important}#page #rafexRackGapBasisV346.active{background:#174a35!important;color:white!important}</style><script data-rack-gap-basis="v346">'+runtime+'</script>'+html.slice(end);
}


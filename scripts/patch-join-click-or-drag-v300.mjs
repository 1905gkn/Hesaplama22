import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* join-click-or-drag-v300 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing click join anchor: '+a.slice(0,100));html=html.replace(a,b);};
 rep('/* bulk-join-restore-v288 */ if(window.rafexBulkJoinV230?.())return;', '/* Click-or-drag join always waits for an explicit target. */');
 rep('function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null,direction=null){','function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null,direction=null,contact=null){');
 rep('const entry=block.slice().sort(', 'const entry=block.find(r=>r.id===contact?.rackId)||block.slice().sort(');
 rep('dc=axis-rowAxis(entry,row(entry));','dc=axis-rowAxis(entry,entry.id===contact?.rackId&&contact.row!=null?contact.row:row(entry));');
 rep('m2CommitMultiSelection=async function(){','m2CommitMultiSelection=async function(request=null){');
 rep('if(!fixedIds.has(r.id)&&b.cx>=left&&b.cx<=right&&b.cy>=top&&b.cy<=bottom)selected.add(r.id);', 'if(!fixedIds.has(r.id)&&(request? r.id===request.rackId : b.cx>=left&&b.cx<=right&&b.cy>=top&&b.cy<=bottom))selected.add(r.id);');
 rep('sign=moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1;', `sign=request?.targetPoint?(((request.targetPoint.x-target.x-target.w/2)*Math.cos(rad)+(request.targetPoint.y-target.y-target.h/2)*Math.sin(rad))<0?-1:1):(moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1);`);
 rep('let chosenRow=null;','let chosenRow=null;\n  const pointRow=(r,p)=>{const c=-p.x*Math.sin(rad)+p.y*Math.cos(rad);return Array.from({length:Number(r.b2bLayout?.rowCount)||1},(_,i)=>i).sort((a,b)=>Math.abs(rowAxis(r,a)-c)-Math.abs(rowAxis(r,b)-c))[0];};\n  if(request?.targetPoint&&Number(target.b2bLayout?.rowCount)===2)chosenRow=pointRow(target,request.targetPoint)===1?\'lower\':\'upper\';');
 rep('if(Number(anchor.b2bLayout?.rowCount)===2&&moving.some(r=>Number(r.b2bLayout?.rowCount)===1)){','if(!request&&Number(anchor.b2bLayout?.rowCount)===2&&moving.some(r=>Number(r.b2bLayout?.rowCount)===1)){');
 rep('fixed,chosenRow,sign).planned;', 'fixed,chosenRow,sign,request?{rackId:request.rackId,row:pointRow(moving.find(r=>r.id===request.rackId),request.movingPoint)}:null).planned;');
 const runtime=fs.readFileSync(new URL('../client/join-click-or-drag-v300.js',import.meta.url),'utf8'),end=html.lastIndexOf('</body>');
 return html.slice(0,end)+'<script>'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-join-click-or-drag-v300.mjs')){
 const file=process.argv[2]||'dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

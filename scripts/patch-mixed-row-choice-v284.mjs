import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* mixed-row-choice-v284 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing row-choice anchor: '+a.slice(0,90));html=html.replace(a,b);};
 rep('function planScannedJoin(target,moving,scale,foot,fixed=[target]){','function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null){');
 rep("const row=r=>lower?(Number(r.b2bLayout?.rowCount)||1)-1:0,axis=rowAxis(target,row(target));","const useLower=chosenRow===null?lower:chosenRow==='lower';\n const row=r=>useLower?(Number(r.b2bLayout?.rowCount)||1)-1:0,axis=chosenRow!==null&&reference?rowAxis(reference,useLower?1:0):rowAxis(target,row(target));");
 rep('m2CommitMultiSelection=function(){\n  if(!m2JoinMode||m2JoinFirstRackId==null)return original.apply(this,arguments);','m2CommitMultiSelection=async function(){\n  if(!m2JoinMode||m2JoinFirstRackId==null)return original.apply(this,arguments);');
 rep('let planned;try{planned=planScannedJoin(anchor,moving,m2LayoutState.scale,m2B2BFootWidth(target),fixed).planned;}',`let chosenRow=null;
  if(Number(anchor.b2bLayout?.rowCount)===2&&moving.some(r=>Number(r.b2bLayout?.rowCount)===1)){
   chosenRow=await window.rafexChooseMixedRowV284();
   if(chosenRow===null){fail('Sıra seçimi iptal edildi.');return;}
   if(!m2JoinMode||m2JoinFirstRackId!==target.id||moving.some(r=>!m2LayoutState.racks.includes(r)))return;
  }
  let planned;try{planned=planScannedJoin(anchor,moving,m2LayoutState.scale,m2B2BFootWidth(target),fixed,chosenRow).planned;}`);
 const runtime=fs.readFileSync(new URL('../client/mixed-row-choice.js',import.meta.url),'utf8'),end=html.lastIndexOf('</body>');return html.slice(0,end)+'<script>'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mixed-row-choice-v284.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

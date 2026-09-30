import fs from 'node:fs';
export function transform(html){if(html.includes('bulk-mixed-v232'))return html;
const start=html.indexOf('window.rafexBulkJoinV230=function(){'),end=html.indexOf('};</script>',start);if(start<0||end<0)throw Error('Bulk join missing');
let code=html.slice(start,end);
code=code.replace(" const seed=members[0],system=", " /* bulk-mixed-v232 */\n const seed=members[0],system=");
code=code.replace('r.b2bLayout.rowCount!==seed.b2bLayout.rowCount||Math.abs(r.h-seed.h)>.5||','Math.abs(Number(r.b2bLayout.frameDepth||r.depthMm/(r.b2bLayout.rowCount||1))-Number(seed.b2bLayout.frameDepth||seed.depthMm/(seed.b2bLayout.rowCount||1)))>1||');
code=code.replace('aynı sıra tipindeki ve aynı ayak profiline','aynı raf derinliğindeki ve aynı ayak profiline');
const a=code.indexOf(' if(Math.max(...members.map(cross))'),b=code.indexOf(' if(planned.some',a);
code=code.slice(0,a)+` const rows=r=>Number(r.b2bLayout.rowCount)||1,double=members.find(r=>rows(r)===2),mixed=!!double&&members.some(r=>rows(r)===1),tolerance=Math.max(.5,m2LayoutState.scale*50);
 const reference=double||seed,baseCross=cross(reference),targetCross=new Map();
 for(const r of members){let desired=baseCross;
   if(mixed&&rows(r)===1){const offset=(double.h-r.h)/2;desired=baseCross+(cross(r)<baseCross?-offset:offset);}
   if(Math.abs(cross(r)-desired)>tolerance){status('Tekli rafları çift sıranın üst veya alt sırasıyla hizalayıp yeniden birleştir.');return true;}
   targetCross.set(r.id,desired);
 }
 members.sort((a,b)=>along(a)-along(b));const planned=[],ids=members.map(r=>r.id),foot=m2B2BFootWidth(seed)*m2LayoutState.scale;
 let cursor=along(members[0]);
 for(let i=0;i<members.length;i++){const r=members[i];if(i){const prev=members[i-1],step=(prev.w+r.w)/2-foot;
   if(step<=0||Math.abs(along(r)-along(prev))<.5){status('Yan yana ilerleyen tek bir birleşim sırası seç.');return true;}
   if(rows(prev)===1&&rows(r)===1&&Math.abs(targetCross.get(prev.id)-targetCross.get(r.id))>tolerance){status('Farklı sıralardaki tekli raflar birbirine ortak ayakla bağlanamaz.');return true;}
   cursor+=step;
 }
 const c=targetCross.get(r.id);planned.push({...r,x:ux*cursor-uy*c-r.w/2,y:uy*cursor+ux*c-r.h/2});
 }
`+code.slice(b);
code=code.replace("modül ortak ayaklı tek sıra olarak birleştirildi.","modül mevcut tekli/çiftli sıra hizası korunarak birleştirildi.");
return html.slice(0,start)+code+html.slice(end)}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-bulk-mixed-v232.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

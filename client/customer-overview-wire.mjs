export const overviewKinds=['foot','beam','brace','tie','rail','shelf','load','product'];

export function readCustomerOverview(cache){
 const result=new Map(),decoded=new Map();
 if(cache?.version!==1||!Array.isArray(cache.templates)||!Array.isArray(cache.refs)||cache.refs.length>20000)return result;
 for(const ref of cache.refs){
  if(!Array.isArray(ref)||typeof ref[0]!=='string'||!Number.isInteger(ref[1]))continue;
  const index=ref[1],rows=cache.templates[index];
  if(!Array.isArray(rows))continue;
  if(!decoded.has(index)){
   const valid=rows.every(row=>Array.isArray(row)&&row.length===10&&overviewKinds[row[0]]&&row.slice(1,9).every(Number.isFinite)&&(row[9]===null||Number.isFinite(row[9])));
   decoded.set(index,valid?rows.map(([code,x,y,z,w,h,d,rx,rz,palletWeight])=>({
    kind:overviewKinds[code],x,y,z,w,h,d,rx,rz,...(palletWeight===null?{}:{palletWeight})
   })):null);
  }
  const template=decoded.get(index);
  if(template)result.set(ref[0],template);
 }
 return result;
}

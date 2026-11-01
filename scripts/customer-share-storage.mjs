import {readSharePayload,pngDataBytes} from '../client/customer-share-payload.mjs';
// The existing share store requires at least two image slots. A direct project
// snapshot uses slot zero; slot one keeps a compatible copy of its plan image.
// Both writes use the caller's existing authenticated owner endpoint.
export async function customerShareStorage(request,{proxyApi}){
 const url=new URL(request.url);
 if(request.method==='POST'&&url.pathname==='/api/customer-shares'){
  const data=await request.clone().json().catch(()=>null);
  if(data?.imageCount===1&&Array.isArray(data.views)&&data.views.length===1){
   const body={...data,imageCount:2,views:[...data.views,{kind:'plan',label:'Yerleşim önizlemesi'}]};
   return proxyApi(new Request(request.url,{method:request.method,headers:request.headers,body:JSON.stringify(body)}));
  }
 }
 if(request.method==='PUT'&&/^\/api\/customer-shares\/[a-f0-9]{48}\/images\/0$/.test(url.pathname)){
  const data=await request.clone().json().catch(()=>null);let snapshot=null;
  try{if(typeof data?.png==='string'&&data.png.length<=4000000)snapshot=await readSharePayload(pngDataBytes(data.png));}catch{}
  if(snapshot&&snapshot.reports?.length===0){
   const primary=await proxyApi(request);if(!primary.ok)return primary;
   url.pathname=url.pathname.replace(/\/0$/,'/1');
   const compatible=await proxyApi(new Request(url,{method:'PUT',headers:request.headers,body:JSON.stringify(data)}));
   return compatible.ok?primary:compatible;
  }
 }
 return proxyApi(request);
}

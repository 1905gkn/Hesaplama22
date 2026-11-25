// Collapse browser round trips without bypassing the share store's password,
// expiry or revocation checks. Credentials never enter a cache or log.
export async function customerBootstrap592(request,{proxyApi}){
 const url=new URL(request.url),base=url.pathname.replace(/\/bootstrap$/,'');
 const forward=(path,init={})=>proxyApi(new Request(new URL(base+path,url),init));
 const infoResponse=await forward('/info');if(!infoResponse.ok)return infoResponse;
 const info=await infoResponse.json();if(info.passwordRequired)return Response.json(info,{headers:{'cache-control':'no-store'}});
 const unlockResponse=await forward('/unlock',{method:'POST',headers:{'content-type':'application/json',origin:url.origin},body:JSON.stringify({password:''})});if(!unlockResponse.ok)return unlockResponse;
 const auth=await unlockResponse.json();
 // Legacy image-only shares keep their existing compatible image read path.
 if(!auth.snapshot||url.searchParams.get('mode')==='plan')return Response.json({...auth,passwordRequired:false},{headers:{'cache-control':'no-store'}});
 const snapshot=await forward('/snapshot',{headers:{Authorization:'Bearer '+auth.session}});if(!snapshot.ok)return snapshot;
 const snapshotBody=Buffer.from(await snapshot.arrayBuffer()).toString('base64');
 return Response.json({...auth,passwordRequired:false,snapshotBody},{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}

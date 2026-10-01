import {gzip,gunzip} from 'node:zlib';
import {promisify} from 'node:util';
const zip=promisify(gzip),unzip=promisify(gunzip);
const maxDecoded=64*1024*1024,maxWire=4*1024*1024;
const savePath=path=>/^\/api\/(?:projects|drawing-projects|[\w-]*types)(?:\/|$)/.test(path);
export async function decodeRequest(request){
 const headers=new Headers(request.headers),encoding=headers.get('x-rafex-body-encoding');
 headers.delete('x-rafex-accept-encoding');headers.delete('x-rafex-body-encoding');
 if(!encoding)return new Request(request,{headers});
 if(encoding!=='gzip'||!savePath(new URL(request.url).pathname)||!['POST','PUT','PATCH'].includes(request.method))throw Object.assign(Error('Desteklenmeyen sıkıştırılmış kayıt isteği.'),{status:400});
 const bytes=new Uint8Array(await request.arrayBuffer());if(bytes.length>maxWire)throw Object.assign(Error('Sıkıştırılmış kayıt 4 MB aktarım sınırını aşıyor. Yerel taslağınız korunuyor.'),{status:413});
 let body;try{body=await unzip(bytes,{maxOutputLength:maxDecoded});}catch(error){throw Object.assign(Error(error.code==='ERR_BUFFER_TOO_LARGE'?'Açılan kayıt 64 MB sınırını aşıyor. Yerel taslağınız korunuyor.':'Sıkıştırılmış kayıt verisi açılamadı; hiçbir kayıt değiştirilmedi.'),{status:error.code==='ERR_BUFFER_TOO_LARGE'?413:400});}
 headers.delete('content-length');headers.delete('content-encoding');headers.delete('transfer-encoding');headers.set('content-type','application/json');
 return new Request(request.url,{method:request.method,headers,body});
}
export async function encodeResponse(response,accepted){
 if(!accepted||!response.body||!response.ok||!response.headers.get('content-type')?.includes('application/json'))return response;
 const body=new Uint8Array(await response.arrayBuffer()),headers=new Headers(response.headers);headers.delete('content-length');headers.delete('content-encoding');
 if(body.length<200000)return new Response(body,{status:response.status,headers});
 const packed=await zip(body);
 if(packed.length>=body.length)return new Response(body,{status:response.status,headers});
 headers.set('x-rafex-body-encoding','gzip');headers.set('vary',[headers.get('vary'),'x-rafex-accept-encoding'].filter(Boolean).join(', '));
 return new Response(packed,{status:response.status,headers});
}

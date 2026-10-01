/* lossless-save-wire-v244 */
window.rafexPrepareWireV244=async function(url,opt){
 const headers=new Headers(opt.headers||{'content-type':'application/json'}),supported=typeof DecompressionStream==='function';
 if(supported)headers.set('x-rafex-accept-encoding','gzip');
 if(typeof opt.body!=='string'||!['POST','PUT','PATCH'].includes(String(opt.method||'GET').toUpperCase())||!/^\/api\/(?:projects|drawing-projects|[\w-]*types)(?:\/|$)/.test(String(url)))return {...opt,headers};
 const blob=new Blob([opt.body],{type:'application/json'}),rawBytes=blob.size;let body=opt.body,wireBytes=rawBytes;
 if(rawBytes>=200000&&typeof CompressionStream==='function'){
  const bytes=await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  if(bytes.byteLength<rawBytes){body=bytes;wireBytes=bytes.byteLength;headers.set('x-rafex-body-encoding','gzip');headers.set('content-type','application/octet-stream');}
 }
 window.rafexLastSaveSizeV244={rawBytes,wireBytes,compressed:typeof body!=='string'};
 if(wireBytes>4*1024*1024)throw Error('Kayıt '+(rawBytes/1048576).toFixed(1)+' MB; aktarılacak veri '+(wireBytes/1048576).toFixed(1)+' MB ile 4 MB sınırını aşıyor. Sunucuya gönderilmedi. Yerel Taslaklar bölümünden taslağı indirebilirsiniz.');
 return {...opt,headers,body};
};
window.rafexReadWireV244=async function(response){
 if(response.headers.get('x-rafex-body-encoding')!=='gzip')return response.text();
 if(typeof DecompressionStream!=='function')throw Error('Sıkıştırılmış yanıt bu tarayıcıda açılamıyor.');
 return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
};

async function requestJson(url, opt = {}) {
  const code='HATA-'+crypto.randomUUID().slice(0,8).toUpperCase();
  const method=String(opt.method||'GET').toUpperCase(),path=String(url).split('?')[0];
  const draft=window.rafexDraftsV241?.reference();
  const fail=(kind,message,response)=>{
    const status=response?.status;
    const details={code,kind,method,path,status:status||null,time:new Date().toISOString(),requestId:response?.headers.get('x-vercel-id')||response?.headers.get('cf-ray')||null};
    const error=new Error(message+' ['+(status?'HTTP '+status+' · ':'')+code+']');
    error.status=status;error.code=code;error.details=details;
    window.rafexLastRequestErrorV241=details;
    if(!['GET','HEAD'].includes(method)&&/^\/api\/(?:projects|drawing-projects|[\w-]*types)(?:\/|$)/.test(path))window.rafexDraftsV241?.failure(error,draft).catch(()=>{});
    return error;
  };
  let response;
  try { response=await fetch(url,{headers:{'content-type':'application/json'},...opt}); }
  catch(error){throw fail(error.name==='AbortError'?'ABORTED':'NETWORK',error.name==='AbortError'?'İstek iptal edildi. Kayıt sonucu doğrulanamadı.':navigator.onLine===false?'İnternet bağlantısı yok. Kayıt sonucu doğrulanamadı.':'Sunucuya bağlantı kurulamadı veya bağlantı kesildi. Kayıt sonucu doğrulanamadı.');}
  const type=response.headers.get('content-type')||'';
  let raw;
  try { raw=await response.text(); } catch {throw fail('BODY_READ','Sunucu yanıtı okunurken bağlantı kesildi. Kayıt sonucu doğrulanamadı.',response);}
  let data;
  if(/\bapplication\/(?:[\w.-]+\+)?json\b/i.test(type)){
    try{data=JSON.parse(raw);}catch{throw fail('INVALID_JSON','Sunucudan bozuk JSON yanıtı geldi. Kayıt sonucu doğrulanamadı.',response);}
  }else{
    const reasons={401:'Rafex oturumu doğrulanamadı.',403:'Sunucu bu işleme erişimi reddetti.',404:'Kayıt servisi adresi bulunamadı.',413:'Gönderilen kayıt sunucunun boyut sınırını aşıyor.',429:'Sunucu çok fazla istek nedeniyle isteği sınırladı.',500:'Sunucuda işlem hatası oluştu.',502:'Ara sunucu kayıt servisine ulaşamadı.',503:'Kayıt servisi şu anda kullanılamıyor.',504:'Ara sunucu yanıt beklerken zaman aşımına uğradı.'};
    throw fail('NON_JSON',(reasons[response.status]||'Sunucudan beklenmeyen yanıt geldi.')+' Beklenen JSON yerine '+(/html/i.test(type)?'HTML sayfası':type||'türü belirtilmemiş içerik')+' döndü. Kayıt sonucu doğrulanamadı.',response);
  }
  if(!response.ok){
    const message=typeof data?.error==='string'?data.error.slice(0,600):'Sunucu isteği reddetti.';
    throw fail('HTTP',message,response);
  }
  return data;
}

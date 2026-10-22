const ERP_URL='https://erp18.rafex.com.tr/api/crmbilgileridetay';
const text=value=>typeof value==='string'?value.trim().slice(0,600):'';
export function crmNumber(value){return /^[1-9]\d{0,9}$/.test(String(value))&&Number(value)<=2147483647?Number(value):null;}
export function findCrm(rows,number){
 if(!Array.isArray(rows))throw Error('ERP_FORMAT');
 const matches=rows.filter(row=>Number(row?.bimno)===number).map(row=>({number,projectNo:text(row.projeno),companyName:text(row.firmaadi),contactName:text(row.gorusulenkisi)}));
 const unique=[...new Map(matches.map(row=>[JSON.stringify(row),row])).values()];
 if(unique.length>1)throw Error('ERP_DUPLICATE');return unique[0]||null;
}
export async function crmLookup(request,{proxyApi,fetchImpl=fetch}={}){
 const reply=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'private, no-store'}});
 if(request.method!=='GET')return reply({error:'Yalnız GET desteklenir.'},405);
 const number=crmNumber(new URL(request.url).pathname.split('/').pop());if(number==null)return reply({error:'Geçerli bir CRM numarası yazın.'},400);
 // Reuse the portal's existing session boundary. No ERP list or credential is
 // sent to the browser; only the explicitly requested CRM row may be returned.
 const sessionUrl=new URL('/api/me',request.url);let session;
 try{const response=await proxyApi(new Request(sessionUrl,{headers:request.headers}));if(!response.ok)return reply({error:response.status===401?'CRM bilgileri için tekrar giriş yapın.':'Oturum doğrulanamadı.'},response.status===401?401:503);session=await response.json();}catch{return reply({error:'Oturum doğrulanamadı.'},503);}
 if(!session?.user?.id)return reply({error:'CRM bilgileri için giriş yapın.'},401);
 try{
  const response=await fetchImpl(ERP_URL,{headers:{accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(!response.ok)return reply({error:'ERP bağlantısı yanıt vermedi. Tekrar deneyin.'},502);
  const row=findCrm(await response.json(),number);
  return row?reply({crm:row}):reply({error:number+' numaralı CRM kaydı bulunamadı.'},404);
 }catch(error){return reply({error:error?.message==='ERP_DUPLICATE'?'Bu CRM numarası için birden fazla farklı kayıt var. ERP kaydını kontrol edin.':error?.name==='TimeoutError'||error?.name==='AbortError'?'ERP yanıtı zaman aşımına uğradı. Tekrar deneyin.':'CRM bilgileri alınamadı. Tekrar deneyin.'},error?.message==='ERP_DUPLICATE'?409:502);}
}

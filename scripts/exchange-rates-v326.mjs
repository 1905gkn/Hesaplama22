export const day=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function validate(r,now=Date.now()){
 if(!r||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||r.date>day(now)||!['eurTry','usdTry','eurUsd'].every(k=>Number.isFinite(r[k])&&r[k]>0))throw Error('Invalid reference rates');return r;
}
export function tcmb(xml){
 const d=xml.match(/Tarih="(\d{2})\.(\d{2})\.(\d{4})"/);if(!d)throw Error('Missing TCMB date');
 const value=code=>{const b=xml.match(new RegExp('<Currency\\b[^>]*(?:Kod|CurrencyCode)="'+code+'"[^>]*>([\\s\\S]*?)</Currency>'))?.[1];return Number(b?.match(/<ForexSelling>\s*([\d.]+)\s*<\/ForexSelling>/)?.[1])/Number(b?.match(/<Unit>\s*(\d+)\s*<\/Unit>/)?.[1]);};
 const eurTry=value('EUR'),usdTry=value('USD');return {eurTry,usdTry,eurUsd:eurTry/usdTry,date:`${d[3]}-${d[2]}-${d[1]}`,source:'TCMB',basis:'Döviz satış'};
}
export function ecb(xml){const date=xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];const value=c=>Number(xml.match(new RegExp('currency=[\'\"]'+c+'[\'\"]\\s+rate=[\'\"]([\\d.]+)'))?.[1]);const eurTry=value('TRY'),eurUsd=value('USD');return {eurTry,eurUsd,usdTry:eurTry/eurUsd,date,source:'ECB',basis:'Referans kuru'};}
export function createRateService(fetcher=fetch,clock=Date.now){
 let cached=null,checked=0,retryAt=0,pending=null;
 async function load(){
  const sources=[['https://www.tcmb.gov.tr/kurlar/today.xml',tcmb],['https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',ecb],['https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD',text=>{const d=JSON.parse(text);return {eurTry:d.rates?.TRY,eurUsd:d.rates?.USD,usdTry:d.rates?.TRY/d.rates?.USD,date:d.date,source:'Frankfurter / ECB',basis:'Referans kuru'};}]];
  for(const [url,parse] of sources){try{const res=await fetcher(url,{signal:AbortSignal.timeout(3500),headers:{accept:'application/xml, application/json, text/xml'}});if(!res.ok)throw Error('Provider HTTP '+res.status);const rates=validate(parse(await res.text()),clock());if(!cached||rates.date>=cached.date)cached={...rates,checkedAt:new Date(clock()).toISOString()};checked=clock();retryAt=0;return {...cached,cached:false};}catch{}}
  retryAt=clock()+60000;if(cached)return {...cached,cached:true};throw Error('Kur kaynaklarına ulaşılamıyor.');
 }
 return async()=>{if(cached&&clock()-checked<300000)return {...cached,cached:false};if(cached&&clock()<retryAt)return {...cached,cached:true};if(!pending)pending=load().finally(()=>pending=null);return pending;};
}
const getRates=createRateService();
export async function exchangeRatesResponse(){try{const rates=await getRates();return Response.json({rates},{headers:{'cache-control':rates.cached?'public, max-age=0, s-maxage=30':'public, max-age=60, s-maxage=300, stale-while-revalidate=3600, stale-if-error=604800'}});}catch{return Response.json({rates:null,error:'Kur kaynaklarına ulaşılamıyor; son doğrulanmış kur varsa korunur.'},{status:503,headers:{'cache-control':'no-store'}});}}


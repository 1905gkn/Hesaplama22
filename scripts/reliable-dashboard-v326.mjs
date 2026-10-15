export function transform(html){
 if(html.includes('async function reliableDashboardV326'))return html;
 const anchor='      let homeDashboardData = null;';
 if(!html.includes(anchor)||!html.includes('await req("/api/dashboard")'))throw Error('Dashboard v326 integration missing');
 const runtime=`      async function reliableDashboardV326(){
        const key='rafex-reference-rates-v326';
        const valid=r=>r && /^\\d{4}-\\d{2}-\\d{2}$/.test(r.date) && Number.isFinite(Date.parse(r.date)) && r.date<=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()) && ['eurTry','usdTry','eurUsd'].every(k=>Number.isFinite(r[k])&&r[k]>0);
        let saved=null;try{saved=JSON.parse(localStorage.getItem(key));if(!valid(saved))saved=null;}catch{}
        if(saved)renderHomeDashboard({rates:{...saved,cached:true}});
        // Rates are independent of the legacy weather/dashboard service.
        const weatherTask=req('/api/dashboard').then(d=>{if(homeDashboardData){homeDashboardData={...homeDashboardData,weather:d.weather};renderHomeDashboard(homeDashboardData);}return d;}).catch(()=>null);
        let rates=null;try{const response=await fetch('/api/exchange-rates',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Unavailable');const d=await response.json();if(valid(d.rates))rates=d.rates;}catch{}
        if(!rates||(saved&&saved.date>rates.date))rates=saved?{...saved,cached:true}:null;
        if(rates)try{localStorage.setItem(key,JSON.stringify(rates));}catch{}
        const result={rates,weather:homeDashboardData?.weather||null};
        homeDashboardData=result;
        // Weather may finish later and update its own card without delaying rates.
        weatherTask.then(d=>{if(d&&document.getElementById('dashboardGrid')){homeDashboardData={...homeDashboardData,weather:d.weather};renderHomeDashboard(homeDashboardData);}});
        return result;
      }
`;
 html=html.replace(anchor,runtime+anchor).replace('await req("/api/dashboard")','await reliableDashboardV326()');
 html=html.replace(' && meta === currentRateDate && !data.stale',' && /^\\d{4}-\\d{2}-\\d{2}$/.test(meta) && meta <= currentRateDate');
 html=html.replace('esc(translatedUiText("Günlük gösterge kuru"))','esc((data.rates?.cached ? "Son doğrulanmış kur · bağlantı bekleniyor" : meta < currentRateDate ? "Son yayımlanan referans kuru" : "Günlük referans kuru") + " · " + (data.rates?.basis || "Referans"))');
 html=html.replace('Bugünün kuru doğrulanamadı.','Kur kaynağına ulaşılamadı; kayıtlı kur bulunmuyor.');
 return html;
}


(function(){
 const detail=window.rafexPlanDetailV143,render=window.rafexRenderPlanV143;
 if(detail&&render){
  window.rafexPlanDetailV143=function(d){const p=detail.apply(this,arguments);if(d?.mekikCustomizationV514?.lanes?.some(Boolean)){const s=window.rafexMekikSteppedV514(d);p.lanePositions547=s.lanes.map(l=>l.model.floors[0].positions);}return p;};
  window.rafexRenderPlanV143=function(p,options={}){
   if(!p.lanePositions547||p.showPallets===false)return render.apply(this,arguments);
   let out=render({...p,showPallets:false},options);const x=Number(options.x)||0,scale=Number(options.scale)||1;
   for(let i=0;i<p.bays;i++){const positions=p.lanePositions547[i]||[];out+='<g data-channel547="'+(i+1)+'">'+render({...p,bays:1,width:p.pitch+p.foot,depth:positions.length,positions,sequence:[],hasExtra:false,braces:[],showFlow:false,lanePositions547:undefined},{...options,x:x+i*p.pitch*scale,braces:false})+'</g>';}
   return out;
  };
 }
 const capture=window.rafexCaptureTechnicalViews,cache=new Map();
 if(capture)window.rafexCaptureTechnicalViews=async function(d,system){
  if(system!=='mekik2'||!d?.mekikCustomizationV514?.lanes?.some(Boolean))return capture.apply(this,arguments);
  const c=d.mekikCustomizationV514,groups=new Map(),bays=Number(d.bays)||1,pitch=(Number(d.totalWidth||d.widthMm)-Number(d.footType||100))/bays;
  for(let i=0;i<bays;i++){const config={...c,...c.lanes[i],lanes:undefined},key=JSON.stringify(config);if(!groups.has(key))groups.set(key,{config,indices:[]});groups.get(key).indices.push(i+1);}
  const language=document.getElementById('m2ReportLanguage')?.value||'tr',label=language==='fr'?'Canaux':language==='en'?'Channels':'Kanallar',views=[];
  for(const group of groups.values()){
   const source={...d,bays:1,widthMm:pitch+Number(d.footType||100),totalWidth:pitch+Number(d.footType||100),mekikCustomizationV514:group.config},model=window.rafexMekikSteppedV514(source);source.sideUprightHeight=model.height;source.totalRackHeight=model.height;
   const key=JSON.stringify([source,language]);if(!cache.has(key)){cache.set(key,Promise.resolve(capture(source,system)).catch(e=>{cache.delete(key);throw e;}));if(cache.size>32)cache.delete(cache.keys().next().value);}
   views.push({title:label+' '+group.indices.join(', '),views:await cache.get(key)});
  }
  const cols=Math.min(2,views.length),rows=Math.ceil(views.length/cols),uri=mode=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+cols*1260+' '+rows*810+'">'+views.map((v,i)=>'<g transform="translate('+(i%cols)*1260+' '+Math.floor(i/cols)*810+')"><text x="630" y="32" text-anchor="middle" fill="#174532" font-family="Arial" font-size="26" font-weight="700">'+v.title+'</text><image y="50" width="1260" height="760" href="'+v.views[mode].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"/></g>').join('')+'</svg>');
  return {front:uri('front'),side:uri('side')};
 };
})();

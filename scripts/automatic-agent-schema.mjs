export function automaticRequest(input) {
  const c=input.context;
  if(!c||!Array.isArray(c.types)||!c.types.length||c.types.length>20)throw Error('1–20 kayıtlı raf tipi seç.');
  for(const n of [c.width,c.depth,c.aisle,c.margin])if(!Number.isFinite(n)||n<0||n>1000000)throw Error('Alan ölçüleri geçersiz.');
  if(c.width<1000||c.depth<1000||c.aisle<500)throw Error('Alan ve koridor ölçülerini kontrol et.');
  const keys=new Set();
  const types=c.types.map(t=>{
    if(typeof t.key!=='string'||t.key.length>80||keys.has(t.key)||typeof t.name!=='string'||t.name.length>80||!['b2b','mr','mekik2','drive','konsol'].includes(t.system)||![t.width,t.depth].every(n=>Number.isFinite(n)&&n>0&&n<=1000000))throw Error('Raf kataloğu geçersiz.');
    keys.add(t.key);return {key:t.key,name:t.name,system:t.system,width:t.width,depth:t.depth};
  });
  return {
    instructions:'Rafex otomatik yerleşim planlayıcısısın. Kullanıcının alanı ve kayıtlı raf tiplerinden bir yerleşim stratejisi öner. Sadece verilen typeKey değerlerini kullan, ölçü veya yeni raf tipi üretme. Mevcut raflar korunur. Koridor ve duvar payını değiştiremezsin. items sıralı tip önceliğidir. count 1–500 arası istenen yeni blok sayısıdır; kullanıcı alanı doldur/en fazla derse count=0 kullan. Açık adet verilmişse aynısını koru. angle 0 veya 90. Kullanıcı tip seçmemişse uygun kayıtlı tipleri seçebilirsin. Geometriyi yerel çakışma kontrolü belirler, kapasite veya güvenlik garantisi verme. Belirsiz/uygulanamayan teknik istekte action=clarify ve items=[] dön. reason kısa Türkçe açıklama. Deprem, taşıma kapasitesi, kaçış yolu, forklift uygunluğu konusunda mühendislik onayı veremezsin.',
    input:JSON.stringify({request:input.prompt,context:{width:c.width,depth:c.depth,aisle:c.aisle,margin:c.margin,existingCount:Number(c.existingCount)||0,types}}),
    text:{format:{type:'json_schema',name:'automatic_layout',strict:true,schema:{type:'object',additionalProperties:false,properties:{action:{type:'string',enum:['layout','clarify']},reason:{type:'string'},items:{type:'array',maxItems:20,items:{type:'object',additionalProperties:false,properties:{typeKey:{type:'string',enum:[...keys]},count:{type:'integer',minimum:0,maximum:500},angle:{type:'integer',enum:[0,90]}},required:['typeKey','count','angle']}}},required:['action','reason','items']}}}
  };
}
export function validAutomaticPlan(plan,input){
  return plan&&['layout','clarify'].includes(plan.action)&&typeof plan.reason==='string'&&plan.reason.length<=1500&&Array.isArray(plan.items)&&plan.items.length<=20&&(plan.action!=='layout'||plan.items.length>0)&&new Set(plan.items.map(i=>i.typeKey)).size===plan.items.length&&plan.items.every(i=>input.context.types.some(t=>t.key===i.typeKey)&&Number.isInteger(i.count)&&i.count>=0&&i.count<=500&&[0,90].includes(i.angle));
}

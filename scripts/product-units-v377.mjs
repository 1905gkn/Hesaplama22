export function transform(html){
 if(html.includes('data-product-units="v377"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v377 inventory anchor '+a.slice(0,80));html=html.replace(a,b);};
 // Normalize before grouping; quantities and product codes remain untouched.
 replace("name=String(name);spec=String(spec||'');unit=String(unit||'adet');","name=String(name);spec=String(spec||'');unit=window.rafexProductUnitV377(name);");
 replace('const key=`${name}|${spec}|${unit}`,row=products.get(key)', 'unit=window.rafexProductUnitV377(name);const key=`${name}|${spec}|${unit}`,row=products.get(key)');
 const first=html.indexOf('<script');if(first<0)throw Error('v377 first script');
 const runtime=`(()=>{window.rafexProductUnitV377=function(name){const key=String(name||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/ı/g,'i').replace(/\\s+/g,' ').trim();return /^(ayak(?: takimi)?|konsol ayak|h[ -]?travers(?:i)?)$/.test(key)?'takım':'adet';};})();`;
 return html.slice(0,first)+'<script data-product-units="v377">'+runtime+'</script>'+html.slice(first);
}

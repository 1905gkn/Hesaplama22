const unitFor=String.raw`function(name){const key=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ı/g,'i').replace(/\s+/g,' ').trim();return /^(ayak(?: takimi)?|konsol ayak|h[ -]?travers(?:i)?)$/.test(key)?'takım':'adet';}`;
export function transform(html){
 if(html.includes('data-product-units="v377"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v377 inventory anchor '+a.slice(0,80));html=html.replace(a,b);};
 // Normalize before grouping; quantities and product codes remain untouched.
 replace("name=String(name);spec=String(spec||'');unit=String(unit||'adet');","name=String(name);spec=String(spec||'');unit=("+unitFor+")(name);");
 replace('const key=`${name}|${spec}|${unit}`,row=products.get(key)', 'unit=('+unitFor+')(name);const key=`${name}|${spec}|${unit}`,row=products.get(key)');
 const first=html.indexOf('<script');if(first<0)throw Error('v377 first script');
 // Inventory consumers can extract the native calculation independently of
 // other runtime scripts. Embed the same pure rule in both calculation paths.
 const runtime='(()=>{window.rafexProductUnitV377='+unitFor+';})();';
 return html.slice(0,first)+'<script data-product-units="v377">'+runtime+'</script>'+html.slice(first);
}
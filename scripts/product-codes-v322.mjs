import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('../client/product-code-rules-v322.js',import.meta.url),'utf8');
export function transform(html){
  if(html.includes('/* product-codes-v322 */'))return html;
  function replace(from,to){if(!html.includes(from))throw Error('Product codes missing anchor: '+from.slice(0,90));html=html.replace(from,to);}
  replace('      function m2B2BFootProductData(drawing){','/* product-codes-v322 */\n'+runtime+'\n      function m2B2BFootProductData(drawing){');
  replace('return{profile,width,family,height,depth,thickness,code:`${family}${heightCode}${depth}${thicknessCode}`,shoeCode:`APK${family}`,shimCode:shim};','return{profile,width,family,height,depth,thickness,code:window.rafexProductCodeRulesV322.frame(`HR${width}.80.${thickness}`,height,depth),shoeCode:window.rafexProductCodeRulesV322.weldedShoe(width),shimCode:window.rafexProductCodeRulesV322.shim(width)};');
  replace("      name=String(name);spec=String(spec||'');unit=String(unit||'adet');",`      name=String(name);spec=String(spec||'');unit=String(unit||'adet');
      var productCodeV322=window.rafexProductCodeRulesV322.codeFor(name,spec);
      if(productCodeV322)spec=productCodeV322+' · '+spec;`);
  replace("add('Ayak pabucu',profileQty,'Kaynaklı');","add('Ayak pabucu',profileQty,'Kaynaklı · '+profile);");
  replace("add('Şim',profileQty,'');","add('Şim',profileQty,profile);");
  replace('<span>${labels.item}</span><span>${labels.spec}</span><span>${labels.qty}</span><span>${labels.unit}</span>', '<span>${labels.item}</span><span>KOD</span><span>${labels.spec.replace(/^KOD \\/ |^CODE \\/ /,"")}</span><span>${labels.qty}</span><span>${labels.unit}</span>');
  replace('<span>${esc(row.item)}</span><span>${esc(row.spec||"—")}</span><span>${fmt(row.qty)}</span><span>${esc(row.unit)}</span>', '<span>${esc(row.item)}</span><span class="rafex-product-code">${esc(window.rafexProductCodeRulesV322.split(row.spec).code||"—")}</span><span>${esc(window.rafexProductCodeRulesV322.split(row.spec).description||"—")}</span><span>${fmt(row.qty)}</span><span>${esc(row.unit)}</span>');
  const style=`<style data-rafex-product-codes="v322">
  .m2-corporate-bom-head,.m2-corporate-bom-row{grid-template-columns:1.1fr 1.4fr 2fr .4fr!important}
  .m2-corporate-bom-head span:nth-child(3),.m2-corporate-bom-row span:nth-child(3){text-align:left!important}
  .m2-corporate-bom-head span:nth-child(n+4),.m2-corporate-bom-row span:nth-child(n+4){text-align:right!important}
  .m2-corporate-bom-head span:nth-child(4),.m2-corporate-bom-row span:nth-child(4){display:block!important}
  .m2-corporate-bom-head span:nth-child(5),.m2-corporate-bom-row span:nth-child(5){display:none!important}
  .m2-corporate-bom-row .rafex-product-code{font-size:10px!important;font-weight:800;overflow:visible!important;text-overflow:clip!important}
  </style>`;
  const end=html.lastIndexOf('</body>');
  if(end<0)throw Error('Product code style: missing body');
  html=html.slice(0,end)+style+html.slice(end);
  return html;
}


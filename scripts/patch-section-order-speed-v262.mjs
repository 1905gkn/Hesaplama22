import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* section-order-speed-v262 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch: '+a.slice(0,80));html=html.replace(a,b);};
 rep('  rackTypeCache=[...groups.values()].map(group=>({...group,existingCounts:[...group.entries.keys()].sort((a,b)=>b-a)}));',`  /* section-order-speed-v262 */
  const blockOrder=new Intl.Collator('tr',{numeric:true,sensitivity:'base'});
  rackTypeCache=[...groups.values()].sort((a,b)=>{
    const x=a.baseLabel.toUpperCase(),y=b.baseLabel.toUpperCase();
    const letters=/^[A-Z]+$/;
    return (letters.test(x)&&letters.test(y)?x.length-y.length||blockOrder.compare(x,y):blockOrder.compare(x,y))||blockOrder.compare(a.system,b.system)||a.rows-b.rows||Number(a.entries.keys().next().value)-Number(b.entries.keys().next().value);
  }).map(group=>({...group,existingCounts:[...group.entries.keys()].sort((a,b)=>b-a)}));`);
 rep("      return await window.rafexCaptureTechnicalViews(seed.drawing,type.system);",`      const signature=JSON.stringify({system:type.system,drawing:seed.drawing});
      if(!force&&previewCache.get(key)?.signature===signature)return previewCache.get(key).src;
      const src=await window.rafexCaptureTechnicalViews(seed.drawing,type.system);
      if(src){previewCache.set(key,{signature,src});trimPreviewCache();}
      return src;`);
 rep("const cards=created.filter(card=>host.contains(card)),template=pages[0];let anchor=template;",`const cards=created.filter(card=>host.contains(card)),template=pages[0];let anchor=template;
        // Clone the page shell only: section artwork has already been captured.
        const shell=template.cloneNode(false);
        for(const child of template.children){
          if(child.classList.contains('rafex-v19-type-grid'))shell.appendChild(child.cloneNode(false));
          else shell.appendChild(child.cloneNode(true));
        }`);
 rep('const page=template.cloneNode(true);page.removeAttribute(\'id\');page.querySelector(\'.rafex-v19-type-grid\').replaceChildren(...cards.slice(i,i+2));','const page=shell.cloneNode(true);page.removeAttribute(\'id\');page.querySelector(\'.rafex-v19-type-grid\').replaceChildren(...cards.slice(i,i+2));');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-order-speed-v262.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

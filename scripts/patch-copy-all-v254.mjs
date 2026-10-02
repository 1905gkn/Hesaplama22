import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-copy-all-v254'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch: '+a.slice(0,80));html=html.replace(a,b);};
 rep('<button type="button" data-copy disabled>Seçilen tipleri kopyala</button>','<button type="button" data-copy disabled>Seçilen tipleri kopyala</button><button type="button" data-copy-all-v254 disabled>Tümünü kopyala</button>');
 rep("copy=root.querySelector('[data-copy]'),status=","copy=root.querySelector('[data-copy]'),copyAll=root.querySelector('[data-copy-all-v254]'),status=");
 rep("   copy.disabled=true;status.textContent=select.value?","   copyAll.disabled=!types.length;copy.disabled=true;status.textContent=select.value?");
 rep("  copy.addEventListener('click',()=>{","  function copyTypes(all){");
 rep("   const selected=[...list.querySelectorAll('input:checked')].map(n=>types[Number(n.value)]);if(!selected.length)return;","   const selected=all?types.slice():[...list.querySelectorAll('input:checked')].map(n=>types[Number(n.value)]);if(!selected.length)return;");
 rep("   }catch(error){status.textContent='Kopyalanamadı: '+error.message;}\n  });","   }catch(error){status.textContent='Kopyalanamadı: '+error.message;}\n  }\n  copy.addEventListener('click',()=>copyTypes(false));\n  copyAll.addEventListener('click',()=>copyTypes(true));");
 rep('const rows = ([["Anında güncellenir"','const rows = ([["Tümünü kopyala","Copy all","Tout copier"],["Anında güncellenir"');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-copy-all-v254.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

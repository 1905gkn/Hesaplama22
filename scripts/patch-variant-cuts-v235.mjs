import fs from 'node:fs';
export function transform(html){if(html.includes('variant-cuts-v235'))return html;
const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing '+a.slice(0,90));html=html.replace(a,b)};
replace('      x: clamp(number(value.x, defaults.x), -80, 80),','      excluded: value.excluded === true,\n      x: clamp(number(value.x, defaults.x), -80, 80),');
replace("const label=safeKey(entry.name||entry.typeName||`Raf Tipi ${index+1}`),key=system+'|'+label.toLocaleUpperCase('tr-TR');\n    if(!groups.has(key))groups.set(key,{key,label,system,entries:new Map(),cards:[]});\n    const count=palletCountOf(drawing);",`const baseLabel=safeKey(entry.name||entry.typeName||\`Raf Tipi \${index+1}\`),baseKey=system+'|'+baseLabel.toLocaleUpperCase('tr-TR');
    const count=palletCountOf(drawing),rows=Number(drawing.b2bLayout?.rowCount)||(drawing.b2b?.rowType==='double'?2:1),variant=system==='b2b';
    const key=variant?baseKey+'|p'+count+'r'+rows:baseKey,label=variant?baseLabel+' · '+count+' paletli · '+(rows===2?'Çift sıra':'Tek sıra'):baseLabel;
    if(!groups.has(key))groups.set(key,{key,label,baseLabel,baseKey,variant,rows,quantity:0,system,entries:new Map(),cards:[]}); groups.get(key).quantity++;`);
replace("const key=system+'|'+label.toLocaleUpperCase('tr-TR'),group=groups.get(key);\n      if(group){group.cards.push(card);card.dataset.rafexSectionKey=key;}",`const baseKey=system+'|'+label.toLocaleUpperCase('tr-TR');
      for(const group of groups.values())if(group.baseKey===baseKey&&(!card.dataset.rafexVariantV235||card.dataset.rafexVariantV235===group.key)){group.cards.push(card);}`);
replace('const value = cloneView(source.sections?.[normalized] || defaults, defaults);','const baseKey=rackTypeCache.find(item=>item.key===normalized)?.baseKey;\n    const value = cloneView(source.sections?.[normalized] || source.sections?.[baseKey] || defaults, defaults);');
replace('cloneView(saved.sections[normalized] || defaultsFor(normalized), defaultsFor(normalized))', 'cloneView(saved.sections[normalized] || saved.sections[rackTypeCache.find(item=>item.key===normalized)?.baseKey] || defaultsFor(normalized), defaultsFor(normalized))');
replace('saved.sections[type.key]=defaultsFor(type.key);','saved.sections[type.key]=cloneView(saved.sections[type.baseKey] || defaultsFor(type.key),defaultsFor(type.key));');
replace('const counts=multiple?requested:[available[0]];','const counts=type.variant?[available[0]]:multiple?requested:[available[0]];');
replace('button.dataset.rafexTypeLetter=section.label;','button.dataset.rafexTypeLetter=section.baseLabel||section.label;');
replace('      list.appendChild(button);\n    });\n  }\n\n  function renderControls()',`      list.appendChild(button);
      const toggle=document.createElement('button');toggle.type='button';toggle.dataset.rafexVariantToggle=section.key;
      const excluded=ensureSetting(section.key).excluded===true;
      toggle.textContent=excluded?'Çıktıya ekle':'Çıktıdan çıkar';toggle.setAttribute('aria-pressed',String(!excluded));toggle.style.cssText='display:block;margin-bottom:8px;font-size:11px';
      toggle.addEventListener('click',()=>{ensureSetting(section.key).excluded=!ensureSetting(section.key).excluded;renderSectionList();});list.appendChild(toggle);
    });
  }

  function renderControls()`);
replace('    modal?.classList.toggle("is-mr", Boolean(mr));','    modal?.classList.toggle("is-mr", Boolean(mr));\n    if(modal)modal.dataset.variantCutV235=type?.variant?"1":"0";');
replace("list.querySelectorAll('.rafex-mekik-section-divider').forEach", "if(list.querySelector('[data-rafex-variant-toggle]'))return;\n    list.querySelectorAll('.rafex-mekik-section-divider').forEach");
replace("if(sectionButton){var cut=", "if(sectionButton&&sectionButton.parentElement?.querySelector('[data-rafex-variant-toggle]'))return;\n    if(sectionButton){var cut=");
replace('title.textContent = activeKey;', 'title.textContent = rackTypeCache.find(item=>item.key===activeKey)?.label || activeKey;');
replace('title.textContent = activeKey || "Raf tipi yok";', 'title.textContent = rackTypeCache.find(item=>item.key===activeKey)?.label || activeKey || "Raf tipi yok";');
const a=html.indexOf('  async function renderAllPerspective(source = saved, force = false) {'),b=html.indexOf('\n  // Final PDF builders',a);if(a<0||b<0)throw Error('Renderer missing');
html=html.slice(0,a)+`  /* variant-cuts-v235 */
  async function renderAllPerspective(source = saved, force = false) {
    while(renderQueued)await new Promise(resolve=>setTimeout(resolve,25));
    const types=collectRackTypes().filter(type=>type.entries.size&&type.cards.length);if(!types.length)return;
    renderQueued=true;window.__rafexSectionCaptureActive=true;
    let originals=new Set();const created=[],images=new Map();
    try{
      for(const type of types){
        if(settingFor(type.key,source).excluded)continue;
        const src=await capturePerspective(type.key,source,force);if(!src)throw Error(type.label+' kesit görüntüsü hazırlanamadı');
        images.set(type.key,src);
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      // Bind cards after asynchronous captures: a pending report refresh can replace their DOM.
      window.__rafexSectionCaptureActive=false;window.rafexRebuildSectionsV230?.();window.__rafexSectionCaptureActive=true;
      const currentTypes=collectRackTypes();originals=new Set(currentTypes.flatMap(type=>type.cards));
      for(const type of currentTypes){
        const src=images.get(type.key);if(!src)continue;
        for(const original of type.cards){
          const card=original.cloneNode(true);card.dataset.rafexVariantV235=type.key;card.dataset.rafexSectionKey=type.key;
          const title=card.querySelector('.rafex-v19-card-head span');if(title)title.textContent=type.label;\n          if(type.variant){const labels=card.querySelectorAll('.rafex-v19-card-head small'),entry=[...type.entries.values()][0];if(labels[0])labels[0].textContent=(entry.count*(Number(entry.drawing.levels)||1)*type.rows*type.quantity)+' PALET';if(labels[1])labels[1].textContent=type.quantity+' ADET';}
          original.parentElement.appendChild(card);created.push(card);await applyPerspectiveToCard(card,type.key,src,source);
        }
      }
      originals.forEach(card=>card.remove());
      for(const id of ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea']){
        const host=document.getElementById(id);if(!host)continue;
        const pages=[...host.querySelectorAll(':scope>.rafex-v19-type-page')];if(!pages.length)continue;
        const cards=created.filter(card=>host.contains(card)),template=pages[0];let anchor=template;
        for(let i=0;i<cards.length;i+=2){const page=template.cloneNode(true);page.removeAttribute('id');page.querySelector('.rafex-v19-type-grid').replaceChildren(...cards.slice(i,i+2));anchor.after(page);anchor=page;}
        pages.forEach(page=>page.remove());
      }
    }catch(error){created.forEach(card=>card.remove());throw error;}
    finally{renderQueued=false;window.__rafexSectionCaptureActive=false;}
  }
`+html.slice(b);
const css='<style data-rafex="variant-cuts-v235">#m2SectionPlacementModal[data-variant-cut-v235="1"] .rafex-module-count{display:none!important}</style>';
const at=html.lastIndexOf('</body>');return html.slice(0,at)+css+html.slice(at)}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-variant-cuts-v235.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

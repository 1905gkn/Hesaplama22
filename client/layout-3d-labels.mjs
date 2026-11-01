// Prefer the text actually rendered by the free-layout label controller.
export function planRackLabel(r,root,variantFor=()=>'',fallbackName=r.typeName||r.blockName||'Raf'){
 const group=Array.from(root?.querySelectorAll('[data-rack]')||[]).find(g=>g.getAttribute('data-rack')===String(r.id));
 const mark=group?.querySelector('.rafex-rack-label-v160'),name=mark?.querySelector('text')?.textContent?.trim(),detail=mark?.querySelector('[data-variant-detail-v306]')?.textContent?.trim();
 if(name)return {name,detail:detail||''};
 const raw=String(variantFor(r)||''),count=/(\d+)$/.exec(raw)?.[1]||'',base=String(r.rafexGlobalTypeLetter||fallbackName).trim().replace(/\s*-\s*Tünel(?:\s+\d+)?\s*$/i,'');
 return {name:base+count,detail:raw.startsWith('TÜNEL')?'TÜNEL':''};
}

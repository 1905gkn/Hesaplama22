import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-layout-budget="v152"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v152 anchor missing: '+a.slice(0,80));html=html.replace(a,b)};
 // A fresh ID index per decoration pass avoids N array searches for N labels.
 replace('  function rackSystemName(group){','  var rackIndexV152=new Map();\n  function rackSystemName(group){');
 replace('rack=Array.isArray(state?.racks)?state.racks.find(function(item){return Number(item.id)===id}):null','rack=rackIndexV152.get(id)');
 replace('function decorate(){var node=svg();if(!node)return;node.querySelectorAll("[data-rack]").forEach(decorateGroup);window.rafexFitNameplatesV136?.()}', 'function decorate(){var node=svg();if(!node)return;rackIndexV152=new Map((typeof m2LayoutState!=="undefined"?m2LayoutState.racks:[]).map(r=>[Number(r.id),r]));node.querySelectorAll("[data-rack]").forEach(decorateGroup);window.rafexFitNameplatesV136?.()}');
 // Cache measured nameplates until their visible text, scale, or selection changes.
 replace('function compactNameplateV136(group){','const nameplateCacheV152=new WeakMap();\n  function compactNameplateV136(group){');
 replace('    const mark=group.querySelector(\'.rafex-single-line-letter-v58\');', `    const mark=group.querySelector('.rafex-single-line-letter-v58');
    const textsV152=Array.from(group.querySelectorAll('.m2-rack-name,.m2-rack-pallet-count'));
    const keyV152=[mark?.getAttribute('data-signature'),group.querySelector('.m2-layout-rack')?.classList.contains('selected'),...textsV152.map(t=>t.textContent+'|'+t.getAttribute('style'))].join('~');
    const oldV152=nameplateCacheV152.get(group);if(oldV152?.key===keyV152&&oldV152.plate===plate&&oldV152.mark===mark)return;
    nameplateCacheV152.set(group,{key:keyV152,plate,mark});`);
 // Export must measure full-detail visible geometry, independent of editor culling.
 replace('function freezePlanPaint(source, copy) {',`function freezePlanPaint(source, copy) {
  const hiddenV152=Array.from(source.querySelectorAll('.rafex-offscreen-v152'));
  hiddenV152.forEach(n=>n.classList.remove('rafex-offscreen-v152'));
  copy.querySelectorAll('.rafex-offscreen-v152').forEach(n=>n.classList.remove('rafex-offscreen-v152'));
  try {`);
 replace("copy.setAttribute('data-rafex-live-snapshot','v1');\n  return copy;", "copy.setAttribute('data-rafex-live-snapshot','v1');\n  return copy;\n  } finally {hiddenV152.forEach(n=>n.classList.add('rafex-offscreen-v152'));}");
 const runtime=fs.readFileSync(new URL('./layout-budget-runtime-v152.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v152 body missing');
 return html.slice(0,end)+'<style data-layout-budget="v152">#m2LayoutSvg .rafex-offscreen-v152{visibility:hidden!important}</style><script data-layout-budget="v152">'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-budget-v152.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 const html=transform(Buffer.from(m[1],'base64').toString());fs.writeFileSync(file,s.replace(m[1],Buffer.from(html).toString('base64')));
}

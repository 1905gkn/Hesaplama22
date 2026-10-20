import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-save-output-perf="v341"'))return html;
 const replace=(from,to,count)=>{if(html.split(from).length-1!==count)throw Error('v341 anchor mismatch: '+from.slice(0,70));html=html.split(from).join(to);};
 replace('const fingerprint=catalogRecordFingerprint;',`// Cache only within this merge; later edits must be fingerprinted again.
  const fingerprints=new WeakMap();
  const fingerprint=entry=>{if(!fingerprints.has(entry))fingerprints.set(entry,catalogRecordFingerprint(entry));return fingerprints.get(entry);};`,2);
 replace('const entry=clone(raw),origin=entry.registryKey||(registry?key(entry):null),fp=fingerprint(entry);',`const entry=clone(raw),origin=entry.registryKey||(registry?key(entry):null),fp=fingerprint(raw);
    fingerprints.set(entry,fp);`,2);
 replace('m2BuildCorporatePages=function(...args){const holder=document.createElement(\'div\');holder.innerHTML=build.apply(this,args);filter(holder);return holder.innerHTML;};',`m2BuildCorporatePages=function(...args){const markup=build.apply(this,args);if(!hide)return markup;const holder=document.createElement('div');holder.innerHTML=markup;filter(holder);return holder.innerHTML;};`,1);
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v341 body missing');return html.slice(0,end)+'<meta data-save-output-perf="v341">'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-save-output-perf-v341.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v341 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v341: operation-scoped catalog fingerprints and output parse fast path');
}


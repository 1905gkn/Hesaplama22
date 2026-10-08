import fs from 'node:fs';

export function transform(html) {
  if (html.includes('/* selected-block-join-v298 */')) return html;
  const replace = (before, after) => {
    if (!html.includes(before)) throw Error('Missing selected-block join anchor: ' + before);
    html = html.replace(before, after);
  };
  replace('const anchor=fixed.slice().sort((a,b)=>sign*(along(b)-along(a)))[0];',
    '/* selected-block-join-v298 */ const anchor=target;');
  replace('const reference=fixed.find(r=>Number(r.b2bLayout?.rowCount)===2);',
    'const reference=Number(target.b2bLayout?.rowCount)===2?target:fixed.find(r=>Number(r.b2bLayout?.rowCount)===2);');
  replace('const ids=[...fixedIds,...selected];', `const occupied=planned.some(p=>fixed.some(f=>{
   const overlap=(p.w+f.w)/2-Math.abs(along(p)-along(f));
   const sharedWidth=(m2B2BFootWidth(p)+m2B2BFootWidth(f))/2*m2LayoutState.scale;
   if(overlap<=sharedWidth+.01)return false;
   const rows=r=>Array.from({length:Number(r.b2bLayout?.rowCount)||1},(_,i)=>rowAxis(r,i));
   return rows(p).some(a=>rows(f).some(b=>Math.abs(a-b)<(Number(p.b2bLayout.frameDepth)+Number(f.b2bLayout.frameDepth))/2*m2LayoutState.scale-.01));
  }));
  if(occupied){fail('Seçilen bloğun bu sırasında başka bir modül var. Boş bir birleşim yönü seç.');return;}
  const ids=[...fixedIds,...selected];`);
  return html;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/patch-selected-block-join-v298.mjs')) {
  const file = process.argv[2] || 'dist/server/index.js';
  const source = fs.readFileSync(file, 'utf8');
  const embedded = source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  const html = embedded ? Buffer.from(embedded[1], 'base64').toString() : source;
  const result = transform(html);
  fs.writeFileSync(file, embedded ? source.replace(embedded[1], Buffer.from(result).toString('base64')) : result);
}


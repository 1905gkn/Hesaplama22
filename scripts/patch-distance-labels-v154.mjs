import fs from 'node:fs';

// Only default rack/rack and rack/wall lettering changes. Geometry, hit targets,
// saved dimensions and explicit per-label font overrides remain untouched.
export function transform(html){
  if(html.includes('data-distance-labels="v154"'))return html;
  for(const anchor of ['.m2-rack-distance-label','.m2-wall-distance-label','.rafex-common-pair-gap']){
    if(!html.includes(anchor))throw Error('v154 missing anchor: '+anchor);
  }
  const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
  const css=`<style data-distance-labels="v154">
.m2-rack-distance-label[data-dimension-key^="gap:"],
.m2-rack-distance-label[data-dimension-key^="pair-gap:"]{font-size:4.25px;stroke-width:1.25px}
.rafex-common-pair-gap .m2-rack-distance-label[data-dimension-key^="pair-gap:"]{font-size:4.25px!important;stroke-width:1.25px!important}
.m2-wall-distance-label[data-dimension-key^="wall:"]{font-size:4px;stroke-width:1.25px}
</style>`;
  return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-distance-labels-v154.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!m)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* independent-measure-position-v330 */'))return html;
 const from="if(line){const x=(Number(line.getAttribute('x1'))+Number(line.getAttribute('x2')))/2,y=(Number(line.getAttribute('y1'))+Number(line.getAttribute('y2')))/2;node.setAttribute('x',x);node.setAttribute('y',y);";
 const to=`/* independent-measure-position-v330 */
      if(line){
       const key=node.dataset.dimensionKey,pair=/^pair-gap:([^:]+):([^:]+)$/.exec(key);
       // Read each label's own saved offset; frozen PDF areas keep their own values.
       const offsets=!pdf&&typeof m2DimensionOffsets!=='undefined'?m2DimensionOffsets:null;
       const offset=offsets?(offsets[key]||(pair?offsets['pair-gap:'+pair[2]+':'+pair[1]]:null)||{}):{x:node.dataset.rafexDimensionOffsetX,y:node.dataset.rafexDimensionOffsetY};
       const dx=Number(offset.x)||0,dy=Number(offset.y)||0;
       if(!pdf){node.dataset.rafexDimensionOffsetX=String(dx);node.dataset.rafexDimensionOffsetY=String(dy);}
       const x=(Number(line.getAttribute('x1'))+Number(line.getAttribute('x2')))/2+dx,y=(Number(line.getAttribute('y1'))+Number(line.getAttribute('y2')))/2+dy;node.setAttribute('x',x);node.setAttribute('y',y);`;
 if(html.split(from).length!==2)throw Error('v330 label position anchor mismatch');return html.replace(from,to);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-independent-measure-position-v330.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v330 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v330: independent per-dimension offsets preserved through centering, font changes and PDF cleanup');
}


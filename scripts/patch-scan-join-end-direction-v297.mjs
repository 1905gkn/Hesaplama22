import fs from 'node:fs';
export function transform(html){
 if(html.includes('scan-join-end-direction-v297'))return html;
 const fn='function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null){';
 const sign='const sign=moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1;';
 const call='planScannedJoin(anchor,moving,m2LayoutState.scale,m2B2BFootWidth(target),fixed,chosenRow).planned';
 if(!html.includes(fn)||!html.includes(sign)||!html.includes(call))throw Error('Missing scan join direction anchors');
 return html.replace(fn,'function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null,direction=null){').replace(sign,'/* scan-join-end-direction-v297 */ const sign=direction===-1?-1:direction===1?1:(moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1);').replace(call,'planScannedJoin(anchor,moving,m2LayoutState.scale,m2B2BFootWidth(target),fixed,chosenRow,sign).planned');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-scan-join-end-direction-v297.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

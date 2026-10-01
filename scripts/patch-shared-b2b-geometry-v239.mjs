import fs from 'node:fs';
import {sectionWidthForCount} from './patch-customize-width-v238.mjs';
export function transform(html){
 if(html.includes('data-shared-b2b-geometry="v239"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing shared geometry anchor: '+a.slice(0,100));html=html.replace(a,b);};
 replace('function b2bPalletGeometry() {','function b2bPalletGeometry(input = null) {');
 replace('const type = $("b2bPalletType")?.value || "euro";','const type = input ? input.palletType || "euro" : $("b2bPalletType")?.value || "euro";');
 replace('Number($("b2bPalletCount")?.value) || 3','Number(input ? input.palletCount : $("b2bPalletCount")?.value) || 3');
 replace('Number(b2bSpecialPallet.width) || 800','Number(input ? input.palletWidth : b2bSpecialPallet.width) || 800');
 replace('Number(b2bSpecialPallet.depth) || 1200','Number(input ? input.palletDepth : b2bSpecialPallet.depth) || 1200');
 replace('const sectionWidth = isStandardFourEuro ? 3600 : calculatedWidth;','const standardWidth = isStandardFourEuro ? 3600 : calculatedWidth;\n        const sectionWidth = Number(input?.importedSectionWidth) >= calculatedWidth ? Number(input.importedSectionWidth) : standardWidth;');
 const start=html.indexOf('        const settings = drawing?.b2b || {}, count =',html.indexOf('function b2bLayoutDrawing('));
 const end=html.indexOf('        const palletOverhang =',start);
 if(start<0||end<0)throw Error('Layout geometry missing');
 html=html.slice(0,start)+`        const settings = drawing?.b2b || {}, geometry=b2bPalletGeometry(settings), count=geometry.count, palletWidth=geometry.width, palletDepth=geometry.depth, sectionWidth=geometry.sectionWidth;
`+html.slice(end);
 replace(sectionWidthForCount.toString(),`function sectionWidthForCount(layout,count){
 const same=Number(count)===Number(layout.palletCount);
 return b2bPalletGeometry({...layout,palletCount:count,importedSectionWidth:same?layout.sectionWidth:undefined}).sectionWidth;
}`);
 replace('rafexSyncWidthV238(rack,count,m2LayoutState.scale,m2B2BFootWidth(rack),view);',`rafexSyncWidthV238(rack,count,m2LayoutState.scale,m2B2BFootWidth(rack),view);
 const geometry=b2bLayoutDrawing({...rack,b2b:{...rack.b2b,palletCount:count}});
 rack.b2bLayout={...rack.b2bLayout,...geometry.b2bLayout};rack.widthMm=geometry.widthMm;rack.totalWidth=geometry.totalWidth;rack.w=Math.max(.5,geometry.widthMm*m2LayoutState.scale);
 if(rack.b2bViewerOptions)rack.b2bViewerOptions={...rack.b2bViewerOptions,sectionWidth:geometry.b2bLayout.sectionWidth,footWidth:geometry.footType};`);
 const endBody=html.lastIndexOf('</body>');return html.slice(0,endBody)+'<script data-shared-b2b-geometry="v239"></script>'+html.slice(endBody);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shared-b2b-geometry-v239.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

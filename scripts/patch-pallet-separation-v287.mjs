import fs from 'node:fs';
export function transform(html){
 if(html.includes('pallet-separation-v287'))return html;
 const css=`<style data-pallet-separation="v287">/* pallet-separation-v287 */
 :is(#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea,#m2A4PrintSheet,#m2A4PrintArea) .m2-b2b-plan-pallet-line{display:none!important}
 #page :is(#m2LayoutSvg,.rafex-drag-scene-v248) [data-rack] .m2-b2b-plan-pallet,
 :is(#m2ReportFloor,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea,#m2A4PrintSheet,#m2A4PrintArea) .m2-b2b-plan-pallet{fill:#dfbd72!important;fill-opacity:1!important;stroke:#ac803e!important;stroke-width:.45px!important;stroke-opacity:1!important;opacity:1!important;vector-effect:none!important;shape-rendering:geometricPrecision!important}
 </style>`;const end=html.lastIndexOf('</body>');return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-separation-v287.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* upright-consistency-v270 */'))return html;
 const old='uprightH = Math.max(.4, Math.min(13, frameH * .16))';
 if(!html.includes(old))throw Error('Physical upright geometry hook missing');
 html=html.replace(old,`uprightH = Math.max(.01, (()=>{const saved=rack.typeName?m2SavedRackTypes.find(t=>t.name===rack.typeName)?.drawing:null;const profile=[rack.footProfileKey,rack.footProfile,saved?.footProfileKey,saved?.footProfile].map(v=>String(v||'')).map(v=>v.match(/HR\\s*\\d{2,3}[.\\s-]+(\\d{2,3})/i)).find(Boolean);return (profile?Number(profile[1]):footWidthMm===127?105:80)*yScale;})()) /* upright-consistency-v270 */`);
 const start=html.indexOf('    var groups=new Map();',html.indexOf('  function enhance(svg){'));
 const end=html.indexOf('    svg.dataset.rafexPdfUprights=',start);
 if(start<0||end<start)throw Error('Upright overlay hook missing');
 html=html.slice(0,start)+`    svg.querySelectorAll('[class*="rafex-pdf-upright-halo"],[class*="rafex-pdf-upright-overlay"]').forEach(node=>node.remove());\n`+html.slice(end);
 const paint='is5010?"#00679d":getComputedStyle(upright).fill';
 if(!html.includes(paint))throw Error('Uniform paint hook missing');
 html=html.replace(paint,'is5010?"#00679d":"#aeb8bd"');
 const css=`<style data-upright-consistency="v270">
 :is(#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) .m2-b2b-plan-upright{stroke:none!important;stroke-width:0!important;transform:none!important;filter:none!important;fill-opacity:1!important;shape-rendering:geometricPrecision!important;vector-effect:none!important}
 :is(#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) [class*="rafex-pdf-upright-halo"],:is(#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) [class*="rafex-pdf-upright-overlay"]{display:none!important}
 </style>`;
 return html.replace('</head>',css+'\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-upright-consistency-v270.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML_BASE64');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

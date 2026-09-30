import fs from 'node:fs';
export function transform(html){if(html.includes('area-width-v227'))return html;
const css=`<style data-rafex="area-width-v227">
#page .m2-tool-group.area-tools{display:grid;grid-template-columns:repeat(4,max-content);width:max-content;max-width:100%;justify-self:start;align-items:start}
#page .area-tools>.m2-tool-group-title,#page .area-tools>.m2-ortho-tools,#page .area-tools>#rafexAddArea,#page .area-tools>#rafexAreaList{grid-column:1/-1}
#page .area-tools>#rafexAreaList,#page .area-tools>.m2-ortho-tools{width:0;min-width:100%;box-sizing:border-box}
#page .area-tools>#rafexAddArea{width:100%;box-sizing:border-box}
@media(max-width:650px){#page .m2-tool-group.area-tools{grid-template-columns:repeat(2,minmax(0,1fr));width:100%}#page .area-tools>button{min-width:0;white-space:normal}}
</style>`;const at=html.lastIndexOf('</body>');return html.slice(0,at)+css+html.slice(at)}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-area-width-v227.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

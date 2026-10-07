import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* report-project-name-v282 */'))return html;
 const replacements=[['projectName=$("m2ProjectName")?.value?.trim()||t.project','projectName=rafexReportProjectNameV282(language)'],['const projectName = $("m2ProjectName")?.value?.trim() || labels.project, palletTotal','const projectName = rafexReportProjectNameV282($("m2ReportLanguage")?.value||"tr"), palletTotal']];
 for(const[a,b]of replacements){if(!html.includes(a))throw Error('Missing report name anchor');html=html.replaceAll(a,b);}
 const runtime=fs.readFileSync(new URL('../client/report-project-name.js',import.meta.url),'utf8'),end=html.lastIndexOf('</body>');
 return html.slice(0,end)+'<script>'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-report-project-name-v282.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

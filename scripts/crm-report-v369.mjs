import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./crm-report-v369.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-crm-report="v369"'))return html;
 const anchor='else print.innerHTML=m2BuildCorporatePages(); document.body.appendChild(print);';
 if(html.split(anchor).length!==2)throw Error('CRM report: direct print hook missing');
 html=html.replace(anchor,anchor+'if(!prepared)window.rafexReportMetadataV324(print);');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('CRM report body');
 const css='.m2-corporate-cover .rafex-report-customer-v369{margin:20px 0 16px;color:white;overflow-wrap:anywhere}.m2-corporate-cover .rafex-report-company-v369{font-size:26px;font-weight:800;line-height:1.25}.m2-corporate-cover p.rafex-report-contact-v369{margin:7px 0 0;font-size:18px;line-height:1.35;color:#d9eaf2}';
 return html.slice(0,end)+'<style data-crm-report="v369">'+css+'</style><script data-crm-report="v369">'+runtime+'</script>'+html.slice(end);
}

import fs from 'node:fs';
import vm from 'node:vm';
const runtime=['top-plan-import.js','top-plan-wizard.js'].map(name=>fs.readFileSync(new URL('../client/'+name,import.meta.url),'utf8')).join('\n');
const inject=html=>{
  html=html.replace(/<script data-rafex-top-plan-import>[\s\S]*?<\/script>/g,'');
  const end=html.lastIndexOf('</body>');
  if(end<0)throw Error('Closing document body not found');
  const result=html.slice(0,end)+`<script data-rafex-top-plan-import>\n${runtime}\n</script>\n`+html.slice(end);
  for(const script of result.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/\bsrc\s*=|application\/json|application\/ld\+json/.test(script[1])||!script[2].trim())continue;
    new vm.Script(script[2]);
  }
  return result;
};
const root=new URL('../',import.meta.url);
const portal=new URL('portal.html',root);fs.writeFileSync(portal,inject(fs.readFileSync(portal,'utf8')));
for(const relative of ['worker/index.js','dist/server/index.js']){
  const file=new URL(relative,root);if(!fs.existsSync(file))continue;let source=fs.readFileSync(file,'utf8');const match=source.match(/const\s+HTML_BASE64\s*=\s*"([A-Za-z0-9+/=]+)"/);if(!match)throw Error('HTML_BASE64 bulunamadı: '+relative);source=source.replace(match[1],Buffer.from(inject(Buffer.from(match[1],'base64').toString('utf8'))).toString('base64'));
  for(const [name,constant] of [['pdf.min.mjs','RAFEX_PDFJS_BASE64'],['pdf.worker.min.mjs','RAFEX_PDFJS_WORKER_BASE64']]){
    const asset=fs.readFileSync(new URL('assets/pdfjs/'+name,root)).toString('base64');
    const pattern=new RegExp('const '+constant+' = "[A-Za-z0-9+/=]+";\\s*');source=source.replace(pattern,'');source='const '+constant+' = "'+asset+'";\n'+source;
    const route=`    if (path === "/pdfjs/${name}") return binary(${constant}, "text/javascript; charset=utf-8");`;
    if(!source.includes(route))source=source.replace('    if (path.startsWith("/api/"))',route+'\n    if (path.startsWith("/api/"))');
    if(!source.includes(route))throw Error('PDF route insertion failed');
  }
  fs.writeFileSync(file,source);
}

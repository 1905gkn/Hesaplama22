import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export const runtime=String.raw`
(()=>{
 // Existing change-only dimension/text controls get the same live update path.
 // Keep the input node and focus intact; no synthetic blur or form submission.
 const pending=new WeakMap();
 document.addEventListener('input',event=>{
  const input=event.target;
  if(!input?.matches?.('#m2DimensionFontSize,#m2AnnotationFontSize,.rafex-section-placement-dialog input[type="text"],.rafex-section-placement-dialog input[type="number"]'))return;
  if(input.getAttribute('oninput')||!input.getAttribute('onchange')||input.value.trim()==='')return;
  if(input.type==='number'&&!Number.isFinite(Number(input.value)))return;
  clearTimeout(pending.get(input));
  pending.set(input,setTimeout(()=>{if(input.isConnected)input.dispatchEvent(new Event('change',{bubbles:true}));},160));
 });
})();`;

export function transform(html){
 if(html.includes('data-b2b-consistency="v549"'))return html;
 html=html.replace(/(b2b-(?:viewer|accessories|report-3d|report-sections)[^"'\s?]*\.js\?v=)[\w.-]+/g,'$1549');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script data-b2b-consistency="v549">'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 for(const file of ['dist/index.html','dist/server/index.js']){
  if(!fs.existsSync(file))continue;const source=fs.readFileSync(file,'utf8');
  if(file.endsWith('.html'))fs.writeFileSync(file,transform(source));
  else {const m=source.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);if(!m)throw Error('Missing HTML_BASE64');fs.writeFileSync(file,source.replace(m[0],m[1]+m[2]+Buffer.from(transform(Buffer.from(m[3],'base64').toString('utf8'))).toString('base64')+m[2]));}
 }
}

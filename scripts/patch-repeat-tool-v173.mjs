import fs from 'node:fs';
export function repeatTool(){
 let last=null;
 const actions={m2SeismicButton:'m2OpenSeismicDialog',m2ProtectionButton:'m2OpenProtectionDialog',m2SymbolButton:'m2OpenSymbolDialog'};
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button');
  if(button&&!button.disabled&&actions[button.id])last=button.id;
 },true);
 document.addEventListener('keydown',event=>{
  if(!event.ctrlKey||event.altKey||event.shiftKey||event.metaKey||event.repeat||event.isComposing||String(event.key).toLowerCase()!=='x')return;
  if(event.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
  const svg=document.getElementById('m2LayoutSvg'),button=last&&document.getElementById(last);
  if(!svg||!svg.getClientRects().length||!button||button.disabled||typeof window[actions[last]]!=='function')return;
  event.preventDefault();event.stopImmediatePropagation();
  window[actions[last]]();
 },true);
}
export function transform(html){
 if(html.includes('data-repeat-tool="v173"'))return html;
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<script data-repeat-tool="v173">('+repeatTool.toString()+')();</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-repeat-tool-v173.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

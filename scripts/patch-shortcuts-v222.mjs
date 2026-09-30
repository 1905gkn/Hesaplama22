import fs from 'node:fs';
export function transform(html){if(html.includes('shortcuts-v222'))return html;const start=html.indexOf('<script data-rafex-shortcuts="v122">'),end=html.indexOf('</script>',start);if(start<0)throw Error('Shortcut handler missing');html=html.slice(0,start)+`<script data-rafex-shortcuts="shortcuts-v222">
(function(){
 const mappings={s:'#m2SelectRackButton',o:'#m2CustomizeRackButton',d:'button[onclick="m2RotateRack()"]',z:'#m2UndoButton',v:'button[onclick="m2DuplicateRack()"]',q:'#rafexPickBlocksV145'};
 window.addEventListener('keydown',function(event){
  const key=String(event.key||'').toLowerCase(),modified=event.ctrlKey||event.metaKey;
  if(event.isComposing||event.altKey||event.shiftKey||!(key==='o'?!modified:modified&&mappings[key]))return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
  const drawing=document.getElementById('m2LayoutSvg'),page=document.getElementById('page');
  if(!drawing?.getClientRects().length||page?.dataset.rafexWorkflowScreen==='types')return;
  if([...document.querySelectorAll('dialog[open],[id$="Modal"],[role="dialog"]')].some(el=>!el.hidden&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length))return;
  const button=document.querySelector(mappings[key]);if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat||button.disabled)return;
  if((key==='s'||key==='o'||key==='q')&&button.classList.contains('active'))return;
  button.click();
 },true);
})();</script>`+html.slice(end+9);
// Individual-selection legacy listener must not hijack editing, dialogs, or a hidden drawing.
const old="if(!common())return;\n    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='q'){";
const next="if(!common()||!document.getElementById('m2LayoutSvg')?.getClientRects().length||event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable=\"false\"]),[role=\"textbox\"]')||[...document.querySelectorAll('dialog[open],[id$=\"Modal\"],[role=\"dialog\"]')].some(el=>!el.hidden&&el.getClientRects().length))return;\n    if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&!event.isComposing&&event.key.toLowerCase()==='q'){";
if(!html.includes(old))throw Error('Individual selection handler missing');html=html.replace(old,next);return html;}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shortcuts-v222.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

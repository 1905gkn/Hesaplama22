import fs from 'node:fs';

// This lives inside the detached customize viewer's closure, not the main viewer API.
export const runtime = String.raw`
 var customizeTimerV166=null,customizeFrameV166=null,customizeSignatureV166=null,customizeOpenV166=0;
 function cancelCustomizeV166(){
  if(customizeTimerV166!==null)clearTimeout(customizeTimerV166);
  if(customizeFrameV166!==null)cancelAnimationFrame(customizeFrameV166);
  customizeTimerV166=customizeFrameV166=null;
 }
 function disposeCustomizeV166(){
  cancelCustomizeV166();customizeOpenV166++;customizeSignatureV166=null;
  try{b2bCustomizeViewer?.destroy?.()}catch(_){}
  b2bCustomizeViewer=null;b2bCustomizeRackId=null;
 }
 function updateB2BCustomizeViewer(event){
  if(event?.target&&['m2CustomizeBlockName','m2CustomizeName'].includes(event.target.id))return;
  var modal=document.getElementById('m2CustomizeModal');
  if(!modal||modal.hidden||!b2bCustomizeViewer)return;
  cancelCustomizeV166();
  customizeTimerV166=setTimeout(function(){
   customizeTimerV166=null;
   customizeFrameV166=requestAnimationFrame(function(){
    customizeFrameV166=null;
    if(modal.hidden||!modal.isConnected||!b2bCustomizeViewer)return;
    var rack=racks().find(function(item){return Number(item.id)===Number(b2bCustomizeRackId)});
    if(!rack)return;
    try{
     var options=b2bCustomizeOptions(rack),signature=JSON.stringify(options);
     if(signature===customizeSignatureV166)return;
     b2bCustomizeViewer.update(options);customizeSignatureV166=signature;
    }catch(_){}
   });
  },100);
 }
 function mountB2BCustomizeViewer(rack){
  var modal=document.getElementById('m2CustomizeModal'),canvas=document.getElementById('m2CustomizeCanvas'),create=window.RafexB2BViewer?.createDetached;
  if(!modal||modal.hidden||!canvas||typeof create!=='function')return;
  cancelCustomizeV166();
  try{b2bCustomizeViewer?.destroy?.()}catch(_){}
  b2bCustomizeViewer=null;b2bCustomizeRackId=rack.id;customizeSignatureV166=null;
  try{
   var options=b2bCustomizeOptions(rack);
   b2bCustomizeViewer=create(canvas,options);customizeSignatureV166=JSON.stringify(options);
   b2bCustomizeViewer?.setView?.('perspective');
  }catch(_){}
  if(!modal.dataset.rafexDetachedB2bV166){
   modal.dataset.rafexDetachedB2bV166='1';
   modal.addEventListener('input',updateB2BCustomizeViewer);
   modal.addEventListener('change',updateB2BCustomizeViewer);
   // Attribute-only observation; no polling or document-wide mutation observer.
   new MutationObserver(function(){if(modal.hidden)disposeCustomizeV166()}).observe(modal,{attributes:true,attributeFilter:['hidden']});
  }
 }
 window.rafexDisposeCustomizeV166=disposeCustomizeV166;
`;

export function transform(html){
 if(html.includes('var customizeTimerV166='))return html;
 const start=html.indexOf(' function updateB2BCustomizeViewer(){');
 const end=html.indexOf(' function mrConfig(d)',start);
 if(start<0||end<0)throw Error('v166 detached viewer anchor missing');
 html=html.slice(0,start)+runtime+html.slice(end);
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v166 anchor missing: '+a);html=html.replace(a,b)};
 replace('var previousOpen=window.m2OpenCustomizeModal;window.m2OpenCustomizeModal=function(rackId){var rack=racks()', 'var previousOpen=window.m2OpenCustomizeModal;window.m2OpenCustomizeModal=function(rackId){disposeCustomizeV166();var openTokenV166=customizeOpenV166;var rack=racks()');
 replace('requestAnimationFrame(function(){mountB2BCustomizeViewer(rack)})','requestAnimationFrame(function(){if(openTokenV166===customizeOpenV166)mountB2BCustomizeViewer(rack)})');
 replace('function m2CloseCustomizeModal() {','function m2CloseCustomizeModal() { window.rafexDisposeCustomizeV166?.();');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-customize-performance-v166.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

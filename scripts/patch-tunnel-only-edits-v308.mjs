import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* tunnel-only-edits-v308 */'))return html;
 const session='original:structuredClone(m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId))};';
 if(!html.includes(session))throw Error('Missing customize session');
 html=html.replace(session,'original:structuredClone(m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId)),nonTunnelEdited:false,tunnelEdited:false};');
 const start=html.indexOf('  if(session?.rackId===r.id&&Number(r.b2b?.tunnelHeight||0)'),end=html.indexOf('   for(const key',start);
 if(start<0||end<0)throw Error('Missing tunnel-only commit gate');
 html=html.slice(0,start)+`  if(session?.rackId===r.id&&!session.nonTunnelEdited&&(session.tunnelEdited||Number(r.b2b?.tunnelHeight||0)!==Number(session.original?.b2b?.tunnelHeight||0))){
`+html.slice(end);
 const anchor=' const commit=window.rafexCommitCustomTypeV184;\n window.rafexCommitCustomTypeV184=function(r,entry,previous){';
 const events=` /* tunnel-only-edits-v308 */
 function trackEditV308(event){
  if(!session||!event.isTrusted||!event.target.closest?.('#m2CustomizeModal'))return;
  const field=event.target.closest('input,select,textarea');if(!field)return;
  if(/Tunnel/.test(field.id)||field.closest('.m2-custom-tunnel'))session.tunnelEdited=true;
  else session.nonTunnelEdited=true;
 }
 document.addEventListener('input',trackEditV308,true);document.addEventListener('change',trackEditV308,true);
 document.addEventListener('click',event=>{
  if(!session||!event.isTrusted)return;
  const button=event.target.closest?.('#m2CustomizeModal button');if(!button)return;
  if(button.closest('.m2-custom-tunnel')){session.tunnelEdited=true;return;}
  if(button.closest('.m2-customize-actions')||/CloseCustomize|ApplyRackCustomization/.test(button.getAttribute('onclick')||''))return;
  session.nonTunnelEdited=true;
 },true);
`;
 const at=html.indexOf(anchor,html.indexOf(' const open=window.m2OpenCustomizeModal;let session=null;'));
 if(at<0)throw Error('Missing commit wrapper');return html.slice(0,at)+events+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-tunnel-only-edits-v308.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
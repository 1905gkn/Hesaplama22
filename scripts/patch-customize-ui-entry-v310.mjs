import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* customize-ui-entry-v310 */'))return html;
 const entries=[['m2OpenCustomizeModal(selectedId);','window.m2OpenCustomizeModal(selectedId);'],['m2OpenCustomizeModal(Number(rackNode.dataset.rack));','window.m2OpenCustomizeModal(Number(rackNode.dataset.rack));']];
 for(const [old,next] of entries){if(!html.includes(old))throw Error('Missing customize UI entry: '+old);html=html.replace(old,next);}
 const anchor=' function trackEditV308(event){';
 if(!html.includes(anchor))throw Error('Missing edit tracking');
 const capture=` /* customize-ui-entry-v310 */
 let visibleModalV310=null;
 function beginV310(){
  const rack=m2LayoutState.racks.find(r=>Number(r.id)===Number(m2CustomizeRackId));if(!rack)return;
  session={rackId:rack.id,original:structuredClone(rack),saved:structuredClone(m2SavedRackTypes),nonTunnelEdited:false,tunnelEdited:false};
 }
 function observeModalV310(){const modal=document.getElementById('m2CustomizeModal');if(modal&&!modal.hidden){if(visibleModalV310!==modal){visibleModalV310=modal;beginV310();}}else{visibleModalV310=null;session=null;}}
 new MutationObserver(records=>{if(records.some(r=>r.target.id==='m2CustomizeModal'||(r.type==='childList'&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.id==='m2CustomizeModal'||n.querySelector?.('#m2CustomizeModal'))))))observeModalV310();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
`;
 html=html.replace(anchor,capture+anchor);
 html=html.replace("if(!session||!event.isTrusted||!event.target.closest?.('#m2CustomizeModal'))return;","if(!event.isTrusted||!event.target.closest?.('#m2CustomizeModal'))return;if(!session)beginV310();if(!session)return;");
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-customize-ui-entry-v310.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}


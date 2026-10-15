import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-history-record-number="v326"'))return html;
 const replace=(from,to)=>{if(html.split(from).length!==2)throw Error('v326 anchor mismatch: '+from.slice(0,110));html=html.replace(from,to);};
 replace('showProjectSavedNotice(documentV133.payload.projectIdentity?.drawingCatalogId||result.serialNo,projectName);','showProjectSavedNotice(result.serialNo,projectName);');
 replace("(documentV133.payload.projectIdentity?.drawingCatalogId||result.serialNo)+' · '+projectName", "result.serialNo+' · '+projectName");
 replace('String(x.projectIdentity?.drawingCatalogId||p.serial_no).padStart(4, "0")','String(p.serial_no).padStart(4, "0")');
 replace("if(project?.payload?.projectIdentity){project.payload.projectIdentity.displayNumber=!asCopy?String(project.payload.projectIdentity.drawingCatalogId||project.serial_no||'Yeni'):'Yeni';}","if(project?.payload?.projectIdentity){const identity=project.payload.projectIdentity;if(asCopy)delete identity.historySerialNo;else if(project.serial_no)identity.historySerialNo=Number(project.serial_no);identity.displayNumber=!asCopy?String(project.serial_no||identity.historySerialNo||identity.drawingCatalogId||'Yeni'):'Yeni';}");
 replace('identity.displayNumber=String(identity.drawingCatalogId);','identity.displayNumber=String(identity.historySerialNo||identity.drawingCatalogId);');
 replace('sourceProjectNumber:document.payload.projectIdentity?.drawingCatalogId||null','sourceProjectNumber:document.payload.projectIdentity?.historySerialNo||document.payload.projectIdentity?.drawingCatalogId||null');
 const runtime=`<script data-history-record-number="v326">(()=>{
 // Each POST creates a separate history snapshot. The rack catalog keeps its
 // own ID; it is never the identifier of a layout save.
 window.rafexProjectSavedV156=function(result,snapshot){
  const serial=Number(result?.serialNo);if(!Number.isSafeInteger(serial)||serial<1)return;
  const saved=snapshot?.payload?.projectIdentity;
  if(saved){saved.historySerialNo=serial;saved.displayNumber=String(serial);}
  const active=window.rafexProjectIdentityV133;
  if(active&&saved&&active.uuid===saved.uuid){active.historySerialNo=serial;active.displayNumber=String(serial);window.rafexActivateProjectV134?.(active);window.rafexSyncProjectGateV134?.();}
 };
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v326 body missing');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-history-record-number-v326.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('v326 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 console.log('v326: distinct history save numbers, save notices and reopened project identity');
}


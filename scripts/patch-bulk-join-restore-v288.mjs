import fs from 'node:fs';
export function transform(html){
 if(html.includes('bulk-join-restore-v288'))return html;
 const anchor="m2ClearAllSelections();m2LayoutState.mode='idle';m2JoinMode=true;m2JoinFirstRackId=null;";
 if(!html.includes(anchor))throw Error('Missing scan-join entry');
 return html.replace(anchor,"/* bulk-join-restore-v288 */ if(window.rafexBulkJoinV230?.())return;\n  "+anchor);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-bulk-join-restore-v288.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

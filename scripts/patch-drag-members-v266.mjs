import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* drag-member-frame-v266 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Expected unique anchor: '+a.slice(0,90));html=html.replace(a,b);};
 replace('function m2ApplyLiveRackDrag(svg,drag,clientX,clientY){','function m2ApplyLiveRackDragBaseV266(svg,drag,clientX,clientY){');
 replace('      let m2MemberIndexV265=null;',`      /* drag-member-frame-v266 */
      let m2MemberIndexV265=null,m2MemberFrameV266=0,m2MemberFrameSerialV266=0;
      function m2ApplyLiveRackDrag(svg,drag,clientX,clientY){
        const previous=m2MemberFrameV266;
        m2MemberFrameV266=++m2MemberFrameSerialV266;
        try{return m2ApplyLiveRackDragBaseV266(svg,drag,clientX,clientY);}
        finally{m2MemberFrameV266=previous;}
      }`);
 replace('const valid=index&&index.rows.length===racks.length&&racks.every(', 'const sameFrame=m2MemberFrameV266&&index?.frame===m2MemberFrameV266&&index.list===racks;\n        const valid=index&&index.rows.length===racks.length&&(sameFrame||racks.every(');
 replace('old.parent===r.sharedFootWith;});','old.parent===r.sharedFootWith;}));');
 replace('        const group=index.groups.get(rack.joinGroup);','        index.frame=m2MemberFrameV266;index.list=racks;\n        const group=index.groups.get(rack.joinGroup);');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-drag-members-v266.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

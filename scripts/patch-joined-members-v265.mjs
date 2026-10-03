import fs from 'node:fs';
export const membership=`      /* joined-members-index-v265 */
      let m2MemberIndexV265=null;
      function m2JoinedRackMembers(rack) {
        if(!rack)return[];if(!rack.joinGroup)return[rack];
        const racks=m2LayoutState.racks;
        let index=m2MemberIndexV265;
        const valid=index&&index.rows.length===racks.length&&racks.every((r,i)=>{const old=index.rows[i];return old.ref===r&&old.id===r.id&&old.group===r.joinGroup&&old.parent===r.sharedFootWith;});
        if(!valid){
          const rows=racks.map(r=>({ref:r,id:r.id,group:r.joinGroup,parent:r.sharedFootWith})),groups=new Map();
          for(const r of racks){if(!r.joinGroup)continue;let group=groups.get(r.joinGroup);if(!group){group={byId:new Map(),links:new Map(),results:new Map()};groups.set(r.joinGroup,group);}group.byId.set(Number(r.id),r);group.links.set(Number(r.id),[]);}
          for(const r of racks){const group=groups.get(r.joinGroup);if(!group)continue;const parent=Number(r.sharedFootWith);if(!Number.isFinite(parent)||!group.byId.has(parent))continue;group.links.get(Number(r.id)).push(parent);group.links.get(parent).push(Number(r.id));}
          index=m2MemberIndexV265={rows,groups};
        }
        const group=index.groups.get(rack.joinGroup);if(!group||!group.byId.has(Number(rack.id)))return[rack];
        const root=Number(rack.id);let connected=group.results.get(root);
        if(!connected){connected=[];const pending=[root],visited=new Set();while(pending.length){const id=pending.pop();if(visited.has(id)||!group.byId.has(id))continue;visited.add(id);connected.push(group.byId.get(id));(group.links.get(id)||[]).forEach(next=>pending.push(next));}group.results.set(root,connected);}
        return connected.length?connected.slice():[rack];
      }
`;
export function transform(html){if(html.includes('/* joined-members-index-v265 */'))return html;const start=html.indexOf('      function m2JoinedRackMembers(rack) {'),end=html.indexOf('      function m2CombinedRackBounds(rack)',start);if(start<0||end<0)throw Error('Membership anchor missing');return html.slice(0,start)+membership+html.slice(end);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-joined-members-v265.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

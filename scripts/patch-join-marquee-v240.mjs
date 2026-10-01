import fs from 'node:fs';
export function insideLayoutPointer(event){return !!event.target?.closest?.('#m2LayoutSvg')||(event.composedPath?.()||[]).some(node=>node?.id==='m2LayoutSvg');}
export function transform(html){
 if(html.includes('data-join-marquee="v240"'))return html;
 const old='if(hasSelection&&!(m2JoinMode&&target?.closest?.("#m2LayoutSvg")))m2ClearAllSelections(';
 if(!html.includes(old))throw Error('Join deselection guard missing');
 html=html.replace(old,'if(hasSelection&&!((m2JoinMode||m2MultiSelect.active)&&rafexInsideLayoutPointerV240(event)))m2ClearAllSelections(');
 const choose="m2JoinFirstRackId=id;m2LayoutState.selected=id;m2ClearMultiSelection();m2MultiSelect.active=true;";
 if(!html.includes(choose))throw Error('Join target transition missing');
 html=html.replace(choose,choose+"document.getElementById('m2SelectRackButton')?.classList.add('active');");
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script data-join-marquee="v240">const rafexInsideLayoutPointerV240='+insideLayoutPointer.toString()+';</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-join-marquee-v240.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

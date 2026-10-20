import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* no-mr-foot-protection-v339 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('v339 missing/ambiguous anchor '+a.slice(0,100));html=html.replace(a,b);};
 rep('const byRack=new Map(),parents=new Map(),feet=[];\n for(const rack of racks){','const byRack=new Map(),parents=new Map(),feet=[];\n for(const rack of racks){\n  /* no-mr-foot-protection-v339 */ if(rafexIsMrV335(rack))continue;');
 rep('/* protection-first-start-v338 */ m2ClearAllSelections("",false);m2ProtectionDraft=',`/* protection-first-start-v338 */ m2ClearAllSelections("",false);
        if(m2LayoutState.racks.some(rafexIsMrV335)&&!m2LayoutState.racks.some(r=>r.b2bLayout&&!rafexIsMrV335(r))){m2CloseProtectionDialog();$("m2FloorStatus").textContent="MR sisteminde UAKS ve UAKZ ayak koruma kullanılmaz.";return;}
        m2ProtectionDraft=`);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-no-mr-foot-protection-v339.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v339 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v339: exclude MR uprights from UAKS/UAKZ protection placement');
}


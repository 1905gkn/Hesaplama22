import fs from 'node:fs';
export function transform(html){if(html.includes('/* shared-stations-v255 */'))return html;
const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch '+a.slice(0,90));html=html.replace(a,b);};
rep('  function renderSharedFeet(state,svg){','  function renderSharedFeet(state,svg){\n    svg.querySelectorAll(\':scope > .rafex-shared-foot-layer-v60\').forEach(n=>n.remove());svg.__sharedFeetV146=null;return;');
rep('html += `<rect x="${ux}" y="${uy}" width="${uprightW}" height="${uprightH}" rx="0" class="m2-b2b-plan-upright"/>`;','{ const sharedPaint=window.rafexSharedFramesV255?.paint(rack,row,side,ux,uprightW)||{x:ux,width:uprightW};html += `<rect x="${sharedPaint.x}" y="${uy}" width="${sharedPaint.width}" height="${uprightH}" rx="0" class="m2-b2b-plan-upright"/>`; }');
rep('group.push([r.id,r.x,r.y,r.w,r.h,r.angle]);','group.push([r.id,r.x,r.y,r.w,r.h,r.angle,r.footProfile,r.footProfileKey,r.sideUprightHeight,r.b2b?.footHeight]);');
rep('add(\'Ayak takımı\',footTeams,footSpec);',"for(const station of (stationMapV255.get(Number(rack.id))||[]).filter(s=>!s.omit)){const p=station.product;add('Ayak takımı',1,p.profile+' · Yükseklik '+textNumber(p.height)+' mm · Derinlik '+textNumber(p.depth)+' mm');}");
rep('||profile(r)!==profile(seed)||m2B2BFootWidth(r)!==m2B2BFootWidth(seed)','');
rep('||profile(r)!==profile(target)||m2B2BFootWidth(r)!==m2B2BFootWidth(target)','');
rep('const step=(previous.w+rack.w)/2-foot*scale;','const step=(previous.w+rack.w)/2-(m2B2BFootWidth(previous)+m2B2BFootWidth(rack))/2*scale;');
rep('step=(prev.w+r.w)/2-foot;','step=(prev.w+r.w)/2-(m2B2BFootWidth(prev)+m2B2BFootWidth(r))/2*m2LayoutState.scale;');
rep('aynı raf derinliğindeki ve aynı ayak profiline sahip rafları seç.','aynı raf derinliğindeki rafları seç.');
rep('Birleşim için yön, çerçeve derinliği ve ayak profili aynı olmalı.','Birleşim için yön ve çerçeve derinliği aynı olmalı.');
rep('<text x="${cx}" y="${cy+8}" text-anchor="middle" class="m2-b2b-joined-mark">TÜNEL</text>','<text x="${cx}" y="${cy+6}" text-anchor="middle" class="m2-b2b-joined-mark rafex-tunnel-label-v255" transform="rotate(${rack.angle} ${cx} ${cy})">TÜNEL</text>');
rep('rx="0" class="m2-b2b-plan-frame"','rx="0" class="m2-b2b-plan-frame" style="stroke:none!important"');
rep('  function rows(targetSystem){\n    var map=new Map();','  function rows(targetSystem){\n    var stationMapV255=window.rafexSharedFramesV255.stations(m2LayoutState.racks);\n    var map=new Map();');
const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<style data-stations-v255>.m2-b2b-plan-frame{stroke:none!important}.rafex-tunnel-label-v255{font-size:3px!important;stroke-width:.5px!important}</style><script>'+fs.readFileSync(new URL('./shared-stations-v255.js',import.meta.url),'utf8')+'</script>'+html.slice(at);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shared-stations-v255.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

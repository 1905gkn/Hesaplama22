import fs from 'node:fs';
export function rackLabelSize554(width,height,ratio=1){
 const side=Math.max(.01,Math.min(Number(width)||1,Number(height)||1));
 return Math.min(12,side*.48)*Math.max(.1,Math.min(2,Number(ratio)||1));
}
export function transform(html){
 if(html.includes('/* rack-label-v171 */'))return html;
 const start=html.indexOf('  function decorateGroup(group){'),end=html.indexOf('  function decorate(){var node=svg();',start);
 if(start<0||end<0)throw Error('Rack label decorator missing');
 html=html.slice(0,start)+`  ${rackLabelSize554.toString()}
  window.rafexRackLabelSizeV554=rackLabelSize554;
  function decorateGroup(group){
    const rack=m2LayoutState?.racks?.find(r=>String(r.id)===group.getAttribute('data-rack'));if(!rack)return;
    group.querySelectorAll('.rafex-single-line-letter-v58').forEach(n=>n.remove());
    const system=String(rack.rafexSystem||rack.__rafexSystem||rack.systemType||'').toLowerCase();
    const names={b2b:'B2B',mr:'MR',mekik:'Mekik',mekik2:'Mekik',fifo:'Mekik',filo:'Mekik',drive:'Drive-In','drive-in':'Drive-In',drivein:'Drive-In',konsol:'Konsol Kollu'};
    const name=String(rack.rafexGlobalTypeLetter||rack.typeName||'').trim();
    const systemName=names[system]||(rack.b2b?.mr?'MR':rack.b2b?'B2B':rack.konsol?'Konsol Kollu':'Mekik');
    const label=['Drive-In','Mekik'].includes(systemName)?systemName:'';
    const matrix=group.getScreenCTM(),scale=Math.hypot(matrix?.a||1,matrix?.b||0)||1;
    /* rack-label-v171 */
    const ratio=Math.max(.1,Math.min(2,Number(window.rafexCommonTypeLetterScaleV65?.())||1));
    const tunnel=Number(rack.b2b?.tunnelHeight)>0;
    // Use the rendered local frame: drag optimization translates the whole group.
    // Model coordinates may already include that translation and would apply it twice.
    const frame=group.querySelector(':scope > .m2-layout-rack');
    const coord=(key,fallback)=>{const value=frame?.getAttribute(key);return value!=null&&Number.isFinite(Number(value))?Number(value):Number(fallback)};
    const rowHeight564=rack.b2b&&!rack.b2b.mr&&Number(rack.b2bLayout?.rowCount)>1?coord('height',rack.h)*(Number(rack.b2bLayout.palletDepth)>0&&Number(rack.depthMm)>0?Math.min(1,Number(rack.b2bLayout.palletDepth)/Number(rack.depthMm)):1/Number(rack.b2bLayout.rowCount)):coord('height',rack.h);
    const size=rackLabelSize554(coord('width',rack.w),rowHeight564,ratio)*(rack.b2b&&!rack.b2b.mr?1.75:1);
    const x=coord('x',rack.x)+coord('width',rack.w)/2,y=coord('y',rack.y)+coord('height',rack.h)/2-(tunnel?size*2/3:0);
    const small=size*5/6,gap=size;
    const color=m2TypeColor(name);
    const signature=[name,label,color,x,y,size,ratio,tunnel].join('|');
    let mark=group.querySelector('.rafex-rack-label-v160');
    if(mark?.getAttribute('data-signature')===signature)return;
    if(!mark){mark=document.createElementNS(NS,'g');mark.setAttribute('class','rafex-rack-label-v160');mark.setAttribute('pointer-events','none');group.appendChild(mark);}
    mark.setAttribute('data-signature',signature);mark.setAttribute('aria-label',[name,label].filter(Boolean).join(' '));mark.replaceChildren();
    for(const [text,baseline,font,weight] of [[name,y,size,'700'],[label,y+gap,small,'400']]){
      if(!text)continue;
      const node=document.createElementNS(NS,'text');node.textContent=text;
      for(const [key,value] of Object.entries({x,y:baseline,'text-anchor':'middle','dominant-baseline':'central','font-family':'Arial, sans-serif','font-size':font,'font-weight':weight,fill:color,'paint-order':'stroke fill',stroke:'#fff','stroke-width':1.5*ratio/scale,'stroke-linejoin':'round'}))node.setAttribute(key,String(value));
      mark.appendChild(node);
    }
  }
`+html.slice(end);
 html=html.replace('  function schedule(){clearTimeout(pending);', '  window.addEventListener("resize",()=>requestAnimationFrame(decorate));\n  function schedule(){clearTimeout(pending);');
 const css='<style data-rack-label="v164">#m2LayoutSvg [data-rack] .m2-rack-nameplate,#m2LayoutSvg [data-rack] .m2-rack-pallet-count,#m2LayoutSvg [data-rack] .m2-rack-name,#m2LayoutSvg [data-rack] .m2-b2b-plan-label,#m2LayoutSvg [data-rack] .rafex-single-line-letter-v58{display:none!important}.rafex-rack-label-v160{opacity:1!important;pointer-events:none}</style>';
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+css+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-rack-label-v160.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}



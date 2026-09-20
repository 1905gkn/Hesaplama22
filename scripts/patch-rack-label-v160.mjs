import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-rack-label="v160"'))return html;
 const start=html.indexOf('  function decorateGroup(group){'),end=html.indexOf('  function decorate(){var node=svg();',start);
 if(start<0||end<0)throw Error('Rack label decorator missing');
 html=html.slice(0,start)+`  function decorateGroup(group){
    const rack=m2LayoutState?.racks?.find(r=>String(r.id)===group.getAttribute('data-rack'));if(!rack)return;
    group.querySelectorAll('.rafex-single-line-letter-v58').forEach(n=>n.remove());
    const system=String(rack.rafexSystem||rack.__rafexSystem||rack.systemType||'').toLowerCase();
    const names={b2b:'B2B',mr:'MR',mekik:'Mekik',mekik2:'Mekik',fifo:'Mekik',filo:'Mekik',drive:'Drive-In','drive-in':'Drive-In',drivein:'Drive-In',konsol:'Konsol Kollu'};
    const name=String(rack.rafexGlobalTypeLetter||rack.typeName||'').trim();
    const label=names[system]||(rack.b2b?.mr?'MR':rack.b2b?'B2B':rack.konsol?'Konsol Kollu':'Mekik');
    const matrix=group.getScreenCTM(),scale=Math.hypot(matrix?.a||1,matrix?.b||0)||1;
    const x=rack.x+rack.w/2,y=rack.y+rack.h/2;
    const size=12/scale,small=10/scale,gap=12/scale;
    const signature=[name,label,x,y,scale].join('|');
    let mark=group.querySelector('.rafex-rack-label-v160');
    if(mark?.getAttribute('data-signature')===signature)return;
    if(!mark){mark=document.createElementNS(NS,'g');mark.setAttribute('class','rafex-rack-label-v160');mark.setAttribute('pointer-events','none');group.appendChild(mark);}
    mark.setAttribute('data-signature',signature);mark.setAttribute('aria-label',name+' '+label);mark.replaceChildren();
    for(const [text,baseline,font,weight] of [[name,y-2/scale,size,'700'],[label,y+gap-2/scale,small,'400']]){
      const node=document.createElementNS(NS,'text');node.textContent=text;
      for(const [key,value] of Object.entries({x,y:baseline,'text-anchor':'middle','font-family':'Arial, sans-serif','font-size':font,'font-weight':weight,fill:'#173c2d','paint-order':'stroke fill',stroke:'#fff','stroke-width':1.5/scale,'stroke-linejoin':'round'}))node.setAttribute(key,String(value));
      mark.appendChild(node);
    }
  }
`+html.slice(end);
 html=html.replace('  function schedule(){clearTimeout(pending);', '  window.addEventListener("resize",()=>requestAnimationFrame(decorate));\n  function schedule(){clearTimeout(pending);');
 const css='<style data-rack-label="v160">#m2LayoutSvg [data-rack] .m2-rack-nameplate,#m2LayoutSvg [data-rack] .m2-rack-pallet-count,#m2LayoutSvg [data-rack] .m2-rack-name,#m2LayoutSvg [data-rack] .m2-b2b-plan-label,#m2LayoutSvg [data-rack] .rafex-single-line-letter-v58{display:none!important}.rafex-rack-label-v160{opacity:1!important;pointer-events:none}</style>';
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+css+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-rack-label-v160.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}


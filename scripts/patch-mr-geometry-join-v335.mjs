import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* mr-geometry-join-v335 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('v335 ambiguous/missing anchor: '+a.slice(0,100));html=html.replace(a,b);};
 rep('function m2B2BFootWidth(item) {',`function rafexIsMrV335(item){return !!(item?.b2b?.mr||item?.plan?.mr||item?.systemType==='mr');}
      function rafexMrDetailV335(item){return window.rafexReadRackDetailV135?.(item,'mr')||null;}
      function rafexMrFootV335(item){
        const detail=rafexMrDetailV335(item),saved=item?.typeName?m2SavedRackTypes.find(t=>t.name===item.typeName&&rafexIsMrV335(t.drawing))?.drawing:null;
        return [detail?.uprightWidth,item?.b2b?.uprightWidth,item?.footType,rafexMrDetailV335(saved)?.uprightWidth,saved?.b2b?.uprightWidth].map(Number).find(v=>Number.isFinite(v)&&v>0)||60;
      }
      function rafexMrWidthV335(item){
        const detail=rafexMrDetailV335(item),modules=Math.max(1,Math.round(Number(detail?.modules||item?.b2b?.modules||item?.bays)||1));
        const clear=Number(detail?.width||item?.b2b?.width||item?.b2bLayout?.palletWidth||item?.palW);
        const section=clear>0?modules*clear:Number(item?.b2bLayout?.sectionWidth)||0;
        return section>0?section+(modules+1)*rafexMrFootV335(item):Number(item?.widthMm)||item.w/m2LayoutState.scale;
      }
      function m2B2BFootWidth(item) {
        /* mr-geometry-join-v335 */ if(rafexIsMrV335(item))return rafexMrFootV335(item);`);
 rep('(Number(member.widthMm)||member.w/m2LayoutState.scale)*m2LayoutState.scale/2','(rafexIsMrV335(member)?rafexMrWidthV335(member):(Number(member.widthMm)||member.w/m2LayoutState.scale))*m2LayoutState.scale/2');
 rep('members.length && members.every((member)=>member.b2bLayout)','members.length && members.every((member)=>member.b2bLayout&&!rafexIsMrV335(member))');
 rep("function footOf(rack){return Math.max(1,Math.round(Number(rack?.b2b?.uprightWidth)||60));}","function footOf(rack){return m2B2BFootWidth(rack);}");
 rep("document.addEventListener('pointerdown',function(event){\n    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;", "document.addEventListener('pointerdown',function(event){\n    if(m2JoinMode){lastMrPointerTap={id:null,at:0};return;}\n    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;");
 rep("document.addEventListener('dblclick',function(event){if(typeof m2LayoutTool!=='undefined'&&m2LayoutTool==='measure')return;var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack))return;", "document.addEventListener('dblclick',function(event){if(m2JoinMode)return;if(typeof m2LayoutTool!=='undefined'&&m2LayoutTool==='measure')return;var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack))return;");
 rep("footMm=r.b2b?.mr?Number(r.b2b.uprightWidth)||60:m2B2BFootWidth(r)","footMm=m2B2BFootWidth(r)");
 rep("if(!rack?.b2bLayout||rack.b2b?.mr){status('Birleştirmek için bir B2B modülü seç.');return;}","if(!rack?.b2bLayout){status('Birleştirmek için bir B2B veya MR modülü seç.');return;}");
 rep("if(moving.some(r=>!r.b2bLayout||r.b2b?.mr||Math.abs(angle(r)-angle(target))>.1||!profile(r)||Math.abs(Number(r.b2bLayout.frameDepth)-Number(target.b2bLayout.frameDepth))>1)){",`const targetMr=rafexIsMrV335(target);
  const mrCompatible=r=>{
   const a=rafexMrDetailV335(target)||target.b2b||{},b=rafexMrDetailV335(r)||r.b2b||{};
   const rows=x=>Number(x.b2bLayout?.rowCount)||1;
   return Math.abs(m2B2BFootWidth(r)-m2B2BFootWidth(target))<.01&&String(a.uprightType||'MR60')===String(b.uprightType||'MR60')&&Math.abs(Number(a.uprightThickness||1.5)-Number(b.uprightThickness||1.5))<.01&&rows(r)===rows(target)&&(rows(r)===1||Math.abs(Number(r.b2bLayout.rowGap||0)-Number(target.b2bLayout.rowGap||0))<.01);
  };
  if(moving.some(r=>!r.b2bLayout||rafexIsMrV335(r)!==targetMr||Math.abs(angle(r)-angle(target))>.1||(targetMr?!mrCompatible(r):!profile(r))||Math.abs(Number(r.b2bLayout.frameDepth)-Number(target.b2bLayout.frameDepth))>1)){`);
 rep("fail('Birleşim için yön ve çerçeve derinliği aynı olmalı. Tekli ve çiftli sıralar birlikte seçilebilir.');return;","fail(targetMr?'MR birleşiminde sistem, yön, ayak profili, derinlik ve sıra düzeni aynı olmalı.':'Birleşim için sistem, yön ve çerçeve derinliği aynı olmalı. Tekli ve çiftli sıralar birlikte seçilebilir.');return;");
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mr-geometry-join-v335.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v335 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v335: MR detail dimensions, physical upright join and independent separation');
}


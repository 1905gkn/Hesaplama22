import vm from 'node:vm';

export const helpers=String.raw`
      function m2B2BRecordV108(drawing){
        const d=JSON.parse(JSON.stringify(drawing)),b=d.b2b;
        if(!b||b.mr)return d;
        d.rafexSystem='b2b';d.systemType='b2b';
        delete d.konsol;delete d.spec;delete d.__rafexSystem;
        d.levels=Number(b.levels)||d.levels;
        d.palletHeight=Number(b.palletHeight)||d.palletHeight;
        d.palletWeight=Number(b.palletWeight)||d.palletWeight;
        if(Number(b.footHeight)>0)d.sideUprightHeight=Number(b.footHeight);
        return b2bLayoutDrawing(d);
      }
      function m2B2BInfoOptionsV108(drawing){
        const d=m2B2BRecordV108(drawing),b=d.b2b||{},l=d.b2bLayout||{};
        const options=m2Rack3DOptions(d);
        return {...options,...(d.b2bViewerOptions||{}),moduleCount:1,moduleOptions:null,
          levels:d.levels,palletHeight:d.palletHeight,palletCount:l.palletCount,
          palletWidth:l.palletWidth,palletDepth:l.palletDepth,rowType:b.rowType||'single',rowGap:b.rowGap??200,
          footHeight:d.sideUprightHeight,firstPalletPosition:b.firstPalletPosition||'ground',
          firstFloorGap:b.firstFloorGap??200,palletTraverseGap:b.palletTraverseGap??200,
          footColor:b.footColor||'ral5010',traverseColor:b.traverseColor||'ral1007',
          showPallets:b.showPallets!==false,dimensions:{levels:true,markers:true,eye:true,width:true,depth:true}};
      }
`;

export function transform(html){
  if(html.includes('function m2B2BRecordV108('))return html;
  function replace(a,b){if(!html.includes(a))throw Error('B2B v108 missing anchor: '+a.slice(0,90));html=html.replace(a,b);}
  replace('      async function m2SaveRackType() {',helpers+'\n      async function m2SaveRackType() {');
  replace('const isB2B = m2ActiveModule === "b2b";',`const selectedSystemV108=document.querySelector('#rafexUnifiedSystemPicker input:checked')?.value;
        const isB2B = selectedSystemV108?selectedSystemV108==='b2b':m2ActiveModule === "b2b";`);
  replace('const drawing = isB2B ? { ...m2LastDrawing,','const drawing = isB2B ? m2B2BRecordV108({ ...m2LastDrawing, b2bViewerOptions:JSON.parse(JSON.stringify(b2b3DOptions())),');
  replace('braces:[...(m2LastDrawing.plan?.braces||[])] } } : m2LastDrawing;','braces:[...(m2LastDrawing.plan?.braces||[])] } }) : m2LastDrawing;');
  replace('const entry = await req(m2TypeApi(), { method: "POST", body: JSON.stringify({ drawing }) });','const entry = await req(isB2B?"/api/b2b-types":m2TypeApi(), { method: "POST", body: JSON.stringify({ drawing }) });');
  replace('await m2RefreshSavedRackTypes(); m2SelectedSavedType = m2SavedRackTypes.findIndex((item) => Number(item.id) === Number(entry.id));',`await m2RefreshSavedRackTypes(); m2SelectedSavedType = m2SavedRackTypes.findIndex((item) => Number(item.id) === Number(entry.id)&&(!isB2B||item.__rafexSystem==='b2b'||(!item.__rafexSystem&&item.drawing?.b2b&&!item.drawing.b2b.mr)));`);
  replace("  function syncKonsolDrawing(){\n    if(free.selected!=='konsol')return;","  function syncKonsolDrawing(){\n    const selected=document.querySelector('#rafexUnifiedSystemPicker input:checked')?.value;\n    if(selected?selected!=='konsol':free.selected!=='konsol')return;");
  // Apply the same canonical fields when an existing B2B record enters the floor.
  replace('if (m2ActiveModule === "b2b" && source?.b2b) source = b2bLayoutDrawing(source);','if (m2ActiveModule === "b2b" && source?.b2b) source = source.b2b.mr?b2bLayoutDrawing(source):m2B2BRecordV108(source);');
  const start=html.indexOf('  const b2bOptions=(d)=>'),end=html.indexOf('\n  const mrConfig=',start);
  if(start<0||end<0)throw Error('B2B v108 info options missing');
  html=html.slice(0,start)+'  const b2bOptions=(d)=>m2B2BInfoOptionsV108(d);'+html.slice(end);
  replace("const metaHtml=(entry,sys)=>{const d=entry.drawing||{};","const metaHtml=(entry,sys)=>{const d=sys==='b2b'?m2B2BRecordV108(entry.drawing):entry.drawing||{};");
  const catalogDrawingAnchor=html.includes("      const drawing=entry.__rafexSnapshot||entry.drawing||{};\n      const system=entry.__rafexSystem||'mekik2';")
    ? "      const drawing=entry.__rafexSnapshot||entry.drawing||{};\n      const system=entry.__rafexSystem||'mekik2';"
    : "      const drawing=entry.drawing||{};\n      const system=entry.__rafexSystem||'mekik2';";
  replace(catalogDrawingAnchor,"      const system=entry.__rafexSystem||'mekik2';\n      const rawDrawing=entry.__rafexSnapshot||entry.drawing||{};\n      const drawing=system==='b2b'&&rawDrawing?.b2b?m2B2BRecordV108(rawDrawing):rawDrawing;");
  replace("      const create=window.RafexB2BViewer?.createDetached;if(typeof create!=='function')", "      if(!window.RafexB2BViewer?.createDetached)await window.rafexLoadViewerOnDemandV3?.('b2b');\n      if(token!==activeInfoToken)return;\n      const create=window.RafexB2BViewer?.createDetached;if(typeof create!=='function')");
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].includes('m2B2BRecordV108'))new vm.Script(m[1]);
  return html;
}

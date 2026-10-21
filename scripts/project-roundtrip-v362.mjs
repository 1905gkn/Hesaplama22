import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./project-roundtrip-v362.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-project-roundtrip="v362"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v362 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 // The save payload must include all document fields (CAD, measurement mode,
 // geometry flags, etc.), not only the old hand-picked list.
 replace('const layout = { pdfImport: m2LayoutState.pdfImport || null,','const layout = { ...m2UndoSnapshot().layout, areaWidth:$("m2AreaW")?.value, areaDepth:$("m2AreaH")?.value, areaZoom:m2LayoutZoom, editorViewportV258:window.rafexCommonLayoutZoomCrispV126?.getView(), pdfImport: m2LayoutState.pdfImport || null,');
 replace('const restoredScale = Number(restoredLayout.scale) || m2LayoutState.scale;','const restoredScale = Number(restoredLayout.scale) || .013;');
 replace('restoredLayout.pdfImport = payload.layout.pdfImport || null;','restoredLayout.pdfImport = restoredLayout.pdfImport || null;');
 replace('m2LayoutState = { ...m2LayoutState, ...restoredLayout, pathBreaks:','m2LayoutState = { points:[],cadElements:[],racks:[],closed:false,openFinished:false,scale:restoredScale,walllessWorkspaceV205:true,showAreaDimensions:false,edgeDimensions:[],rackGapBasis:"pallet", ...restoredLayout, pathBreaks:');
 replace('m2ClearMultiSelection();if(!(commonV186&&payload.areas?.length&&window.rafexAreaOutputIsCurrent))','m2ClearMultiSelection();m2LayoutZoom=Number(restoredLayout.areaZoom)||1;for(const [id,value] of [["m2AreaW",restoredLayout.areaWidth],["m2AreaH",restoredLayout.areaDepth]])if(value!=null&&$(id))$(id).value=value;if(restoredLayout.editorViewportV258)window.rafexCommonLayoutZoomCrispV126?.setView(restoredLayout.editorViewportV258);if(!(commonV186&&payload.areas?.length&&window.rafexAreaOutputIsCurrent))');
 // No previous project's CAD geometry survives a legacy record with no CAD.
 // Each object's saved position remains authoritative on load and on render.
 const marker='<script data-rafex-cad-import="v56">';
 replace(marker,'<script data-project-roundtrip="v362">'+runtime+'</script>'+marker);
 replace('elements.forEach(function(element){if(!Array.isArray(element.points)','window.rafexCadGeometryV362.layer(elements,m2LayoutSymbols).forEach(function(element){if(!Array.isArray(element.points)');
 replace('}[symbol.type];let shape="";','}[symbol.type];const cadShapeV362=window.rafexCadGeometryV362.shape(symbol,selected);let shape="";');
 replace('if(symbol.type==="column")shape=window.rafexColumnV204.shape(symbol,selected);','if(cadShapeV362)shape=cadShapeV362;else if(symbol.type==="column")shape=window.rafexColumnV204.shape(symbol,selected);');
 // CAD IDs contain text; Number(id) turned every imported column into NaN,
 // sharing one cached bound and breaking selection/drag/undo after reopening.
 replace('m2LayoutSymbols.find((item)=>Number(item.id)===Number(origin.id))','m2LayoutSymbols.find((item)=>String(item.id)===String(origin.id))',2);
 replace('m2LayoutSymbols.find((item)=>Number(item.id)===Number(saved.id))','m2LayoutSymbols.find((item)=>String(item.id)===String(saved.id))');
 replace('item.id===Number(symbolNode.dataset.layoutSymbol)','String(item.id)===String(symbolNode.dataset.layoutSymbol)',2);
 replace('Number(symbol.id)','String(symbol.id)',6);
 replace('m2PerfSymbolDomTable.get(Number(s.id))','m2PerfSymbolDomTable.get(String(s.id))',2);
 replace('bounds.set(Number(s.id),m2SymbolBounds(s))','bounds.set(String(s.id),m2SymbolBounds(s))',2);
 replace('const id=Number(node.dataset.layoutSymbol);if(Number.isFinite(id))m2PerfSymbolDomTable.set(id,','const id=String(node.dataset.layoutSymbol);if(id)m2PerfSymbolDomTable.set(id,');
 replace('const symbolsV135=new Map(m2LayoutSymbols.map(symbol=>[symbol.id,symbol]));','const symbolsV135=new Map(m2LayoutSymbols.map(symbol=>[String(symbol.id),symbol]));');
 replace('symbolsV135.get(Number(node.dataset.layoutSymbol))','symbolsV135.get(String(node.dataset.layoutSymbol))');
 replace('m2PromptSymbolDistance(${symbol.id},','m2PromptSymbolDistance(${JSON.stringify(symbol.id).replace(/"/g,\'&quot;\')},');
 replace('window.RafexRuntimeAuthority={version:\'v2\',sync:commit,getState:','window.RafexRuntimeAuthority={version:\'v2\',sync:commit,setProjectName:function(value){projectName=String(value??\'\');projectKnown=true;window.__rafexCommonProjectName=projectName;if(projectNode){for(var input of projectNode.querySelectorAll("input"))input.value=projectName;}commit();},getState:');
 replace('const name=document.getElementById(\'rafexAuthorityProjectName\');\n    if(name){name.value=project.project_name+(asCopy?\' - Kopya\':\'\');name.dispatchEvent(new Event(\'input\',{bubbles:true}));}','window.RafexRuntimeAuthority?.setProjectName?.(project.project_name+(asCopy?\' - Kopya\':\'\'));\n    const name=document.getElementById(\'rafexAuthorityProjectName\');\n    if(name){name.value=project.project_name+(asCopy?\' - Kopya\':\'\');name.dispatchEvent(new Event(\'input\',{bubbles:true}));}');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v362 body');
 return html.slice(0,end)+'<style data-project-roundtrip="v362">.m2-symbol-cad-obstacle{fill:#67717b;fill-opacity:.3;stroke:#59636c}</style>'+html.slice(end);
}


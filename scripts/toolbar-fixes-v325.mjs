import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('../client/toolbar-rules-v325.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('/* toolbar-rules-v325 */'))return html;
 function rep(a,b){if(!html.includes(a))throw Error('Toolbar anchor missing: '+a.slice(0,90));html=html.replace(a,b);}
 rep('button,input,select,textarea,label,dialog,.modal,.m2-wall-editor,.m2-saved-types','button,input,select,textarea,label,summary,.rafex-plan-toolbar-v150,.rafex-menu-v216,dialog,.modal,.m2-wall-editor,.m2-saved-types');
 rep('if (!m2LayoutState.closed) { $("m2FloorStatus").textContent = "Önce alan çizimini tamamla."; return; }\n        const edgeCount = m2LayoutState.points.length, allVisible = edgeCount > 0 && Array.from({ length: edgeCount }, (_, index) => m2LayoutState.edgeDimensions[index] !== false).every(Boolean);\n        m2LayoutState.showAreaDimensions = !allVisible; m2LayoutState.edgeDimensions = Array(edgeCount).fill(!allVisible); m2RenderLayout();',`const indices=window.rafexEdgeIndicesV325(m2LayoutState);
        if(!indices.length){$("m2FloorStatus").textContent="Ölçü göstermek için önce bir kenar çiz.";return;}
        const allVisible=indices.every(i=>m2LayoutState.edgeDimensions[i]===true);
        m2LayoutState.showAreaDimensions=!allVisible;indices.forEach(i=>m2LayoutState.edgeDimensions[i]=!allVisible);m2RenderLayout();`);
 rep('const edgeCount = m2LayoutState.closed ? m2LayoutState.points.length : 0, allVisible = edgeCount > 0 && Array.from({ length: edgeCount }, (_, index) => m2LayoutState.edgeDimensions[index] !== false).every(Boolean);','const edgeIndices=window.rafexEdgeIndicesV325(m2LayoutState),allVisible=edgeIndices.length>0&&edgeIndices.every(i=>m2LayoutState.edgeDimensions[i]===true);');
 const start=html.indexOf('<script data-rafex-between-measure-source="v2">'),end=html.indexOf('</script>',start);
 if(start<0||end<0)throw Error('Between-measure module missing');
 let script=html.slice(start,end);
 if(!script.includes('bind();overlay();'))throw Error('Between bind missing');
 script=script.replace('bind();overlay();','window.rafexObserveUIV321(bind);bind();overlay();');
 html=html.slice(0,start)+script+html.slice(end);
 rep("meta.textContent=entry.__rafexSystemLabel||entry.__rafexSystem||entry.system||'';","meta.textContent=window.rafexToolbarMetaV325(entry);");
 const anchor='<script data-tool-menus="v216">';rep(anchor,'<script>'+runtime+'</script>'+anchor);
 return html;
}


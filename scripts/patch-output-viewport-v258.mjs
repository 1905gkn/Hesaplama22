import fs from 'node:fs';
export function transform(html){if(html.includes('/* output-viewport-v258 */'))return html;const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch '+a.slice(0,100));html=html.replace(a,b);};
rep('areaZoom:m2LayoutZoom};','areaZoom:m2LayoutZoom,editorViewportV258:window.rafexCommonLayoutZoomCrispV126?.getView()};');
rep('getView:function(){return Object.assign({},view)}','setView:function(next){if(!next||![next.x,next.y,next.w,next.h].every(Number.isFinite)||next.w<=0||next.h<=0)return;syncBounds();view={...next};apply();},getView:function(){return Object.assign({},view)}');
rep('if(paint){m2RenderLayout();m2UpdateUndoButton();}','if(paint){if(v.editorViewportV258)window.rafexCommonLayoutZoomCrispV126?.setView(v.editorViewportV258);m2RenderLayout();m2UpdateUndoButton();}');
rep('restore(area.layout);await render({sections:false});','restore(area.layout);await render({sections:areas.length===1});');
rep("if(section.matches('.rafex-v19-type-page')||section.querySelector('.rafex-v19-type-card,.m2-corporate-type-grid'))continue;","if(section.matches('.rafex-v19-type-page')||section.querySelector('.rafex-v19-type-card,.m2-corporate-type-grid')){if(areas.length===1)sharedSections.push(section);continue;}");
rep('      if(plans.length){','      if(plans.length&&areas.length===1){fragments.push(...(cover?[cover]:[]),...plans,...sharedSections,...details);}\n      else if(plans.length){');
rep('if(source?.id==="m2LayoutSvg"&&window.rafexViewportV248&&!window.rafexViewportV248.exporting)','if(source?.id==="m2LayoutSvg"&&!document.querySelector(\'#nav button.active[data-page="free"]\')&&window.rafexViewportV248&&!window.rafexViewportV248.exporting)');
rep('creating=true;depth++;window.__rafexManualOutputBuild=true;','creating=true;depth++;window.__rafexManualOutputBuild=true;window.rafexPlanCacheV258=new WeakMap();');
rep('depth--;creating=false;window.__rafexManualOutputBuild=false;','depth--;creating=false;window.__rafexManualOutputBuild=false;window.rafexPlanCacheV258=null;');
const at=html.lastIndexOf('</body>');return html.slice(0,at)+`<script>/* output-viewport-v258 */
(()=>{const clone=rafexPdfLayoutCloneV140;rafexPdfLayoutCloneV140=function(source,margin){const cache=window.rafexPlanCacheV258,state=m2LayoutState,view=source?.getAttribute('viewBox'),saved=cache?.get(state);if(saved&&saved.source===source&&saved.view===view)return saved.copy.cloneNode(true);const copy=clone.apply(this,arguments);if(copy&&cache)cache.set(state,{source,view,copy:copy.cloneNode(true)});return copy;};})();
</script>`+html.slice(at);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-output-viewport-v258.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

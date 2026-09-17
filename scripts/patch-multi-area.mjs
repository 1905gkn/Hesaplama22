import fs from 'node:fs';
import {namespaceSvgCopy} from './namespace-svg-copy.mjs';
export function transform(html){
 if(html.includes('data-rafex-multi-area'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Multi-area anchor missing: '+a.slice(0,100));html=html.replace(a,b);};
 replace("document.querySelector('#nav button.active[data-page]')?.dataset.page==='free'&&m2LayoutState.racks.length>0", "document.querySelector('#nav button.active[data-page]')?.dataset.page==='free'");
 replace('if(independentV133)documentV133=window.rafexIndependentProjectV133', 'documentV133=window.rafexAttachAreas?.(documentV133)||documentV133;\n          if(independentV133)documentV133=window.rafexIndependentProjectV133');
 const start="      if(type==='summary')await base.m2RenderA4Report?.();else await base.m2RenderCorporateReport?.();";
 replace(start, "      await window.rafexRenderAreaOutput(target,async(options={})=>{\n"+start);
 replace("if(type==='corporate')await base.rafexRenderSelectedB2BSections?.(true);", "if(type==='corporate'&&options.sections!==false)await base.rafexRenderSelectedB2BSections?.(true);");
 replace("      if(!target.querySelector('svg,img,canvas'))throw Error('Çizim önizlemesi üretilemedi.');", "      });\n      if(!target.querySelector('svg,img,canvas'))throw Error('Çizim önizlemesi üretilemedi.');");
 replace("if(!depth&&panel()){invalidate();return;}return original.apply(this,arguments);", "if(!depth&&panel()){if(!window.rafexAreaOutputIsCurrent?.())invalidate();return;}return original.apply(this,arguments);");
 for(const name of ['rebuildHost','syncPdfHost'])replace('function '+name+'(host){', 'function '+name+'(host){\n    if(host?.querySelector("[data-rafex-area]"))return;');
 replace('racks = x.layout?.racks || []', 'racks = x.areas?.length ? x.areas.flatMap(area=>area.layout.racks||[]) : x.layout?.racks || []');
 const script='<script data-rafex-multi-area>window.rafexNamespaceAreaSvg='+namespaceSvgCopy.toString()+';\n'+fs.readFileSync(new URL('./multi-area-runtime.js',import.meta.url),'utf8')+'</script>';
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+script+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-multi-area.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

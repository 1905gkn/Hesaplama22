import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function transform(html){
 if(html.includes('output-performance-v578'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('Output v578 anchor missing: '+from.slice(0,90));html=html.replace(from,to);};
 replace("cutTypes=m2CorporateCutTypes(types), projectName=", "cutTypes=window.__rafexOutputSectionsNeeded578===false?[]:m2CorporateCutTypes(types), projectName=");
 replace('const variantGroups=new Map();types.forEach((entry,index)=>','const variantGroups=new Map();(window.__rafexOutputSectionsNeeded578===false?[]:types).forEach((entry,index)=>');
 replace("      if(type==='summary')await base.m2RenderA4Report?.();else await base.m2RenderCorporateReport?.();",`      const sectionMode578=window.__rafexOutputSectionsNeeded578,sharedMode578=window.__rafexOutputSharedOnly578;window.__rafexOutputSectionsNeeded578=options.sections!==false;window.__rafexOutputSharedOnly578=options.sharedOnly===true;
      try{if(type==='summary')await base.m2RenderA4Report?.();else await base.m2RenderCorporateReport?.();`);
 replace("      if(token!==generation||!p.isConnected||owner!==key())return;\n      });","      if(token!==generation||!p.isConnected||owner!==key())return;\n      }finally{window.__rafexOutputSectionsNeeded578=sectionMode578;window.__rafexOutputSharedOnly578=sharedMode578;}\n      });");
 replace("if(type==='corporate'){window.rafexRebuildSectionsV230?.();window.rafexSyncSectionLabelsV230?.();}","if(type==='corporate'&&options.sections!==false){window.rafexRebuildSectionsV230?.();window.rafexSyncSectionLabelsV230?.();}");
 replace('restore(layout);await render();','restore(layout,false);await new Promise(requestAnimationFrame);await render({sharedOnly:true});');
 replace('const floorSource=$("m2LayoutSvg"), floorSvg=', 'const floorSource=window.__rafexOutputSharedOnly578?null:$("m2LayoutSvg"), floorSvg=');
 replace('function rafexPdfLayoutCloneV140(source,margin=0){','function rafexPdfLayoutCloneV140(source,margin=0){\n        if(window.__rafexOutputSharedOnly578&&source?.id==="m2LayoutSvg")return source.cloneNode(false);');
 replace('  function rebuildHost(host){','  function rebuildHost(host){\n    if(window.__rafexOutputSectionsNeeded578===false)return;');
 // Paint the progress text before starting the next synchronous legacy builder.
 replace('      for(const area of areas){\n        documentState.activeAreaId=',`      let areaIndex578=0;target.dataset.outputAreaPasses='0';
      for(const area of areas){
        const progress578=document.getElementById('m2CreateOutputButton');if(progress578)progress578.textContent=(++areaIndex578)+' / '+areas.length+' · '+area.name;
        await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
        target.dataset.outputAreaPasses=String(areaIndex578);
        documentState.activeAreaId=`);
 replace('    preparedSignature=outputSignature();','    target.dataset.outputPerformanceVersion="578";target.dataset.outputPreparationMs=String(Math.round(performance.now()-started578));\n    preparedSignature=outputSignature();');
 // A shared-only pass reads all racks for counts and sections, but never clones
 // an unrelated plan. Original area plans and final pallet totals are retained.
 return html.replace('window.rafexRenderAreaOutput=async(target,render)=>{','window.rafexRenderAreaOutput=async(target,render)=>{/* output-performance-v578 */const started578=performance.now();');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

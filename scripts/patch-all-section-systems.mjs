import fs from 'node:fs';

async function captureKonsolSection(drawing,settings){
 const k=drawing.konsol||drawing.spec||{},saved=window.rafexReadRackDetailV135?.(drawing,'konsol');
 const options=saved||window.rafexKonsolDetailOptionsV135?.(drawing)||{uprightCount:k.count||5,spacing:k.spacing||1500,height:k.height||4500,armLength:k.arm||1000,baseDepth:k.baseDepth||1000,levels:k.levels||4,doubleSided:k.side==='double',productLength:k.productLength||7500,productHeight:k.productHeight||900,loadType:k.loadType||'profile',levelRows:k.levelRows,uprightProfile:k.uprightProfile,armProfile:k.armProfile,armColor:k.armColor};
 const host=document.createElement('div');host.style.cssText='position:fixed;left:-100000px;width:1120px;height:900px';
 const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%';host.appendChild(canvas);document.body.appendChild(host);
 let viewer;
 try{
  viewer=window.RafexKonsolViewer.createDetached(canvas,{...options,loadType:settings.showPallets===false?'unpacked':options.loadType,dimensions:settings.dimensions});
  viewer.setView('perspective');viewer.controls.enableDamping=false;
  const target=viewer.controls.target,radius=viewer.camera.position.distanceTo(target),az=settings.azimuth*Math.PI/180,el=settings.elevation*Math.PI/180;
  viewer.camera.position.set(target.x+radius*Math.cos(el)*Math.sin(az),target.y+radius*Math.sin(el),target.z+radius*Math.cos(el)*Math.cos(az));viewer.controls.update();
  viewer.renderer.setPixelRatio(1.5);viewer.renderer.setSize(1120,900,false);viewer.camera.aspect=1120/900;viewer.camera.updateProjectionMatrix();viewer.renderer.render(viewer.scene,viewer.camera);
  return canvas.toDataURL('image/png');
 }finally{viewer?.destroy();host.remove();}
}

export function transform(html){
 if(html.includes('data-rafex-all-section-systems'))return html;
 const pattern=/(<script data-rafex-b2b-section-positioner-fallback="v5">)([\s\S]*?)(<\/script>)/;
 const match=html.match(pattern);if(!match)throw Error('Section positioner not found');
 let script=match[2];
 const replace=(a,b)=>{if(!script.includes(a))throw Error('Section anchor missing: '+a.slice(0,80));script=script.replace(a,b);};
 replace('if (!drawing || !(drawing?.b2b || drawing?.b2bLayout)) return;',`if (!drawing || !(drawing.b2b || drawing.b2bLayout || drawing.konsol || ['mr','konsol','b2b'].includes(drawing.rafexSystem||drawing.systemType))) return;`);
 replace('const system = drawing?.rafexSystem === "mr"','const system = drawing.konsol || ["konsol","konsol-kollu","cantilever"].includes(drawing.rafexSystem||drawing.systemType) ? "konsol" : drawing?.rafexSystem === "mr"');
 replace('.rafex-v19-type-card[data-rafex-system="mr"]\'','.rafex-v19-type-card[data-rafex-system="mr"],.rafex-v19-type-card[data-rafex-system="konsol"]\'');
 replace('card.dataset.rafexSystem !== "mr")','card.dataset.rafexSystem !== "mr" && card.dataset.rafexSystem !== "konsol")');
 replace('const system = card.dataset.rafexSystem === "mr" ? "mr" : "b2b";', 'const system = ["mr","konsol"].includes(card.dataset.rafexSystem) ? card.dataset.rafexSystem : "b2b";');
 replace('const api = system === "mr" ? "RafexMRViewer" : "RafexB2BViewer";', 'const api = system === "konsol" ? "RafexKonsolViewer" : system === "mr" ? "RafexMRViewer" : "RafexB2BViewer";');
 replace('const readyEvent = system === "mr" ? "rafex-mr-viewer-ready" : "rafex-b2b-viewer-ready";', 'const readyEvent = `rafex-${system}-viewer-ready`;');
 replace('    const mr = type?.system === "mr" || isMrDrawing(seed?.drawing);', `    const konsol=type?.system==='konsol';
    const mr = !konsol&&(type?.system === "mr" || isMrDrawing(seed?.drawing));
    await ensureViewer(konsol?'konsol':mr?'mr':'b2b');
    if(konsol){const signature=JSON.stringify({drawing:seed?.drawing,settings});if(!force&&previewCache.get(key)?.signature===signature)return previewCache.get(key).src;const src=await captureKonsolSection(seed.drawing,settings);previewCache.set(key,{signature,src});trimPreviewCache();return src;}`);
 // Pallet-count controls only apply to B2B; other systems keep their saved geometry.
 replace('    const requestKey = activeKey;', '    const requestKey = activeKey;\n    stage.querySelector(".rafex-placement-art")?.remove();');
 replace('    const src = await capturePerspective(requestKey, draft, force);', '    const src = await capturePerspective(requestKey, draft, force).catch(error=>{console.error("Kesit görüntüsü hazırlanamadı",error);return null;});');
 replace('image.alt = "B2B raf perspektif görünüşü";', 'image.alt = "Raf perspektif görünüşü";');
 replace('    document.querySelectorAll("[data-rafex-count]")', '    const counts=document.querySelector(".rafex-module-selector");if(counts)counts.style.display=type?.system==="b2b"?"":"none";\n    document.querySelectorAll("[data-rafex-count]")');
 script=captureKonsolSection.toString()+'\n'+script;
 html=html.replace(pattern,()=>match[1]+script+match[3]);
 html=html.replace("const cards=[...preview.querySelectorAll('.rafex-v19-type-card[data-rafex-system=\"b2b\"],.rafex-v19-type-card[data-rafex-system=\"mr\"]')];", "const cards=[...preview.querySelectorAll('.rafex-v19-type-card[data-rafex-system=\"b2b\"],.rafex-v19-type-card[data-rafex-system=\"mr\"],.rafex-v19-type-card[data-rafex-system=\"konsol\"]')];");
 const css=`<style data-rafex-all-section-systems>
.rafex-v19-type-card[data-rafex-system="mr"],.rafex-v19-type-card[data-rafex-system="konsol"]{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:28px minmax(0,1fr)!important}
.rafex-v19-type-card[data-rafex-system="mr"]>.rafex-v19-view,.rafex-v19-type-card[data-rafex-system="konsol"]>.rafex-v19-view{grid-column:1!important;grid-row:2!important}
</style>`;
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-all-section-systems.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

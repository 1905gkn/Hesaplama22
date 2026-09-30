import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-wallless-workspace="v205"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing wallless anchor '+a.slice(0,90));html=html.replace(a,b);};
 replace('if (!drawing?.plan || (!m2LayoutState.closed && !m2LayoutState.openFinished)) { $("m2FloorStatus").textContent = "Önce Alanı Bitir veya Alanı Tamamla ile duvarları hazırla ve uygun bir raf hesabı oluştur."; return; }','if (!drawing?.plan) { $("m2FloorStatus").textContent = "Önce bir raf tipi oluştur veya kayıtlı raf tipini seç."; return; }\n        window.rafexWalllessWorkspaceV205?.initialize();');
 replace('if (m2LayoutState.openFinished && !m2LayoutState.closed) {','if (!m2LayoutState.closed) {');
 const start=html.indexOf('      function m2StartFreeArea() {'),end=html.indexOf('      function m2PauseFreeArea()',start);if(start<0||end<0)throw Error('Missing free area function');
 html=html.slice(0,start)+`      function m2StartFreeArea() {
        window.rafexWalllessWorkspaceV205?.initialize();
        if(m2LayoutState.mode==='draw')return;
        m2PushUndo('Mevcut yerleşimde alan çizimi');
        m2LayoutState.freeDrawFrameV205=window.rafexCommonLayoutZoomCrispV126?.getView();
        Object.assign(m2LayoutState,{mode:'draw',closed:false,openFinished:false,areaEditMode:true,drawFromIndex:null,branchSourceIndex:null,selected:null,hover:null,drag:null});
        m2AutoFillDraft=null;m2ClearMultiSelection();m2SetAutoFillControlsActive(false);
        document.getElementById('m2FreeButton')?.classList.add('active');
        document.getElementById('m2FloorStatus').textContent='Raflar ve görünüm korundu. Rafların etrafındaki alan köşelerini çiz; bitince Alanı Bitir veya Alanı Tamamla düğmesine bas.';
        m2RenderLayout();
      }
`+html.slice(end);
 replace('var points=s?.points;','var points=s?.points;\n    if(s?.areaEditMode&&s.freeDrawFrameV205)return {...s.freeDrawFrameV205};\n    if(s?.walllessWorkspaceV205&&!s.closed&&(!points?.length||s.mode===\'draw\'))return{x:175,y:0,w:650,h:650};');
 // Only defaults change; restored projects keep their own physical scale.
 html=html.replaceAll('scale: .04, showAreaDimensions: false','scale: .013, walllessWorkspaceV205:true, showAreaDimensions: false');
 html=html.replaceAll('scale:.04,showAreaDimensions:false','scale:.013,walllessWorkspaceV205:true,showAreaDimensions:false');
 html=html.replaceAll("areaWidth:'50000',areaDepth:'30000'","areaWidth:'50000',areaDepth:'50000'");
 html=html.replaceAll('id="m2AreaH" type="number" min="1000" value="30000"','id="m2AreaH" type="number" min="1000" value="50000"');
 // New wall-free plans can contain symbols and attached protections too.
 replace('if(!m2LayoutState.points.length){$("m2FloorStatus").textContent="Önce serbest yerleşim alanını oluştur.";return;}','window.rafexWalllessWorkspaceV205?.initialize();');
 replace('function m2OpenProtectionDialog(){if(!m2LayoutState.points.length){$("m2FloorStatus").textContent="Önce serbest yerleşim alanını oluştur.";return;}','function m2OpenProtectionDialog(){window.rafexWalllessWorkspaceV205?.initialize();');
 replace('if(!m2LayoutState.points.length||!m2LayoutState.racks.some((rack)=>rack.layoutView==="b2b-top"))','if(!m2LayoutState.racks.some((rack)=>rack.layoutView==="b2b-top"))');
 const code=fs.readFileSync(new URL('./wallless-workspace-v205.js',import.meta.url),'utf8'),at=html.lastIndexOf('</body>');
 return html.slice(0,at)+'<script data-wallless-workspace="v205">'+code+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-wallless-workspace-v205.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

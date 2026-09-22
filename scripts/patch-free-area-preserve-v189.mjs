import fs from 'node:fs';

export function startExistingFreeArea(){
  const hasContent=m2LayoutState.racks.length||m2LayoutSymbols.length||m2LayoutState.points.length||m2LayoutState.cadElements?.length||m2UserNotes.length;
  if(!hasContent)return false;
  if(m2LayoutState.mode==='draw')return true;
  m2PushUndo('Mevcut yerleşimde alan çizimi');
  Object.assign(m2LayoutState,{mode:'draw',closed:false,openFinished:false,areaEditMode:true,drawFromIndex:null,branchSourceIndex:null,selected:null,hover:null,drag:null});
  m2AutoFillDraft=null;m2ClearMultiSelection();m2SetAutoFillControlsActive(false);
  document.getElementById('m2FreeButton')?.classList.add('active');
  document.getElementById('m2FloorStatus').textContent='Mevcut raflar, çizimler ve ölçek korundu. Alan köşelerini çiz; bitince Alanı Bitir veya Alanı Tamamla düğmesine bas.';
  m2RenderLayout();return true;
}

export function transform(html){
  if(html.includes('/* free-area-preserve-v189 */'))return html;
  for(const name of ['m2StartFreeArea','m2FitCompletedFreeArea'])if(!html.includes('function '+name+'() {'))throw Error('v189 missing '+name);
  html=html.replace('function m2StartFreeArea() {','function m2StartFreeArea() {\n        if(('+startExistingFreeArea.toString()+')())return;');
  // Fitting only the new walls would change the mm scale without transforming
  // the already placed racks, symbols or annotations. Keep their coordinate system.
  html=html.replace('function m2FitCompletedFreeArea() {','function m2FitCompletedFreeArea() {\n        /* free-area-preserve-v189 */\n        if(m2LayoutState.racks.length||m2LayoutSymbols.length||m2LayoutState.cadElements?.length||m2UserNotes.length)return;');
  return html;
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-free-area-preserve-v189.mjs')){
  const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
  fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

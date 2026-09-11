import fs from 'node:fs';

export function transform(html) {
  if(html.includes('/* idle-dom-performance-v147:'))return html;
  const replace=(from,to)=>{if(!html.includes(from))throw Error('v147 missing anchor: '+from.slice(0,100));html=html.replace(from,to)};
  // A body observer must not rewrite its own output on every animation frame.
  replace("grid.classList.add('rafex-cad-import-grid');", "if(!grid.classList.contains('rafex-cad-import-grid'))grid.classList.add('rafex-cad-import-grid');");
  replace('button.textContent=buttonLabel();button.title=buttonLabel()', "if(button.textContent!==buttonLabel())button.textContent=buttonLabel();button.title=buttonLabel()");
  replace('ensureMrRowControlsV49();installSavedActionsV46();selectedRackInfoV46();', 'ensureMrRowControlsV49();installSavedActionsV46();/* idle-dom-performance-v147: selection renders through its existing state handlers */');
  // MR action installation likewise produces child mutations; suppress only its
  // own synchronous writes, then observe subsequent user/application changes.
  replace('var savedActionScanV46=false;new MutationObserver(function(){', 'var savedActionScanV46=false;var savedActionsObserverV147=new MutationObserver(function(){');
  replace('savedActionScanV46=false;ensureMrRowControlsV49();installSavedActionsV46();/* idle-dom-performance-v147:', 'savedActionScanV46=false;savedActionsObserverV147.disconnect();try{ensureMrRowControlsV49();installSavedActionsV46();}finally{savedActionsObserverV147.observe(document.body,{childList:true,subtree:true})}/* idle-dom-performance-v147:');
  replace('}).observe(document.body,{childList:true,subtree:true});ensureMrRowControlsV49();installSavedActionsV46();', '});savedActionsObserverV147.observe(document.body,{childList:true,subtree:true});ensureMrRowControlsV49();installSavedActionsV46();');
  replace('node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";', 'if(node.style.width!=="100%")node.style.width="100%";if(node.style.height!=="auto")node.style.height="auto";if(node.style.maxWidth!=="none")node.style.maxWidth="none";if(node.style.margin!=="0px")node.style.margin="0";');
  replace('node.style.aspectRatio=view.w+" / "+view.h;', 'var ratioV147=String(Number((view.w/view.h).toFixed(9)))+" / 1";if(node.style.aspectRatio!==ratioV147)node.style.aspectRatio=ratioV147;');
  return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-idle-dom-performance-v147.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!match)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
  console.log('v147: stop self-triggered CAD and selection observer updates.');
}

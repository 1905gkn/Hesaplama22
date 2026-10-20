import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-wall-editor-toggle="v340"'))return html;
 const anchor='onclick="m2ToggleEdgeEditorVisibility()">Kenar ölçülerini göster</button></div>';
 if(html.split(anchor).length!==2)throw Error('v340 edge toolbar anchor missing');
 html=html.replace(anchor,'onclick="m2ToggleEdgeEditorVisibility()">Kenar ölçülerini göster</button><button id="rafexWallEditorToggleV340" type="button" aria-controls="m2WallEditor" aria-expanded="true" onclick="rafexToggleWallEditorV340()">Duvar Uzaklıklarını Gizle</button></div>');
 const extra=`<style data-wall-editor-toggle="v340">.m2-edge-visibility{gap:8px;flex-wrap:wrap}#page#page #m2WallEditor.rafex-wall-editor-hidden-v340{display:none!important}</style><script data-wall-editor-toggle="v340">(()=>{
 let hidden=false;
 function sync(){
  const panel=document.getElementById('m2WallEditor'),button=document.getElementById('rafexWallEditorToggleV340');
  panel?.classList.toggle('rafex-wall-editor-hidden-v340',hidden);
  if(button){const label=hidden?'Duvar Uzaklıklarını Göster':'Duvar Uzaklıklarını Gizle';if(button.textContent!==label)button.textContent=label;button.setAttribute('aria-expanded',String(!hidden));button.classList.toggle('active',!hidden);}
 }
 window.rafexToggleWallEditorV340=function(){hidden=!hidden;sync();};
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=render.apply(this,arguments);sync();return result;};sync();
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v340 body missing');return html.slice(0,end)+extra+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-wall-editor-toggle-v340.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v340 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v340: wall distances panel toggle beside edge length information');
}


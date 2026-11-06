import fs from 'node:fs';
import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-column-continuation="v506"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v506 missing '+a.slice(0,100));html=html.replace(a,b)};
 // Project the pointer first: it determines the current extension direction.
 replace('m2ColumnBeginExtensionV504(source,draft);try{\n        const projected=point?m2ProjectAutoFillPoint(point):draft.hover, radians=source.angle', 'const projected=point?m2ProjectAutoFillPoint(point):draft.hover;\n        m2ColumnBeginExtensionV504(source,draft);try{\n        const radians=source.angle');
 replace('m2ColumnExtensionContextV504=null;\n const status=', `m2ColumnExtensionContextV504=null;
 // Keep the measured-extension tool live at the newly reached row end.
 // The next click is the explicit second attempt; no deselection is required.
 if(stopped.length&&ctx.keepGuide){
  const origin={x:end.x+end.w/2,y:end.y+end.h/2};
  m2AutoFillDraft={rackId:end.id,origin,start:origin,hover:origin,direction:ctx.direction};
  m2LayoutState.selected=end.id;m2SetAutoFillControlsActive(true);
  if($('m2AutoFillLength'))$('m2AutoFillLength').value='';
  m2RenderLayout();
 }
 const status=`);
 replace('accepted:new Map(),source,direction};','accepted:new Map(),source,direction,keepGuide:!!m2AutoFillDraft};');
 replace('Yakınından aynı yönde tekrar uzatırsan, travers ve ayaklara temas etmeyen kolonun kapattığı palet yerleri boş bırakılır.', 'Uzatma açık kaldı. Aynı yönde tekrar mesafe seç; uygun kolonun kapattığı palet yerleri boş bırakılarak devam edilir.');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-column-continuation="v506">window.rafexColumnContinuationVersion="v506";</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(/[\\/]column-continuation-v506\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v506 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v506: '+file);
}


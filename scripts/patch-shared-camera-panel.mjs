import fs from 'node:fs';
if(process.argv.includes('--source')){
  const file='client/mr-viewer.entry.js';let source=fs.readFileSync(file,'utf8');
  source=source.replace('type: "tray",\n        width:', 'type: "tray", thickness:Number(item.thickness)||0,load:Number(item.load)||0,traySelectionMode:item.traySelectionMode||"manual",\n        width:');
  if(!source.includes('*14*this.config.dimensionScale')){
    if(!source.includes('*28*this.config.dimensionScale'))throw Error('MR dimension size anchor missing');
    source=source.replaceAll('*28*this.config.dimensionScale','*14*this.config.dimensionScale');
    fs.writeFileSync(file,source);
  }
  fs.writeFileSync(file,source);
}else{
  const file='dist/server/index.js';let source=fs.readFileSync(file,'utf8');
  const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!match)throw Error('HTML_BASE64 missing');
  let html=Buffer.from(match[2],'base64').toString('utf8');
  const end=html.lastIndexOf('</body>');
  const css=`<style data-shared-camera-style>
  #page .mr-auto,#page .mr-view-toolbar [data-mr-view]:not([data-mr-view="perspective"]),
  #page .konsol-toolbar [data-kview]:not([data-kview="perspective"]){display:none!important}
  #page [data-shared-camera]{top:14px;right:14px}
  </style>`;
  html=html.slice(0,end)+css+'<script>'+fs.readFileSync('client/shared-camera-panel.js','utf8')+'</script>'+html.slice(end);
  source=source.replace(match[2],Buffer.from(html).toString('base64'));fs.writeFileSync(file,source);
}

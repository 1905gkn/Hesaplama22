import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-detail-text-controls="586"'))return html;
 for(const anchor of ['modal.hidden=false;if(sys===','detailViewer=viewer;'])if(!html.includes(anchor))throw Error('v586 detail anchor '+anchor);
 html=html.replace('modal.hidden=false;if(sys===','window.rafexInstallDetailText586(modal);modal.hidden=false;if(sys===');
 html=html.replace('detailViewer=viewer;','detailViewer=viewer;window.rafexBindDetailText586(viewer,modal);');
 const native="}).join('')+'</div>'}catch(error){if(token===detailToken)";if(!html.includes(native))throw Error('v586 native detail views anchor');
 html=html.replace(native,"}).join('')+'</div>';window.rafexScaleDetailImages586(modal);}catch(error){if(token===detailToken)");
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<style data-detail-text-controls="586">#rafexSystemDetailV115 .rsv115-head{flex-wrap:wrap}#rafexSystemDetailV115 .rafex-detail-text586{display:flex;align-items:center;gap:7px;order:3;flex-basis:100%}#rafexSystemDetailV115 .rafex-detail-text586 button{padding:5px 12px;min-width:36px}#rafexSystemDetailV115 .rafex-detail-text586 input{width:76px;padding:6px}</style><script>'+fs.readFileSync(new URL('../client/detail-text-controls-v586.js',import.meta.url),'utf8')+'</script>'+html.slice(at);
}
if(/[\\/]detail-text-controls-v586\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

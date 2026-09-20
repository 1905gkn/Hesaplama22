import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-project-start="v157"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v157 anchor missing: '+from.slice(0,90));html=html.replace(from,to);};
 replace('window.rafexStartNewProjectV133=function(){','window.rafexStartNewProjectV133=async function(){');
 const end=/    window\.rafexSyncProjectGateV134\?\.\(\);\r?\n  };\r?\n  function installButton\(\)/;
 if(!end.test(html))throw Error('v157 project start completion missing');
 html=html.replace(end,'    window.rafexSyncProjectGateV134?.();\n    await window.rafexSaveNewProjectV157();\n  };\n  function installButton()');
 html=html.replaceAll('Yeni proje aç','Yeni projeyi kaydet');
 const runtime=fs.readFileSync(new URL('./project-start-v157.js',import.meta.url),'utf8');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('v157 missing body');
 return html.slice(0,at)+'<script data-project-start="v157">'+runtime+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-start-v157.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

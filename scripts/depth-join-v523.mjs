import fs from 'node:fs';
import vm from 'node:vm';
export function transform(html){
 if(html.includes('/* depth-join-v523 */'))return html;
 const runtime=fs.readFileSync(new URL('../client/depth-join-v523.js',import.meta.url),'utf8');new vm.Script(runtime);
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body for depth join');
 html=html.slice(0,at)+'<script data-depth-join="v523">'+runtime+'</script>'+html.slice(at);
 return html;
}
if(/[\\/]depth-join-v523\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing server HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS depth join v523: '+file);
}

import fs from 'node:fs';
import vm from 'node:vm';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
if(!match)throw Error('Compiled HTML missing');
const js=fs.readFileSync('client/common-ui.js','utf8');new vm.Script(js);
let html=Buffer.from(match[1],'base64').toString('utf8');
const end=html.lastIndexOf('</body>');if(end<0)throw Error('Body missing');
html=html.slice(0,end)+'<style data-common-ui="v1">'+fs.readFileSync('client/common-ui.css','utf8')+'</style><script>'+js+'</script>'+html.slice(end);
fs.writeFileSync(file,source.replace(match[1],Buffer.from(html).toString('base64')));

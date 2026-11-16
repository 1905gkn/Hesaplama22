import fs from 'node:fs';import {pathToFileURL} from 'node:url';import {combineProductPages} from './combine-product-pages.mjs';
export function transform(html){
 const start=html.indexOf('window.rafexCombineProductPages='),end=html.indexOf(';window.rafexNamespaceAreaSvg=',start);
 if(start<0||end<0)throw Error('Missing product pagination anchor');
 return html.slice(0,start)+'window.rafexCombineProductPages='+combineProductPages.toString()+html.slice(end);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

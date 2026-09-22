import fs from 'node:fs';

export function transform(html){
 if(html.includes('data-b2b-default-clearance="v187"'))return html;
 const from='b2bAutoRotate = false, b2bPalletTraverseGap = 200;';
 if(html.indexOf(from)<0||html.indexOf(from)!==html.lastIndexOf(from))throw Error('v187 default clearance anchor missing/ambiguous');
 // Only the initial editor default changes. Explicit saved values and the
 // historical fallback for old records without this field retain their size.
 html=html.replace(from,'b2bAutoRotate = false, b2bPalletTraverseGap = 100;');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v187 body missing');
 return html.slice(0,end)+'<script data-b2b-default-clearance="v187">window.rafexB2BDefaultClearanceV187=100;</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-b2b-default-clearance-v187.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!match)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}

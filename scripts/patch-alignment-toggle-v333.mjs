import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* alignment-toggle-v333 */'))return html;
 const selector='input,button:not(.rafex-extension-toggle)';
 if(!html.includes(selector))throw Error('v333 extension controls selector missing');
 html=html.replaceAll(selector,'input,button:not(.rafex-extension-toggle):not(#rafexAlignmentButtonV250)');
 const from="button.textContent=(document.getElementById('programLanguage')?.value==='en'?'Alignment'";
 if(html.split(from).length!==2)throw Error('v333 alignment install anchor mismatch');
 html=html.replace(from,"/* alignment-toggle-v333 */button.disabled=false;button.removeAttribute('aria-disabled');"+from);
 const style='<style data-alignment-toggle="v333">#page #rafexAlignmentButtonV250{opacity:1!important;cursor:pointer!important}#page #rafexAlignmentButtonV250[aria-pressed="true"]{background:#e5f0e9!important;color:#174a35!important;border-color:#74a18a!important}#page #rafexAlignmentButtonV250[aria-pressed="false"]{background:#fff!important;color:#52695d!important;border-color:#aac8bb!important}</style>';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v333 body missing');return html.slice(0,end)+style+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-alignment-toggle-v333.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v333 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v333: alignment toggle stays enabled independently of extension controls');
}


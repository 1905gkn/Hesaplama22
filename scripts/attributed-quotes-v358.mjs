import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./attributed-quotes-v358.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-attributed-quotes="v358"'))return html;
 const pattern=/<script data-daily-motivation="v355">[\s\S]*?<\/script>/g;
 if([...html.matchAll(pattern)].length!==1)throw Error('v358 daily quotation runtime anchor');
 html=html.replace(pattern,'<script data-daily-motivation="v355" data-attributed-quotes="v358">'+runtime+'</script>');
 const css='.rafex-quote-text-v358{display:block}.rafex-daily-motivation-v355 .rafex-quote-author-v358{display:block;margin-top:12px;font:600 14px/1.5 Arial,sans-serif;letter-spacing:0}.rafex-quote-author-v358 a{color:#f4d445;text-decoration:none}.rafex-quote-author-v358 a:hover,.rafex-quote-author-v358 a:focus-visible{text-decoration:underline;text-underline-offset:3px}.rafex-quote-author-v358 a:focus-visible{outline:2px solid currentColor;outline-offset:4px;border-radius:2px}';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v358 body');
 return html.slice(0,end)+'<style data-attributed-quotes="v358">'+css+'</style>'+html.slice(end);
}

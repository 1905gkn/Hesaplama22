import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-engineering="v488"'))return html;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Engineering body anchor missing');
 const js=fs.readFileSync('client/engineering-v488.js','utf8')+'\n'+fs.readFileSync('client/engineering-tracking.js','utf8'),css=fs.readFileSync('client/engineering-v488.css','utf8');
 return html.slice(0,end)+'<style data-engineering="v488">'+css+'</style><script data-engineering="v488">'+js+'</script>'+html.slice(end);
}

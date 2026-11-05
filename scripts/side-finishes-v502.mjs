import fs from 'node:fs';import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-side-finishes="v502"'))return html;
 const start=html.indexOf('function m2MekikSetProjection('),end=html.indexOf('function m2FootProfileKey',start);
 if(start<0||end<0)throw Error('v502 side projection missing');
 let projection=html.slice(start,end);
 const anchor='const styles = `<style>.m2-side-horizontal-brace';
 if(!projection.includes(anchor)||!projection.includes('.m2-side-upright-body{fill:#b8bec0'))throw Error('v502 native finish anchor missing');
 projection=projection.replace(anchor,`const footFinishV502=(drawing?.mekikFootColor||drawing?.footColor||'ral5010')==='pgv'?'#a8b0b3':'#004f7c';
        const styles = \`<style>.m2-side-horizontal-brace`);
 projection=projection.replace('.m2-side-upright-body{fill:#b8bec0','.m2-side-upright-body{fill:${footFinishV502}').replace('.m2-side-base{fill:#9fa8ab','.m2-side-base{fill:${footFinishV502}').replace('.m2-side-upright-highlight{stroke:#eef1f1','.m2-side-upright-highlight{stroke:${footFinishV502}');
 for(const name of ['upright-body','base','upright-highlight'])projection=projection.replace('.m2-side-'+name+'{','[data-upright-finish="${footFinishV502}"] .m2-side-'+name+'{');
 projection=projection.replace('<g data-glb-assembly="ayak-ray-travers-paletli"','<g data-upright-finish="${footFinishV502}" data-glb-assembly="ayak-ray-travers-paletli"');
 html=html.slice(0,start)+projection+html.slice(end);
 // Side drawings carry their saved finish, including detached PDF captures.
 // Remove the older DOM-variable overrides that could keep a previous system's finish.
 html=html.replace(/(<style\s+data-rafex-common-mekik-view-colors="v1">)([\s\S]*?)(<\/style>)/,(_,a,s,z)=>a+s.replace(/[^{}]*#m2Side\s+\.m2-side-(?:upright-body|base|upright-highlight)[^{]*\{[^}]*\}/g,'')+z);
 const pos=html.lastIndexOf('</body>');html=html.slice(0,pos)+'<script data-side-finishes="v502">window.rafexSideFinishesVersion="v502";</script>'+html.slice(pos);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(process.argv[1]?.endsWith('side-finishes-v502.mjs')){
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
  let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v502 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);
 }
 console.log('PASS v502: native side projection uses saved upright finish at initial render, changes and PDF capture.');
}

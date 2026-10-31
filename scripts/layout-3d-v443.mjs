import fs from 'node:fs';
export function transform(html){if(html.includes('data-rafex-layout-3d="v443"'))return html;
 const anchor='<button type="button" id="m2FreeButton"';if(!html.includes(anchor))throw Error('Free layout toolbar missing');
 html=html.replace(anchor,'<button type="button" data-layout-3d>Yerleşimi 3D Gör</button>'+anchor);
 const head=html.indexOf('</head>'),end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script defer src="/layout-3d.js" data-rafex-layout-3d="v443"></script>'+html.slice(end);return html.slice(0,head)+'<link rel="stylesheet" href="/layout-3d.css">'+html.slice(head);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/layout-3d-v443.mjs')){
 const {build}=await import('esbuild');
 const plugin={name:'reuse-shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'three',namespace:'shared-three'}));b.onLoad({filter:/.*/,namespace:'shared-three'},async()=>({contents:Object.keys(await import('three')).map(k=>'export const '+k+'=globalThis.RafexThree.'+k+';').join('\n'),loader:'js'}));}};
 await build({entryPoints:['client/layout-3d.entry.js'],bundle:true,format:'iife',target:'es2022',minify:true,outfile:'dist/layout-3d.js',plugins:[plugin]});fs.copyFileSync('client/layout-3d.css','dist/layout-3d.css');fs.writeFileSync('dist/index.html',transform(fs.readFileSync('dist/index.html','utf8')));console.log('Free layout 3D preview emitted.');
}

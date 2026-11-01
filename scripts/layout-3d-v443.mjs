import fs from 'node:fs';
export function transform(html){if(html.includes('data-rafex-layout-3d="v469"'))return html;
 if(html.includes('data-rafex-layout-3d="v468"'))return html.replaceAll('v=468','v=469').replaceAll('data-rafex-layout-3d="v468"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v467"'))return html.replaceAll('v=467','v=469').replaceAll('data-rafex-layout-3d="v467"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v466"'))return html.replaceAll('v=466','v=469').replaceAll('data-rafex-layout-3d="v466"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v465"'))return html.replaceAll('v=465','v=469').replaceAll('data-rafex-layout-3d="v465"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v464"'))return html.replaceAll('v=464','v=469').replaceAll('data-rafex-layout-3d="v464"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v463"'))return html.replaceAll('v=463','v=469').replaceAll('data-rafex-layout-3d="v463"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v462"'))return html.replaceAll('v=462','v=469').replaceAll('data-rafex-layout-3d="v462"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v461"'))return html.replaceAll('v=461','v=469').replaceAll('data-rafex-layout-3d="v461"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v460"'))return html.replaceAll('v=460','v=469').replaceAll('data-rafex-layout-3d="v460"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v459"'))return html.replaceAll('v=459','v=469').replaceAll('data-rafex-layout-3d="v459"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v458"'))return html.replaceAll('v=458','v=469').replaceAll('data-rafex-layout-3d="v458"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v457"'))return html.replaceAll('v=457','v=469').replaceAll('data-rafex-layout-3d="v457"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v456"'))return html.replaceAll('v=456','v=469').replaceAll('data-rafex-layout-3d="v456"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v455"'))return html.replaceAll('v=455','v=469').replaceAll('data-rafex-layout-3d="v455"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v454"'))return html.replaceAll('v=454','v=469').replaceAll('data-rafex-layout-3d="v454"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v453"'))return html.replaceAll('v=453','v=469').replaceAll('data-rafex-layout-3d="v453"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v452"'))return html.replaceAll('v=452','v=469').replaceAll('data-rafex-layout-3d="v452"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v451"'))return html.replaceAll('v=451','v=469').replaceAll('data-rafex-layout-3d="v451"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v450"'))return html.replaceAll('v=450','v=469').replaceAll('data-rafex-layout-3d="v450"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v449"'))return html.replaceAll('v=449','v=469').replaceAll('data-rafex-layout-3d="v449"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v448"'))return html.replaceAll('v=448','v=469').replaceAll('data-rafex-layout-3d="v448"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v447"'))return html.replaceAll('v=447','v=469').replaceAll('data-rafex-layout-3d="v447"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v446"'))return html.replaceAll('v=446','v=469').replaceAll('data-rafex-layout-3d="v446"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v445"'))return html.replaceAll('v=445','v=469').replaceAll('data-rafex-layout-3d="v445"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v444"'))return html.replaceAll('v=444','v=469').replaceAll('data-rafex-layout-3d="v444"','data-rafex-layout-3d="v469"');
 if(html.includes('data-rafex-layout-3d="v443"'))return html.replace('src="/layout-3d.js"','src="/layout-3d.js?v=469"').replace('href="/layout-3d.css"','href="/layout-3d.css?v=469"').replace('data-rafex-layout-3d="v443"','data-rafex-layout-3d="v469"');
 const anchor='<button type="button" id="m2FreeButton"';if(!html.includes(anchor))throw Error('Free layout toolbar missing');
 html=html.replace(anchor,'<button type="button" data-layout-3d>Yerleşimi 3D Gör</button>'+anchor);
 const head=html.indexOf('</head>'),end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script defer src="/layout-3d.js?v=469" data-rafex-layout-3d="v469"></script>'+html.slice(end);return html.slice(0,head)+'<link rel="stylesheet" href="/layout-3d.css?v=469">'+html.slice(head);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/layout-3d-v443.mjs')){
 const {build}=await import('esbuild');
 const plugin={name:'reuse-shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'three',namespace:'shared-three'}));b.onLoad({filter:/.*/,namespace:'shared-three'},async()=>({contents:Object.keys(await import('three')).map(k=>'export const '+k+'=globalThis.RafexThree.'+k+';').join('\n'),loader:'js'}));}};
 await build({entryPoints:['client/layout-3d.entry.js'],bundle:true,format:'iife',target:'es2022',minify:true,outfile:'dist/layout-3d.js',plugins:[plugin]});fs.copyFileSync('client/layout-3d.css','dist/layout-3d.css');fs.writeFileSync('dist/index.html',transform(fs.readFileSync('dist/index.html','utf8')));console.log('Free layout 3D preview emitted.');
}

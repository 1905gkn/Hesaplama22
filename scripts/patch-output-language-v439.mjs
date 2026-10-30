import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-output-language="v439"'))return html;
 const replace=(a,b,n=1)=>{const found=html.split(a).length-1;if(found!==n)throw Error('v439 anchor count '+found+' expected '+n+': '+a.slice(0,110));html=html.split(a).join(b);};
 // Saved options can retain the program language. The output selector owns captures.
 replace('    const options = mr ? (mrOptions ? { ...mrOptions, dimensions:',"    const captureLanguage=document.getElementById('m2ReportLanguage')?.value||'tr';\n    const options = mr ? (mrOptions ? { ...mrOptions, language:captureLanguage, dimensions:");
 replace('    if (!options || typeof capture !== "function") return null;',`    if (!options || typeof capture !== "function") return null;
    options.language=captureLanguage;
    if(Array.isArray(options.moduleOptions))options.moduleOptions=options.moduleOptions.map(item=>({...item,language:captureLanguage}));`);
 replace('options, { width:1120, height:900, azimuth:', 'options, { language:captureLanguage, width:1120, height:900, azimuth:');
 replace('      if (!force) return pending;', '      if (!force && pending.rafexCaptureLanguage439===captureLanguage) return pending;');
 replace('    previewPending.set(key, task);', '    task.rafexCaptureLanguage439=captureLanguage;\n    previewPending.set(key, task);');
 // Revision is part of every section-cache signature, in addition to output language.
 html=html.replaceAll("reportLanguage:document.getElementById('m2ReportLanguage')?.value||'tr',","captureRevision:'v439',reportLanguage:document.getElementById('m2ReportLanguage')?.value||'tr',");
 const why='${types.some(entry=>{const d=entry.drawing||entry;return !d.b2bLayout&&(entry.rafexSystem||d.rafexSystem||"mekik2")==="mekik2"})?`<article><h3>${t.whyTitle}</h3><p>${t.whyText}</p></article>`:""}';
 replace(why,'');
 replace('<article class="rafex-drawing-note-footer"><h3>Çizim Notu</h3><p>Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article>','');
 return html.replace('</head>','<meta data-output-language="v439"></head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-output-language-v439.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}
import fs from 'node:fs';import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-four-direction-gaps="v508"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v508 missing '+a.slice(0,100));html=html.replace(a,b)};
 replace('(window.rafexRackGapRelationsV46?.(owner)||[m2NearestRackGap(owner)]).filter(Boolean).slice(0,2)', '(window.rafexRackGapRelationsV46?.(owner)||[m2NearestRackGap(owner)]).filter(Boolean).slice(0,4)');
 replace('(window.rafexRackGapRelationsV46?.(measurementRack)||[nearest]).filter(Boolean).slice(0,2)', '(window.rafexRackGapRelationsV46?.(measurementRack)||[nearest]).filter(Boolean).slice(0,4)');
 replace('var pairs=relations.slice(0,2).map(function(relation){return pairCandidate(active,relation.other);}).filter(Boolean);','var pairs=relations.slice(0,4).map(function(relation){return pairCandidate(active,relation.other);}).filter(Boolean);');
 // The search already starts at the whole joined row. Preserve those same
 // extents when the selected candidate becomes a visible/editable measurement.
 replace('var A=m2GapBoundsV346(a),B=m2GapBoundsV346(b),candidates=[];', 'var A=m2CombinedGapBoundsV346(a),B=m2CombinedGapBoundsV346(b),candidates=[];');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-four-direction-gaps="v508">window.rafexFourDirectionGapsVersion="v508";</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]four-direction-gaps-v508\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v508 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v508: '+file);
}


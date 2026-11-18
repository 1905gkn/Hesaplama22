import fs from 'node:fs';
import {translateAccessoryText591} from '../client/report-accessory-language-v591.mjs';
export function transformViewerSource(source,system='b2b'){
 if(source.includes('/* section-dimensions-v591 */'))return source;
 const replace=(a,b)=>{if(!source.includes(a))throw Error('v591 viewer missing '+a.slice(0,90));source=source.replace(a,b);};
 if(system==='b2b'){
  replace('markers: next.dimensions?.markers !== false,','markers: next.dimensions?.markers !== false,\n        topPallet: next.dimensions?.topPallet ?? (next.dimensions?.markers !== false),\n        uprightHeight: next.dimensions?.uprightHeight ?? (next.dimensions?.markers !== false),');
  replace('if (this.options.dimensions.markers) {','if (this.options.dimensions.topPallet || this.options.dimensions.uprightHeight) {');
  replace('if(this.options.levels>0)this.addLevelMarker(markersLayer, markerX, frontY, topPallet,','if(this.options.levels>0&&this.options.dimensions.topPallet)this.addLevelMarker(markersLayer, markerX, frontY, topPallet,');
  replace('this.addLevelMarker(markersLayer, rackWidth + 1400,','if(this.options.dimensions.uprightHeight)this.addLevelMarker(markersLayer, rackWidth + 1400,');
  replace('window.rafexDimensionText?.(line,language())||line','translateAccessoryText591(window.rafexDimensionText?.(line,language())||line,language())');
 }else{
  replace('markers: config.dimensions?.markers !== false,','markers: config.dimensions?.markers !== false,\n        topPallet: config.dimensions?.topPallet ?? (config.dimensions?.markers !== false),\n        uprightHeight: config.dimensions?.uprightHeight ?? (config.dimensions?.markers !== false),');
  // MR has no pallet-top marker. Its production preparation keeps only the
  // upright measure and may move that label to the left of the section.
  replace('if (this.config.dimensions.markers) {','if (this.config.dimensions.uprightHeight) {');
  source=source.replaceAll('window.rafexDimensionText?.(text, this.config.language || document.documentElement.lang) || text','translateAccessoryText591(window.rafexDimensionText?.(text, this.config.language || document.documentElement.lang) || text,this.config.language || document.documentElement.lang)').replaceAll('window.rafexDimensionText?.(text, language) || text','translateAccessoryText591(window.rafexDimensionText?.(text, language) || text,language)');
 }
 return "/* section-dimensions-v591 */\nimport {translateAccessoryText591} from '../client/report-accessory-language-v591.mjs';\n"+source;
}
export function transform(html){
 if(html.includes('data-section-dimensions="v591"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v591 UI missing '+a.slice(0,90));html=html.replace(a,b);};
 replace('<label><input type="checkbox" data-rafex-dimension="markers"> Üst palet kotu ve ayak boyu</label>','<label><input type="checkbox" data-rafex-dimension="topPallet"> Üst palet kotu</label><label><input type="checkbox" data-rafex-dimension="uprightHeight"> Ayak boyu</label>');
 replace('markers: value.dimensions?.markers ?? defaultDimensions.markers,','markers: value.dimensions?.markers ?? defaultDimensions.markers,\n        topPallet: value.dimensions?.topPallet ?? value.dimensions?.markers ?? defaultDimensions.topPallet ?? defaultDimensions.markers,\n        uprightHeight: value.dimensions?.uprightHeight ?? value.dimensions?.markers ?? defaultDimensions.uprightHeight ?? defaultDimensions.markers,');
 replace('const DIMENSION_DEFAULTS = {','const DIMENSION_DEFAULTS = { topPallet:true, uprightHeight:true,');
 replace("    if (lang === 'tr') return source;","    if (lang === 'tr') return source;\n    const accessory591=window.rafexAccessoryText591?.(source,lang);if(accessory591&&accessory591!==source)return accessory591;");
 html=html.replaceAll("captureRevision:'v439'","captureRevision:'v591'");
 html=html.replace(/\/(b2b|mr)-viewer\.js\?v=[^"'\s<>]+/g,'/$1-viewer.js?v=591');
 const at=html.indexOf('<script');return html.slice(0,at)+'<script data-section-dimensions="v591">window.rafexAccessoryText591='+translateAccessoryText591.toString()+';</script>'+html.slice(at);
}
if(/[\\/]section-dimensions-language-v591\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}

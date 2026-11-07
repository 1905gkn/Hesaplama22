import fs from 'node:fs';
import {build} from 'esbuild';
const calculation=await build({stdin:{contents:"import {mekikStepped} from './client/mekik-stepped.mjs';import {driveStepped} from './client/drive-stepped.mjs';import {mekikSideMetrics} from './client/mekik-side-metrics.mjs';Object.assign(window,{rafexMekikSteppedV514:mekikStepped,rafexDriveSteppedV521:driveStepped,rafexMekikSideMetricsV518:mekikSideMetrics});",resolveDir:process.cwd()},bundle:true,format:'iife',target:'es2022',minify:true,write:false});
export function transform(s){s=s.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=531');if(!s.includes('data-rack-calculations="v531"'))s=s.replace(/<head([^>]*)>/i,'<head$1><script data-rack-calculations="v531">'+calculation.outputFiles[0].text+'</script>');return s;}
if(/[\\/]preparation-v531\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');
 if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}
 fs.writeFileSync(file,s);console.log('PASS responsive scene preparation v531: '+file);
}

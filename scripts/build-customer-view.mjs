import fs from 'node:fs';import {build} from 'esbuild';import vm from 'node:vm';
for(const [entry,out] of [['customer-view.entry.js','customer-view.js'],['customer-share-capture.entry.js','customer-share-capture.js']]){const result=await build({entryPoints:['client/'+entry],bundle:true,format:'iife',minify:true,target:'es2022',write:false});new vm.Script(result.outputFiles[0].text);fs.writeFileSync('dist/'+out,result.outputFiles[0].text);}
fs.copyFileSync('client/customer-view.css','dist/customer-view.css');console.log('PASS customer viewer and capture bundles emitted.');

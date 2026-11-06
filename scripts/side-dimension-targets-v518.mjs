import fs from 'node:fs';import vm from 'node:vm';import {mekikSideMetrics} from '../client/mekik-side-metrics.mjs';
export function transform(html){
 if(html.includes('data-side-metrics="v518"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v518 missing '+a.slice(0,100));html=html.replaceAll(a,b);};
 replace('const railLengthMm = Math.max(1, Number(drawing?.railLength) || 1),','const sideMetrics=window.rafexMekikSideMetricsV518(drawing,stepped),railLengthMm = Math.max(1, Number(drawing?.railLength) || 1),');
 replace('rackHeightMm = stepped?.height||Math.ceil(Math.max(topRailHeightMm,Number(drawing?.sideUprightHeight)||topRailHeightMm+loadHeightMm/2)/50)*50,','rackHeightMm = sideMetrics.uprightHeight,');
 replace('topLoadHeightMm = topRailHeightMm + loadHeightMm,','topLoadHeightMm = sideMetrics.topLoadHeight,');
 replace('contentTopHeightMm = Math.max(rackHeightMm, topLoadHeightMm),','contentTopHeightMm = sideMetrics.contentHeight,');
 replace('marginX = Math.max(85, baseWidthMm * .75),','marginX = sideMetrics.marginX,');
 replace('marginTop = 45,\n          marginBottom = 95,','marginTop = sideMetrics.marginTop,\n          marginBottom = sideMetrics.marginBottom,');
 replace('const elevation = (mode) => {','const elevation = (mode) => {const sideMetrics=window.rafexMekikSideMetricsV518(m2LastDrawing,m2LastDrawing?.mekikCustomizationV514?window.rafexMekikSteppedV514(m2LastDrawing):null);');
 replace('window.rafexNativeSideSection=function(d){','window.rafexNativeSideSection=function(d){const sideMetrics=window.rafexMekikSideMetricsV518(d,d.mekikCustomizationV514?window.rafexMekikSteppedV514(d):null);');
 replace('sideUprightHeight=d.sideUprightHeight,totalRackHeight=d.totalRackHeight,','sideUprightHeight=sideMetrics.uprightHeight,totalRackHeight=d.totalRackHeight,');
 replace('sideMarginX = Math.max(85, sideUprightWidth * 1.7 * .75),','sideMarginX = sideMetrics.marginX,');
 replace('sideMarginTop = 90, sideMarginBottom = 110,','sideMarginTop = sideMetrics.marginTop, sideMarginBottom = sideMetrics.marginBottom,');
 replace('sideContentHeightMm = Math.max(sideUprightHeight, totalRackHeight),','sideContentHeightMm = sideMetrics.contentHeight,');
 replace('topLoadHeight = firstRailHeight+(levels-1)*levelH+palletHeight,','topLoadHeight = sideMetrics.topLoadHeight,');
 const code='<script data-side-metrics="v518">window.rafexMekikSideMetricsV518='+mekikSideMetrics.toString()+';</script>';const at=html.indexOf('<script');if(at<0)throw Error('Missing first script');html=html.slice(0,at)+code+html.slice(at);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]side-dimension-targets-v518\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing server HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS side measurement targets v518: '+file);}

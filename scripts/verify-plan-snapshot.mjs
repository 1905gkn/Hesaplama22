import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform as margin} from './patch-pdf-layout-margin-v140.mjs';
import {transform as fit} from './patch-pdf-tight-fit-v141.mjs';
import {transform} from './patch-plan-snapshot.mjs';
import {freezePlanPaint} from './plan-snapshot.mjs';

const runtime=name=>fs.readFileSync('scripts/'+name,'utf8').replaceAll('\r\n','\n').match(/const runtime = String.raw`([\s\S]*?)`;/)[1];
const upright=runtime('patch-pdf-upright-visibility-v129.mjs');
const paint=runtime('patch-common-drawing-upright-5010-v57.mjs');
let html=fs.readFileSync('portal.html','utf8').replaceAll('\r\n','\n').replace('</body>',paint+upright+'</body>');
html=transform(fit(margin(html)));
assert.equal(transform(html),html);
assert(html.includes('if(svg.hasAttribute("data-rafex-live-snapshot"))return'));
assert(html.includes('if(pdfSvg.hasAttribute("data-rafex-live-snapshot"))return'));
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);

const guardedUpright=html.match(/<script data-rafex-pdf-upright-visibility="v132">[\s\S]*?<\/script>/)[0];
const rows=[false,true].map((double,row)=>`<g data-rack="${row}" transform="translate(10 ${10+row*45})">${Array.from({length:8},(_,i)=>`<g transform="translate(${i*35} 0)"><rect class="m2-b2b-plan-pallet" x="2" y="0" width="31" height="${double?26:13}"/>${[8,16,24].map(x=>`<path class="m2-b2b-plan-pallet-line" d="M${x} 0v${double?26:13}"/>`).join('')}<rect class="m2-b2b-plan-upright" x="0" y="0" width="2" height="${double?26:13}"/></g>`).join('')}</g>`).join('');
const fixture=`<!doctype html><meta charset="utf-8"><title>Üst görünüm aktarım kontrolü</title><style>body{font:16px Arial}svg{background:#fafafa;display:block}#m2LayoutSvg .m2-b2b-plan-pallet{fill:#c78330;stroke:#4b2809;stroke-width:1.5px;vector-effect:non-scaling-stroke}#m2LayoutSvg .m2-b2b-plan-pallet-line{stroke:#704018;stroke-width:.95px;vector-effect:non-scaling-stroke}iframe{width:500px;height:170px;border:0}</style><div id="page"><h2>Serbest yerleşim</h2><svg id="m2LayoutSvg" width="960" viewBox="0 0 300 95">${rows}</svg><h2>Çıktı önizlemesi — yarı ölçek</h2><div id="preview"></div><h2>PDF içeriği — bağımsız sayfa</h2><iframe id="pdf"></iframe><p id="result"></p></div>${upright.match(/<style[\s\S]*?<\/style>/)[0]}${guardedUpright}<script>
const freeze=${freezePlanPaint.toString()};
const source=document.getElementById('m2LayoutSvg');rafexPdfUprightVisibilityV132.enhance(source);
const clone=freeze(source,source.cloneNode(true));clone.removeAttribute('id');clone.setAttribute('width','480');document.getElementById('preview').appendChild(clone);
const frozen=clone.outerHTML;rafexPdfUprightVisibilityV132.enhance(clone);if(clone.outerHTML!==frozen)throw Error('Frozen export repainted');document.getElementById('pdf').srcdoc=clone.outerHTML;
const checks=[];const original=source.querySelectorAll('path,rect'),copied=clone.querySelectorAll('path,rect');
original.forEach((node,i)=>{const target=copied[i],a=getComputedStyle(node),b=getComputedStyle(target),m=node.getScreenCTM(),n=target.getScreenCTM(),scale=x=>Math.sqrt(Math.abs(x.a*x.d-x.b*x.c));const live=parseFloat(a.strokeWidth)*(a.vectorEffect==='non-scaling-stroke'?1:scale(m));const printed=parseFloat(b.strokeWidth)*scale(n);checks.push(Math.abs(printed/live-.5)<.001&&a.fill===b.fill&&a.stroke===b.stroke&&b.vectorEffect==='none')});
document.getElementById('result').textContent=checks.every(Boolean)?'PASS: '+checks.length+' ayak/palet/çizgi aynı renk ve yarı ölçekte':'FAIL';
</script>`;
fs.mkdirSync('outputs/plan-snapshot',{recursive:true});fs.writeFileSync('outputs/plan-snapshot/index.html',fixture);
console.log('PASS: real export anchors, repaint guards, idempotence and inline syntax. Browser fixture ready.');

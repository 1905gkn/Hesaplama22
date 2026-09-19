import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-workflow-'));
fs.mkdirSync(path.join(dir,'dist/server'),{recursive:true});
const file=path.join(dir,'dist/server/index.js');
const fixture=`<!doctype html><html><head><meta charset="utf-8"><title>Workflow fixture</title></head><body><script>const exportDocument='</body>';</script>
<nav id="nav"><button data-page="free">Ortak Çizim</button></nav>
<main id="page" class="rafex-common-independent" data-rafex-common-active="1">
<h1>ORTAK ÇİZİM</h1><section id="rafexUnifiedSystemPicker">B2B · MR · Mekik · Drive-In · Konsol Kollu</section>
<section class="rafex-common-project-name-wrap">Test projesi</section>
<div class="m2-layout"><h2>Raf Ölçüleri</h2><input aria-label="Palet sayısı" value="3"></div>
<div class="rafex-b2b-mekik-savebar"><button id="m2SaveRackButton">Raf Tipini Kaydet</button></div>
<div class="rafex-free-shortcuts">Çizim kısayolları</div>
<section class="m2-floor-editor"><div id="m2WallEditor">Duvar ölçüleri</div>
<div id="m2SavedTypesPanel"><h3>Kayıtlı Raf Tipleri</h3><div id="m2SavedTypeList"><button>A · B2B</button><button>B · MR</button></div></div>
<h3>Yerleşim çizimi</h3><div><svg id="m2LayoutSvg" width="300" height="100"><rect id="testRack" x="20" y="10" width="80" height="40" fill="green"/></svg></div>
<div id="m2LayoutProductList">Ürün listesi</div><button id="m2SectionPlacementButton">Kesit Yer Belirleme</button><button id="m2ProjectSaveButton">Projeyi Kaydet</button><button>PDF Oluştur</button></section></main></body></html>`;
fs.writeFileSync(file,"const HTML_BASE64='"+Buffer.from(fixture).toString('base64')+"';");
const patch=path.resolve('scripts/patch-common-workflow-screens.mjs');
execFileSync(process.execPath,[patch],{cwd:dir});
const once=fs.readFileSync(file,'utf8');execFileSync(process.execPath,[patch],{cwd:dir});
assert.equal(fs.readFileSync(file,'utf8'),once,'Patch must be idempotent');
const html=Buffer.from(once.match(/HTML_BASE64='([^']+)'/)[1],'base64').toString();
assert.equal(html.split('id="m2SavedTypesPanel"').length-1,1);
assert(html.includes('Serbest Yerleşim Alanı'));assert(html.includes('Raf Tipi Oluşturmaya Dön'));
assert(html.includes('#mrSaveRackButton, #rafexKonsolCommonSaveRack'));
assert(!html.includes('cloneNode('),'Catalog must not be cloned');
for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
if(process.argv.includes('--fixture')){fs.mkdirSync('.workflow-test',{recursive:true});fs.writeFileSync('.workflow-test/index.html',html);}
console.log('PASS: idempotent injection, single catalog, five-system save routing and valid runtime.');

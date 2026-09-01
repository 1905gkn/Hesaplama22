import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('Common Mekik front GLB: HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
if (html.includes('data-rafex-common-mekik-front-glb="v1"')) {
  console.log('Common Mekik front GLB v1 already present.');
  process.exit(0);
}

const oldBranch = /if\(sys==='mekik2'\)\{\s*const front=typeof m2ReportElevationSvg==='function'\?m2ReportElevationSvg\(d,'front',true\):'';const side=typeof m2ReportElevationSvg==='function'\?m2ReportElevationSvg\(d,'side',true\):'';\s*body\.innerHTML=metaHtml\(entry,sys\)\+'<div class="rafex-free-info-views mekik-only">'\+\(front\?'<div class="rafex-free-info-view"><strong>ÖNDEN GÖRÜŞ<\/strong>'\+front\+'<\/div>':''\)\+\(side\?'<div class="rafex-free-info-view"><strong>YAN GÖRÜŞ<\/strong>'\+side\+'<\/div>':''\)\+'<\/div>';return;\s*\}/;
if (!oldBranch.test(html)) throw new Error('Common Mekik front GLB: eski Ortak Cizim Mekik bilgi blogu bulunamadi.');

const newBranch = `if(sys==='mekik2'){
        const side=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'side',true):'';
        body.innerHTML=metaHtml(entry,sys)+'<div class="rafex-free-info-views mekik-only" data-rafex-common-mekik-front-glb="v1"><div class="rafex-free-info-view"><strong>ÖNDEN GÖRÜŞ · GLB</strong><div class="rafex-common-mekik-front-host" style="position:relative;height:390px;min-height:320px;overflow:hidden;background:#f7faf8;border-radius:8px;margin-top:6px"><canvas class="rafex-common-mekik-front-canvas" style="display:block;width:100%;height:100%" aria-label="Mekik son GLB ön görünüşü"></canvas><span class="rafex-common-mekik-front-status" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;padding:8px 11px;border-radius:7px;background:#173c2d;color:#fff;font:800 11px Arial,sans-serif">GLB ön görünüş hazırlanıyor…</span></div></div>'+(side?'<div class="rafex-free-info-view"><strong>YAN GÖRÜŞ</strong>'+side+'</div>':'')+'</div>';
        const canvas=body.querySelector('.rafex-common-mekik-front-canvas');
        const status=body.querySelector('.rafex-common-mekik-front-status');
        const create=window.RafexMekikFrontViewer?.createDetached;
        if(typeof create!=='function'){if(status){status.textContent='Mekik GLB ön görünüş motoru hazır değil.';status.style.background='#8d2020'}return;}
        const detached=create(canvas,d,status);
        if(token!==activeInfoToken){detached?.destroy?.();return;}
        activeInfoViewer=detached;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{try{detached?.fit?.(true);detached?.render?.()}catch{}}));
        return;
      }`;

html = html.replace(oldBranch, newBranch);
if (!html.includes('data-rafex-common-mekik-front-glb="v1"')) throw new Error('Common Mekik front GLB: yeni runtime eklenemedi.');
if (!html.includes('RafexMekikFrontViewer?.createDetached')) throw new Error('Common Mekik front GLB: detached API baglantisi eklenemedi.');

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Ortak Cizim Mekik bilgi penceresi son GLB on gorunusune baglandi (v1).');

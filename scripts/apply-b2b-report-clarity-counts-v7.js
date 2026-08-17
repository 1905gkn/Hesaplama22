const fs = require('node:fs');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`${label} bulunamadi.`);
  return source.replace(from, to);
}

// 1) Kurumsal rapor: on gorunus buyuk, yan gorunus dar; iki gorunus de tamamen kadraja sigar.
const sectionsPath = 'client/b2b-report-sections.js';
let sections = fs.readFileSync(sectionsPath, 'utf8');
sections = sections.replaceAll('corporate-type-sections-v6', 'corporate-type-sections-v9');
sections = sections.replaceAll('__rafexAdaptiveReportZoomV6', '__rafexAdaptiveReportZoomV9');
sections = sections.replaceAll('__rafexTechnicalTypesV6', '__rafexTechnicalTypesV9');
sections = sections.replaceAll('__rafexCombinedTypesV6', '__rafexCombinedTypesV9');
sections = replaceRequired(
  sections,
  'width: isReportCapture ? 1500 : settings.width,\n        height: isReportCapture ? 3000 : settings.height,',
  'width: isReportCapture ? 3600 : settings.width,\n        height: isReportCapture ? 3000 : settings.height,\n        pixelRatio: isReportCapture ? Math.max(2.5, num(settings.pixelRatio, 1)) : settings.pixelRatio,',
  'rapor capture cozumunurlugu',
);
sections = replaceRequired(
  sections,
  '.rafex-combined-type-page .rafex-combined-type-card {display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;',
  '.rafex-combined-type-page .rafex-combined-type-card {display:grid!important;grid-template-columns:minmax(0,7fr) minmax(0,3fr)!important;',
  'sayfa alani on yan 70 30 kolon orani',
);
sections = replaceRequired(
  sections,
  '.rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame img {display:block!important;width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center center!important}',
  '.rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame img {display:block!important;width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center center!important;image-rendering:auto!important;transform-origin:center center!important}\n      .rafex-combined-type-page .rafex-front-view>.rafex-report-3d-frame{justify-content:center!important;align-items:center!important;overflow:hidden!important}\n      .rafex-combined-type-page .rafex-front-view>.rafex-report-3d-frame img{transform:scale(1.28)!important}\n      .rafex-combined-type-page .rafex-side-view>.rafex-report-3d-frame{justify-content:center!important;align-items:center!important;overflow:hidden!important}\n      .rafex-combined-type-page .rafex-side-view>.rafex-report-3d-frame img{height:100%!important;width:auto!important;max-width:none!important;max-height:100%!important;object-fit:contain!important;object-position:center center!important;transform:scale(2.35)!important}',
  'rapor tam sigdirma ve merkezleme css',
);
fs.writeFileSync(sectionsPath, sections);

// 2) On ve yan gorunusu ayni fiziksel yukseklik olceginde yakala.
const report3dPath = 'client/b2b-report-3d.js';
let report3d = fs.readFileSync(report3dPath, 'utf8');
report3d = report3d.replaceAll('front-side-capture-v35', 'front-side-capture-v38');
const oldCapture = `      const result = await capture(options, {
        width: 2800,
        height: 2400,
        pixelRatio: 2.25,
        cameraPadding: adaptiveCameraPadding(drawing),
        frontDimensions: { levels: true, markers: true, eye: true, width: false, depth: false },
        sideDimensions: { levels: false, markers: false, eye: false, width: false, depth: true },
        side: "right",
      });
      if (!result?.front || !result?.side) throw new Error("B2B 3D ön/yan görüntüsü oluşturulamadı.");
      const cached = { front: result.front, side: result.side };`;
const newCapture = `      const sharedPadding = adaptiveCameraPadding(drawing);
      const frontResult = await capture(options, {
        width: 1800,
        height: 3000,
        pixelRatio: 2.75,
        cameraPadding: sharedPadding,
        frontDimensions: { levels: true, markers: true, eye: true, width: false, depth: false },
        sideDimensions: { levels: false, markers: false, eye: false, width: false, depth: true },
        side: "right",
      });
      const sideResult = await capture(options, {
        width: 900,
        height: 3000,
        pixelRatio: 2.75,
        cameraPadding: sharedPadding,
        frontDimensions: { levels: true, markers: true, eye: true, width: false, depth: false },
        sideDimensions: { levels: false, markers: false, eye: false, width: false, depth: true },
        side: "right",
      });
      if (!frontResult?.front || !sideResult?.side) throw new Error("B2B 3D ön/yan görüntüsü oluşturulamadı.");
      const cached = { front: frontResult.front, side: sideResult.side };`;
report3d = replaceRequired(report3d, oldCapture, newCapture, 'ortak fiziksel olcek capture');
fs.writeFileSync(report3dPath, report3d);

// 3) Aksesuar adetlerini mevcut Ayak / duz arabag sayim listesinin icine ekle.
const accessoriesPath = 'client/b2b-accessories.js';
let accessories = fs.readFileSync(accessoriesPath, 'utf8');
const injection = `

  function rafexAccessoryCountTotals() {
    const totals = { palletStop: 0, hTraverse: 0, tray: 0 };
    const clear = sectionWidth();
    cloneState().forEach((item) => {
      const levelCount = new Set((item.levels || []).map(Number).filter(Number.isFinite)).size;
      if (!levelCount) return;
      if (item.type === 'tray') {
        const plan = trayPlan(clear, item.width);
        const piecesPerLevel = (plan.pieces || []).reduce((sum, piece) => sum + Math.max(0, Number(piece.count) || 0), 0);
        totals.tray += piecesPerLevel * levelCount;
      } else if (item.type === 'hTraverse') {
        totals.hTraverse += levelCount;
      } else if (item.type === 'palletStop') {
        totals.palletStop += levelCount;
      }
    });
    return totals;
  }

  function rafexRenderAccessoryCounts() {
    const host = document.getElementById('m2Parts');
    if (!host) return;
    const totals = rafexAccessoryCountTotals();
    const signature = [totals.tray, totals.hTraverse, totals.palletStop].join('|');
    const existing = host.querySelectorAll('[data-b2b-accessory-count]');
    if (host.dataset.b2bAccessoryCountSignature === signature && existing.length === 3) return;
    existing.forEach((node) => node.remove());
    host.dataset.b2bAccessoryCountSignature = signature;
    const rows = [
      ['Tava', totals.tray],
      ['H Travers', totals.hTraverse],
      ['Palet Dayama', totals.palletStop],
    ];
    host.insertAdjacentHTML('beforeend', rows.map(([label, count]) => '<div class="m2-part" data-b2b-accessory-count="1"><span>' + label + '</span><b>' + Number(count).toLocaleString('tr-TR') + ' adet</b></div>').join(''));
  }

  function rafexInstallAccessoryCountObserver() {
    if (window.__rafexAccessoryCountObserver) return;
    window.__rafexAccessoryCountObserver = new MutationObserver(() => rafexRenderAccessoryCounts());
    window.__rafexAccessoryCountObserver.observe(document.body, { childList: true, subtree: true });
    rafexRenderAccessoryCounts();
  }

  setTimeout(rafexInstallAccessoryCountObserver, 0);
`;
if (!accessories.includes('function rafexAccessoryCountTotals()')) {
  const end = accessories.lastIndexOf('})();');
  if (end < 0) throw new Error('b2b-accessories kapanis noktasi bulunamadi.');
  accessories = accessories.slice(0, end) + injection + '\n' + accessories.slice(end);
}
accessories = accessories.replace("const VERSION = 'b2b-accessories-v6';", "const VERSION = 'b2b-accessories-v9';");
fs.writeFileSync(accessoriesPath, accessories);

console.log('B2B rapor tam kadraj, 70/30 yerlesim, ortak on/yan yukseklik ve aksesuar sayim satirlari uygulandi.');

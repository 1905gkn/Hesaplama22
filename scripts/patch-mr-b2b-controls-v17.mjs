import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

if (portal.includes('data-rafex-mr-b2b-v17="1"')) {
  console.log("MR v17 zaten uygulanmis.");
  process.exit(0);
}

// Yeni MR bundle her production deploy'da tarayici cache'ini kirsin.
portal = portal.replace(/\/mr-viewer\.js\?v=mr-system-\d+/g, "/mr-viewer.js?v=mr-system-17");

const marker = "      const mrRenderBeforeV5=renderMR;";
if (!portal.includes(marker)) throw new Error("MR v17: renderMR marker bulunamadi");

const helpers = `      const mrRenderBeforeV5=renderMR;
      const mrUpdateSummaryV17Base=mrUpdateSummary;
      window.mrOpenMeasureDialogV17=(id)=>{const dialog=$(id);if(dialog&&!dialog.open)dialog.showModal()};
      window.mrRefreshMeasureUiV17=()=>{const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4))),first=Math.max(0,Number($("mrFirstTraverse")?.value)||0),gap=Math.max(100,Number($("mrLevelGap")?.value)||1000),top=first+Math.max(0,levels-1)*gap,topInput=$("mrTopTraverseEditV17"),buttonValue=$("mrMeasureButtonValueV17");if(topInput&&document.activeElement!==topInput)topInput.value=String(Math.round(top));if(buttonValue)buttonValue.textContent=\`K1 ${'${fmt(first)}'} · KAT ${'${fmt(gap)}'} · SON ${'${fmt(top)}'} mm\`};
      window.mrApplyTopTraverseV17=()=>{const source=$("mrTopTraverseEditV17"),levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4))),top=Math.max(0,Number(source?.value)||0),firstInput=$("mrFirstTraverse"),gapInput=$("mrLevelGap");if(!source||!firstInput||!gapInput)return;if(levels<=1){firstInput.value=String(Math.round(top/10)*10);firstInput.dispatchEvent(new Event("input",{bubbles:true}));return}const first=Math.max(0,Number(firstInput.value)||0),gap=Math.max(100,Math.round(((top-first)/(levels-1))/10)*10);gapInput.value=String(gap);gapInput.dispatchEvent(new Event("input",{bubbles:true}))};
      window.mrUpgradeMeasureUiV17=()=>{const page=$("page"),canvasWrap=page?.querySelector(".mr-canvas-wrap");if(!canvasWrap||$("mrMeasureSettingsDialogV17"))return;canvasWrap.insertAdjacentHTML("beforeend",\`<div class="mr-measure-controls-v17"><button class="mr-measure-button-v17" type="button" onclick="mrOpenMeasureDialogV17('mrMeasureSettingsDialogV17')">ÖLÇÜLER VE MESAFELER<small id="mrMeasureButtonValueV17"></small></button><button class="mr-measure-button-v17" type="button" onclick="mrOpenMeasureDialogV17('mrDimensionVisibilityDialogV17')">ÖLÇÜLERİ GÖSTER / GİZLE</button></div><dialog id="mrMeasureSettingsDialogV17" class="mr-measure-dialog-v17"><div class="mr-measure-dialog-head-v17"><h3>Ölçüler ve Mesafeler</h3><p>MR rafının temel ölçülerini 3D alanından çıkmadan düzenleyin. 3D üzerindeki ölçü etiketlerine tıklayınca ilgili alan açılır.</p></div><div class="mr-measure-dialog-body-v17" id="mrMeasureFieldsV17"></div><div class="mr-measure-dialog-actions-v17"><button type="button" onclick="this.closest('dialog').close()">Kapat</button></div></dialog><dialog id="mrDimensionVisibilityDialogV17" class="mr-measure-dialog-v17"><div class="mr-measure-dialog-head-v17"><h3>3D Ölçü Görünürlüğü</h3><p>Görmek istediğiniz ölçü gruplarını açıp kapatın.</p></div><div class="mr-measure-dialog-body-v17 mr-dimension-options-v17" id="mrDimensionFieldsV17"></div><div class="mr-measure-dialog-actions-v17"><button type="button" onclick="this.closest('dialog').close()">Kapat</button></div></dialog>\`);const fields=$("mrMeasureFieldsV17"),dimensionFields=$("mrDimensionFieldsV17"),legacy=$("mrMeasureOverlay");if(!fields||!dimensionFields)return;const moveLabel=(id,target=fields)=>{const element=$(id),label=element?.closest("label");if(label)target.appendChild(label)};moveLabel("mrFirstTraverse");moveLabel("mrLevelGap");fields.insertAdjacentHTML("beforeend",\`<label class="mr-derived-top-field-v17">Son travers kotu (mm)<input id="mrTopTraverseEditV17" type="number" min="0" max="30000" step="10" value="0"></label>\`);moveLabel("mrHeight");moveLabel("mrSectionWidth");moveLabel("mrDepth");const summary=$("mrDistanceSummary");if(summary){summary.classList.add("mr-distance-summary-v17");fields.appendChild(summary)}const checks=legacy?.querySelector(".mr-dimension-checks");if(checks)dimensionFields.appendChild(checks);moveLabel("mrDimensionScale",dimensionFields);legacy?.remove();const topInput=$("mrTopTraverseEditV17");if(topInput)topInput.addEventListener("change",mrApplyTopTraverseV17);mrRefreshMeasureUiV17()};
      mrUpdateSummary=function(refresh3d=false){const result=mrUpdateSummaryV17Base(refresh3d);mrRefreshMeasureUiV17();return result};`;
portal = portal.replace(marker, helpers);

// 3D etiketine tiklayinca B2B'deki gibi modal olcu penceresi acilsin.
const openStart = portal.indexOf('      window.mrOpenMeasureV12=(key="")=>');
const renderStart = portal.indexOf('      renderMR=function(){', openStart);
if (openStart < 0 || renderStart < 0) throw new Error("MR v17: olcu tiklama blogu bulunamadi");
const openMeasure = `      window.mrOpenMeasureV12=(key="")=>{mrUpgradeMeasureUiV17();const dialog=$("mrMeasureSettingsDialogV17");if(dialog&&!dialog.open)dialog.showModal();const target={firstTraverse:"mrFirstTraverse",levelGap:"mrLevelGap",uprightHeight:"mrHeight",width:"mrSectionWidth",depth:"mrDepth"}[key];if(target)setTimeout(()=>{const input=$(target);input?.scrollIntoView?.({behavior:"smooth",block:"center"});input?.focus?.();input?.select?.()},60)};\n`;
portal = portal.slice(0, openStart) + openMeasure + portal.slice(renderStart);

// Eski details paneli olusturulsa bile render sonunda B2B tarzi kontrollere donustur.
const tail = 'page.onclick=(event)=>{const view=event.target.closest?.("[data-mr-view]");if(view)mrSetView(view.dataset.mrView)};mrUpdateSummary();mrSyncLayoutDrawingV4(false);requestAnimationFrame(mrMountViewer)';
const tailV17 = 'page.onclick=(event)=>{const view=event.target.closest?.("[data-mr-view]");if(view)mrSetView(view.dataset.mrView)};mrUpgradeMeasureUiV17();mrUpdateSummary();mrSyncLayoutDrawingV4(false);requestAnimationFrame(mrMountViewer)';
if (!portal.includes(tail)) throw new Error("MR v17: render sonu bulunamadi");
portal = portal.replace(tail, tailV17);

const style = `<style data-rafex-mr-b2b-v17="1">
.mr-mode .mr-measure-overlay{display:none!important}
.mr-mode .mr-canvas-wrap{position:relative!important}
.mr-mode .mr-measure-controls-v17{position:absolute;z-index:8;top:190px;right:14px;width:250px;display:grid;justify-items:end;gap:7px;pointer-events:auto}
.mr-mode .mr-measure-button-v17{width:auto;max-width:250px;padding:8px 10px;border:1px solid #d9a600;border-radius:7px;background:#fff8d5;color:#4b3100;box-shadow:0 5px 16px #21070d20;font-size:9px;font-weight:900;text-align:right}
.mr-mode .mr-measure-button-v17:hover{background:#f2c500}
.mr-mode .mr-measure-button-v17 small{display:block;margin-top:3px;color:#765e00;font-size:8px;font-weight:800;white-space:normal}
.mr-measure-dialog-v17{width:min(660px,calc(100vw - 32px));padding:0;border:1px solid #d7ddd9;border-radius:14px;background:#fff;color:#26312b;box-shadow:0 24px 70px #173c2d55}
.mr-measure-dialog-v17::backdrop{background:#10251b66;backdrop-filter:blur(2px)}
.mr-measure-dialog-head-v17{padding:18px 20px 14px;border-bottom:1px solid #e2e7e3;background:#f8faf8}
.mr-measure-dialog-head-v17 h3{margin:0 0 6px;color:#173c2d;font-size:18px}
.mr-measure-dialog-head-v17 p{margin:0;color:#68736c;font-size:11px;line-height:1.5}
.mr-measure-dialog-body-v17{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:18px 20px}
.mr-measure-dialog-body-v17>label{display:grid;gap:6px;min-width:0;margin:0!important;color:#536058;font-size:10px;font-weight:800}
.mr-measure-dialog-body-v17 input[type=number],.mr-measure-dialog-body-v17 select{width:100%!important;min-width:0!important;min-height:40px!important;margin:0!important;padding:9px 10px!important;border:1px solid #d8e1db!important;border-radius:8px!important;background:#fff!important;color:#17201b!important;font-weight:850!important}
.mr-measure-dialog-body-v17 input[type=range]{width:100%}
.mr-measure-dialog-actions-v17{display:flex;justify-content:flex-end;padding:12px 20px 18px;border-top:1px solid #edf0ed}
.mr-measure-dialog-actions-v17 button{background:#214f3b;color:#fff;min-width:100px}
.mr-mode .mr-derived-top-field-v17{min-width:0!important}
.mr-mode .mr-distance-summary-v17{grid-column:1/-1!important;display:block!important;padding:9px 10px!important;border-radius:8px!important;background:#eef3ef!important;color:#365245!important;font-size:10px!important;line-height:1.5!important}
.mr-dimension-options-v17 .mr-dimension-checks{grid-column:1/-1;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
.mr-dimension-options-v17 .mr-dimension-checks label{display:flex!important;align-items:center!important;gap:7px!important;min-width:0!important}
.mr-mode .mr-profile-field{min-width:0!important}
.mr-mode .mr-profile-field select{width:100%!important;min-width:0!important;min-height:40px!important;padding:8px 9px!important;border:1px solid #d8dfda!important;border-radius:8px!important;background:#fff!important;color:#17201b!important;font-weight:800!important}
.mr-mode .mr-profile-field small{display:block;margin-top:5px;color:#718078;font-size:9px;line-height:1.35}
@media(max-width:900px){.mr-mode .mr-measure-controls-v17{top:146px;right:8px;width:220px}.mr-mode .mr-measure-button-v17{max-width:220px}.mr-measure-dialog-body-v17{grid-template-columns:1fr}}
@media(max-width:600px){.mr-mode .mr-measure-controls-v17{top:auto;bottom:12px;left:8px;right:8px;width:auto;grid-template-columns:1fr 1fr;justify-items:stretch}.mr-mode .mr-measure-button-v17{width:100%;max-width:none;text-align:center}.mr-dimension-options-v17 .mr-dimension-checks{grid-template-columns:1fr!important}}
</style>`;
const headEnd = portal.indexOf("</head>");
if (headEnd < 0) throw new Error("MR v17: head kapanisi bulunamadi");
portal = portal.slice(0, headEnd) + style + "\n  " + portal.slice(headEnd);

fs.writeFileSync(portalPath, portal);
console.log("MR v17: B2B tipi 3D olcu dialoglari, normal olcu alanlari ve profil secim UI uygulandi.");

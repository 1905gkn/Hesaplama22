import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim nav: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html
  .replace(/<script\s+data-rafex-free-nav-ortak="v39">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-layout-system-switch="v40">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-ortak-switch-ux="v41">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-b2b-remount="v42">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-editor-preserve="v43">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-layout-persistence="v37">[\s\S]*?<\/script>/g, "");

const staticFrontWrite = '$("m2Front").innerHTML = elevation("front");';
const b2b3DOnlyWrite = 'if (m2ActiveModule !== "b2b") $("m2Front").innerHTML = elevation("front");';
if (html.includes(staticFrontWrite)) html = html.replace(staticFrontWrite, b2b3DOnlyWrite);
if (!html.includes(b2b3DOnlyWrite)) throw new Error("B2B 3D-only: statik on gorunus yazimi devre disi birakilamadi");

html = html.replace(
  'if (frontTab) frontTab.textContent = "3D / Önden Görünüş";',
  'if (frontTab) frontTab.textContent = "3D Görünüş";'
);
html = html.replace(
  `<button type="button" onclick="b2bSet3DCamera('front')">Önden</button>`,
  ""
);

const commonHelperAnchor = "      function m2ActivateModule(moduleName) {";
const commonHelpers = `      function m2CommonDrawingActive() {
        const page = document.getElementById("page");
        return Boolean(page && (page.dataset.rafexFreeDrawing === "1" || page.classList.contains("rafex-free-drawing-page")));
      }
      const m2CommonDrawingStateKeys = [
        "layoutState", "layoutZoom", "pinnedDimensions", "pinnedDimensionsByRack",
        "savedRackTypes", "selectedSavedType", "projectRecords", "dimensionOffsets",
        "dimensionFontSizes", "selectedDimensionKey", "userNotes", "selectedNoteId",
        "hiddenSummaryDimensions", "visibleRackDimensions", "showSharedFootLabels",
        "reportImages", "edgeEditorVisible", "freeMeasure", "layoutSymbols",
        "selectedSymbolId", "manualPlan", "manualPlanRows"
      ];
      function m2MergeCommonDrawingState(target, source) {
        m2CommonDrawingStateKeys.forEach((key) => { target[key] = source[key]; });
        return target;
      }
`;
if (!html.includes("function m2CommonDrawingActive()")) {
  if (!html.includes(commonHelperAnchor)) throw new Error("Ortak Cizim: m2ActivateModule bulunamadi");
  html = html.replace(commonHelperAnchor, commonHelpers + commonHelperAnchor);
}

const initOpen = `      function m2InitLayoutEditor() {
        const svg = $("m2LayoutSvg");
        if (!svg) return;`;
const initOpenShared = initOpen + `
        const __rafexCommonState = m2CommonDrawingActive() ? m2CaptureModuleState() : null;`;
if (!html.includes("__rafexCommonState = m2CommonDrawingActive()")) {
  if (!html.includes(initOpen)) throw new Error("Ortak Cizim: m2InitLayoutEditor baslangici bulunamadi");
  html = html.replace(initOpen, initOpenShared);
}

const rectangleInitAnchor = `        m2CreateRectangle();
        m2ZoomLayout(0, true);`;
const rectangleInitShared = `        if (m2CommonDrawingActive()) m2RenderLayout();
        else {
          m2CreateRectangle();
          m2ZoomLayout(0, true);
        }`;
if (!html.includes("if (m2CommonDrawingActive()) m2RenderLayout();")) {
  if (!html.includes(rectangleInitAnchor)) throw new Error("Ortak Cizim: kosulsuz alan olusturma noktasi bulunamadi");
  html = html.replace(rectangleInitAnchor, rectangleInitShared);
}

const keyHandlerAnchor = '        if (m2LayoutKeyHandler) document.removeEventListener("keydown", m2LayoutKeyHandler);';
const sharedRestore = '        if (__rafexCommonState) m2RestoreModuleState(m2MergeCommonDrawingState(m2CaptureModuleState(), __rafexCommonState));\n' + keyHandlerAnchor;
if (!html.includes("m2RestoreModuleState(m2MergeCommonDrawingState(m2CaptureModuleState(), __rafexCommonState))")) {
  if (!html.includes(keyHandlerAnchor)) throw new Error("Ortak Cizim: editor baglama noktasi bulunamadi");
  html = html.replace(keyHandlerAnchor, sharedRestore);
}

const activateStart = `      function m2ActivateModule(moduleName) {
        if (!m2ModuleStates[m2ActiveModule])`;
const activateStartShared = `      function m2ActivateModule(moduleName) {
        const __rafexCommonState = m2CommonDrawingActive() ? m2CaptureModuleState() : null;
        if (!m2ModuleStates[m2ActiveModule])`;
if (!html.includes("function m2ActivateModule(moduleName) {\n        const __rafexCommonState")) {
  if (!html.includes(activateStart)) throw new Error("Ortak Cizim: modul gecis baslangici bulunamadi");
  html = html.replace(activateStart, activateStartShared);
}

const activateRestore = `        if (!m2ModuleStates[moduleName]) m2ModuleStates[moduleName]=m2FreshModuleState();
        m2RestoreModuleState(m2ModuleStates[moduleName]);`;
const activateRestoreShared = `        if (!m2ModuleStates[moduleName]) m2ModuleStates[moduleName]=m2FreshModuleState();
        if (__rafexCommonState) m2MergeCommonDrawingState(m2ModuleStates[moduleName], __rafexCommonState);
        m2RestoreModuleState(m2ModuleStates[moduleName]);`;
if (!html.includes("m2MergeCommonDrawingState(m2ModuleStates[moduleName], __rafexCommonState)")) {
  if (!html.includes(activateRestore)) throw new Error("Ortak Cizim: modul restore noktasi bulunamadi");
  html = html.replace(activateRestore, activateRestoreShared);
}

const b2bReportModeAnchor = '        if(reportType){reportType.value="corporate";if(reportTypeControl)reportTypeControl.hidden=true;if($("m2ReportCompleteFront"))$("m2ReportCompleteFront").checked=true;m2ChangeReportMode();}';
const b2bReportModeShared = '        if(reportType){reportType.value="corporate";if(reportTypeControl)reportTypeControl.hidden=true;if($("m2ReportCompleteFront"))$("m2ReportCompleteFront").checked=true;const __rafexManualSharedReport=m2CommonDrawingActive();if(__rafexManualSharedReport){const panel=reportType.closest(".m2-report-panel");if(panel){panel.dataset.rafexManualOutput="1";panel.dataset.rafexOutputVisible="0";}if($("m2A4Sheet"))$("m2A4Sheet").hidden=true;if($("m2CorporatePreview"))$("m2CorporatePreview").hidden=true;}else m2ChangeReportMode();}';
if (!html.includes("const __rafexManualSharedReport=m2CommonDrawingActive();")) {
  if (!html.includes(b2bReportModeAnchor)) throw new Error("Ortak Cizim: B2B otomatik rapor acma noktasi bulunamadi");
  html = html.replace(b2bReportModeAnchor, b2bReportModeShared);
}

for (const required of [
  "function m2CommonDrawingActive()",
  "m2CommonDrawingStateKeys",
  "__rafexCommonState = m2CommonDrawingActive()",
  "m2MergeCommonDrawingState(m2ModuleStates[moduleName], __rafexCommonState)",
  "m2RestoreModuleState(m2MergeCommonDrawingState(m2CaptureModuleState(), __rafexCommonState))",
  "if (m2CommonDrawingActive()) m2RenderLayout();"
]) {
  if (!html.includes(required)) throw new Error(`Ortak Cizim ortak state dogrulamasi eksik: ${required}`);
}

const runtime = `<script data-rafex-free-nav-ortak="v39">
(function(){
  const LABEL='Ortak Çizim';
  let navObserver=null;
  function apply(){
    const button=document.querySelector('#nav button[data-page="free"]');
    if(!button)return;
    const textNodes=Array.from(button.childNodes).filter(function(node){return node.nodeType===3&&String(node.nodeValue||'').trim();});
    if(textNodes.length){
      textNodes.forEach(function(node,index){
        if(index===0){if(String(node.nodeValue||'').trim()!==LABEL)node.nodeValue=LABEL;}
        else node.nodeValue='';
      });
    }else{
      button.appendChild(document.createTextNode(LABEL));
    }
    button.setAttribute('aria-label',LABEL);
  }
  function bind(){
    apply();
    const nav=document.getElementById('nav');
    if(!nav||navObserver)return;
    navObserver=new MutationObserver(apply);
    navObserver.observe(nav,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,0);
  setTimeout(bind,250);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim nav: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
if (!html.includes('data-rafex-free-nav-ortak="v39"') || !html.includes("const LABEL='Ortak Çizim'")) {
  throw new Error("Ortak Cizim nav runtime eklenemedi");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v39: Ortak Cizim alanı yeniden olusturulmaz; B2B rapor onizlemesi yalniz kullanici istegiyle acilir.");


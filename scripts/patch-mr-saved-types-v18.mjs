import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

function mustReplace(from, to, label) {
  if (portal.includes(to)) return;
  if (!portal.includes(from)) throw new Error(`MR v18: ${label} bulunamadi`);
  portal = portal.replace(from, to);
}

// Kaydet alanındaki ayrı küçük "MR BLOKLARI" panelini kaldır.
mustReplace(
  '<div class="mr-rack-save"><button id="mrSaveRackButton" type="button" onclick="mrSaveRackV6()">Rafı Kaydet</button><small id="mrSaveRackStatus">Mevcut MR ölçülerini A–Z bloklarından biri olarak kaydeder.</small><div class="mr-block-panel"><div class="mr-block-head"><b>MR BLOKLARI</b><small id="mrBlockCount">0/26</small></div><div class="mr-block-list" id="mrBlockList"></div></div></div>',
  '<div class="mr-rack-save"><button id="mrSaveRackButton" type="button" onclick="mrSaveRackV6()">Rafı Kaydet</button><small id="mrSaveRackStatus">Mevcut MR ölçülerini kayıtlı MR raf tiplerine ekler.</small></div>',
  "küçük MR blok paneli"
);

// Ayrı blok renderer artık sadece ana kayıt sayacını senkronize etsin; ana listeyi m2RenderSavedRackTypes çizer.
const oldRender = /function mrRenderBlocksV7\(\)\{[\s\S]*?\n      \}/;
if (!portal.includes('function mrRenderBlocksV7(){mrNormalizeBlocksV7();if($("m2SavedTypeCount"))$("m2SavedTypeCount").textContent=`(${m2SavedRackTypes.length})`;}')) {
  const match = portal.match(oldRender);
  if (!match) throw new Error("MR v18: mrRenderBlocksV7 bulunamadi");
  portal = portal.replace(match[0], 'function mrRenderBlocksV7(){mrNormalizeBlocksV7();if($("m2SavedTypeCount"))$("m2SavedTypeCount").textContent=`(${m2SavedRackTypes.length})`;}' );
}

// MR kaydını her zaman canlı MR formundan üret; başka modülden kalan m2LastDrawing kullanılmasın.
const oldSaveStart = 'window.mrSaveRackV6=async()=>{mrNormalizeBlocksV7();const button=$("mrSaveRackButton"),status=$("mrSaveRackStatus");if(m2SavedRackTypes.length>=26){if(status)status.textContent="A–Z arasındaki 26 MR bloğunun tamamı kaydedildi.";return}mrSyncLayoutDrawingV4(false);const drawing=JSON.parse(JSON.stringify(m2LastDrawing||mrLayoutDrawingV4()));if(button)button.disabled=true;try{const saved=await req("/api/mr-types",{method:"POST",body:JSON.stringify({drawing})});await m2RefreshSavedRackTypes();';
const newSaveStart = 'window.mrSaveRackV6=async()=>{m2ActiveModule="mr";mrNormalizeBlocksV7();const button=$("mrSaveRackButton"),status=$("mrSaveRackStatus");if(m2SavedRackTypes.length>=26){if(status)status.textContent="A–Z arasındaki 26 MR bloğunun tamamı kaydedildi.";return}const drawing=JSON.parse(JSON.stringify(mrLayoutDrawingV4()));m2LastDrawing=drawing;mrSyncLayoutDrawingV4(false);if(button)button.disabled=true;if(status)status.textContent="MR raf tipi kaydediliyor…";try{const savedResult=await req("/api/mr-types",{method:"POST",body:JSON.stringify({drawing})});const saved=savedResult?.type||savedResult?.rackType||savedResult;await m2RefreshSavedRackTypes();';
mustReplace(oldSaveStart, newSaveStart, "MR kayıt başlangıcı");

// Kaydın sonunda ana listeyi güncelle; kaldırılan küçük paneli çağırma.
portal = portal.replace('m2RenderSavedRackTypes();mrRenderBlocksV7();if(m2LayoutState.closed||m2LayoutState.openFinished)', 'm2RenderSavedRackTypes();if(m2LayoutState.closed||m2LayoutState.openFinished)');

// MR renderer içinde Mekik2 taban ekranı kurulduktan sonra aktif modülü tekrar MR olarak sabitle.
portal = portal.replace('renderMekik2();\n        page.classList.remove("b2b-mode");page.classList.add("mr-mode");page.dataset.m2Module="mr";', 'renderMekik2();\n        m2ActiveModule="mr";\n        page.classList.remove("b2b-mode");page.classList.add("mr-mode");page.dataset.m2Module="mr";');

// Küçük panel CSS kalıntılarını görünmez kıl (eski HTML kalırsa bile görünmesin).
const headEnd = portal.indexOf("</head>");
if (headEnd < 0) throw new Error("MR v18: head kapanisi bulunamadi");
if (!portal.includes('data-rafex-mr-v18="1"')) {
  const style = '<style data-rafex-mr-v18="1">.mr-mode .mr-block-panel{display:none!important}.mr-mode .mr-rack-save{display:grid!important;grid-template-columns:minmax(140px,220px) 1fr!important;align-items:center!important;gap:10px!important}</style>\n';
  portal = portal.slice(0, headEnd) + style + portal.slice(headEnd);
}

fs.writeFileSync(portalPath, portal);
console.log("MR v18: küçük blok paneli kaldırıldı; kayıtlar yalnız ana Kayıtlı MR Raf Tipleri alanında gösteriliyor ve MR kayıt akışı canlı formdan üretilecek şekilde düzeltildi.");

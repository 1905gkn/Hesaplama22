import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (portal.includes(to)) return;
  if (!portal.includes(from)) throw new Error(`B2B physical width v23: ${label} bulunamadi`);
  portal = portal.replace(from, to);
}

function replaceAllRequired(from, to, minCount, label) {
  if (!portal.includes(from)) {
    if (portal.includes(to)) return;
    throw new Error(`B2B physical width v23: ${label} bulunamadi`);
  }
  const count = portal.split(from).length - 1;
  if (count < minCount) throw new Error(`B2B physical width v23: ${label} sayisi ${count}, beklenen en az ${minCount}`);
  portal = portal.split(from).join(to);
}

replaceRequired(
  "const B2B_MODULE_FOOT_WIDTH = 100;",
  `const B2B_MODULE_FOOT_WIDTH = 100;\n      // HR90/100/120/127/140 profil secimi yapisal profil ailesidir.\n      // Raf on gorunusunde ayagin gercek kapladigi genislik sabit 60 mm'dir.\n      const B2B_PHYSICAL_FOOT_WIDTH = 60;`,
  "60 mm fiziksel ayak sabiti"
);

// Girdi kartindaki tek modul dis olcusu: travers + iki adet 60 mm ayak.
replaceRequired(
  "geometry = b2bPalletGeometry(), totalWidth = geometry.sectionWidth + 2 * footWidth;",
  "geometry = b2bPalletGeometry(), totalWidth = geometry.sectionWidth + 2 * B2B_PHYSICAL_FOOT_WIDTH;",
  "tek modul toplam genislik"
);
replaceRequired(
  'if ($("b2bWidthRule")) $("b2bWidthRule").textContent = `Travers ${fmt(geometry.sectionWidth)} + sol ayak ${fmt(footWidth)} + sag ayak ${fmt(footWidth)} = ${fmt(totalWidth)} mm`;',
  'if ($("b2bWidthRule")) $("b2bWidthRule").textContent = `Travers ${fmt(geometry.sectionWidth)} + sol ayak ${fmt(B2B_PHYSICAL_FOOT_WIDTH)} + sag ayak ${fmt(B2B_PHYSICAL_FOOT_WIDTH)} = ${fmt(totalWidth)} mm`;',
  "tek modul genislik aciklamasi"
);

// Ana 3D ve serbest yerlesim 3D'si profil ailesinden bagimsiz olarak 60 mm ayak eni kullanir.
replaceRequired(
  'footWidth: m2B2BFootWidth({footType:Number($("m2FootType")?.value)||120,footProfile:$("b2bFootProfile")?.value||$("m2FootProfile")?.value||""}),',
  "footWidth: B2B_PHYSICAL_FOOT_WIDTH,",
  "ana 3D fiziksel ayak eni"
);
replaceRequired(
  "footWidth:m2B2BFootWidth(rack),dimensionLabelScale:",
  "footWidth:B2B_PHYSICAL_FOOT_WIDTH,dimensionLabelScale:",
  "raf 3D fiziksel ayak eni"
);

// Kayitli eski yerlesimler acilirken eski 90/100/120... mm dis olcuyu tasimaz.
replaceRequired(
  "fallback=b2bLayoutDrawing(typeDrawing),footWidth=m2B2BFootWidth({...typeDrawing,...rack,b2bLayout:savedLayout});",
  "fallback=b2bLayoutDrawing(typeDrawing),profileFootWidth=m2B2BFootWidth({...typeDrawing,...rack,b2bLayout:savedLayout}),footWidth=B2B_PHYSICAL_FOOT_WIDTH;",
  "kayitli raf ayak genisligi ayrimi"
);
replaceRequired(
  "const widthMm=Number(rack.widthMm)||savedLayout.sectionWidth+2*footWidth,depthMm=",
  "const widthMm=savedLayout.sectionWidth+2*footWidth,depthMm=",
  "kayitli raf eski genisligini yenileme"
);
replaceRequired(
  "footType:footWidth,layoutView:rack.layoutView||\"b2b-top\"",
  "footType:profileFootWidth,layoutView:rack.layoutView||\"b2b-top\"",
  "kayitli raf profil ailesini koruma"
);

// Birlesik raflarda n modul = n travers acikligi + (n+1) ortak 60 mm ayak.
replaceRequired(
  "+ (members.length+1)*m2B2BFootWidth(members[0])",
  "+ (members.length+1)*B2B_PHYSICAL_FOOT_WIDTH",
  "birlesik raf toplam genisligi"
);
replaceRequired(
  "const footWidth=m2B2BFootWidth(rack),exactWidth=Number(rack.b2bLayout.sectionWidth||0)+2*footWidth;",
  "const footWidth=B2B_PHYSICAL_FOOT_WIDTH,exactWidth=Number(rack.b2bLayout.sectionWidth||0)+2*footWidth;",
  "serbest raf fiziksel genisligi"
);
replaceRequired(
  "const cx=rack.x+rack.w/2; rack.footType=footWidth;rack.widthMm=exactWidth;",
  "const cx=rack.x+rack.w/2; rack.widthMm=exactWidth;",
  "profil tipini fiziksel genislikten ayirma"
);
replaceRequired(
  "/2+m2B2BFootWidth(previous),cx=",
  "/2+B2B_PHYSICAL_FOOT_WIDTH,cx=",
  "birlesik raf merkez araligi"
);

// Yeni raf tipinin kayitli dis olcusu 60 mm ayaklarla olusur; HR profil bilgisi ayri korunur.
replaceRequired(
  "const footWidth = m2B2BFootWidth(drawing);",
  "const profileFootWidth = m2B2BFootWidth(drawing), footWidth = B2B_PHYSICAL_FOOT_WIDTH;",
  "b2b cizim fiziksel/profile ayirimi"
);
replaceRequired(
  "return { ...drawing, footType:footWidth, bays:1, depth:rowCount, palW:palletWidth, palD:palletDepth, totalWidth:sectionWidth + 2 * footWidth,",
  "return { ...drawing, footType:profileFootWidth, bays:1, depth:rowCount, palW:palletWidth, palD:palletDepth, totalWidth:sectionWidth + 2 * footWidth,",
  "b2b cizim profil tipini koruma"
);
replaceRequired(
  "rack.widthMm = layout.sectionWidth + 2 * rack.footType;",
  "rack.widthMm = layout.sectionWidth + 2 * B2B_PHYSICAL_FOOT_WIDTH;",
  "palet sayisi degisince dis olcu"
);

// Uzatma, otomatik doldurma ve birlestirme ortak ayagi sadece bir kez sayar.
replaceAllRequired(
  "footMm=m2B2BFootWidth(source)",
  "footMm=B2B_PHYSICAL_FOOT_WIDTH",
  3,
  "uzatma/otomatik doldurma fiziksel ayak eni"
);
replaceRequired(
  "const footMm=m2B2BFootWidth(first),radians =",
  "const footMm=B2B_PHYSICAL_FOOT_WIDTH,radians =",
  "raf birlestirme ortak ayak eni"
);

// Serbest cizim ust gorunuste de ayak 60 mm olarak cizilir.
replaceRequired(
  "footWidthMm = m2B2BFootWidth(rack), totalWidthMm = Math.max(1, layout.sectionWidth + 2 * footWidthMm)",
  "footWidthMm = B2B_PHYSICAL_FOOT_WIDTH, totalWidthMm = Math.max(1, layout.sectionWidth + 2 * footWidthMm)",
  "serbest ust gorunus fiziksel ayak eni"
);

fs.writeFileSync(portalPath, portal);

// Tum viewer girisleri icin 60 mm fiziksel ayak enini varsayilan yap.
const viewerPath = path.join(root, "client/b2b-viewer.entry.js");
let viewer = fs.readFileSync(viewerPath, "utf8");
if (!viewer.includes("footWidth: clamp(Number(next.footWidth) || 60, 60, 300),")) {
  if (!viewer.includes("footWidth: clamp(Number(next.footWidth) || 120, 60, 300),")) throw new Error("B2B physical width v23: viewer footWidth varsayilani bulunamadi");
  viewer = viewer.replace("footWidth: clamp(Number(next.footWidth) || 120, 60, 300),", "footWidth: clamp(Number(next.footWidth) || 60, 60, 300),");
}
viewer = viewer.replace(/Number\(segment\.footWidth\)\|\|120/g, "Number(segment.footWidth)||60");
fs.writeFileSync(viewerPath, viewer);

for (const relative of ["client/b2b-report-3d.js", "client/b2b-section-positioner-v5.js", "client/b2b-section-positioner-fallback.js"]) {
  const filePath = path.join(root, relative);
  if (!fs.existsSync(filePath)) continue;
  let source = fs.readFileSync(filePath, "utf8");
  source = source.replace(/footWidth:\s*Math\.max\(60,\s*number\(drawing\?\.footType\s*\?\?\s*state\.footWidth,\s*120\)\),/g, "footWidth: 60,");
  fs.writeFileSync(filePath, source);
}

console.log("B2B physical width v23: ayak on eni 60 mm; toplam genislik traversler + (modul+1) x 60 mm olarak sabitlendi.");

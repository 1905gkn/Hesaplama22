import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldBlock = `      function m2RackVisualSideOverhang(rack) {
        // B2B üst görünüşünün dış çerçevesi zaten rack.w sınırına tam oturur.
        // Genel raf ayağına ait eski görsel taşmayı burada bir kez daha eklemek
        // 0 mm duvar ölçüsünde sahte boşluk ve hatalı toplam genişlik üretiyordu.
        if (rack?.layoutView === "b2b-top") return 0;
        const feet = rack?.plan?.feet || [];
        if (!feet.length || !rack.depthMm || !rack.h) return 0;
        return Math.max(...feet.map((length) => Math.max(4, Math.min(14, rack.h * length / rack.depthMm * 146 / 1062)))) / 2;
      }`;

const newBlock = `      function m2RackVisualSideOverhang(rack) {
        // B2B üst görünüşünün dış çerçevesi zaten rack.w sınırına tam oturur.
        // Mekik plan görünüşü de rack.w sınırına tam oturur. Eski ayak taşması
        // iki Mekik bloğunun arasında görünmeyen bir tampon oluşturuyordu.
        const explicitSystem = String(rack?.rafexSystem || rack?.__rafexSystem || "").toLowerCase();
        const systemType = String(rack?.systemType || "").toLowerCase();
        const legacyMekik = !explicitSystem && !rack?.b2bLayout && !rack?.b2b && !rack?.konsol && !rack?.plan?.mr && (systemType === "fifo" || systemType === "filo");
        if (rack?.layoutView === "b2b-top" || explicitSystem === "mekik2" || explicitSystem === "mekik" || legacyMekik) return 0;
        const feet = rack?.plan?.feet || [];
        if (!feet.length || !rack.depthMm || !rack.h) return 0;
        return Math.max(...feet.map((length) => Math.max(4, Math.min(14, rack.h * length / rack.depthMm * 146 / 1062)))) / 2;
      }`;

if (html.includes("const legacyMekik = !explicitSystem")) {
  console.log("v151: Mekik dış sınırı zaten görünür çerçeveye sıfırlı.");
  process.exit(0);
}
const normalized = html.replace(/\r\n/g, "\n");
if (!normalized.includes(oldBlock)) throw new Error("v151: m2RackVisualSideOverhang hedefi bulunamadı.");
html = normalized.replace(oldBlock, newBlock);
fs.writeFileSync(portalPath, html);
console.log("v151: Mekik bloklarının görünmeyen yan tamponu kaldırıldı.");

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-fallback.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v2\"";

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes(marker)) {
  const fallback = fs.readFileSync(fallbackPath, "utf8").replace(/<\/script/gi, "<\\/script");

  if (!html.includes('id="m2SectionPlacementButton"')) {
    const actionsIndex = html.indexOf("m2-report-head-actions");
    if (actionsIndex >= 0) {
      let targetIndex = html.indexOf('id="m2ReportType"', actionsIndex);
      if (targetIndex < 0) targetIndex = html.indexOf("Çıktı Tipi", actionsIndex);
      const labelStart = targetIndex >= 0 ? html.lastIndexOf("<label", targetIndex) : -1;
      if (labelStart >= actionsIndex) {
        html = `${html.slice(0, labelStart)}<button type="button" id="m2SectionPlacementButton" class="rafex-section-placement-button" data-rafex-section-positioner-static="v2">Kesit Yer Belirleme</button>${html.slice(labelStart)}`;
      }
    }
  }

  const scriptTag = `<script ${marker}>${fallback}<\/script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${scriptTag}${html.slice(bodyEnd)}`;
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const verify = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const verifyHtml = verify ? Buffer.from(verify[2], "base64").toString("utf8") : "";
if (!verifyHtml.includes("Kesit Yer Belirleme") || !verifyHtml.includes(marker)) {
  throw new Error("Kesit Yer Belirleme fallback'i build çıktısına eklenemedi.");
}

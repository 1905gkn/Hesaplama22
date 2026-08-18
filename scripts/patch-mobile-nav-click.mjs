import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

// Navigation buttons must never submit a surrounding form on mobile browsers.
html = html.replace(/<button(\s+data-page="[^"]+")/g, '<button type="button"$1');

// Also block default navigation/submission behavior before switching modules.
html = html.replace(
  '$("nav").onclick = (e) => {\n        const b = e.target.closest("button[data-page]");\n        if (b) showPage(b.dataset.page);\n      };',
  '$("nav").onclick = (e) => {\n        const b = e.target.closest("button[data-page]");\n        if (!b) return;\n        e.preventDefault();\n        e.stopPropagation();\n        showPage(b.dataset.page);\n      };'
);

fs.writeFileSync(portalPath, html);
console.log("Mobil menü tıklama yenilemesi engellendi.");

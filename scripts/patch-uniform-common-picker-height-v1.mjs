import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common picker height: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<style\s+data-rafex-common-picker-height="v1">[\s\S]*?<\/style>\s*/g, "");

const styles = String.raw`<style data-rafex-common-picker-height="v1">
@media (min-width:721px){
  #page #rafexUnifiedSystemPicker{
    display:block!important;width:100%!important;height:78px!important;min-height:78px!important;max-height:78px!important;
    margin:0 0 10px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important
  }
  #page.rafex-common-mr #rafexUnifiedSystemPicker{
    margin-bottom:-4px!important
  }
  #page #rafexUnifiedSystemPicker .rafex-system-picker-head,
  #page #rafexUnifiedSystemPicker .rafex-system-picker-actions{display:none!important}
  #page #rafexUnifiedSystemPicker .rafex-system-options{
    display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:8px!important;
    width:100%!important;height:60px!important;min-height:60px!important;max-height:60px!important;margin:0!important
  }
  #page #rafexUnifiedSystemPicker .rafex-system-option,
  #page #rafexUnifiedSystemPicker .rafex-system-option-body{
    display:flex!important;align-items:center!important;justify-content:center!important;
    width:100%!important;height:60px!important;min-height:60px!important;max-height:60px!important;
    margin:0!important;box-sizing:border-box!important
  }
}
</style>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common picker height: </body> bulunamadi");
html = html.slice(0, closing) + styles + "\n" + html.slice(closing);
for (const required of ['data-rafex-common-picker-height="v1"', 'height:78px!important', 'height:60px!important']) {
  if (!html.includes(required)) throw new Error("Common picker height eksigi: " + required);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v1: Ortak sistem secim seridi tum sistemlerde esit yukseklige sabitlendi.");

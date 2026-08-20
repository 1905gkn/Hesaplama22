import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldBlock = 'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();m2ScheduleReportRefresh(650);}';
const newBlock = 'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();const placingRack=m2LayoutState.racks.some((rack)=>rack?.staged||rack?.freePlacement);if(!placingRack)m2ScheduleReportRefresh(650);}';

if (html.includes(oldBlock)) {
  html = html.replace(oldBlock, newBlock);
} else if (!html.includes(newBlock)) {
  throw new Error("Serbest yerlesim rapor yenileme blogu bulunamadi.");
}

fs.writeFileSync(portalPath, html);
console.log("Serbest yerlesimde yeni raf yerlesirken agir rapor yenilemesi ertelendi.");

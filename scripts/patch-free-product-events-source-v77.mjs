import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const renderPattern = 'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();const placingRack=m2LayoutState.racks.some((rack)=>rack?.staged||rack?.freePlacement);if(!placingRack)m2ScheduleReportRefresh(650);}';
if (!html.includes(renderPattern)) throw new Error("Free product events v77: genel render sayim/PDF kalibi bulunamadi.");
html = html.replace(renderPattern, 'if(!interactiveRender)m2RenderSelectedRackInfo();');

const addTimerPattern = /\s+setTimeout\(function m2RefreshReportAfterStableAdd\(\)\{if\(m2LayoutState\?\.drag\)\{setTimeout\(m2RefreshReportAfterStableAdd,180\);return;\}if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},180\);/;
if (!addTimerPattern.test(html)) throw new Error("Free product events v77: raf ekleme PDF zamanlayicisi bulunamadi.");
html = html.replace(addTimerPattern, "");

fs.writeFileSync(portalPath, html);
console.log("SOURCE v77: tasima/secim/olcu renderlarindan urun sayimi ve PDF zamanlayicisi kaldirildi.");

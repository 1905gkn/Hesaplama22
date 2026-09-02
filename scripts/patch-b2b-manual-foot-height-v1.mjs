import fs from "node:fs";

const file = new URL("../portal.html", import.meta.url);
let source = fs.readFileSync(file, "utf8");

const replaceRequired = (from, to, label) => {
  if (source.includes(to)) return;
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  source = source.replace(from, to);
};

replaceRequired(
  'height = Math.max(0, Number(drawing?.sideUprightHeight) || Number(drawing?.totalRackHeight) || Number(drawing?.footLy) || Number(settings.footHeight) || 0)',
  'height = m2B2BEffectiveFootHeight(drawing)',
  "Düz arabağ ayak boyu",
);

replaceRequired(
  'const state=rack?.b2b||{},levels=',
  'const state=rack?.b2b||{},levels=',
  "B2B ayak hesap başlangıcı",
);

const calculatedNeedle = 'const state=rack?.b2b||{},levels=Math.max(1,Math.round(Number(rack?.levels)||Number(state.levels)||1)),defaultPallet=Math.max(300,Number(rack?.palletHeight)||Number(state.palletHeight)||1200),traverseTypeHeight=Number(String(state.traverseType||"").match(/\\d+/)?.[0]),traverseHeight=Math.max(50,Number(state.traverseHeightOverride)||traverseTypeHeight||Number(rack?.traverseHeight)||b2bTraverseHeight()),custom=Array.isArray(state.customLevels)?state.customLevels:[],defaultClearance=Math.max(0,Number(state.palletTraverseGap??rack?.clearance??200)),lastOverlap=Math.max(0,Number(state.lastPalletOverlap)||Math.round(defaultPallet/2));\n        let height=';
const calculatedReplacement = 'const state=rack?.b2b||{},levels=Math.max(1,Math.round(Number(rack?.levels)||Number(state.levels)||1)),defaultPallet=Math.max(300,Number(rack?.palletHeight)||Number(state.palletHeight)||1200),traverseTypeHeight=Number(String(state.traverseType||"").match(/\\d+/)?.[0]),traverseHeight=Math.max(50,Number(state.traverseHeightOverride)||traverseTypeHeight||Number(rack?.traverseHeight)||b2bTraverseHeight()),custom=Array.isArray(state.customLevels)?state.customLevels:[],defaultClearance=Math.max(0,Number(state.palletTraverseGap??rack?.clearance??200)),lastOverlap=Math.max(0,Number(state.lastPalletOverlap)||Math.round(defaultPallet/2));\n        const manualHeight=state.footHeightMode==="manual"?Number(state.footHeight):0;\n        if(manualHeight>0)return Math.max(500,Math.ceil(manualHeight/50)*50);\n        let height=';
replaceRequired(calculatedNeedle, calculatedReplacement, "Manuel ayak boyu önceliği");

replaceRequired(
  '      function m2Rack3DOptions(rack) {',
  '      function m2B2BEffectiveFootHeight(drawing) {\n        const state=drawing?.b2b||{},manualHeight=state.footHeightMode==="manual"?Number(state.footHeight):0;\n        if(manualHeight>0)return Math.max(500,Math.ceil(manualHeight/50)*50);\n        return Math.max(0,Number(drawing?.sideUprightHeight)||Number(drawing?.totalRackHeight)||Number(drawing?.footLy)||Number(state.footHeight)||0);\n      }\n      function m2Rack3DOptions(rack) {',
  "Merkezi ayak boyu çözücüsü",
);

replaceRequired(
  'const drawing = isB2B ? { ...m2LastDrawing, b2b:b2bReadInputState(), plan:m2LastDrawing.plan || { feet:[Math.round(b2bVerticalLayout().footHeight)], braces:[] } } : m2LastDrawing;',
  'const liveB2BState=isB2B?b2bReadInputState():null,liveB2BHeight=isB2B?Math.round(b2bVerticalLayout().footHeight):0;\n        const drawing = isB2B ? { ...m2LastDrawing, sideUprightHeight:liveB2BHeight, b2b:{...liveB2BState,footHeight:liveB2BHeight}, plan:{ feet:[liveB2BHeight], braces:[...(m2LastDrawing.plan?.braces||[])] } } : m2LastDrawing;',
  "Kayıtta canlı manuel ayak boyu",
);

source = source.replace('uprightHeight=Math.max(1,Number(drawing.sideUprightHeight)||Number(drawing.totalRackHeight)||Number(drawing.footLy)||5000)', 'uprightHeight=Math.max(1,m2B2BEffectiveFootHeight(drawing)||5000)');
source = source.replace('rawHeight=Math.max(1,Number(drawing.sideUprightHeight)||Number(drawing.totalRackHeight)||Number(drawing.footLy)||5000)', 'rawHeight=Math.max(1,m2B2BEffectiveFootHeight(drawing)||5000)');

for (const required of [
  'height = m2B2BEffectiveFootHeight(drawing)',
  'function m2B2BEffectiveFootHeight(drawing)',
  'sideUprightHeight:liveB2BHeight',
  'uprightHeight=Math.max(1,m2B2BEffectiveFootHeight(drawing)||5000)',
  'rawHeight=Math.max(1,m2B2BEffectiveFootHeight(drawing)||5000)',
]) {
  if (!source.includes(required)) throw new Error(`B2B manuel ayak boyu doğrulaması eksik: ${required}`);
}

fs.writeFileSync(file, source);
console.log("B2B manuel ayak boyu: kayıt, görüntüleme, ürün listesi ve PDF aynı fiziksel yüksekliği kullanıyor.");
